// Загружаем header и инициализируем корзину
fetch('/templates/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;
        updateCartCounter();
        
        // Добавляем обработчик ПОСЛЕ загрузки header
        document.getElementById('cart-button').addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '../shop_single_page/single_shop_page.html';
        });
    })
    .catch(error => console.error('Error loading header:', error));

// Остальной код (загрузка товаров) остается без изменений
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
                
                productElement.addEventListener('click', function() {
                    addToCart(product.id);
                });
                
                container.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error loading products:', error));

    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    updateCartCounter();
});

function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    document.getElementById('cart-counter').textContent = cart.length;
}