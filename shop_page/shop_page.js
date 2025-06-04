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
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const isAdmin = user?.role === 'admin';

  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(products => {
      allProducts = products;

      // Добавление кнопки "Добавить товар"
      if (isAdmin) {
        const addButton = document.createElement('button');
        addButton.textContent = 'Добавить товар';
        addButton.className = 'add-product-button';
        addButton.addEventListener('click', () => {
          window.location.href = '../admin/add_product.html';
        });
        document.getElementById('controls').appendChild(addButton);
      }

      applyFilters(isAdmin);
    });

  // Слушатели фильтров
  searchInput.addEventListener('input', () => applyFilters(isAdmin));
  sortPrice.addEventListener('change', () => applyFilters(isAdmin));
  filterCategory.addEventListener('change', () => applyFilters(isAdmin));
});

function applyFilters(isAdmin) {
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
  renderProducts(isAdmin);
  renderPagination();
}

function renderProducts(isAdmin) {
  container.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const productsToShow = filteredProducts.slice(start, end);

  productsToShow.forEach(product => {
    const productElement = document.createElement('div');
    productElement.className = 'base-rectangle';

    productElement.innerHTML = `
      ${isAdmin ? `<div class="product-edit-icon" title="Редактировать товар" onclick="event.stopPropagation(); editProduct(${product.id})">
        <img src="./assets/edit.svg" alt="Edit" style="width: 30px; height: 30px;" />
      </div>` : ''}
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
      const user = JSON.parse(localStorage.getItem('user'));
      const isAdmin = user?.role === 'admin';
      renderProducts(isAdmin);
      renderPagination();
    });
    pagination.appendChild(pageBtn);
  }
}

function editProduct(productId) {
  const product = allProducts.find(p => p.id === productId.toString());
  if (!product) return;

  // Заполнить форму
  document.getElementById('editId').value = product.id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editOldPrice').value = product.oldPrice;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editImage').value = product.image;

  // Показать модалку
  document.getElementById('editModal').style.display = 'block';
}

// Закрытие модалки
document.getElementById('closeModal').onclick = () => {
  document.getElementById('editModal').style.display = 'none';
};

// Отправка изменений
document.getElementById('editForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const updatedProduct = {
    name: document.getElementById('editName').value,
    category: document.getElementById('editCategory').value,
    oldPrice: parseFloat(document.getElementById('editOldPrice').value),
    price: parseFloat(document.getElementById('editPrice').value),
    image: document.getElementById('editImage').value,
  };

  fetch(`http://localhost:3000/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct)
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById('editModal').style.display = 'none';
    // Перезагрузить товары
    return fetch('http://localhost:3000/products');
  })
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    applyFilters(true);
  });
});
