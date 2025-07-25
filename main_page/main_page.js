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