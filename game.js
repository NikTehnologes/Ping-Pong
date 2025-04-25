document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    
    // Game constants
    const PADDLE_WIDTH = 15;
    const PADDLE_HEIGHT = 90;
    const BALL_SIZE = 15;
    const baseBallSpeed = 7; // Base speed for ~800px width
    const PADDLE_SPEED = 8;
    
    // Game objects
    let player, opponent, ball;
    let ballSpeedX, ballSpeedY;
    let playerSpeed = 0;
    let opponentSpeed = 0;
    let playerScore = 0;
    let opponentScore = 0;
    let gameRunning = false;
    
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Adjust ball speed based on screen size
        const screenFactor = canvas.width / 800;
        ballSpeedX = baseBallSpeed * screenFactor * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = baseBallSpeed * screenFactor * (Math.random() > 0.5 ? 1 : -1);
        
        if (gameRunning) {
            resetGameObjects();
        }
    }
    
    function resetGameObjects() {
        player = {
            x: 50,
            y: canvas.height / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        };
        
        opponent = {
            x: canvas.width - 50 - PADDLE_WIDTH,
            y: canvas.height / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        };
        
        ball = {
            x: canvas.width / 2 - BALL_SIZE / 2,
            y: canvas.height / 2 - BALL_SIZE / 2,
            width: BALL_SIZE,
            height: BALL_SIZE
        };
        
        const screenFactor = canvas.width / 800;
        ballSpeedX = baseBallSpeed * screenFactor * (Math.random() > 0.5 ? 1 : -1);
        ballSpeedY = baseBallSpeed * screenFactor * (Math.random() > 0.5 ? 1 : -1);
    }
    
    function startGame() {
        gameRunning = true;
        startScreen.style.display = 'none';
        resizeCanvas();
        resetGameObjects();
        gameLoop();
    }
    
    function gameLoop() {
        if (!gameRunning) return;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        player.y += playerSpeed;
        
        if (opponent.y + opponent.height / 2 < ball.y + ball.height / 2 && 
            opponent.y + opponent.height < canvas.height) {
            opponent.y += PADDLE_SPEED;
        }
        if (opponent.y + opponent.height / 2 > ball.y + ball.height / 2 && 
            opponent.y > 0) {
            opponent.y -= PADDLE_SPEED;
        }
        
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
        opponent.y = Math.max(0, Math.min(canvas.height - opponent.height, opponent.y));
        
        ball.x += ballSpeedX;
        ball.y += ballSpeedY;
        
        if (ball.y <= 0 || ball.y + ball.height >= canvas.height) {
            ballSpeedY = -ballSpeedY;
        }
        
        if (checkCollision(ball, player) || checkCollision(ball, opponent)) {
            ballSpeedX = -ballSpeedX;
            ballSpeedY += (Math.random() * 2 - 1) * 2;
        }
        
        if (ball.x <= 0) {
            opponentScore++;
            resetBall();
            const screenFactor = canvas.width / 800;
            ballSpeedX = baseBallSpeed * screenFactor;
        }
        
        if (ball.x + ball.width >= canvas.width) {
            playerScore++;
            resetBall();
            const screenFactor = canvas.width / 800;
            ballSpeedX = -baseBallSpeed * screenFactor;
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
        ctx.beginPath();
        ctx.ellipse(ball.x + ball.width / 2, ball.y + ball.height / 2, 
                    ball.width / 2, ball.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerScore, canvas.width / 4, 50);
        ctx.fillText(opponentScore, 3 * canvas.width / 4, 50);
        
        requestAnimationFrame(gameLoop);
    }
    
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    function resetBall() {
        ball.x = canvas.width / 2 - BALL_SIZE / 2;
        ball.y = canvas.height / 2 - BALL_SIZE / 2;
        const screenFactor = canvas.width / 800;
        ballSpeedY = baseBallSpeed * screenFactor * (Math.random() > 0.5 ? 1 : -1);
    }
    
    // Остальные обработчики событий остаются без изменений
    startBtn.addEventListener('click', startGame);
    window.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        if (e.key === 'ArrowUp') playerSpeed = -PADDLE_SPEED;
        else if (e.key === 'ArrowDown') playerSpeed = PADDLE_SPEED;
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') playerSpeed = 0;
    });
    upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); playerSpeed = -PADDLE_SPEED; });
    downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); playerSpeed = PADDLE_SPEED; });
    upBtn.addEventListener('touchend', (e) => { e.preventDefault(); if (playerSpeed < 0) playerSpeed = 0; });
    downBtn.addEventListener('touchend', (e) => { e.preventDefault(); if (playerSpeed > 0) playerSpeed = 0; });
    upBtn.addEventListener('mousedown', () => { playerSpeed = -PADDLE_SPEED; });
    downBtn.addEventListener('mousedown', () => { playerSpeed = PADDLE_SPEED; });
    upBtn.addEventListener('mouseup', () => { if (playerSpeed < 0) playerSpeed = 0; });
    downBtn.addEventListener('mouseup', () => { if (playerSpeed > 0) playerSpeed = 0; });
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});
