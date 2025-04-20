// script.js
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const wolf = document.getElementById('wolf');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer');
    const comboCounter = document.getElementById('combo-counter');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const totalBalanceDisplay = document.getElementById('total-balance');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;
    let score = 0;
    let timeLeft = 60;
    let gameInterval;
    let coinInterval;
    let timerInterval;
    let isGameRunning = false;
    let combo = 0;
    let lastCatchTime = 0;
    let wolfPosition = containerWidth / 2 - 40;
    let totalBalance = parseInt(localStorage.getItem('totalBalance')) || 0;
    let scoreMultiplier = 1;
    let multiplierTimeout = null;

    totalBalanceDisplay.textContent = `Общий баланс: ${totalBalance} кодкоинов`;

    wolf.style.left = `${wolfPosition}px`;

    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        const wolfWidth = wolf.offsetWidth;
        const speed = 20;
        if (e.key === 'ArrowLeft' && wolfPosition > 0) {
            wolfPosition = Math.max(0, wolfPosition - speed);
            wolf.style.left = `${wolfPosition}px`;
        } else if (e.key === 'ArrowRight' && wolfPosition < containerWidth - wolfWidth) {
            wolfPosition = Math.min(containerWidth - wolfWidth, wolfPosition + speed);
            wolf.style.left = `${wolfPosition}px`;
        }
    });

    gameContainer.addEventListener('touchmove', (e) => {
        if (!isGameRunning) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = gameContainer.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const wolfWidth = wolf.offsetWidth;
        wolfPosition = Math.max(0, Math.min(touchX - wolfWidth/2, containerWidth - wolfWidth));
        wolf.style.left = `${wolfPosition}px`;
    });

    function createCoin() {
        if (!isGameRunning) return;
        const isRock = Math.random() < 0.2; // 20% шанс на камень
        const isSpecialCoin = Math.random() < 0.1; // 10% шанс на золотую монету
        const item = document.createElement('div');
        
        if (isRock) {
            item.className = 'rock';
        } else if (isSpecialCoin) {
            item.className = 'special-coin';
        } else {
            item.className = 'coin';
        }
        
        const itemX = Math.random() * (containerWidth - 30);
        item.style.left = `${itemX}px`;
        item.style.top = '-30px';
        gameContainer.appendChild(item);
        let itemY = -30;
        const itemSpeed = 2 + Math.random() * 3;
        
        const itemFall = setInterval(() => {
            if (!isGameRunning) {
                clearInterval(itemFall);
                return;
            }
            itemY += itemSpeed;
            item.style.top = `${itemY}px`;
            
            if (checkCollision(wolf, item)) {
                if (isRock) {
                    hitRock(item, itemFall);
                } else if (isSpecialCoin) {
                    catchSpecialCoin(item, itemFall);
                } else {
                    catchCoin(item, itemFall);
                }
            }
            
            if (itemY > containerHeight) {
                clearInterval(itemFall);
                gameContainer.removeChild(item);
                if (!isRock) resetCombo();
            }
        }, 16);
    }
    function hitRock(rock, rockFall) {
        clearInterval(rockFall);
        gameContainer.removeChild(rock);
        createExplosion(rock);
        score = Math.max(0, score - 20); // Отнимаем 20 очков
        scoreDisplay.textContent = `Кодкоины: ${score}`;
        resetCombo();
    }
    // Новая функция для золотых монет
function catchSpecialCoin(coin, coinFall) {
    clearInterval(coinFall);
    gameContainer.removeChild(coin);
    createExplosion(coin);
    scoreMultiplier = 2;
    scoreDisplay.style.color = '#FF4500'; // Визуальный индикатор бонуса
    if (multiplierTimeout) clearTimeout(multiplierTimeout);
    multiplierTimeout = setTimeout(() => {
        scoreMultiplier = 1;
        scoreDisplay.style.color = '#FFD700';
    }, 10000); // 10 секунд
    score += 20 * scoreMultiplier;
    scoreDisplay.textContent = `Кодкоины: ${score}`;
}

    function checkCollision(wolf, coin) {
        const wolfRect = wolf.getBoundingClientRect();
        const coinRect = coin.getBoundingClientRect();
        return !(
            coinRect.right < wolfRect.left || 
            coinRect.left > wolfRect.right || 
            coinRect.bottom < wolfRect.top || 
            coinRect.top > wolfRect.bottom
        );
    }

    // Модифицировать функцию catchCoin для учета множителя
function catchCoin(coin, coinFall) {
    clearInterval(coinFall);
    gameContainer.removeChild(coin);
    createExplosion(coin);
    const now = Date.now();
    const timeDiff = now - lastCatchTime;
    if (timeDiff < 1000) {
        combo++;
        if (combo > 1) {
            showCombo();
        }
        score += 10 * combo * scoreMultiplier;
    } else {
        combo = 1;
        score += 10 * scoreMultiplier;
    }
    lastCatchTime = now;
    scoreDisplay.textContent = `Кодкоины: ${score}`;
}

    function createExplosion(coin) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        const coinRect = coin.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        const x = coinRect.left - containerRect.left + coinRect.width/2 - 25;
        const y = coinRect.top - containerRect.top + coinRect.height/2 - 25;
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        gameContainer.appendChild(explosion);
        setTimeout(() => {
            gameContainer.removeChild(explosion);
        }, 500);
    }

    function showCombo() {
        comboCounter.textContent = `Комбо: x${combo}!`;
        comboCounter.style.display = 'block';
        comboCounter.style.animation = 'none';
        void comboCounter.offsetWidth;
        comboCounter.style.animation = 'pulse 0.5s 2';
        setTimeout(() => {
            comboCounter.style.display = 'none';
        }, 1000);
    }

    function resetCombo() {
        if (combo > 1) {
            combo = 0;
            comboCounter.style.display = 'none';
        }
    }

    function startTimer() {
        timeLeft = 60;
        timerDisplay.textContent = `Время: ${timeLeft}`;
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Время: ${timeLeft}`;
            if (timeLeft <= 10) {
                timerDisplay.style.color = '#e94560';
                timerDisplay.style.animation = 'pulse 0.5s infinite';
            }
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function startGame() {
        if (isGameRunning) return;
        score = 0;
        timeLeft = 60;
        combo = 0;
        lastCatchTime = 0;
        scoreDisplay.textContent = `Кодкоины: ${score}`;
        timerDisplay.textContent = `Время: ${timeLeft}`;
        timerDisplay.style.color = '#FFD700';
        timerDisplay.style.animation = 'none';
        document.querySelectorAll('.coin').forEach(coin => coin.remove());
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        isGameRunning = true;
        startTimer();
        coinInterval = setInterval(createCoin, 800);
    }

    function endGame() {
        isGameRunning = false;
        clearInterval(coinInterval);
        clearInterval(timerInterval);
        totalBalance += score;
        localStorage.setItem('totalBalance', totalBalance);
        totalBalanceDisplay.textContent = `Общий баланс: ${totalBalance} кодкоинов`;
        finalScoreDisplay.textContent = `Вы собрали: ${score} кодкоинов`;
        gameOverScreen.style.display = 'flex';
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Очистить таймер множителя при завершении игры
function endGame() {
    isGameRunning = false;
    clearInterval(coinInterval);
    clearInterval(timerInterval);
    if (multiplierTimeout) clearTimeout(multiplierTimeout);
    scoreMultiplier = 1;
    scoreDisplay.style.color = '#FFD700';
    totalBalance += score;
    localStorage.setItem('totalBalance', totalBalance);
    totalBalanceDisplay.textContent = `Общий баланс: ${totalBalance} кодкоинов`;
    finalScoreDisplay.textContent = `Вы собрали: ${score} кодкоинов`;
    gameOverScreen.style.display = 'flex';
}

    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        createControls();
    }
});