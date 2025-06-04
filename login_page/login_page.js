document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("login-btn");

    loginBtn.addEventListener("click", async function () {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`http://localhost:3000/users?email=${email}&password=${password}`);
            const users = await response.json();

            if (users.length > 0) {
                const user = users[0];

                // Сохраняем пользователя в localStorage, как в регистрации
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    phone: user.phone,
                    loggedIn: true,
                    role : user.role
                }));

                // Сохраняем дату входа
                localStorage.setItem('lastLogin', new Date().toISOString());

                // Перенаправление на главную страницу
                window.location.href = "/main_page/index.html";
            } else {
                alert("Invalid email or password.");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Server error.");
        }
    });
});
