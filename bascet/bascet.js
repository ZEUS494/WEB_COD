document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Firebase (только если не была инициализирована ранее)
    if (!firebase.apps.length) {
        const firebaseConfig = {
            apiKey: "AIzaSyBeCuMUazd-l9D0vPqfBrNJYSxCgOG6DeY",
            authDomain: "codweb-4d1aa.firebaseapp.com",
            projectId: "codweb-4d1aa",
            storageBucket: "codweb-4d1aa.firebasestorage.app",
            messagingSenderId: "892570211314",
            appId: "1:892570211314:web:4888edb47d69cbd809d16b",
            measurementId: "G-57GYQLP328"
        };
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-container');
    const cartItemsContainer = cartContainer.querySelector('.cart-items');
    const cartHeader = cartContainer.querySelector('.cart-header span');
    const clearCartBtn = cartContainer.querySelector('.clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const balanceAmount = document.getElementById('balance-amount');

    function loadUserBalance() {
        const currentUser = getCookie('user');
        if (!currentUser) return;

        db.collection("users").doc(currentUser).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                balanceAmount.textContent = userData.codcoins || 0;
            }
        }).catch(err => {
            console.error("Ошибка загрузки баланса:", err);
        });
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let totalAmount = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');

            cartItem.innerHTML = `
                <div class="item-info">
                    <img src="./${item.img}" alt="Product Image" class="item-image">
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


        clearCartBtn.addEventListener('click', () => {
            localStorage.removeItem('cart');
            cart.length = 0;
            renderCart();
        });

        if (cart.length === 0) {
            cartHeader.innerText = `${cart.length} предметов`;
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                     fill="none" stroke="#02eef4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="10" cy="20.5" r="1"/><circle cx="18" cy="20.5" r="1"/>
                        <path d="M2.5 2.5h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6l1.6-8.4H7.1"/>
                    </svg>
                    <p>Ваша корзина пуста</p>
                    <small>Вернитесь в магазин, чтобы добавить товары</small>
                </div>
            `;
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
        }
    }

    

    checkoutBtn.addEventListener('click', async () => {
        const currentUser = getCookie('user');
        if (!currentUser) {
            window.location.href = '../profile/index.html';
            return;
        }

        const totalAmount = parseFloat(cartContainer.querySelector('#total-sum').textContent);
        
        try {
            const userDoc = await db.collection("users").doc(currentUser).get();
            if (!userDoc.exists) {
                alert('Ошибка: пользователь не найден');
                return;
            }

            const userData = userDoc.data();
            const currentBalance = userData.codcoins || 0;

            if (currentBalance < totalAmount) {
                alert('Недостаточно кодкоинов для оформления заказа');
                return;
            }

            await db.collection("users").doc(currentUser).update({
                codcoins: firebase.firestore.FieldValue.increment(-totalAmount)
            });

            sendOrderToAdmins(currentUser, cart, totalAmount);

            localStorage.removeItem('cart');
            cart.length = 0;
            renderCart();
            
            loadUserBalance();
            
            alert('Заказ успешно оформлен! Кодкоины списаны.');
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
        }
    });

    // Заглушка для отправки заказа в Telegram
    function sendOrderToAdmins(user, items, total) {
        console.log(`Новый заказ от ${user}:`, items, `Общая сумма: ${total}`);
        // Здесь будет код для подключения к Telegram API
    }

    const isMobile = window.matchMedia('(max-width: 400px)').matches;
    if (isMobile) {
        document.querySelector('.background-animation').style.display = 'none';
    }

    loadUserBalance();
    renderCart();
});