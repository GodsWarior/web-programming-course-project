// Загружаем header
fetch('/templates/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;
        
        // Обработчик клика по корзине → переход на purchase_page.html
        document.getElementById('cart-button').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../purchase_page/purchase_page.html';
        });
        
        // Инициализация корзины (если её нет)
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        // Обновляем счётчик (пока скрыт)
        updateCartCounter();
    })
    .catch(error => console.error('Error loading header:', error));

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

// Функция добавления в корзину (оставлена для будущего использования)
function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

// Функция обновления счётчика (пока скрыта, но работает)
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const counter = document.getElementById('cart-counter');
    if (counter) {
        counter.textContent = cart.length;
        // Позже можно будет показать счётчик: counter.style.display = "inline";
    }
}

// Получаем ID товара из URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

// Загружаем данные товара
if (productId) {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            // Находим нужный товар по ID
            const product = products.find(p => p.id === productId);
            
            if (product) {
                // Вставляем данные товара в HTML
                document.querySelector('.product-title').textContent = product.name;
                document.querySelector('.product-category').textContent = product.category;
                document.querySelector('.product-image').src = product.image;
                document.querySelector('.product-rating').src = product.ratingImage;
                document.querySelector('.old-price').textContent = `$${product.oldPrice.toFixed(2)}`;
                document.querySelector('.current-price').textContent = `$${product.price.toFixed(2)}`;
                
                // Описание можно добавить в db.json или использовать фиксированное
                document.querySelector('.product-description').textContent = 
                    product.description || "Premium quality product from our organic farm.";
            }
        })
        .catch(error => console.error('Ошибка загрузки товара:', error));
}

// Обработчик кнопки "Add To Cart"
document.querySelector('.add-to-cart-btn').addEventListener('click', function() {
    if (!productId) return;
    
    const quantity = parseInt(document.querySelector('.product-quantity input').value);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Добавляем товар N раз в соответствии с количеством
    for (let i = 0; i < quantity; i++) {
        cart.push(productId);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${quantity} item(s) added to cart!`);
});