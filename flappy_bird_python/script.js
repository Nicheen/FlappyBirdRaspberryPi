class Player {
    constructor() {
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBestScore')) || 0;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0.8 }; // Gravity
        this.radius = 20;
    }

    update() {
        this.velocity.y += this.acceleration.y;
        this.position.y += this.velocity.y;
        
        // Terminal velocity
        if (this.velocity.y > 12) {
            this.velocity.y = 12;
        }
    }

    jump() {
        this.velocity.y = -12;
    }

    draw(ctx) {
        // Draw bird body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bird eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.position.x + 8, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(this.position.x + this.radius, this.position.y);
        ctx.lineTo(this.position.x + this.radius + 10, this.position.y - 3);
        ctx.lineTo(this.position.x + this.radius + 10, this.position.y + 3);
        ctx.closePath();
        ctx.fill();
    }

    checkBounds(canvasHeight) {
        return this.position.y - this.radius < 0 || 
                this.position.y + this.radius > canvasHeight;
    }
}

class Pipe {
    constructor(x, gapY, gapSize) {
        this.x = x;
        this.gapY = gapY;
        this.gapSize = gapSize;
        this.width = 60;
        this.passed = false;
    }

    move(speed) {
        this.x -= speed;
    }

    draw(ctx, canvasHeight) {
        ctx.fillStyle = '#228B22';
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;
        
        // Top pipe
        const topHeight = this.gapY - this.gapSize / 2;
        ctx.fillRect(this.x, 0, this.width, topHeight);
        ctx.strokeRect(this.x, 0, this.width, topHeight);
        
        // Bottom pipe
        const bottomY = this.gapY + this.gapSize / 2;
        const bottomHeight = canvasHeight - bottomY;
        ctx.fillRect(this.x, bottomY, this.width, bottomHeight);
        ctx.strokeRect(this.x, bottomY, this.width, bottomHeight);
        
        // Pipe caps
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(this.x - 5, topHeight - 20, this.width + 10, 20);
        ctx.fillRect(this.x - 5, bottomY, this.width + 10, 20);
        ctx.strokeRect(this.x - 5, topHeight - 20, this.width + 10, 20);
        ctx.strokeRect(this.x - 5, bottomY, this.width + 10, 20);
    }

    checkCollision(player) {
        // Check if player is within pipe x range
        if (player.position.x + player.radius > this.x && 
            player.position.x - player.radius < this.x + this.width) {
            
            // Check if player is in the gap
            const topPipeBottom = this.gapY - this.gapSize / 2;
            const bottomPipeTop = this.gapY + this.gapSize / 2;
            
            if (player.position.y - player.radius < topPipeBottom || 
                player.position.y + player.radius > bottomPipeTop) {
                return true;
            }
        }
        return false;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

class Pipes {
    constructor() {
        this.pipeList = [];
        this.pipeSpeed = 3;
    }

    addPipe(pipe) {
        this.pipeList.push(pipe);
    }

    update(player) {
        // Move all pipes
        this.pipeList.forEach(pipe => {
            pipe.move(this.pipeSpeed);
            
            // Check for scoring
            if (!pipe.passed && pipe.x + pipe.width < player.position.x) {
                pipe.passed = true;
                player.score++;
            }
        });

        // Remove off-screen pipes
        this.pipeList = this.pipeList.filter(pipe => !pipe.isOffScreen());
    }

    draw(ctx, canvasHeight) {
        this.pipeList.forEach(pipe => pipe.draw(ctx, canvasHeight));
    }

    checkCollisions(player) {
        return this.pipeList.some(pipe => pipe.checkCollision(player));
    }

    getPipes() {
        return this.pipeList;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.running = false;
        this.gameOver = false;
        this.player = new Player();
        this.pipes = new Pipes();
        this.pipeTimer = 0;
        this.pipeInterval = 120; // frames between pipes
        
        this.setupEventListeners();
        this.initialize();
    }

    initialize() {
        this.player.position = { x: 100, y: 250 };
        this.player.velocity = { x: 0, y: 0 };
        this.player.score = 0;
        this.pipes.pipeList = [];
        this.gameOver = false;
        this.pipeTimer = 0;

        // Add initial pipes
        for (let i = 0; i < 3; i++) {
            const gapY = 150 + Math.random() * 200;
            const pipe = new Pipe(400 + i * 200, gapY, 120);
            this.pipes.addPipe(pipe);
        }

        this.updateUI();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.gameOver) {
                    this.player.jump();
                    if (!this.running) {
                        this.start();
                    }
                }
            }
        });

        // Mouse/touch controls
        this.canvas.addEventListener('click', () => {
            if (!this.gameOver) {
                this.player.jump();
                if (!this.running) {
                    this.start();
                }
            }
        });
    }

    start() {
        this.running = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.running || this.gameOver) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.player.update();
        this.pipes.update(this.player);

        // Add new pipes
        this.pipeTimer++;
        if (this.pipeTimer >= this.pipeInterval) {
            const gapY = 150 + Math.random() * 200;
            const pipe = new Pipe(this.canvas.width, gapY, 120);
            this.pipes.addPipe(pipe);
            this.pipeTimer = 0;
        }

        // Check collisions
        if (this.player.checkBounds(this.canvas.height) || 
            this.pipes.checkCollisions(this.player)) {
            this.endGame();
        }

        this.updateUI();
    }

    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds
        this.drawClouds();

        // Draw pipes and player
        this.pipes.draw(this.ctx, this.canvas.height);
        this.player.draw(this.ctx);
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        // Simple cloud shapes
        for (let i = 0; i < 3; i++) {
            const x = 100 + i * 250;
            const y = 50 + Math.sin(Date.now() * 0.001 + i) * 10;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.player.score;
        document.getElementById('bestScoreDisplay').textContent = this.player.bestScore;
    }

    endGame() {
        this.gameOver = true;
        this.running = false;
        
        // Update best score
        if (this.player.score > this.player.bestScore) {
            this.player.bestScore = this.player.score;
            localStorage.setItem('flappyBestScore', this.player.bestScore.toString());
        }

        // Show game over screen
        document.getElementById('finalScore').textContent = this.player.score;
        document.getElementById('gameOverScreen').style.display = 'block';
        this.updateUI();
    }
}

let game;

function startGame() {
    game = new Game();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    game.initialize();
}

// Start the game when page loads
window.addEventListener('load', startGame);