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
      populateCategoryOptions(products);

      if (isAdmin) {
        addAddProductButton();
      }

      applyFilters(isAdmin);
    });

  // Слушатели фильтров
  searchInput.addEventListener('input', () => applyFilters(isAdmin));
  sortPrice.addEventListener('change', () => applyFilters(isAdmin));
  filterCategory.addEventListener('change', () => applyFilters(isAdmin));

  // Закрытие модалки редактирования
  document.getElementById('closeModal').onclick = () => {
    document.getElementById('editModal').style.display = 'none';
  };

  // Отправка изменений продукта
  document.getElementById('editForm').addEventListener('submit', onEditFormSubmit);

  // Удаление продукта
  document.getElementById('deleteProduct').addEventListener('click', onDeleteProductClick);

  // Модалка добавления товара — слушатели и логика
  setupAddProductModal(isAdmin);
});

function addAddProductButton() {
  if (document.querySelector('.add-product-button')) return; // Чтобы не добавить несколько кнопок
  const addButton = document.createElement('button');
  addButton.textContent = 'Добавить товар';
  addButton.className = 'add-product-button';
  addButton.addEventListener('click', () => {
    openAddModal();
  });
  document.getElementById('controls').appendChild(addButton);
}

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
  renderPagination(isAdmin);
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

function renderPagination(isAdmin) {
  pagination.innerHTML = '';
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.classList.toggle('active', i === currentPage);
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderProducts(isAdmin);
      renderPagination(isAdmin);
    });
    pagination.appendChild(pageBtn);
  }
}

function editProduct(productId) {
  const product = allProducts.find(p => p.id === productId || p.id === String(productId));
  if (!product) return;

  document.getElementById('editId').value = product.id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editOldPrice').value = product.oldPrice;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editImage').value = product.image;
  document.getElementById('editProductImage').src = product.image;

  document.getElementById('editModal').style.display = 'block';
}

function onEditFormSubmit(e) {
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
    return fetch('http://localhost:3000/products');
  })
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = user?.role === 'admin';
    applyFilters(isAdmin);
  });
}

function onDeleteProductClick() {
  const id = document.getElementById('editId').value;

  if (confirm('Вы уверены, что хотите удалить этот товар?')) {
    fetch(`http://localhost:3000/products/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        alert('Товар удалён');
        document.getElementById('editModal').style.display = 'none';
        return fetch('http://localhost:3000/products');
      } else {
        throw new Error('Ошибка при удалении товара');
      }
    })
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      const user = JSON.parse(localStorage.getItem('currentUser'));
      const isAdmin = user?.role === 'admin';
      applyFilters(isAdmin);
    })
    .catch(err => alert(err.message));
  }
}

function populateCategoryOptions(products) {
  const categorySelect = document.getElementById('filterCategory');
  const categories = [...new Set(products.map(p => p.category))];
  categorySelect.innerHTML = '<option value="">Все категории</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Также заполняем категории в редактировании
  const editCategorySelect = document.getElementById('editCategory');
  if (editCategorySelect) {
    editCategorySelect.innerHTML = '';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      editCategorySelect.appendChild(option);
    });
  }
}

function setupAddProductModal(isAdmin) {
  if (!isAdmin) return;

  const addModal = document.getElementById('addModal');
  const addForm = document.getElementById('addForm');
  const closeAddModalBtn = document.getElementById('closeAddModal');
  const addCategorySelect = document.getElementById('addCategory');

  function openAddModal() {
    populateAddCategoryOptions();
    addModal.style.display = 'block';
  }

  function closeAddModal() {
    addModal.style.display = 'none';
    addForm.reset();
  }

  window.addEventListener('click', (event) => {
    if (event.target === addModal) {
      closeAddModal();
    }
  });

  closeAddModalBtn.addEventListener('click', closeAddModal);

  function populateAddCategoryOptions() {
    const categories = [...new Set(allProducts.map(p => p.category))];
    addCategorySelect.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      addCategorySelect.appendChild(option);
    });
  }

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newProduct = {
      id: String(allProducts.length+1),
      name: document.getElementById('addName').value.trim(),
      category: addCategorySelect.value,
      image: document.getElementById('addImage').value.trim(),
      oldPrice: parseFloat(document.getElementById('addOldPrice').value),
      price: parseFloat(document.getElementById('addPrice').value),
      rating: 5,
      ratingImage: "./assets/five_star.png"
    };

    fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
    .then(res => {
      if (!res.ok) throw new Error('Ошибка при добавлении');
      return res.json();
    })
    .then(() => {
      alert('Товар успешно добавлен');
      closeAddModal();

      return fetch('http://localhost:3000/products');
    })
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      applyFilters(true);
    })
    .catch(err => alert(err.message));
  });

  // Экспорт функции открытия модалки, чтобы использовать в кнопке добавления
  window.openAddModal = openAddModal;
}
