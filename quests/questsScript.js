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

// Получаем все элементы .quest
const questElements = document.querySelectorAll('.quest');

// Присваиваем случайные цвета каждому элементу
questElements.forEach((element, index) => {
    // Выбираем случайный индекс цвета из массива
    let randomIndex = Math.floor(Math.random() * pastelColors.length);
    
    // Назначаем выбранный цвет элементу
    element.style.backgroundColor = pastelColors[randomIndex];
});
const minigame = document.querySelectorAll('#minigame');

// Присваиваем случайные цвета каждому элементу
minigame.forEach((element, index) => {
    // Выбираем случайный индекс цвета из массива
    let randomIndex = Math.floor(Math.random() * pastelColors.length);
    
    // Назначаем выбранный цвет элементу
    element.style.backgroundColor = pastelColors[randomIndex];
});

// Получаем элементы модального окна
const modal = document.querySelector('.modal');
const closeButton = document.querySelector('.close-modal');
const modalContainer = modal.querySelector('.modal-container');
const modalTitle = modal.querySelector('.modal-title');
const modalDescription = modal.querySelector('.modal-description');

function openModal(questId) {
    console.log(`Opening modal for quest with ID: ${questId}`);

    const questElement = document.querySelector(`.quest[data-quest-id="${questId}"]`);
    if (!questElement) {
        console.error(`Quest element not found for ID: ${questId}`);
        return;
    }

    const title = questElement.querySelector('h1').textContent;
    const description = questElement.querySelector('.questinfo').textContent;
    const bgColor = window.getComputedStyle(questElement).getPropertyValue("background-color"); // Получаем цвет фона выбранного элемента

    console.log(`Title: ${title}, Description: ${description}`);

    modalTitle.textContent = title;
    modalDescription.textContent = description;
    modalContainer.style.backgroundColor = bgColor; // Применяем цвет фона к модальному окну

    modal.style.display = 'block'; // Показываем модальное окно
}

// Закрытие модального окна при клике на кнопку "X"
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Обрабатываем клики вне модального контейнера
document.addEventListener('click', function(event) {
    // Если кликнули вне модального контейнера и модальное окно активно
    if (modal.style.display === 'block' && !modalContainer.contains(event.target)) {
        modal.style.display = 'none';
    }
});

// Добавляем обработчик для нажатия клавиши Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

// Открываем модальное окно при клике на квест
questElements.forEach(quest => {
    quest.addEventListener('click', function(event) {
        event.stopPropagation(); // Останавливаем всплытие события
        const questId = this.dataset.questId;
        openModal(questId);
    });
});
const snake = document.querySelector("div.snake").addEventListener('click', function(){
    window.location.href = "/minigames/snake/snake.html"
})
const wolf = document.querySelector("div.wolf").addEventListener('click', function(){
    window.location.href = "/minigames/wolf/wolf.html"
})
const arkanoid = document.querySelector("div.arkanoid").addEventListener('click', function(){
    window.location.href = "/minigames/arkanoid/arkanoid.html"
})