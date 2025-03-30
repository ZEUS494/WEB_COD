document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-container');
    const cartItemsContainer = cartContainer.querySelector('.cart-items');
    const cartHeader = cartContainer.querySelector('.cart-header span');
    const clearCartBtn = cartContainer.querySelector('.clear-cart-btn');

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let totalAmount = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            cartItem.innerHTML = `
                <div class="item-info">
                    <img src="${item.img}" alt="Product Image" class="item-image">
                    <div class="item-details">
                        <p class="item-name">${item.name}</p>
                        <p class="item-price">${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn minus-btn">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus-btn">+</button>
                </div>
                <div class="item-total">${(item.price * item.quantity).toFixed(2)}<div class="coin"></div></div>
            `;

            const minusBtn = cartItem.querySelector('.minus-btn');
            const plusBtn = cartItem.querySelector('.plus-btn');
            const quantitySpan = cartItem.querySelector('.item-quantity span');

            minusBtn.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });

            plusBtn.addEventListener('click', () => {
                item.quantity += 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            });

            cartItemsContainer.appendChild(cartItem);
            totalAmount += item.price * item.quantity;
        });

        if (cart.length === 1) {
            cartHeader.innerText = `${cart.length} предмет`;
        } else if (cart.length >= 2 && cart.length <= 4) {
            cartHeader.innerText = `${cart.length} предмета`;
        } else if (cart.length >= 5) {
            cartHeader.innerText = `${cart.length} предметов`;
        }

        cartContainer.querySelector('#total-sum').innerText = totalAmount.toFixed(2);

        if (cart.length === 0) {
            cartHeader.innerText = `${cart.length} предметов`;
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bb86fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="10" cy="20.5" r="1"/><circle cx="18" cy="20.5" r="1"/>
                        <path d="M2.5 2.5h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6l1.6-8.4H7.1"/>
                    </svg>
                    <p>Ваша корзина пуста</p>
                    <small>Вернитесь в магазин, чтобы добавить товары</small>
                </div>
            `;
        }
    }

    clearCartBtn.addEventListener('click', () => {
        localStorage.removeItem('cart');
        cart.length = 0;
        renderCart();
    });
    // Добавьте в начало bascet.js
const isMobile = window.matchMedia('(max-width: 400px)').matches;

if (isMobile) {
    document.querySelector('.background-animation').style.display = 'none';
    // Другие оптимизации для мобильных устройств
}
    renderCart();
});