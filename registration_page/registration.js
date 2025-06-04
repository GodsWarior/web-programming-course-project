document.addEventListener("DOMContentLoaded", function () {
    // Обработка выбора метода пароля
    const passwordMethodRadios = document.querySelectorAll('input[name="password-method"]');
    const manualPasswordFields = document.querySelector('.manual-password');
    const autoPasswordField = document.querySelector('.auto-password');
    const generatedPasswordSpan = document.getElementById('generated-password');
    
    function generateRandomPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    
    passwordMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'auto') {
                manualPasswordFields.style.display = 'none';
                autoPasswordField.style.display = 'block';
                generatedPasswordSpan.textContent = generateRandomPassword();
            } else {
                manualPasswordFields.style.display = 'block';
                autoPasswordField.style.display = 'none';
            }
        });
    });
    
    document.getElementById('regenerate-password').addEventListener('click', function() {
        generatedPasswordSpan.textContent = generateRandomPassword();
    });
    
    document.getElementById('copy-password').addEventListener('click', function() {
        navigator.clipboard.writeText(generatedPasswordSpan.textContent);
        alert('Password copied to clipboard!');
    });
    
    // Обработчик формы регистрации
    const registerBtn = document.getElementById("register-btn");
    
    registerBtn.addEventListener("click", async function () {
        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const middleName = document.getElementById("middle-name").value.trim();
        const username = document.getElementById("username").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const birthDate = document.getElementById("birth-date").value;
        const passwordMethod = document.querySelector('input[name="password-method"]:checked').value;
        let password, confirmPassword;

        if (passwordMethod === 'manual') {
            password = document.getElementById("password").value;
            confirmPassword = document.getElementById("confirm-password").value;
        } else {
            password = generatedPasswordSpan.textContent;
            confirmPassword = generatedPasswordSpan.textContent;
        }

        const cardNumber = document.getElementById("card-number").value.trim();
        const expiryDate = document.getElementById("expiry-date").value.trim();
        const cvv = document.getElementById("cvv").value.trim();
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

        if (!phone.match(/^\+375\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/)) {
            alert("Please enter a valid Belarusian phone number (+375 XX XXX XX XX)");
            return;
        }

        if (!cardNumber.match(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)) {
            alert("Please enter a valid card number (16 digits)");
            return;
        }

        if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
            alert("Please enter a valid expiry date (MM/YY)");
            return;
        }

        if (!cvv.match(/^\d{3}$/)) {
            alert("Please enter a valid CVV (3 digits)");
            return;
        }

        try {
            // Проверка на существующий email
            const checkEmailResponse = await fetch(`http://localhost:3000/users?email=${email}`);
            const existingUsers = await checkEmailResponse.json();

            if (existingUsers.length > 0) {
                alert("This email is already registered. Please use another one.");
                return;
            }

            const newUser = {
                firstName,
                lastName,
                middleName,
                username,
                phone,
                email,
                birthDate,
                passwordMethod,
                password,
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryDate,
                cvv,
                newsletter,
                createdAt: new Date().toISOString(),
                role: "user"
            };

            const response = await fetch("http://localhost:3000/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify({
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    username: newUser.username,
                    phone: newUser.phone,
                    loggedIn: true,
                    token: 'generated-token-here',
                    role: newUser.role
                }));

                localStorage.setItem('lastLogin', new Date().toISOString());

                window.location.href = '/main_page/index.html';
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Registration failed");
                console.error("Registration error:", errorData);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Network error. Please try again later.");
        }
    });
});