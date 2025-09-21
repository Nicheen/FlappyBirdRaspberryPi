class Bird {
    constructor() {
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBestScore')) || 0;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.radius = 20;
        this.rotation = 0;
        
        // Physics constants matching the reference
        this.jumpAmount = 80; // How high the jump goes
        this.jumpTime = 266; // Duration of jump in ms
        this.fallSpeed = 500; // Pixels per second when falling
        this.maxRotationUp = -20; // Max upward rotation in degrees
        this.maxRotationDown = 90; // Max downward rotation in degrees
        
        // Animation states
        this.isJumping = false;
        this.jumpStartTime = 0;
        this.initialJumpY = 0;

        // Pre-load bird image
        this.birdimages = new Image();
        this.birdimages.src = path_image_bird;
    }

    update(deltaTime) {
        const deltaS = deltaTime / 1000; // Convert to seconds like the reference
        
        if (this.isJumping) {
            this.updateJump(deltaS);
        } else {
            this.updateFall(deltaS);
        }
        
        this.updateRotation();
    }

    updateJump(deltaS) {
        const elapsed = Date.now() - this.jumpStartTime;
        
        if (elapsed < this.jumpTime) {
            // Still in jump phase - use quadratic easing like reference
            const progress = elapsed / this.jumpTime;
            const easeOut = 1 - Math.pow(1 - progress, 2); // quadOut easing
            
            this.position.y = this.initialJumpY - (this.jumpAmount * easeOut);
            this.velocity.y = -(this.jumpAmount / this.jumpTime) * 1000 * (1 - progress);
        } else {
            // Jump finished, start falling
            this.isJumping = false;
            this.velocity.y = 0;
        }
    }

    updateFall(deltaS) {
        // Free fall with increasing velocity like reference
        this.velocity.y += this.fallSpeed * deltaS;
        this.position.y += this.velocity.y * deltaS;
        
        // Cap fall speed for playability
        if (this.velocity.y > 400) {
            this.velocity.y = 400;
        }
    }

    updateRotation() {
        // Rotation logic similar to reference
        if (this.isJumping || this.velocity.y < 0) {
            // Flying up - rotate upward
            this.rotation = this.maxRotationUp;
        } else {
            // Falling - rotate downward based on fall speed
            const rotationProgress = Math.min(this.velocity.y / 300, 1);
            this.rotation = rotationProgress * this.maxRotationDown;
        }
    }

    jump() {
        // Start new jump like reference
        this.isJumping = true;
        this.jumpStartTime = Date.now();
        this.initialJumpY = this.position.y;
        this.velocity.y = 0;
    }

    draw(ctx) {
        ctx.save();
        
        // Translate and rotate like reference
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation * Math.PI / 180); // Convert degrees to radians
        
        // Draw bird body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bird eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(8, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw beak
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius + 10, -3);
        ctx.lineTo(this.radius + 10, 3);
        ctx.closePath();
        ctx.fill();
        
        // Add wing detail
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    checkBounds(canvasHeight) {
        return this.position.y - this.radius < 0 || 
               this.position.y + this.radius > canvasHeight - 50; // Account for ground
    }
}

class Pipe {
    constructor(x, gapY, gapSize) {
        // Pre-load pipe image
        this.pipeImage = new Image();
        this.pipeImage.src = path_image_pipe;

        this.x = x;
        this.gapY = gapY;
        this.gapSize = gapSize;
        this.width = this.pipeImage.width;
        this.passed = false;
        this.name = ""; // For counting like reference
    }

    move(deltaS) {
        // Move at 300 pixels per second like reference
        this.x -= 300 * deltaS;
    }

    draw(ctx, canvasHeight) {
        // Draw pipe if loaded
        if (this.pipeImage.complete) {
            // Draw the first pipe (bottom)
            ctx.drawImage(this.pipeImage, this.x, this.gapY + this.gapSize / 2, this.pipeImage.width, this.pipeImage.height);

            // Draw the second pipe (top)
            ctx.save()
            ctx.scale(1, -1);
            ctx.drawImage(this.pipeImage, this.x, -this.gapY + this.gapSize / 2, this.pipeImage.width, this.pipeImage.height);
            ctx.restore();
        }

        // Draw collision boxes in red
        // this.drawCollisionBoxes(ctx, canvasHeight);
    }

    checkCollision(bird) {
        // Simplified collision like reference
        const birdLeft = bird.position.x - bird.radius;
        const birdRight = bird.position.x + bird.radius;
        const birdTop = bird.position.y - bird.radius;
        const birdBottom = bird.position.y + bird.radius;
        
        const pipeLeft = this.x;
        const pipeRight = this.x + this.width;
        const gapTop = this.gapY - this.gapSize / 2;
        const gapBottom = this.gapY + this.gapSize / 2;
        
        // Check if bird is within pipe x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird is outside the gap
            if (birdTop < gapTop || birdBottom > gapBottom) {
                return true;
            }
        }
        return false;
    }

    drawCollisionBoxes(ctx, canvasHeight) {
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Optional: dashed lines
        
        const pipeLeft = this.x;
        const pipeRight = this.x + this.width;
        const gapTop = this.gapY - this.gapSize / 2;
        const gapBottom = this.gapY + this.gapSize / 2;
        
        // Draw top pipe collision box
        ctx.strokeRect(pipeLeft, 0, this.width, gapTop);
        
        // Draw bottom pipe collision box
        ctx.strokeRect(pipeLeft, gapBottom, this.width, canvasHeight - gapBottom - 50);
        
        // Optional: Draw the gap area in green to visualize safe zone
        ctx.strokeStyle = 'green';
        ctx.strokeRect(pipeLeft, gapTop, this.width, this.gapSize);
        
        ctx.restore();
    }

    isOffScreen() {
        return this.x + this.width*2 < 0;
    }
}

class Pipes {
    constructor() {
        this.pipeList = [];
        this.pipeDelay = 1.5; // Seconds between pipes like reference
        this.pipeTimer = 0;
    }

    addPipe(pipe) {
        this.pipeList.push(pipe);
    }

    update(bird, deltaS) {
        // Update pipe timer
        this.pipeTimer += deltaS;
        
        // Add new pipe when timer expires
        if (this.pipeTimer >= this.pipeDelay) {
            this.spawnPipe(bird.canvas ? bird.canvas.width : 800);
            this.pipeTimer = 0;
        }
        
        // Move all pipes and check scoring
        this.pipeList.forEach(pipe => {
            pipe.move(deltaS);
            
            // Score when bird passes pipe (like reference at x=338)
            if (!pipe.passed && pipe.x + pipe.width < bird.position.x && pipe.name !== "counted") {
                pipe.name = "counted";
                pipe.passed = true;
                bird.score++;
            }
        });

        // Remove off-screen pipes
        this.pipeList = this.pipeList.filter(pipe => !pipe.isOffScreen());
    }

    spawnPipe(canvasWidth) {
        // Spawn pipe like reference with random gap position
        const gapY = (Math.random() * 350) + 50; // Random between 50-400
        const pipe = new Pipe(canvasWidth + 100, gapY, 200);
        this.addPipe(pipe);
    }

    draw(ctx, canvasHeight) {
        this.pipeList.forEach(pipe => pipe.draw(ctx, canvasHeight));
    }

    checkCollisions(bird) {
        return this.pipeList.some(pipe => pipe.checkCollision(bird));
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
        this.started = false;
        this.bird = new Bird();
        this.pipes = new Pipes();
        this.lastTime = 0;
        this.groundX = 0; 

        this.lastJumpCommand = null;
        this.lastFileModified = null;
        this.lastJumpCommand = null;
        this.checkPythonCommands();

        // Pre-load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = path_image_background;

        this.groundImage = new Image();
        this.groundImage.src = path_image_ground;
        
        this.customFontLoaded = false;
        this.loadCustomFont();
        this.setupEventListeners();
        this.initialize();
    }

    checkPythonCommands() {
        // Fire-and-forget fetch - don't await it
        fetch('./data.json?' + new Date().getTime())
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok');
            })
            .then(data => {
                if (data.jump && data.timestamp !== this.lastJumpCommand) {
                    this.lastJumpCommand = data.timestamp;
                    this.handleJump();
                }
            })
            .catch(error => {
		throw new Error(error);
            });

        // Schedule next check - this runs immediately, not waiting for fetch
        const pollInterval = (this.started && !this.gameOver) ? 50 : 200;
        setTimeout(() => this.checkPythonCommands(), pollInterval);
    }

    handleJump() {
        if (!this.gameOver) {
            this.bird.jump();
            if (!this.started) {
                this.start();
            }
        }
	else{
	    this.initialize();
	}
    }

    async loadCustomFont() {
        try {
            // Wait for the font to be available
            await document.fonts.load('48px FlappyBirdFont');
            this.customFontLoaded = true;
            console.log('Flappy Bird font loaded successfully!');
        } catch (error) {
            console.warn('Flappy Bird font failed to load:', error);
            this.customFontLoaded = false;
        }
    }

    initialize() {
        this.bird.position = { x: 100, y: 250 };
        this.bird.velocity = { x: 0, y: 0 };
        this.bird.rotation = 0;
        this.bird.score = 0;
        this.bird.isJumping = false;
        this.pipes.pipeList = [];
        this.pipes.pipeTimer = 0;
        this.gameOver = false;
        this.started = false;
        this.lastTime = 0;
        this.groundX = 0;
    }

    setupEventListeners() {
        //const handleJump = () => {
        //    if (!this.gameOver) {
        //        this.bird.jump();
        //        if (!this.started) {
        //            this.start();
        //        }
        //    } else {
        //        this.initialize();
        //    }
        //};

        // Keyboard controls
        //document.addEventListener('keydown', (e) => {
        //    if (e.code === 'Space') {
        //        e.preventDefault();
        //        handleJump();
        //    }
        //});

        //// Mouse/touch controls
        //this.canvas.addEventListener('click', handleJump);
    }

    start() {
        this.started = true;
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.running || this.gameOver) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        const deltaS = deltaTime / 1000;
        
        this.bird.update(deltaTime);
        
	this.checkPythonCommands();
        if (this.started) {
            this.pipes.update(this.bird, deltaS);
            
            // Animate ground scroll like reference
            this.groundX = (this.groundX - deltaS * 300) % 200;
        }

        // Check collisions
        if (this.bird.checkBounds(this.canvas.height) || 
            this.pipes.checkCollisions(this.bird)) {
            this.endGame();
        }
    }

    draw() {
        // Clear canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background if loaded
        if (this.backgroundImage.complete) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Draw pipes
        this.pipes.draw(this.ctx, this.canvas.height);
        
        // Draw bird
        this.bird.draw(this.ctx);
        
        // Draw ground
        this.drawGround();
        if (this.bird) {
            // Use custom font if loaded, otherwise fallback
            const fontFamily = this.customFontLoaded ? 'FlappyBirdFont' : 'Arial';
            this.ctx.font = `48px ${fontFamily}, sans-serif`;
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(this.bird.score.toString(), this.canvas.width / 2, this.canvas.height / 5);
        }
    }

    drawGround() {
        // Draw scrolling ground like reference
        const groundHeight = 50;
        const groundY = this.canvas.height - groundHeight;
        
        // Draw repeated ground pattern
        if (this.groundImage.complete) {
            const tileWidth = this.groundImage.width;
        
            // Calculate exact number of tiles needed (with one extra for smooth scrolling)
            const tilesNeeded = Math.ceil(this.canvas.width / tileWidth) + 1;
            
            // Start position - use Math.floor to avoid sub-pixel rendering
            const startX = Math.floor(this.groundX % tileWidth) - tileWidth;
            
            // Draw only the tiles we need
            for (let i = 0; i <= tilesNeeded; i++) {
                const x = startX + (i * tileWidth);
                this.ctx.drawImage(this.groundImage, x, groundY, tileWidth, groundHeight);
            }
        }
    }

    endGame() {
        this.gameOver = true;
        this.running = false;
        
        // Update best score
        if (this.bird.score > this.bird.bestScore) {
            this.bird.bestScore = this.bird.score;
            localStorage.setItem('flappyBestScore', this.bird.bestScore.toString());
        }

        // Show game over screen
        //document.getElementById('gameOverScreen').style.display = 'block';
    }
}

let game;
const path_image_background = "./images/background.png"
const path_image_bird       = "./images/bird.png"
const path_image_ground     = "./images/ground.png"
const path_image_pipe       = "./images/pipe.png"
const path_image_score      = "./images/score.png"

function startGame() {
    game = new Game();
    game.initialize();
}

function restartGame() {
    //document.getElementById('gameOverScreen').style.display = 'none';
    game.initialize();
}

// Start the game when page loads
window.addEventListener('load', startGame);
