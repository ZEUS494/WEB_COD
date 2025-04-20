document.addEventListener('DOMContentLoaded', () => {
    const GRID_SIZE = 20;
    const CELL_SIZE = 20;
    const GAME_WIDTH = Math.floor(window.innerWidth * 0.9 / CELL_SIZE) * CELL_SIZE;
    const GAME_HEIGHT = Math.floor((window.innerHeight * 0.6) / CELL_SIZE) * CELL_SIZE;
    const GRID_COLS = GAME_WIDTH / CELL_SIZE;
    const GRID_ROWS = GAME_HEIGHT / CELL_SIZE;

    let snake = [{x: 10, y: 10}];
    let food = {x: 5, y: 5, value: 1};
    let direction = {x: 0, y: 0};
    let nextDirection = {x: 0, y: 0};
    let gameSpeed = 150;
    let score = 0;
    let speedLevel = 1;
    let gameLoop;
    let lastRenderTime = 0;
    let gameOver = false;

    // Баланс игрока (сохраняется в localStorage)
    let balance = parseInt(localStorage.getItem('balance')) || 0;
    const balanceElement = document.getElementById('balance');

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const speedElement = document.getElementById('speed');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');
    const startModal = document.getElementById('start-modal');
    const startGameBtn = document.getElementById('start-game-btn');

    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    gameContainer.style.width = `${GAME_WIDTH}px`;
    gameContainer.style.height = `${GAME_HEIGHT}px`;

    window.addEventListener('resize', () => {
        location.reload();
    });

    function initGame() {
        snake = [{x: Math.floor(GRID_COLS / 2), y: Math.floor(GRID_ROWS / 2)}];
        direction = {x: 0, y: 1};
        nextDirection = {x: 0, y: 1};
        score = 0;
        speedLevel = 1;
        gameOver = false;
        scoreElement.textContent = score;
        speedElement.textContent = `${speedLevel}x`;
        gameOverElement.classList.add('hidden');
        generateFood();
        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }
        lastRenderTime = 0;
        gameLoop = requestAnimationFrame(main);
        gameContainer.classList.remove('hidden');
    }

    function main(currentTime) {
        if (gameOver) return;
        gameLoop = requestAnimationFrame(main);
        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if (secondsSinceLastRender < gameSpeed / 1000) return;
        lastRenderTime = currentTime;
        update();
        draw();
    }

    function update() {
        direction = {...nextDirection};
        const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

        if (head.x < 0 || head.x >= GRID_COLS || head.y < 0 || head.y >= GRID_ROWS) {
            endGame();
            return;
        }

        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                endGame();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += food.value;
            scoreElement.textContent = score;

            if (score >= speedLevel * 10) {
                speedLevel++;
                gameSpeed = Math.max(50, gameSpeed - 20);
                speedElement.textContent = `${speedLevel}x`;
            }

            generateFood();
        } else {
            snake.pop();
        }
    }

    function draw() {
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < GRID_COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, GAME_HEIGHT);
            ctx.stroke();
        }

        for (let j = 0; j < GRID_ROWS; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * CELL_SIZE);
            ctx.lineTo(GAME_WIDTH, j * CELL_SIZE);
            ctx.stroke();
        }

        snake.forEach((segment, index) => {
            const isHead = index === 0;
            const colorValue = isHead ? 180 : 120 - Math.min(20, index);
            ctx.fillStyle = isHead ? '#48bb78' : `rgb(72, ${187 - index * 5}, ${120 - index * 2})`;
            ctx.strokeStyle = '#2f855a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(
                segment.x * CELL_SIZE, 
                segment.y * CELL_SIZE, 
                CELL_SIZE, 
                CELL_SIZE, 
                isHead ? 6 : 4
            );
            ctx.fill();
            ctx.stroke();

            if (isHead) {
                ctx.fillStyle = 'white';

                const leftEyeX = direction.x === 1 ? 14 : direction.x === -1 ? 6 : 10;
                const leftEyeY = direction.y === 1 ? 14 : direction.y === -1 ? 6 : 6;

                const rightEyeX = direction.x === 1 ? 14 : direction.x === -1 ? 6 : 10;
                const rightEyeY = direction.y === 1 ? 14 : direction.y === -1 ? 6 : 14;

                ctx.beginPath();
                ctx.arc(
                    segment.x * CELL_SIZE + leftEyeX, 
                    segment.y * CELL_SIZE + leftEyeY, 
                    2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();

                ctx.beginPath();
                ctx.arc(
                    segment.x * CELL_SIZE + rightEyeX, 
                    segment.y * CELL_SIZE + rightEyeY, 
                    2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        ctx.fillStyle = '#f6e05e';
        ctx.strokeStyle = '#d69e2e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE / 2, 
            food.y * CELL_SIZE + CELL_SIZE / 2, 
            CELL_SIZE / 2 - 2, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#d69e2e';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            '₭', 
            food.x * CELL_SIZE + CELL_SIZE / 2, 
            food.y * CELL_SIZE + CELL_SIZE / 2
        );
    }

    function generateFood() {
        const maxValue = Math.min(5, Math.floor(score / 10) + 1);
        food = {
            x: Math.floor(Math.random() * GRID_COLS),
            y: Math.floor(Math.random() * GRID_ROWS),
            value: Math.max(1, Math.floor(Math.random() * maxValue) + 1)
        };

        for (let i = 0; i < snake.length; i++) {
            if (food.x === snake[i].x && food.y === snake[i].y) {
                return generateFood();
            }
        }
    }

    function endGame() {
        gameOver = true;
        cancelAnimationFrame(gameLoop);
        finalScoreElement.textContent = score;
        gameOverElement.classList.remove('hidden');

        // Добавляем счет текущей игры к балансу
        balance += score;
        balanceElement.textContent = balance;
        localStorage.setItem('balance', balance);
    }

    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                if (direction.y === 0) nextDirection = {x: 0, y: -1};
                break;
            case 's':
            case 'arrowdown':
                if (direction.y === 0) nextDirection = {x: 0, y: 1};
                break;
            case 'a':
            case 'arrowleft':
                if (direction.x === 0) nextDirection = {x: -1, y: 0};
                break;
            case 'd':
            case 'arrowright':
                if (direction.x === 0) nextDirection = {x: 1, y: 0};
                break;
            case ' ':
                if (gameOver) initGame();
                break;
        }
    });

    upBtn.addEventListener('click', () => {
        if (direction.y === 0) nextDirection = {x: 0, y: -1};
    });

    downBtn.addEventListener('click', () => {
        if (direction.y === 0) nextDirection = {x: 0, y: 1};
    });

    leftBtn.addEventListener('click', () => {
        if (direction.x === 0) nextDirection = {x: -1, y: 0};
    });

    rightBtn.addEventListener('click', () => {
        if (direction.x === 0) nextDirection = {x: 1, y: 0};
    });

    restartBtn.addEventListener('click', initGame);

    let touchStartX = 0;
    let touchStartY = 0;

    gameContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);

    gameContainer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction.x === 0) {
                nextDirection = {x: 1, y: 0};
            } else if (dx < 0 && direction.x === 0) {
                nextDirection = {x: -1, y: 0};
            }
        } else {
            if (dy > 0 && direction.y === 0) {
                nextDirection = {x: 0, y: 1};
            } else if (dy < 0 && direction.y === 0) {
                nextDirection = {x: 0, y: -1};
            }
        }
    }, false);

    // Обработчик кнопки "Начать игру"
    startGameBtn.addEventListener('click', () => {
        startModal.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        initGame();
    });

    // Инициализация баланса при загрузке
    balanceElement.textContent = balance;
});