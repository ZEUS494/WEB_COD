document.addEventListener('DOMContentLoaded', () => {
    // Массив пастельных цветов
    const pastelColors = [
        '#ffb3ba', // Розовый
        '#ffdfba', // Персиковый
        '#ffffba', // Лимонный
        '#baffc9', // Мятный
        '#bae1ff', // Голубой
        '#d7aefb', // Лавандовый
        '#ffbaec', // Сиреневый
        '#ffccdc'  // Бежевый
    ];

    // Присваиваем случайные цвета элементам .quest и #minigame
    document.querySelectorAll('.quest, #minigame').forEach((element) => {
        let randomIndex = Math.floor(Math.random() * pastelColors.length);
        element.style.backgroundColor = pastelColors[randomIndex];
    });

    // Модальное окно для квестов
    const modal = document.querySelector('.modal');
    const closeButton = document.querySelector('.close-modal');
    const modalContainer = modal.querySelector('.modal-container');

    function openModal(questId) {
        const questElement = document.querySelector(`.quest[data-quest-id="${questId}"]`);
        if (!questElement) return;

        const title = questElement.querySelector('h1').textContent;
        const description = questElement.querySelector('.questinfo').textContent;
        const bgColor = window.getComputedStyle(questElement).getPropertyValue("background-color");

        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-description').textContent = description;
        modalContainer.style.backgroundColor = bgColor;
        modal.style.display = 'block';
    }

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.addEventListener('click', (event) => {
        if (modal.style.display === 'block' && !modalContainer.contains(event.target)) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    document.querySelectorAll('.quest').forEach((quest) => {
        quest.addEventListener('click', (event) => {
            event.stopPropagation();
            openModal(quest.dataset.questId);
        });
    });

    // Модальное окно для мини-игр
    const modalGame = document.getElementById('modalGame');
    const modalGameAfter = document.getElementById('modalGameAfter');
    const closeButtonGame = document.querySelector('.close-modal-game');
    const confirmButton = document.querySelector('.modal-game-confirm');
    const cancelButton = document.querySelector('.modal-game-cancel');
    let currentGameUrl = '';

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    function canPlayToday() {
        const lastPlay = getCookie("lastPlayDate");
        if (!lastPlay) return true;
        const lastPlayDate = new Date(lastPlay);
        const today = new Date();
        return lastPlayDate.getDate() !== today.getDate() ||
               lastPlayDate.getMonth() !== today.getMonth() ||
               lastPlayDate.getFullYear() !== today.getFullYear();
    }
    function ModalFlex(){
        modalGame.style.display = 'block';
    }
    function ModalAfterFlex(){
        modalGameAfter.style.display = 'block';
    }
    function ModalV(){
        modalV.style.display = 'block';
    }
    function openGameModal(gameUrl) {

        if (canPlayToday()) {
            
            currentGameUrl = gameUrl;
            ModalFlex();
        } else {
            modalGameAfter.querySelector('.modal-game-description').textContent =
                'Вы уже играли сегодня. Возвращайтесь завтра!';
            ModalAfterFlex()
        }
    }

    function startGame() {
        setCookie("lastPlayDate", new Date().toUTCString(), 1);
        window.location.href = currentGameUrl;
        modalGame.style.display = 'none';
    }

    function closeGameModal() {
        modalGame.style.display = 'none';
        currentGameUrl = '';
    }

    closeButtonGame.addEventListener('click', closeGameModal);
    cancelButton.addEventListener('click', closeGameModal);
    confirmButton.addEventListener('click', startGame);

    document.addEventListener('click', (event) => {
        if (modalGame.style.display === 'flex' && !event.target.closest('.modal-game-container')) {
            closeGameModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalGame.style.display === 'flex') {
            closeGameModal();
        }
    });

    document.querySelectorAll('div.snake, div.wolf, div.arkanoid').forEach((game) => {
        game.addEventListener('click', () => {
            const gameUrl = game.classList.contains('snake') ? "/minigames/snake/snake.html" :
                            game.classList.contains('wolf') ? "/minigames/wolf/wolf.html" :
                            "/minigames/arkanoid/arkanoid.html";
            openGameModal(gameUrl);
        });
    });

    // Модальное окно после игры
    const closeButtonAfter = document.getElementById('close');
    const modalGameAfterContainer = modalGameAfter.querySelector('.modal-game-container');

    function closeModalGameAfter() {
        modalGameAfter.style.display = 'none';
    }

    closeButtonAfter.addEventListener('click', closeModalGameAfter);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalGameAfter.style.display === 'block') {
            closeModalGameAfter();
        }
    });

    // Модальное окно вывода
    const modalV = document.getElementById('modalV');
    const closeButtonV = document.getElementById('closeV');
    const confirmButtonV = document.getElementById('confirmV');
    const cancelButtonV = document.getElementById('cancelV');
    const Vbtn = document.getElementById('Vbtn');

    function canWithdrawThisWeek() {
        const lastWithdraw = getCookie("lastWithdrawDate");
        if (!lastWithdraw) return true;
        const lastWithdrawDate = new Date(lastWithdraw);
        const today = new Date();
        const diffTime = Math.abs(today - lastWithdrawDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
    }

    function openModalV() {
        if (canWithdrawThisWeek()) {

            ModalV()
        } else {
            modalGameAfter.querySelector('.modal-game-description').textContent =
                'Вы уже выводили кодкоины на этой неделе. Возвращайтесь через неделю!';
            modalGameAfter.style.display = 'block';
        }
    }

    function closeModalV() {
        modalV.style.display = 'none';
    }

    function confirmWithdraw() {
        setCookie("lastWithdrawDate", new Date().toUTCString(), 7);
        console.log('Вывод подтвержден! Следующий вывод будет доступен через неделю.');
        closeModalV();
    }

    Vbtn.addEventListener('click', openModalV);
    closeButtonV.addEventListener('click', closeModalV);
    cancelButtonV.addEventListener('click', closeModalV);
    confirmButtonV.addEventListener('click', confirmWithdraw);

    document.addEventListener('click', (event) => {
        if (modalV.style.display === 'flex' && !event.target.closest('.modal-game-container')) {
            closeModalV();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalV.style.display === 'block') {
            closeModalV();
        }
    });

    // Модальное окно информации
    const infoModal = document.getElementById("infoModal");
    const infoBtn = document.getElementById("infoBtn");
    const infoClose = infoModal.querySelector(".close");

    function updateCoinsInfo() {
        const snakeCoins = localStorage.getItem('Snake') || 0;
        const wolfCoins = localStorage.getItem('Wolf') || 0;
        const arkanoidCoins = localStorage.getItem('Arkanoid') || 0;
        const totalCoins = parseInt(snakeCoins) + parseInt(wolfCoins) + parseInt(arkanoidCoins);

        document.querySelector('#infoModal .game-item:nth-child(1) .coins-count').textContent = `${snakeCoins} кодкоинов`;
        document.querySelector('#infoModal .game-item:nth-child(2) .coins-count').textContent = `${wolfCoins} кодкоинов`;
        document.querySelector('#infoModal .game-item:nth-child(3) .coins-count').textContent = `${arkanoidCoins} кодкоинов`;
        document.querySelector('#infoModal .game-item.total .coins-count').textContent = `${totalCoins} кодкоинов`;

        document.querySelector('.cashing h3').textContent = `Баланс: ${totalCoins} кодкоинов`;
    }

    infoBtn.onclick = () => {
        infoModal.style.display = "block";
        updateCoinsInfo();
    };

    infoClose.onclick = () => {
        infoModal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === infoModal) {
            infoModal.style.display = "none";
        }
    };

    // Инициализация данных
    updateCoinsInfo();
});