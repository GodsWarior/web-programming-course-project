// Загрузка и отображение продуктов
console.log(1);
document.addEventListener('DOMContentLoaded', function() {
    // Сначала получаем данные о покупках
    fetch('http://localhost:3000/purchase_products')
        .then(response => response.json())
        .then(purchases => {
            // Группируем покупки по productId и суммируем amount
            const purchaseSummary = purchases.reduce((acc, purchase) => {
                if (!acc[purchase.productId]) {
                    acc[purchase.productId] = 0;
                }
                acc[purchase.productId] += purchase.amount;
                return acc;
            }, {});
            
            // Получаем массив уникальных ID товаров
            const purchasedProductIds = Object.keys(purchaseSummary);
            
            
            // Загружаем все продукты
            return fetch('http://localhost:3000/products')
                .then(response => response.json())
                .then(products => {
                    // Фильтруем только купленные товары
                    const purchasedProducts = products.filter(product => 
                        purchasedProductIds.includes(product.id)
                    );
                    
                    // Добавляем информацию о суммарном количестве
                    return purchasedProducts.map(product => ({
                        ...product,
                        totalPurchased: purchaseSummary[product.id] || 0
                    }));
                });
        })
        .then(productsWithAmount => {
            const container = document.getElementById('products-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            productsWithAmount.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'base-rectangle';
                productElement.innerHTML = `
                    <div class="product-header">
                        <span class="delete-btn">&times;</span>
                    </div>
                    <img src="${product.image}" class="product-image" alt="${product.name}">
                    <p class="product_category">${product.category}</p>
                    <p class="product_name">${product.name}</p>
                    <div class="rectangle-line"></div>
                    <p class="price-line-through">$ ${product.oldPrice.toFixed(2)} USD</p>
                    <p class="current-price">$ ${product.price.toFixed(2)} USD</p>
                    <div class="amount-control">
                        <input type="number" id="amount-${product.id}" min="1" value="${product.totalPurchased}" data-product-id="${product.id}">
                    </div>
                `;                
                container.appendChild(productElement);
                productElement.querySelector('.delete-btn').addEventListener('click', async () => {
                    try {
                        const response = await fetch('http://localhost:3000/purchase_products');
                        const purchases = await response.json();
                        const toDelete = purchases.filter(p => p.productId === product.id);

                        await Promise.all(toDelete.map(p =>
                            fetch(`http://localhost:3000/purchase_products/${p.id}`, { method: 'DELETE' })
                        ));

                        productElement.remove();
                        updateCartCounter();
                    } catch (error) {
                        console.error('Delete error:', error);
                    }
                });
                productElement.querySelector(`#amount-${product.id}`).addEventListener('change', async (e) => {
                    const newAmount = parseInt(e.target.value);
                    if (isNaN(newAmount) || newAmount < 1) {
                        alert('Minimum quantity is 1');
                        e.target.value = product.totalPurchased;
                        return;
                    }

                    try {
                        const response = await fetch('http://localhost:3000/purchase_products');
                        const purchases = await response.json();
                        const existing = purchases.filter(p => p.productId === product.id);

                        // Удалить все записи
                        await Promise.all(existing.map(p =>
                            fetch(`http://localhost:3000/purchase_products/${p.id}`, { method: 'DELETE' })
                        ));

                        // Добавить новую с нужным количеством
                        await fetch('http://localhost:3000/purchase_products', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                productId: product.id,
                                amount: newAmount
                            })
                        });

                        updateCartCounter();
                    } catch (error) {
                        console.error('Update quantity error:', error);
                    }
                });


            });
        })
        .catch(error => console.error('Error loading data:', error));
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("order-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Получение данных формы
    const address = document.getElementById("delivery-address").value.trim();
    const recipient = document.getElementById("recipient-name").value.trim();
    const payment = document.querySelector("input[name='payment']:checked").value;
    const promo = document.getElementById("promo-code").value.trim();

    // Получение currentUser и cart из localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!currentUser || !currentUser.id) {
      alert("User not authorized.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Создание объекта заказа
    const order = {
      userId: currentUser.id,
      address: address,
      recipient: recipient,
      paymentMethod: payment,
      promoCode: promo || null,
      items: cart,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        clearCart();
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("An error occurred while placing the order.");
    }
  });
});



// Кнопка удаления
productElement.querySelector('.delete-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/purchase_products');
        const purchases = await response.json();
        const toDelete = purchases.filter(p => p.productId === product.id);

        await Promise.all(toDelete.map(p =>
            fetch(`http://localhost:3000/purchase_products/${p.id}`, { method: 'DELETE' })
        ));

        productElement.remove();
        updateCartCounter();
    } catch (error) {
        console.error('Delete error:', error);
    }
});

// Изменение количества
productElement.querySelector(`#amount-${product.id}`).addEventListener('change', async (e) => {
    const newAmount = parseInt(e.target.value);
    if (isNaN(newAmount) || newAmount < 1) {
        alert('Minimum quantity is 1');
        e.target.value = product.totalPurchased;
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/purchase_products');
        const purchases = await response.json();
        const existing = purchases.filter(p => p.productId === product.id);

        // Удалить все записи
        await Promise.all(existing.map(p =>
            fetch(`http://localhost:3000/purchase_products/${p.id}`, { method: 'DELETE' })
        ));

        // Добавить новую с нужным количеством
        await fetch('http://localhost:3000/purchase_products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: product.id,
                amount: newAmount
            })
        });

        updateCartCounter();
    } catch (error) {
        console.error('Update quantity error:', error);
    }
});
