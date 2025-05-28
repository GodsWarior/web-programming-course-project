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

//слайдер
  document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('testimonial-slider');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');

    let comments = [];
    let currentIndex = 0;

    function renderComment(comment) {
      slider.innerHTML = `
        <section class="fifth-block-second-section-overlay">
          <img src="${comment['profile-image']}" class="fifth-block-woman-image" alt="User Image">
          <img src="./assets/five_star_2.png" class="fifth-block-five-star-image" alt="five_star_image">
          <p class="fifth-block-quote">${comment.quote}</p>
          <h3>${comment.nickname}</h3>
          <p class="fifth-block-consumer">${comment.status}</p>
        </section>
      `;
    }

    function showComment(index) {
      if (comments.length > 0) {
        renderComment(comments[index]);
      }
    }

    fetch('http://localhost:3000/comments')
      .then(response => response.json())
      .then(data => {
        comments = data;
        showComment(currentIndex);
      })
      .catch(error => {
        console.error('Ошибка загрузки комментариев:', error);
      });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % comments.length;
      showComment(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + comments.length) % comments.length;
      showComment(currentIndex);
    });
  });


// Загрузка товаров
document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            const container = document.getElementById('products-container');
            
            // Показываем только первые 6 товаров
            const limitedProducts = products.slice(0, 6);

            limitedProducts.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'base-rectangle';
                productElement.innerHTML = `
                    <img src="${product.image}" class="product-image" alt="${product.name}">
                    <p class="product_category">${product.category}</p>
                    <p class="product_name">${product.name}</p>
                    <div class="rectangle-line"></div>
                    <p class="price-line-through">$ ${product.oldPrice.toFixed(2)} USD</p>
                    <p class="current-price">$ ${product.price.toFixed(2)} USD</p>
                    <img src="${product.ratingImage}" class="five-star-image" alt="Rating ${product.rating}">
                `;

                productElement.addEventListener('click', function () {
                    window.location.href = `../shop_single_page/single_shop_page.html?id=${product.id}`;
                });

                container.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error loading products:', error));
});


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