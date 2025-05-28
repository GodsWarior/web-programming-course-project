// Загружаем header
fetch('/templates/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;

        const menuToggle = document.getElementById('menu-toggle');
        const overlay = document.getElementById('overlay');
        const body = document.body;

        // Показ/скрытие меню
        if (menuToggle) {
            menuToggle.addEventListener('change', () => {
                if (menuToggle.checked) {
                    body.classList.add('menu-open');
                } else {
                    body.classList.remove('menu-open');
                }
            });
        }

        // Клик вне меню — закрыть
        overlay.addEventListener('click', () => {
            menuToggle.checked = false;
            body.classList.remove('menu-open');
        });

        // Обработка перехода в корзину
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            cartButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = '../purchase_page/purchase_page.html';
            });
        }

        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }

        updateCartCounter();
    })
    .catch(error => console.error('Ошибка загрузки header:', error));

//preloader
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
});
// Загрузка и отображение продуктов
document.addEventListener('DOMContentLoaded', function() {
    // Сначала получаем данные о покупках
    fetch('http://localhost:3000/purchase_products')
        .then(response => response.json())
        .then(purchases => {
            // Группируем покупки по productId и суммируем amount
            const purchaseSummary = purchases.reduce((acc, purchase) => {
                if (!acc[purchase.productId]) {
                    acc[purchase.productId] = 0;
                }
                acc[purchase.productId] += purchase.amount;
                return acc;
            }, {});
            
            // Получаем массив уникальных ID товаров
            const purchasedProductIds = Object.keys(purchaseSummary);
            
            // Загружаем все продукты
            return fetch('http://localhost:3000/products')
                .then(response => response.json())
                .then(products => {
                    // Фильтруем только купленные товары
                    const purchasedProducts = products.filter(product => 
                        purchasedProductIds.includes(product.id)
                    );
                    
                    // Добавляем информацию о суммарном количестве
                    return purchasedProducts.map(product => ({
                        ...product,
                        totalPurchased: purchaseSummary[product.id] || 0
                    }));
                });
        })
        .then(productsWithAmount => {
            const container = document.getElementById('products-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            productsWithAmount.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'base-rectangle';
                productElement.innerHTML = `
                    <img src="${product.image}" class="product-image" alt="${product.name}">
                    <p class="product_category">${product.category}</p>
                    <p class="product_name">${product.name}</p>
                    <div class="rectangle-line"></div>
                    <p class="price-line-through">$ ${product.oldPrice.toFixed(2)} USD</p>
                    <p class="current-price">$ ${product.price.toFixed(2)} USD</p>
                    <div class="purchased-amount">
                        Purchased: ${product.totalPurchased}
                    </div>
                `;
                
                container.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error loading data:', error));
});


// Обработчик формы заказа
document.getElementById('order-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // Получаем данные формы (без содержимого корзины)
        const orderData = {
            address: document.getElementById('delivery-address').value,
            recipient: document.getElementById('recipient-name').value,
            payment: document.querySelector('input[name="payment"]:checked').value,
            promoCode: document.getElementById('promo-code').value,
            date: new Date().toISOString()
        };
        
        // 1. Отправляем данные заказа
        const orderResponse = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!orderResponse.ok) throw new Error('Failed to create order');
        
        // 2. Получаем все purchase_products для удаления
        const purchasesResponse = await fetch('http://localhost:3000/purchase_products');
        const purchases = await purchasesResponse.json();
        
        // 3. Удаляем все purchase_products
        const deletePromises = purchases.map(purchase => 
            fetch(`http://localhost:3000/purchase_products/${purchase.id}`, {
                method: 'DELETE'
            })
        );
        
        await Promise.all(deletePromises);
        
        // 4. Обновляем счетчик корзины (он будет 0, так как purchase_products очищены)
        updateCartCounter();
        
        // 5. Показываем уведомление об успехе
        showNotification('Order placed successfully!');
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error placing order. Please try again.', 'error');
    }
});

// Функция обновления счетчика корзины (теперь учитывает purchase_products)
async function updateCartCounter() {
    try {
        // Получаем текущие покупки из базы
        const response = await fetch('http://localhost:3000/purchase_products');
        const purchases = await response.json();
        
        // Считаем общее количество
        const totalItems = purchases.reduce((sum, item) => sum + item.amount, 0);
        const counter = document.getElementById('cart-counter');
        
        if (counter) {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? "inline" : "0";
        }
        
        // Синхронизируем с localStorage (опционально)
        const cart = purchases.map(item => ({
            id: item.productId,
            amount: item.amount
        }));
        localStorage.setItem('cart', JSON.stringify(cart));
        
    } catch (error) {
        console.error('Error updating cart counter:', error);
        // Fallback на localStorage если сервер недоступен
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.amount, 0);
        const counter = document.getElementById('cart-counter');
        if (counter) {
            counter.textContent = totalItems;
        }
    }
}