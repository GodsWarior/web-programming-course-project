//кнопка на shop
document.getElementById('explore-button').addEventListener('click', function () {
    window.location.href = '/shop_page/shop_page.html';
  });

document.getElementById('shop-now-btn').addEventListener('click', function () {
window.location.href = '/shop_page/shop_page.html';
});

document.getElementById('view-all-products-btn').addEventListener('click', function () {
window.location.href = '/shop_page/shop_page.html';
});

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
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            const container = document.getElementById('products-container');
            
            // Показываем только первые 6 товаров
            const limitedProducts = products.slice(0, 6);

            limitedProducts.forEach(product => {
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

                productElement.addEventListener('click', function () {
                    window.location.href = `../shop_single_page/single_shop_page.html?id=${product.id}`;
                });

                container.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error loading products:', error));
});


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