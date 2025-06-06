document.addEventListener("DOMContentLoaded", function() {
    // Загрузка header и footer
    fetch('/templates/header.html')
        .then(response => response.text())
        .then(html => document.getElementById('header-container').innerHTML = html)
        .catch(error => console.error('Error loading header:', error));

    fetch('/templates/footer.html')
        .then(response => response.text())
        .then(html => document.getElementById('footer-container').innerHTML = html)
        .catch(error => console.error('Error loading footer:', error));

    // Проверка авторизации
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '/login_page/login_page.html';
        return;
    }

    // Загрузка данных пользователя
    loadUserData();

    // Обработчики форм
    document.getElementById('personal-info-form').addEventListener('submit', updatePersonalInfo);
    document.getElementById('payment-info-form').addEventListener('submit', updatePaymentInfo);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('change-password-btn').addEventListener('click', () => {
        document.getElementById('password-modal').style.display = 'block';
    });

    // Закрытие модального окна
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('password-modal').style.display = 'none';
    });

    // Переключение видимости пароля
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Проверка сложности пароля
    document.getElementById('new-password').addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

    // Обработчик формы смены пароля
    document.getElementById('change-password-form').addEventListener('submit', changePassword);

    // Заполнение формы данными пользователя
    function loadUserData() {
        fetch(`http://localhost:3000/users/${currentUser.id}`)
            .then(response => response.json())
            .then(user => {
                // Основная информация
                document.getElementById('firstName').value = user.firstName || '';
                document.getElementById('lastName').value = user.lastName || '';
                document.getElementById('middleName').value = user.middleName || '';
                document.getElementById('username').value = user.username || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('phone').value = user.phone || '';
                document.getElementById('birthDate').value = user.birthDate || '';
                document.getElementById('newsletter').checked = user.newsletter || false;

                // Платежная информация
                document.getElementById('cardNumber').value = user.cardNumber || '';
                document.getElementById('expiryDate').value = user.expiryDate || '';
                document.getElementById('cvv').value = user.cvv || '';
            })
            .catch(error => console.error('Error loading user data:', error));
    }

    // Проверка сложности пароля
    function checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const strengthMeter = document.querySelector('.strength-meter');
        
        // Сбросить классы
        strengthMeter.className = 'strength-meter';
        
        if (!password) {
            strengthBar.style.width = '0';
            strengthText.textContent = '';
            return;
        }
        
        // Проверка сложности
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLong = password.length >= 8;
        
        let strength = 0;
        if (hasLetters) strength += 1;
        if (hasNumbers) strength += 1;
        if (hasSpecial) strength += 1;
        if (isLong) strength += 1;
        
        if (strength <= 1) {
            strengthBar.style.width = '30%';
            strengthBar.style.backgroundColor = '#f44336';
            strengthText.textContent = 'Сложность: слабый';
            strengthMeter.classList.add('strength-weak');
        } else if (strength <= 3) {
            strengthBar.style.width = '60%';
            strengthBar.style.backgroundColor = '#ff9800';
            strengthText.textContent = 'Сложность: средний';
            strengthMeter.classList.add('strength-medium');
        } else {
            strengthBar.style.width = '100%';
            strengthBar.style.backgroundColor = '#4caf50';
            strengthText.textContent = 'Сложность: сильный';
            strengthMeter.classList.add('strength-strong');
        }
    }

    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Валидация белорусского телефона
    function validateBelarusPhone(phone) {
        const re = /^\+375(24|25|29|33|44)\d{7}$/;
        return re.test(phone);
    }

    // Проверка уникальности username
    async function isUsernameUnique(username, currentUserId) {
        const response = await fetch(`http://localhost:3000/users?username=${username}`);
        const users = await response.json();
        return users.length === 0 || users[0].id === currentUserId;
    }

    // Проверка уникальности email
    async function isEmailUnique(email, currentUserId) {
        const response = await fetch(`http://localhost:3000/users?email=${email}`);
        const users = await response.json();
        return users.length === 0 || users[0].id === currentUserId;
    }

    // Валидация формы
    async function validatePersonalForm() {
        let isValid = true;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        // Проверка username
        if (username.length < 4) {
            showError('username-error', 'Логин должен содержать минимум 4 символа');
            isValid = false;
        } else if (!await isUsernameUnique(username, currentUser.id)) {
            showError('username-error', 'Этот логин уже занят');
            isValid = false;
        } else {
            hideError('username-error');
        }
        
        // Проверка email
        if (!validateEmail(email)) {
            showError('email-error', 'Введите корректный email');
            isValid = false;
        } else if (!await isEmailUnique(email, currentUser.id)) {
            showError('email-error', 'Этот email уже используется');
            isValid = false;
        } else {
            hideError('email-error');
        }
        
        // Проверка телефона
        if (!validateBelarusPhone(phone)) {
            showError('phone-error', 'Введите корректный белорусский номер (+375XXXXXXXXX)');
            isValid = false;
        } else {
            hideError('phone-error');
        }
        
        return isValid;
    }

    // Показать ошибку
    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.style.display = 'block';
    }

    // Скрыть ошибку
    function hideError(elementId) {
        const element = document.getElementById(elementId);
        element.style.display = 'none';
    }

    // Обновление личной информации
    async function updatePersonalInfo(e) {
        e.preventDefault();
        
        if (!await validatePersonalForm()) return;
        
        const updatedData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            middleName: document.getElementById('middleName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            birthDate: document.getElementById('birthDate').value,
            newsletter: document.getElementById('newsletter').checked
        };

        updateUserData(updatedData);
    }

    // Обновление платежной информации
    function updatePaymentInfo(e) {
        e.preventDefault();
        
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        // Простая валидация платежных данных
        if (cardNumber && !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            showError('cardNumber-error', 'Некорректный номер карты');
            return;
        } else {
            hideError('cardNumber-error');
        }
        
        if (expiryDate && !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
            showError('expiryDate-error', 'Некорректный срок действия');
            return;
        } else {
            hideError('expiryDate-error');
        }
        
        if (cvv && !/^\d{3,4}$/.test(cvv)) {
            showError('cvv-error', 'Некорректный CVV');
            return;
        } else {
            hideError('cvv-error');
        }
        
        const updatedData = {
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            cvv: cvv
        };

        updateUserData(updatedData);
    }

    // Функция обновления данных пользователя
    function updateUserData(updatedData) {
        fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(updatedUser => {
            // Обновляем данные в localStorage
            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
            const newUserData = {...storedUser, ...updatedUser};
            localStorage.setItem('currentUser', JSON.stringify(newUserData));
            
            alert('Данные успешно обновлены!');
        })
        .catch(error => {
            console.error('Error updating user data:', error);
            alert('Произошла ошибка при обновлении данных');
        });
    }

    // Смена пароля
    async function changePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Проверка текущего пароля
        const response = await fetch(`http://localhost:3000/users/${currentUser.id}`);
        const user = await response.json();
        
        if (user.password !== currentPassword) {
            showError('current-password-error', 'Неверный текущий пароль');
            return;
        } else {
            hideError('current-password-error');
        }
        
        // Проверка нового пароля
        if (newPassword.length < 8) {
            showError('new-password-error', 'Пароль должен содержать минимум 8 символов');
            return;
        } else {
            hideError('new-password-error');
        }
        
        // Проверка совпадения паролей
        if (newPassword !== confirmPassword) {
            showError('confirm-password-error', 'Пароли не совпадают');
            return;
        } else {
            hideError('confirm-password-error');
        }
        
        // Обновление пароля
        fetch(`http://localhost:3000/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        })
        .then(() => {
            alert('Пароль успешно изменен!');
            document.getElementById('password-modal').style.display = 'none';
            document.getElementById('change-password-form').reset();
        })
        .catch(error => {
            console.error('Error changing password:', error);
            alert('Произошла ошибка при изменении пароля');
        });
    }

    // Выход из аккаунта
    function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '/main_page/index.html';
        clearCart();
    }
});