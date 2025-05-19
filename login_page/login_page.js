fetch('/templates/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header-container').innerHTML = html;
            // Инициализируем корзину (если нужно)
            updateCartCounter();
        });