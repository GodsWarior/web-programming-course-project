// Загрузка header
fetch('/templates/header.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;
        // Инициализация меню и других элементов
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

        // Инициализация корзины
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

        // Инициализация авторизации
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        const signInLink = document.getElementById('sign-in-link');
        const signUpLink = document.getElementById('sign-up-link');
        const signOutLink = document.getElementById('Account-link');

        const sideSignInLink = document.getElementById('side-sign-in');
        const sideSignUpLink = document.getElementById('side-sign-up');
        const sideSignOutLink = document.getElementById('Account-sign');

        function logout() {
            localStorage.removeItem('currentUser');
            localStorage.setItem('cart', JSON.stringify([]));
            location.reload();
        }

        function redirectToAccountPage() {
            window.location.href = '/user_account/account.html';
        }

        if (currentUser) {
            if (signInLink) signInLink.style.display = 'none';
            if (signUpLink) signUpLink.style.display = 'none';
            if (signOutLink) {
                signOutLink.style.display = 'inline';
                signOutLink.addEventListener('click', redirectToAccountPage);
            }

            if (sideSignInLink) sideSignInLink.style.display = 'none';
            if (sideSignUpLink) sideSignUpLink.style.display = 'none';
            if (sideSignOutLink) {
                sideSignOutLink.style.display = 'inline';
                sideSignOutLink.addEventListener('click', redirectToAccountPage);
            }
        } else {
            if (signOutLink) signOutLink.style.display = 'none';
            if (sideSignOutLink) sideSignOutLink.style.display = 'none';
        }

        // Инициализация темы ПОСЛЕ загрузки header
        initThemeToggle();

        // Инициализация переключателя языка
        initLanguageSwitcher();

        // Инициализация модального окна версии для слабовидящих
        initAccessibilityModal();
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

function initLanguageSwitcher() {
    // Проверяем сохраненный язык (по умолчанию - английский)
    let currentLang = localStorage.getItem('language') || 'en';

    // Функция для обновления текста на странице
    function updatePageText() {
        // Обновляем элементы с атрибутом data-transate
        document.querySelectorAll('[data-transate]').forEach(element => {
            const key = element.getAttribute('data-transate');
            if (translations[currentLang] && translations[currentLang][key]) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translations[currentLang][key];
                } else {
                    element.textContent = translations[currentLang][key];
                }
            }
        });

        // Обновляем элементы с атрибутом data-translate (опечатка в header.html)
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[currentLang] && translations[currentLang][key]) {
                element.textContent = translations[currentLang][key];
            }
        });
    }

    // Инициализация переключателей
    const languageToggle = document.getElementById('language-toggle');
    const sideLanguageToggle = document.getElementById('side-language-toggle');

    // Устанавливаем начальное состояние переключателей
    if (languageToggle) languageToggle.checked = currentLang === 'ru';
    if (sideLanguageToggle) sideLanguageToggle.checked = currentLang === 'ru';

    // Обработчики событий для переключателей
    if (languageToggle) {
        languageToggle.addEventListener('change', function() {
            currentLang = this.checked ? 'ru' : 'en';
            localStorage.setItem('language', currentLang);
            updatePageText();
            
            // Синхронизируем состояние бокового переключателя
            if (sideLanguageToggle) {
                sideLanguageToggle.checked = this.checked;
            }
        });
    }

    if (sideLanguageToggle) {
        sideLanguageToggle.addEventListener('change', function() {
            currentLang = this.checked ? 'ru' : 'en';
            localStorage.setItem('language', currentLang);
            updatePageText();
            
            // Синхронизируем состояние основного переключателя
            if (languageToggle) {
                languageToggle.checked = this.checked;
            }
        });
    }

    // Первоначальное обновление текста
    updatePageText();
}

// Отдельная функция для инициализации переключателя темы
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    if (!themeToggle) {
        console.error('Theme toggle element not found!');
        return;
    }

    function setTheme(isDark) {
        if (isDark) {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.checked = true;
            console.log('Dark theme applied');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.checked = false;
            console.log('Light theme applied');
        }
    }
    
    // Проверяем сохранённую тему
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else if (systemPrefersDark) {
        setTheme(true);
    } else {
        setTheme(false);
    }
    
    themeToggle.addEventListener('change', function() {
        setTheme(this.checked);
        console.log('Theme changed to:', this.checked ? 'dark' : 'light');
    });
    
    // Отслеживание изменений системных предпочтений
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches);
            }
        });
    }
}




function initAccessibilityModal() {
    const settingsButton = document.getElementById('settings-button');
    const sideSettingsButton = document.getElementById('side-settings-button');
    const accessibilityModal = document.getElementById('accessibility-modal');
    const closeAccessibility = document.getElementById('close-accessibility');
    const applyAccessibility = document.getElementById('apply-accessibility');
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    const colorSchemeButtons = document.querySelectorAll('.color-scheme-btn');
    const imagesToggle = document.getElementById('images-toggle');
    const resetAccessibility = document.getElementById('reset-accessibility');


     let hiddenImageElements = [];

  // Скрыть изображения вне header и footer
  function hideImages() {
    hiddenImageElements = [];
    const allElements = document.body.querySelectorAll('*');

    allElements.forEach(el => {
      if (el.closest('#header-container') || el.closest('#footer-container')) return;

      // Скрытие <img>
      if (el.tagName === 'IMG') {
        el.dataset._wasDisplayed = el.style.display || '';
        el.style.display = 'none';
        hiddenImageElements.push(el);
      }

      // Скрытие background-image
      const computedStyle = getComputedStyle(el);
      if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
        el.dataset._hadBg = 'true';
        el.dataset._originalBg = el.style.backgroundImage || '';
        el.style.backgroundImage = 'none';
        hiddenImageElements.push(el);
      }
    });
  }

  // Показать изображения
  function showImages() {
    hiddenImageElements.forEach(el => {
      if (el.tagName === 'IMG') {
        el.style.display = el.dataset._wasDisplayed || '';
        delete el.dataset._wasDisplayed;
      }

      if (el.dataset._hadBg) {
        el.style.backgroundImage = el.dataset._originalBg || '';
        delete el.dataset._hadBg;
        delete el.dataset._originalBg;
      }
    });

    hiddenImageElements = [];
  }

    function openAccessibilityModal() {
        accessibilityModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeAccessibilityModal() {
        accessibilityModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Обработчики для открытия модального окна
    if (settingsButton) {
        settingsButton.addEventListener('click', function(e) {
            e.preventDefault();
            openAccessibilityModal();
        });
    }

    if (sideSettingsButton) {
        sideSettingsButton.addEventListener('click', function(e) {
            e.preventDefault();
            openAccessibilityModal();
        });
    }

    // Обработчик для закрытия модального окна
    if (closeAccessibility) {
        closeAccessibility.addEventListener('click', closeAccessibilityModal);
    }

    // Обработчики для кнопок размера шрифта
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Обработчики для кнопок цветовой схемы
    colorSchemeButtons.forEach(button => {
        button.addEventListener('click', function() {
            colorSchemeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Обработчик сброса настроек
    if (resetAccessibility) {
        resetAccessibility.addEventListener('click', function() {
            // Удаляем все настройки из localStorage
            localStorage.removeItem('fontSize');
            localStorage.removeItem('colorScheme');
            localStorage.removeItem('showImages');

            // Сбрасываем атрибуты на элементе <html>
            document.documentElement.removeAttribute('data-font-size');
            document.documentElement.removeAttribute('data-color-scheme');
            document.documentElement.setAttribute('data-images', 'show');

            // Сброс активных классов
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            const mediumFont = document.querySelector('.font-size-btn[data-size="medium"]');
            if (mediumFont) mediumFont.classList.add('active');

            colorSchemeButtons.forEach(btn => btn.classList.remove('active'));
            const defaultScheme = document.querySelector('.color-scheme-btn[data-scheme="default"]');
            if (defaultScheme) defaultScheme.classList.add('active');

            showImages();
            imagesToggle.checked = true;
        });
    }

    // Обработчик для применения настроек
    if (applyAccessibility) {
        applyAccessibility.addEventListener('click', function() {
            // Применение размера шрифта
            const activeFontSize = document.querySelector('.font-size-btn.active').dataset.size;
            document.documentElement.setAttribute('data-font-size', activeFontSize);
            localStorage.setItem('fontSize', activeFontSize);

            // Применение цветовой схемы (с обработкой дефолтной схемы)
            const activeColorScheme = document.querySelector('.color-scheme-btn.active').dataset.scheme;
            if (activeColorScheme === 'default') {
                document.documentElement.removeAttribute('data-color-scheme');
                localStorage.removeItem('colorScheme');
            } else {
                document.documentElement.setAttribute('data-color-scheme', activeColorScheme);
                localStorage.setItem('colorScheme', activeColorScheme);
            }

            const showImgs = imagesToggle.checked;
            if (showImgs) {
                showImages();
                localStorage.setItem('showImages', 'true');
            } else {
                hideImages();
                localStorage.setItem('showImages', 'false');
            }
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            closeAccessibilityModal();
        });
    }

    // Закрытие по клику вне модального окна
    accessibilityModal.addEventListener('click', function(e) {
        if (e.target === accessibilityModal) {
            closeAccessibilityModal();
        }
    });

    // Восстановление сохраненных настроек при загрузке
    function loadAccessibilitySettings() {
        // Размер шрифта
        const savedFontSize = localStorage.getItem('fontSize') || 'medium';
        document.documentElement.setAttribute('data-font-size', savedFontSize);
        const fontSizeBtn = document.querySelector(`.font-size-btn[data-size="${savedFontSize}"]`);
        if (fontSizeBtn) fontSizeBtn.classList.add('active');

        // Цветовая схема (с обработкой дефолтной схемы)
        const savedColorScheme = localStorage.getItem('colorScheme');
        if (savedColorScheme) {
            document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
            const colorSchemeBtn = document.querySelector(`.color-scheme-btn[data-scheme="${savedColorScheme}"]`);
            if (colorSchemeBtn) colorSchemeBtn.classList.add('active');
        } else {
            const defaultSchemeBtn = document.querySelector('.color-scheme-btn[data-scheme="default"]');
            if (defaultSchemeBtn) defaultSchemeBtn.classList.add('active');
        }

        const savedShowImages = localStorage.getItem('showImages') !== 'false';
         if (savedShowImages) {
            showImages();
        } else {
            hideImages();
        }

        imagesToggle.checked = savedShowImages;

        }

    // Вызываем при загрузке
    loadAccessibilitySettings();
}