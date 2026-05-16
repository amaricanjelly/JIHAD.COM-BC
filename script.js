const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game states
const STATES = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Game variables
let gameState = STATES.IDLE;
let score = 0;
let gameSpeed = 5;
let baseSpeed = 5;

// Bike object
const bike = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    width: 40,
    height: 50,
    speed: 0,
    maxSpeed: 8,
    boosting: false,
    boostEndTime: 0
};

// Arrays for obstacles and coins
let obstacles = [];
let coins = [];

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === STATES.PLAYING && !bike.boosting) {
            activateBoost();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Button controls
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);

function startGame() {
    if (gameState === STATES.IDLE) {
        gameState = STATES.PLAYING;
        resetGameVariables();
        gameLoop();
    }
}

function togglePause() {
    if (gameState === STATES.PLAYING) {
        gameState = STATES.PAUSED;
        document.getElementById('pauseBtn').textContent = 'Resume';
    } else if (gameState === STATES.PAUSED) {
        gameState = STATES.PLAYING;
        document.getElementById('pauseBtn').textContent = 'Pause';
        gameLoop();
    }
}

function resetGame() {
    gameState = STATES.IDLE;
    resetGameVariables();
    drawGameStart();
}

function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    startGame();
}

function resetGameVariables() {
    score = 0;
    gameSpeed = 5;
    baseSpeed = 5;
    bike.x = canvas.width / 2 - 20;
    bike.y = canvas.height - 100;
    bike.boosting = false;
    obstacles = [];
    coins = [];
    updateUI();
}

function activateBoost() {
    bike.boosting = true;
    bike.boostEndTime = Date.now() + 3000; // 3 seconds boost
}

function updateBike() {
    // Handle horizontal movement
    if (keys['arrowleft'] || keys['a']) {
        bike.x = Math.max(0, bike.x - 6);
    }
    if (keys['arrowright'] || keys['d']) {
        bike.x = Math.min(canvas.width - bike.width, bike.x + 6);
    }

    // Update boost status
    if (bike.boosting && Date.now() > bike.boostEndTime) {
        bike.boosting = false;
    }
}

function spawnObstacle() {
    const width = 50;
    const height = 40;
    const x = Math.random() * (canvas.width - width);
    obstacles.push({
        x: x,
        y: -height,
        width: width,
        height: height,
        scored: false
    });
}

function spawnCoin() {
    const radius = 8;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    coins.push({
        x: x,
        y: -radius * 2,
        radius: radius,
        collected: false
    });
}

function updateGameObjects() {
    // Update obstacles
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += gameSpeed;

        // Check if passed bike
        if (!obstacles[i].scored && obstacles[i].y > bike.y + bike.height) {
            score += 5;
            obstacles[i].scored = true;
        }

        // Check collision with bike
        if (checkCollision(bike, obstacles[i])) {
            endGame();
        }
    }

    // Update coins
    for (let i = 0; i < coins.length; i++) {
        coins[i].y += gameSpeed;

        // Check collision with bike
        const dx = bike.x + bike.width / 2 - coins[i].x;
        const dy = bike.y + bike.height / 2 - coins[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bike.width / 2 + coins[i].radius) {
            score += 10;
            coins[i].collected = true;
        }
    }

    // Remove off-screen objects
    obstacles = obstacles.filter(obs => obs.y < canvas.height);
    coins = coins.filter(coin => coin.y < canvas.height);

    // Increase difficulty
    baseSpeed = 5 + Math.floor(score / 100) * 0.5;
    gameSpeed = bike.boosting ? baseSpeed * 1.15 : baseSpeed;
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw road lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 4, 0);
    ctx.lineTo(canvas.width / 4, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((canvas.width * 3) / 4, 0);
    ctx.lineTo((canvas.width * 3) / 4, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw obstacles
    ctx.fillStyle = '#ff6b6b';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Draw pattern on obstacle
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);
        ctx.fillStyle = '#ff6b6b';
    }

    // Draw coins
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffed4e';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    // Draw bike
    drawBike();

    // Draw boost effect
    if (bike.boosting) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
        ctx.fillRect(bike.x - 5, bike.y + bike.height, bike.width + 10, 20);
        ctx.fillStyle = 'rgba(255, 69, 0, 0.7)';
        ctx.fillRect(bike.x, bike.y + bike.height + 5, bike.width, 15);
    }
}

function drawBike() {
    // Bike body
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(bike.x, bike.y, bike.width, bike.height);

    // Bike frame (red)
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bike.x + bike.width / 2, bike.y);
    ctx.lineTo(bike.x + 5, bike.y + bike.height);
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bike.x + 10, bike.y + bike.height, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bike.x + bike.width - 10, bike.y + bike.height, 6, 0, Math.PI * 2);
    ctx.fill();

    // Wheel detail
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bike.x + 10, bike.y + bike.height, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bike.x + bike.width - 10, bike.y + bike.height, 4, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGameStart() {
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚴 Bike Race Game', canvas.width / 2, canvas.height / 2 - 80);

    ctx.font = '24px Arial';
    ctx.fillText('Click "Start Game" to begin', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Avoid red obstacles, collect gold coins', canvas.width / 2, canvas.height / 2 + 40);
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('speed').textContent = Math.round(gameSpeed * 10) / 10;
}

function endGame() {
    gameState = STATES.GAME_OVER;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function gameLoop() {
    if (gameState === STATES.PLAYING) {
        // Spawn new obstacles and coins
        if (Math.random() < 0.02) spawnObstacle();
        if (Math.random() < 0.01) spawnCoin();

        updateBike();
        updateGameObjects();
        updateUI();

        drawGame();

        requestAnimationFrame(gameLoop);
    } else if (gameState === STATES.PAUSED) {
        drawGame();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Start with the game start screen
drawGameStart();