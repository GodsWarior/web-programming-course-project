// Загрузка header
fetch('/templates/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;

        const menuToggle = document.getElementById('menu-toggle');
        const overlay = document.getElementById('overlay');
        const body = document.body;

        if (menuToggle) {
            menuToggle.addEventListener('change', () => {
                body.classList.toggle('menu-open', menuToggle.checked);
            });
        }

        overlay.addEventListener('click', () => {
            menuToggle.checked = false;
            body.classList.remove('menu-open');
        });

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

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        const signInLink = document.getElementById('sign-in-link');
        const signUpLink = document.getElementById('sign-up-link');
        const signOutLink = document.getElementById('sign-out-link');

        const sideSignInLink = document.getElementById('side-sign-in');
        const sideSignUpLink = document.getElementById('side-sign-up');
        const sideSignOutLink = document.getElementById('side-sign-out');

        function logout() {
            localStorage.removeItem('currentUser');
            localStorage.setItem('cart', JSON.stringify([]));
            location.reload();
        }

        if (currentUser) {
            if (signInLink) signInLink.style.display = 'none';
            if (signUpLink) signUpLink.style.display = 'none';
            if (signOutLink) {
                signOutLink.style.display = 'inline';
                signOutLink.addEventListener('click', logout);
            }

            if (sideSignInLink) sideSignInLink.style.display = 'none';
            if (sideSignUpLink) sideSignUpLink.style.display = 'none';
            if (sideSignOutLink) {
                sideSignOutLink.style.display = 'inline';
                sideSignOutLink.addEventListener('click', logout);
            }
        } else {
            if (signOutLink) signOutLink.style.display = 'none';
            if (sideSignOutLink) sideSignOutLink.style.display = 'none';
        }
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



// Функция для обновления счетчика корзины
function updateCartCounter() {
    updateCartCounterFromDB();
    // Проверяем, есть ли элемент счетчика на странице
    const counter = document.getElementById('cart-counter');
    if (!counter) return;

    try {
        // Получаем данные корзины из localStorage
        const cartData = localStorage.getItem('cart');
        let cartItems = [];
        
        if (cartData) {
            cartItems = JSON.parse(cartData);
        } else {
            localStorage.setItem('cart', JSON.stringify([]));
        }

        // Считаем общее количество товаров в корзине
        const totalItems = cartItems.reduce((sum, item) => sum + (item.amount || 1), 0);
        
        // Обновляем счетчик
        counter.textContent = totalItems > 0 ? totalItems : '0';
        
    } catch (error) {
        console.error('Error updating cart counter:', error);
        counter.style.display = 'none';
    }
}


/**
 * Очищает весь LocalStorage браузера
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
        console.log('LocalStorage has been completely cleared');
        return true;
    } catch (error) {
        console.error('Error clearing LocalStorage:', error);
        return false;
    }
}

/**
 * Очищает только данные корзины (из LocalStorage и базы данных)
 */
async function clearCart() {
    try {
        // 1. Очищаем корзину в LocalStorage
        localStorage.setItem('cart', JSON.stringify([]));

        // 2. Получаем все покупки и удаляем их по одной
        try {
            const response = await fetch('http://localhost:3000/purchase_products');
            const purchases = await response.json();

            await Promise.all(purchases.map(p =>
                fetch(`http://localhost:3000/purchase_products/${p.id}`, {
                    method: 'DELETE'
                })
            ));
        } catch (serverError) {
            console.warn('Could not clear server cart, proceeding with localStorage only:', serverError);
        }

        // 3. Обновляем счетчик
        updateCartCounter();
        console.log('Cart has been cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  // Проверяем сохранённую тему
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-theme");
    toggle.checked = true;
  }

  // Обработчик переключения темы
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  });
});
