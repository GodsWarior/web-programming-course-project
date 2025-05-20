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

// Обработчик формы входа
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("login-btn");

    loginBtn.addEventListener("click", async function () {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`http://localhost:3000/users?email=${email}&password=${password}`);
            const users = await response.json();

            if (users.length > 0) {
                alert("Login successful!");
                // Пример: сохраняем пользователя в localStorage
                localStorage.setItem("user", JSON.stringify(users[0]));
                // Перенаправление, если нужно
                // window.location.href = "/dashboard.html";
            } else {
                alert("Invalid email or password.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Server error.");
        }
    });
});