// Загрузка header
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

//footer
fetch('/templates/footer.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('footer-container').innerHTML = html;
    });

//preloader
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    preloader.style.display = 'none';
});


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

//burger-menu
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const body = document.body;

  menuToggle.addEventListener("change", () => {
    if (menuToggle.checked) {
      body.classList.add("menu-open");
    } else {
      body.classList.remove("menu-open");
    }
  });
});

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