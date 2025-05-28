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

// Загрузка товаров
const container = document.getElementById('products-container');
const searchInput = document.getElementById('searchInput');
const sortPrice = document.getElementById('sortPrice');
const filterCategory = document.getElementById('filterCategory');
const pagination = document.getElementById('pagination');

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      allProducts = products;
      applyFilters();
    });
});

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedSort = sortPrice.value;
  const selectedCategory = filterCategory.value;

  filteredProducts = allProducts.filter(product => {
    return product.name.toLowerCase().includes(searchTerm) &&
           (selectedCategory ? product.category === selectedCategory : true);
  });

  if (selectedSort === 'asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  currentPage = 1;
  renderProducts();
  renderPagination();
}

function renderProducts() {
  container.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const productsToShow = filteredProducts.slice(start, end);

  productsToShow.forEach(product => {
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
    productElement.addEventListener('click', () => {
      window.location.href = `../shop_single_page/single_shop_page.html?id=${product.id}`;
    });
    container.appendChild(productElement);
  });
}

function renderPagination() {
  pagination.innerHTML = '';
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.classList.toggle('active', i === currentPage);
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderProducts();
      renderPagination();
    });
    pagination.appendChild(pageBtn);
  }
}

// Слушатели фильтров
searchInput.addEventListener('input', applyFilters);
sortPrice.addEventListener('change', applyFilters);
filterCategory.addEventListener('change', applyFilters);



// Функция добавления в корзину (оставлена для будущего использования)
function addToCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
}

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
