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

// Обработчик формы регистрации
document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.getElementById("register-btn");

    registerBtn.addEventListener("click", async function () {
        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const newsletter = document.getElementById("newsletter").checked;
        const termsAccepted = document.getElementById("terms").checked;

        if (!termsAccepted) {
            alert("You must agree to the terms.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const newUser = {
            firstName,
            lastName,
            email,
            password,
            newsletter,
            createdAt: new Date().toISOString()
        };

        try {
            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                alert("Registration successful!");
                document.getElementById("registration-form").reset();
            } else {
                alert("Something went wrong.");
                console.error(await response.text());
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Server error.");
        }
    });
});