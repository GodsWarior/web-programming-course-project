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


// Функция обновления счётчика (пока скрыта, но работает)
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