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

    // Инициализация модального окна для игр
    function initGameModal() {
        const modalGame = document.getElementById('modalGame');
        const closeButtonGame = document.querySelector('.close-modal-game');
        const confirmButton = document.querySelector('.modal-game-confirm');
        const cancelButton = document.querySelector('.modal-game-cancel');
        let currentGameUrl = '';

        function openGameModal(gameUrl) {
            const lastPlayDate = getCookie('lastPlayDate');
            const currentDate = new Date().toDateString();
            
            if (lastPlayDate !== currentDate) {
                currentGameUrl = gameUrl;
                modalGame.style.display = 'block';
            } else {
                alert('Вы уже играли сегодня. Возвращайтесь завтра!');
            }
        }

        function startGame() {
            const currentDate = new Date().toDateString();
            setCookie('lastPlayDate', currentDate, 1); // Кука на 1 день
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

        document.addEventListener('click', function(event) {
            if (modalGame.style.display === 'block' && !event.target.closest('.modal-game-container')) {
                closeGameModal();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modalGame.style.display === 'block') {
                closeGameModal();
            }
        });

        // Обработчики для мини-игр
        document.querySelector("div.snake")?.addEventListener('click', function() {
            openGameModal("../minigames/snake/snake.html");
        });

        document.querySelector("div.wolf")?.addEventListener('click', function() {
            openGameModal("../minigames/wolf/wolf.html");
        });

        document.querySelector("div.arkanoid")?.addEventListener('click', function() {
            openGameModal("../minigames/arkanoid/arkanoid.html");
        });
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
    initGameModal();

    // Присваиваем цвета мини-играм
    document.querySelectorAll('#minigame').forEach((element, index) => {
        const randomIndex = Math.floor(Math.random() * pastelColors.length);
        element.style.backgroundColor = pastelColors[randomIndex];
    });
});