document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.btn-new');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const modal = document.getElementById('modal');
    const modalProductName = document.getElementById('modal-product-name');
    const modalClose = document.getElementById('modal-close');
    const modalCart = document.getElementById('modal-cart');

    function showModal(productName) {
        modalProductName.textContent = productName;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', hideModal);
    modalCart.addEventListener('click', function() {
        window.location.href = '/bascet/bascet.html';
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            hideModal();
        }
    });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.closest('.post');
            const productName = product.querySelector('h3').innerText;
            const productPrice = parseFloat(product.querySelector('p').innerText.replace(/[^\d.]/g, ''));
            const productImgId = product.querySelector('div.top').id;
            
            // Формируем корректный URL изображения
            const productImg = `/shop/images/${productImgId}.jpg`; // Убедитесь, что путь соответствует структуре папок

            const productItem = {
                name: productName,
                price: productPrice,
                quantity: 1,
                img: productImg // Сохраняем URL изображения
            };

            const existingProduct = cart.find(item => item.name === productName);
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push(productItem);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            showModal(productName);
        });
    });
});