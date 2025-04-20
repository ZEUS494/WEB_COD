const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const startGameButton = document.getElementById('startGameButton');
const gameOverModal = document.getElementById('gameOverModal');
const restartButton = document.getElementById('restartButton');
const finalScore = document.getElementById('finalScore');
const finalCoins = document.getElementById('finalCoins');
let initialBrickColumnCount = Math.floor(window.innerWidth / (window.innerWidth <= 480 ? 60 : window.innerWidth <= 768 ? 70 : 80));
let brickRowCount = 15; // Можно также сделать настраиваемым
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameStarted = false;

// Состояние игры
let score = 0;
let coins = 0;
let level = 1;
let lives = 3;
let activeBonuses = [];

function updateUI() {
    document.getElementById('score').innerText = score;
    document.getElementById('coins').innerText = coins;
    document.getElementById('level').innerText = level;
    document.getElementById('lives').innerText = lives;
    const indicator = document.getElementById('bonusIndicator');
    if (activeBonuses.length > 0) {
        indicator.innerHTML = activeBonuses.map(b => 
            `${getBonusName(b.type)} (${Math.ceil((b.endTime - Date.now())/1000)}с)`
        ).join(' | ');
    } else {
        indicator.innerText = 'Нет активных бонусов';
    }
}

function getBonusName(type) {
    switch(type) {
        case 'extend': return 'Удлинение';
        case 'speed': return 'Скорость';
        case 'multiball': return 'Многомячик';
        case 'shield': return 'Щит';
        default: return type;
    }
}

// Элементы игры
let ballRadius = window.innerWidth <= 480 ? 6 : window.innerWidth <= 768 ? 8 : 12;
let paddleWidth = window.innerWidth <= 480 ? 80 : window.innerWidth <= 768 ? 100 : 180;
let paddleHeight = window.innerWidth <= 480 ? 10 : window.innerWidth <= 768 ? 12 : 18;
let paddleX = (canvas.width - paddleWidth) / 2;
let ballX = canvas.width / 2, ballY = canvas.height - 50;
let ballDX = 5, ballDY = -5;
const baseBallSpeed = 5;

// Настройки кирпичей
let brickColumnCount = Math.floor(canvas.width / (window.innerWidth <= 480 ? 60 : window.innerWidth <= 768 ? 70 : 80));
const brickWidth = (canvas.width - 20) / brickColumnCount - 5;
const brickHeight = 20, brickPadding = 5;
const brickOffsetTop = 60;

// Настройки монет и бонусов
const coinRadius = window.innerWidth <= 480 ? 6 : 10;
const bonusRadius = window.innerWidth <= 480 ? 8 : 12;
const bonusTypes = ['extend', 'speed', 'multiball', 'shield'];

// Настройки босса
let isBossLevel = false;
let bossHealth = 0;
let bossX, bossY, bossWidth = window.innerWidth <= 480 ? 200 : window.innerWidth <= 768 ? 250 : 300, bossHeight = 60;

// Объекты игры
let bricks = [];
const coinsArray = [];
const bonuses = [];
const balls = [{x: ballX, y: ballY, dx: ballDX, dy: ballDY}];

// Обработка ввода
let rightPressed = false, leftPressed = false;
let touchStartX = null;
let paddleVelocity = 0;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousemove', mouseMoveHandler);
canvas.addEventListener('touchstart', touchStartHandler);
canvas.addEventListener('touchmove', touchMoveHandler);
canvas.addEventListener('touchend', touchEndHandler);

function keyDownHandler(e) {
    if(e.key === "ArrowRight") rightPressed = true;
    else if(e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if(e.key === "ArrowRight") rightPressed = false;
    else if(e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX;
    if(relativeX > paddleWidth/2 && relativeX < canvas.width - paddleWidth/2) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function touchStartHandler(e) {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
}

function touchMoveHandler(e) {
    e.preventDefault();
    if (touchStartX !== null) {
        const touchX = e.touches[0].clientX;
        const deltaX = touchX - touchStartX;
        paddleVelocity = deltaX * 0.5; // Adjust sensitivity
        paddleX += paddleVelocity;
        paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
        touchStartX = touchX;
    }
}

function touchEndHandler(e) {
    e.preventDefault();
    touchStartX = null;
    paddleVelocity = 0;
}

// Инициализация кирпичей
function initBricks() {
    bricks = [];
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
    for(let c = 0; c < initialBrickColumnCount; c++) {
        bricks[c] = [];
        for(let r = 0; r < brickRowCount; r++) {
            const color = colors[(r + c) % colors.length];
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1,
                color: color,
                health: level > 5 ? 2 : 1
            };
        }
    }
}
initBricks();

// Функции отрисовки
function drawPaddle() {
    const gradient = ctx.createLinearGradient(0, canvas.height - paddleHeight, 0, canvas.height);
    gradient.addColorStop(0, '#00c8ff');
    gradient.addColorStop(1, '#007bff');
    ctx.shadowColor = 'rgba(0, 140, 255, 0.7)';
    ctx.shadowBlur = 15;
    ctx.fillStyle = gradient;
    ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
}

function drawBall(ball) {
    const gradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ballRadius
    );
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(1, '#00c8ff');
    ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    if (isBossLevel) {
        drawBoss();
        return;
    }
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if(brick.status === 1) {
                const brickX = c * (brickWidth + brickPadding) + 10;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 5;
                ctx.fillStyle = brick.color;
                ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(brickX, brickY, brickWidth, brickHeight);
                if (brick.health > 1) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '12px Roboto';
                    ctx.textAlign = 'center';
                    ctx.fillText(brick.health.toString(), brickX + brickWidth/2, brickY + brickHeight/2 + 4);
                    ctx.textAlign = 'left';
                }
            }
        }
    }
}

function drawBoss() {
    const gradient = ctx.createLinearGradient(bossX, bossY, bossX, bossY + bossHeight);
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(1, '#b30000');
    ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = gradient;
    ctx.fillRect(bossX, bossY, bossWidth, bossHeight);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(bossX, bossY, bossWidth, bossHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText(`БОСС: ${bossHealth} HP`, bossX + bossWidth/2, bossY - 15);
    ctx.textAlign = 'left';
}

function drawCoins() {
    coinsArray.forEach(coin => {
        const gradient = ctx.createRadialGradient(
            coin.x, coin.y, 0,
            coin.x, coin.y, coinRadius
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coinRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(coin.x - coinRadius/3, coin.y - coinRadius/3, coinRadius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.closePath();
    });
}

function drawBonuses() {
    bonuses.forEach(bonus => {
        let color1, color2;
        switch(bonus.type) {
            case 'extend': color1 = '#00ff7f'; color2 = '#008040'; break;
            case 'speed': color1 = '#FFA500'; color2 = '#FF6347'; break;
            case 'multiball': color1 = '#FF69B4'; color2 = '#FF1493'; break;
            case 'shield': color1 = '#1E90FF'; color2 = '#00BFFF'; break;
        }
        const gradient = ctx.createRadialGradient(
            bonus.x, bonus.y, 0,
            bonus.x, bonus.y, bonusRadius
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.shadowColor = `rgba(${parseInt(color1.slice(1,3), 16)}, ${parseInt(color1.slice(3,5), 16)}, ${parseInt(color1.slice(5,7), 16)}, 0.8)`;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bonus.x, bonus.y, bonusRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText(getBonusSymbol(bonus.type), bonus.x, bonus.y + 4);
        ctx.textAlign = 'left';
    });
}

function getBonusSymbol(type) {
    switch(type) {
        case 'extend': return '↔️';
        case 'speed': return '⚡';
        case 'multiball': return '💫';
        case 'shield': return '🛡️';
        default: return '';
    }
}

// Логика игры
function collisionDetection() {
    const hitboxMultiplier = 1.2; // Увеличение хитбокса на 20%
    if (isBossLevel) {
        balls.forEach(ball => {
            if (ball.x + ballRadius*hitboxMultiplier > bossX && 
                ball.x - ballRadius*hitboxMultiplier < bossX + bossWidth && 
                ball.y + ballRadius*hitboxMultiplier > bossY && 
                ball.y - ballRadius*hitboxMultiplier < bossY + bossHeight) {
                ball.dy = -ball.dy;
                bossHealth--;
                score += 20;
                updateUI();
                if (bossHealth <= 0) {
                    endBossLevel();
                }
            }
        });
        return;
    }
    balls.forEach(ball => {
        for(let c = 0; c < initialBrickColumnCount; c++) {
            for(let r = 0; r < brickRowCount; r++) {
                const brick = bricks[c][r];
                if(brick.status === 1) {
                    if(ball.x + ballRadius*hitboxMultiplier > brick.x && 
                       ball.x - ballRadius*hitboxMultiplier < brick.x + brickWidth && 
                       ball.y + ballRadius*hitboxMultiplier > brick.y && 
                       ball.y - ballRadius*hitboxMultiplier < brick.y + brickHeight) {
                        ball.dy = -ball.dy;
                        brick.health--;
                        if (brick.health <= 0) {
                            brick.status = 0;
                            if(Math.random() < 0.4) {
                                coinsArray.push({
                                    x: brick.x + brickWidth / 2, 
                                    y: brick.y + brickHeight / 2
                                });
                            }
                            if(Math.random() < 0.15) {
                                bonuses.push({
                                    x: brick.x + brickWidth / 2,
                                    y: brick.y + brickHeight / 2,
                                    type: bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
                                });
                            }
                        }
                        score += 5;
                        updateUI();
                    }
                }
            }
        }
    });
}

function coinCollection() {
    coinsArray.forEach((coin, index) => {
        if(coin.y > canvas.height - paddleHeight - 10 &&
           coin.x > paddleX && coin.x < paddleX + paddleWidth) {
            coins += 1;
            updateUI();
            coinsArray.splice(index, 1);
        } else {
            coin.y += 3;
            if (coin.y > canvas.height) coinsArray.splice(index, 1);
        }
    });
}

function bonusCollection() {
    for (let i = bonuses.length - 1; i >= 0; i--) {
        const bonus = bonuses[i];
        if(bonus.y > canvas.height - paddleHeight - 10 &&
           bonus.x > paddleX && bonus.x < paddleX + paddleWidth) {
            const duration = 10000;
            const endTime = Date.now() + duration;
            switch(bonus.type) {
                case 'extend':
                    paddleWidth += window.innerWidth <= 480 ? 40 : window.innerWidth <= 768 ? 50 : 60;
                    activeBonuses.push({type: 'extend', endTime});
                    setTimeout(() => {
                        paddleWidth = Math.max(window.innerWidth <= 480 ? 80 : window.innerWidth <= 768 ? 100 : 120, paddleWidth - (window.innerWidth <= 480 ? 40 : window.innerWidth <= 768 ? 50 : 60));
                        activeBonuses = activeBonuses.filter(b => b.type !== 'extend');
                    }, duration);
                    break;
                case 'speed':
                    balls.forEach(ball => {
                        // Гарантируем, что скорость не станет меньше базовой
                        ball.dx = Math.sign(ball.dx) * Math.max(Math.abs(ball.dx) * 1.5, baseBallSpeed);
                        ball.dy = Math.sign(ball.dy) * Math.max(Math.abs(ball.dy) * 1.5, baseBallSpeed);
                    });
                    activeBonuses.push({type: 'speed', endTime});
                    setTimeout(() => {
                        balls.forEach(ball => {
                            // Возвращаем к базовой скорости, но не ниже
                            ball.dx = Math.sign(ball.dx) * baseBallSpeed;
                            ball.dy = Math.sign(ball.dy) * baseBallSpeed;
                        });
                        activeBonuses = activeBonuses.filter(b => b.type !== 'speed');
                    }, duration);
                    break;
                case 'multiball':
                    for (let i = 0; i < 2; i++) {
                        const angle = Math.random() * Math.PI/2 - Math.PI/4;
                        balls.push({
                            x: paddleX + paddleWidth/2,
                            y: canvas.height - paddleHeight - ballRadius,
                            dx: baseBallSpeed * Math.cos(angle),
                            dy: -baseBallSpeed * Math.sin(angle)
                        });
                    }
                    break;
                case 'shield':
                    activeBonuses.push({type: 'shield', endTime});
                    setTimeout(() => {
                        activeBonuses = activeBonuses.filter(b => b.type !== 'shield');
                    }, duration);
                    break;
            }
            bonuses.splice(i, 1);
            updateUI();
        } else {
            bonus.y += 3;
            if (bonus.y > canvas.height) bonuses.splice(i, 1);
        }
    }
}

function startBossLevel() {
    isBossLevel = true;
    bossHealth = 20 + (level * 2);
    bossX = (canvas.width - bossWidth) / 2;
    bossY = 100;
    bricks = [];
    bonuses.length = 0;
    coinsArray.length = 0;
}

function endBossLevel() {
    isBossLevel = false;
    level++;
    coins += 100;
    updateUI();
    initBricks();
    resetBall();
}

function checkLevelComplete() {
    if (isBossLevel) return;
    let bricksLeft = 0;
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) bricksLeft++;
        }
    }
    if (bricksLeft === 0) {
        if (level % 5 === 0) {
            startBossLevel();
        } else {
            level++;
            updateUI();
            initBricks();
            resetBall();
        }
    }
}

function resetBall() {
    balls.length = 1;
    balls[0] = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        dx: baseBallSpeed,
        dy: -baseBallSpeed
    };
}

function showGameOverScreen() {
    cancelAnimationFrame(animationFrame);
    gameOverModal.style.display = 'flex';
    finalScore.innerText = score;
    finalCoins.innerText = coins;
}

function checkBallLoss() {
    for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].y + balls[i].dy > canvas.height - ballRadius) {
            if (balls[i].x + ballRadius > paddleX && balls[i].x - ballRadius < paddleX + paddleWidth) {
                balls[i].dy = -balls[i].dy;
                const hitPosition = (balls[i].x - paddleX) / paddleWidth;
                balls[i].dx = 5 * (hitPosition - 0.5);
            } else {
                const hasShield = activeBonuses.some(b => b.type === 'shield');
                if (hasShield) {
                    balls[i].dy = -balls[i].dy;
                    activeBonuses = activeBonuses.filter(b => b.type !== 'shield');
                    updateUI();
                } else {
                    balls.splice(i, 1);
                }
            }
        }
    }
    if (balls.length === 0) {
        lives--;
        if (lives <= 0) {
            showGameOverScreen();
        } else {
            resetBall();
        }
    }
}

// Главный игровой цикл
let animationFrame;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    balls.forEach(ball => drawBall(ball));
    drawPaddle();
    drawCoins();
    drawBonuses();
    collisionDetection();
    coinCollection();
    bonusCollection();
    checkLevelComplete();
    checkBallLoss();
    
    balls.forEach(ball => {
        if(ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if(ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    });
    
    if(rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 10;
    } else if(leftPressed && paddleX > 0) {
        paddleX -= 10;
    }
    
    activeBonuses = activeBonuses.filter(bonus => bonus.endTime > Date.now());
    updateUI();
    animationFrame = requestAnimationFrame(draw);
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        startScreen.style.display = 'none';
        draw();
    }
}

updateUI();

// Обработчики событий
startGameButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    document.location.reload();
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    paddleX = (canvas.width - paddleWidth) / 2;
    ballRadius = window.innerWidth <= 480 ? 6 : window.innerWidth <= 768 ? 8 : 12;
    paddleWidth = window.innerWidth <= 480 ? 80 : window.innerWidth <= 768 ? 100 : 180;
    paddleHeight = window.innerWidth <= 480 ? 10 : window.innerWidth <= 768 ? 12 : 18;
    bossWidth = window.innerWidth <= 480 ? 200 : window.innerWidth <= 768 ? 250 : 300;
});