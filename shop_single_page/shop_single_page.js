let currentProductId = null;

// Функция для обновления счётчика корзины из purchase_products
async function updateCartCounterFromDB() {
    try {
        const response = await fetch('http://localhost:3000/purchase_products');
        const purchases = await response.json();
        
        // Считаем общее количество товаров
        const totalItems = purchases.reduce((sum, item) => sum + item.amount, 0);
        
        // Обновляем счётчик в header
        const counter = document.getElementById('cart-counter');
        if (counter) {
            counter.textContent = totalItems;
        }
        
        // Синхронизируем с localStorage
        const cart = purchases.map(item => ({
            id: item.productId,
            amount: item.amount
        }));
        localStorage.setItem('cart', JSON.stringify(cart));
        
    } catch (error) {
        console.error('Error updating cart from DB:', error);
        // Если ошибка, используем localStorage как fallback
        updateCartCounter();
    }
}

// Загружаем header
fetch('/templates/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;
        
        // Обработчик клика по корзине
        document.getElementById('cart-button').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../purchase_page/purchase_page.html';
        });
        
        // Инициализация корзины
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        // Обновляем счётчик из базы данных
        updateCartCounterFromDB();
    })
    .catch(error => console.error('Error loading header:', error));

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.amount, 0);
    const counter = document.getElementById('cart-counter');
    
    if (counter) {
        counter.textContent = totalItems;
    }
    
    // Дополнительно синхронизируем с базой
    updateCartCounterFromDB();
}

// Загрузка товаров
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            const container = document.getElementById('products-container');
            
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'base-rectangle';
                productElement.innerHTML = `
                    <img src="${product.image}" class="product-image" alt="${product.name}">
                    <p class="product_category">${product.category}</p>
                    <p class="product_name">${product.name}</p>
                    <div class="rectangle-line"></div>
                    <p class="price-line-through">$ ${product.oldPrice.toFixed(2)} USD</p>
                    <p class="current-price">$ ${product.price.toFixed(2)} USD</p>
                    <img src="${product.ratingImage}" class="five-star-image" alt="Rating ${product.rating}">
                `;
                
                // Клик на товар → переход на single_shop_page.html с ID товара
                productElement.addEventListener('click', function() {
                    window.location.href = `../shop_single_page/single_shop_page.html?id=${product.id}`;
                });
                
                container.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error loading products:', error));
});

// Получаем ID товара из URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (productId) {
    fetch(`http://localhost:3000/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            // Заполняем карточку товара (левая часть)
            document.querySelector('.product-image').src = product.image;
            document.querySelector('.product_category').textContent = product.category;
            document.querySelector('.product_name').textContent = product.name;
            document.querySelector('.price-line-through').textContent = `$${product.oldPrice.toFixed(2)} USD`;
            document.querySelector('.current-price').textContent = `$${product.price.toFixed(2)} USD`;
            document.querySelector('.five-star-image').src = product.ratingImage;
            
            // Заполняем детали товара (правая часть)
            document.querySelector('.product-title').textContent = product.name;
            document.querySelector('.old-price').textContent = `$${product.oldPrice.toFixed(2)}`;
            document.querySelector('.current-price').textContent = `$${product.price.toFixed(2)}`;
        })
        .catch(error => console.error('Error loading product:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы по ID
    const quantityInput = document.getElementById('product-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const cartCounter = document.getElementById('cart-counter'); // Должен быть в header.html

    // Получаем ID товара из URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId && addToCartBtn && quantityInput) {
        // Загружаем данные товара
        fetch(`http://localhost:3000/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                // Заполняем данные на странице
                document.querySelector('.product-image').src = product.image;
                document.querySelector('.product_category').textContent = product.category;
                document.querySelector('.product_name').textContent = product.name;
                document.querySelector('.price-line-through').textContent = `$${product.oldPrice.toFixed(2)}`;
                document.querySelector('.current-price').textContent = `$${product.price.toFixed(2)}`;
                document.querySelector('.five-star-image').src = product.ratingImage;
                
                // Обработчик кнопки "Add to Cart"
                addToCartBtn.addEventListener('click', function() {
                    const quantity = parseInt(quantityInput.value) || 1;
                    
                    // 1. Обновляем корзину
                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const existingItem = cart.find(item => item.id === productId);
                    
                    if (existingItem) {
                        existingItem.amount += quantity;
                    } else {
                        cart.push({ 
                            id: Number(productId), 
                            amount: quantity,
                        });
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // 2. Сохраняем в базу данных
                    fetch('http://localhost:3000/purchase_products', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            productId: productId,
                            amount: quantity
                        })
                    });
                    
                    // 3. Обновляем интерфейс
                    updateCartCounter();
                    alert(`Added ${quantity} ${product.name} to cart!`);
                });
            })
            .catch(error => console.error('Error loading product:', error));
    }
});

async function clearCart() {
    try {
        // 1. Очищаем localStorage
        localStorage.setItem('cart', JSON.stringify([]));
        
        // 2. Удаляем все записи из purchase_products в базе данных
        const response = await fetch('http://localhost:3000/purchase_products');
        const purchases = await response.json();
        
        // Создаём массив промисов для удаления
        const deletePromises = purchases.map(purchase => 
            fetch(`http://localhost:3000/purchase_products/${purchase.id}`, {
                method: 'DELETE'
            })
        );
        
        // Ждём завершения всех удалений
        await Promise.all(deletePromises);
        
        // 3. Обновляем счётчик
        updateCartCounter();
        
        // 4. Показываем уведомление
        showNotification('Корзина успешно очищена!');
        
        // 5. Если находимся на странице корзины - обновляем её
        if (window.location.pathname.includes('purchase_page.html')) {
            displayCartItems(); // Ваша функция для отображения корзины
        }
        
    } catch (error) {
        console.error('Ошибка при очистке корзины:', error);
        showNotification('Ошибка при очистке корзины', 'error');
    }
}