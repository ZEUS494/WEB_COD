document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBeCuMUazd-l9D0vPqfBrNJYSxCgOG6DeY",
        authDomain: "codweb-4d1aa.firebaseapp.com",
        projectId: "codweb-4d1aa",
        storageBucket: "codweb-4d1aa.appspot.com",
        messagingSenderId: "892570211314",
        appId: "1:892570211314:web:4888edb47d69cbd809d16b",
        measurementId: "G-57GYQLP328"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // Проверяем авторизацию пользователя
    const currentUser = getCookie('user');
    if (!currentUser) {
        window.location.href = '../profile/index.html';
        return;
    }

    // Массив пастельных цветов
    const pastelColors = [
        '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', 
        '#bae1ff', '#d7aefb', '#ffbaec', '#ffccdc'
    ];

    // Загрузка заданий из Firestore
    async function loadQuests() {
        try {
            // Загружаем ежедневные задания
            const dailyDoc = await db.collection('quests').doc('daily').get();
            if (dailyDoc.exists) {
                const dailyQuests = dailyDoc.data().quests || [];
                updateQuestElements('daily', dailyQuests);
            } else {
                console.log("Документ 'daily' не найден в Firestore");
            }

            // Загружаем еженедельные задания
            const weeklyDoc = await db.collection('quests').doc('weekly').get();
            if (weeklyDoc.exists) {
                const weeklyQuests = weeklyDoc.data().quests || [];
                updateQuestElements('weekly', weeklyQuests);
            } else {
                console.log("Документ 'weekly' не найден в Firestore");
            }
        } catch (error) {
            console.error("Ошибка загрузки заданий:", error);
            alert("Ошибка загрузки заданий. Попробуйте позже.");
        }
    }

    // Обновляем элементы заданий на странице
    function updateQuestElements(type, questsArray) {
        const questsContainer = document.querySelector(`#${type} .quests`);
        
        // Очищаем контейнер
        questsContainer.innerHTML = '';
        
        // Создаем блоки для каждого задания
        questsArray.forEach((questDescription, index) => {
            const questElement = document.createElement('div');
            questElement.className = 'quest';
            questElement.dataset.questId = `${type === 'daily' ? 'd' : 'w'}quest${index + 1}`;
            
            const titleElement = document.createElement('h1');
            titleElement.textContent = `Задание №${index + 1}`;
            
            const infoElement = document.createElement('p');
            infoElement.className = 'questinfo';
            infoElement.textContent = questDescription;
            
            questElement.appendChild(titleElement);
            questElement.appendChild(infoElement);
            
            // Устанавливаем случайный цвет
            const randomIndex = Math.floor(Math.random() * pastelColors.length);
            questElement.style.backgroundColor = pastelColors[randomIndex];
            
            questsContainer.appendChild(questElement);
        });
    }

    // Инициализация модальных окон
    function initModals() {
        const modal = document.querySelector('.modal');
        const closeButton = document.querySelector('.close-modal');
        const modalContainer = modal.querySelector('.modal-container');
        const modalTitle = modal.querySelector('.modal-title');
        const modalDescription = modal.querySelector('.modal-description');

        function openModal(questId) {
            const questElement = document.querySelector(`.quest[data-quest-id="${questId}"]`);
            if (!questElement) return;

            const title = questElement.querySelector('h1').textContent;
            const description = questElement.querySelector('.questinfo').textContent;
            const bgColor = window.getComputedStyle(questElement).getPropertyValue("background-color");

            modalTitle.textContent = title;
            modalDescription.textContent = description;
            modalContainer.style.backgroundColor = bgColor;
            modal.style.display = 'block';
        }

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.addEventListener('click', function(event) {
            if (modal.style.display === 'block' && !modalContainer.contains(event.target)) {
                modal.style.display = 'none';
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });

        // Делегирование событий для динамически созданных элементов
        document.querySelectorAll('.block').forEach(block => {
            block.addEventListener('click', function(event) {
                const questElement = event.target.closest('.quest');
                if (questElement) {
                    event.stopPropagation();
                    const questId = questElement.dataset.questId;
                    openModal(questId);
                }
            });
        });
    }

    // Инициализация модальных окон для игр и других функций
    function initGameModals() {
        const modalGame = document.getElementById('modalGame');
        const modalGameAfter = document.getElementById('modalGameAfter');
        const modalV = document.getElementById('modalV');
        const closeButtonGame = document.querySelector('.close-modal-game');
        const confirmButton = document.querySelector('.modal-game-confirm');
        const cancelButton = document.querySelector('.modal-game-cancel');
        const closeButtonAfter = document.getElementById('close');
        const closeButtonV = document.getElementById('closeV');
        const confirmButtonV = document.getElementById('confirmV');
        const cancelButtonV = document.getElementById('cancelV');
        const Vbtn = document.getElementById('Vbtn');
        const infoModal = document.getElementById("infoModal");
        const infoBtn = document.getElementById("infoBtn");
        const infoClose = infoModal.querySelector(".close");
        
        let currentGameUrl = '';

        function canPlayToday() {
            const lastPlay = getCookie("lastPlayDate");
            if (!lastPlay) return true;
            const lastPlayDate = new Date(lastPlay);
            const today = new Date();
            return lastPlayDate.getDate() !== today.getDate() ||
                   lastPlayDate.getMonth() !== today.getMonth() ||
                   lastPlayDate.getFullYear() !== today.getFullYear();
        }

        function canWithdrawThisWeek() {
            const lastWithdraw = getCookie("lastWithdrawDate");
            if (!lastWithdraw) return true;
            const lastWithdrawDate = new Date(lastWithdraw);
            const today = new Date();
            const diffTime = Math.abs(today - lastWithdrawDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 7;
        }

        function openGameModal(gameUrl) {
            if (canPlayToday()) {
                currentGameUrl = gameUrl;
                modalGame.style.display = 'block';
            } else {
                modalGameAfter.querySelector('.modal-game-description').textContent =
                    'Вы уже играли сегодня. Возвращайтесь завтра!';
                modalGameAfter.style.display = 'block';
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

        function closeModalGameAfter() {
            modalGameAfter.style.display = 'none';
        }

        function openModalV() {
            if (canWithdrawThisWeek()) {
                modalV.style.display = 'block';
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

        // Обработчики событий для игр
        closeButtonGame.addEventListener('click', closeGameModal);
        cancelButton.addEventListener('click', closeGameModal);
        confirmButton.addEventListener('click', startGame);
        closeButtonAfter.addEventListener('click', closeModalGameAfter);
        Vbtn.addEventListener('click', openModalV);
        closeButtonV.addEventListener('click', closeModalV);
        cancelButtonV.addEventListener('click', closeModalV);
        confirmButtonV.addEventListener('click', confirmWithdraw);
        infoBtn.onclick = () => {
            infoModal.style.display = "block";
            updateCoinsInfo();
        };
        infoClose.onclick = () => {
            infoModal.style.display = "none";
        };

        document.querySelectorAll('div.snake, div.wolf, div.arkanoid').forEach((game) => {
            game.addEventListener('click', () => {
                const gameUrl = game.classList.contains('snake') ? "/minigames/snake/snake.html" :
                                game.classList.contains('wolf') ? "/minigames/wolf/wolf.html" :
                                "/minigames/arkanoid/arkanoid.html";
                openGameModal(gameUrl);
            });
        });

        document.addEventListener('click', (event) => {
            if (modalGameAfter.style.display === 'block' && event.target === modalGameAfter) {
                closeModalGameAfter();
            }
            if (modalGame.style.display === 'block' && event.target === modalGame) {
                closeGameModal();
            }
            if (modalV.style.display === 'block' && event.target === modalV) {
                closeModalV();
            }
            if (event.target === infoModal) {
                infoModal.style.display = "none";
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (modalGame.style.display === 'block') closeGameModal();
                if (modalGameAfter.style.display === 'block') closeModalGameAfter();
                if (modalV.style.display === 'block') closeModalV();
                if (infoModal.style.display === 'block') infoModal.style.display = "none";
            }
        });

        // Инициализация данных
        updateCoinsInfo();
    }

    // Вспомогательные функции для работы с куками
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = encodeURIComponent(name) + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.startsWith(nameEQ)) return decodeURIComponent(c.slice(nameEQ.length));
        }
        return null;
    }

    // Инициализация всех функций
    loadQuests();
    initModals();
    initGameModals();

    // Присваиваем цвета мини-играм
    document.querySelectorAll('#minigame').forEach((element, index) => {
        const randomIndex = Math.floor(Math.random() * pastelColors.length);
        element.style.backgroundColor = pastelColors[randomIndex];
    });
});