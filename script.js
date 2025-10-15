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
        this.maxRotationUp = -40; // Max upward rotation in degrees
        this.maxRotationDown = 90; // Max downward rotation in degrees
        
        // Animation states
        this.isJumping = false;
        this.jumpStartTime = 0;
        this.initialJumpY = 0;

        // Pre-load bird image
        this.birdimages = new Image();
        this.birdimages.src = path_image_bird;
        this.birdstate = 0;
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
        
        // Translate to bird position
        ctx.translate(this.position.x, this.position.y);

        // Rotate based on bird rotation
        ctx.rotate(this.rotation * Math.PI / 180);

        if (this.rotation < 30) {
            self.birdState = 0;
        } else if (this.rotation >= 30 && this.rotation < 60) {
            self.birdState = 1;
        } else if (this.rotation >= 60) {
            self.birdState = 2;
        }

        // Draw bird centered at its position
        if (this.birdimages.complete) {
            const birdWidth = this.birdimages.width / 3;
            const birdHeight = this.birdimages.height;
            const birdSizeRatio = birdWidth / birdHeight;
            ctx.drawImage(this.birdimages, self.birdState * birdWidth, 0, birdWidth, birdHeight, -this.radius, -this.radius, this.radius * 2 * birdSizeRatio, this.radius * 2);
        } else {
            // Fallback: draw a circle if image isn't loaded yet
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

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

        this.pipeImageNight = new Image();//pipe image in night mode
        this.pipeImageNight.src = path_image_pipe_night;
        this.pipeImageNight.onload = () => { this.loaded = true; };

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
        // Select the appropriate pipe image based on night mode
        const pipeImg = nightMode ? this.pipeImageNight : this.pipeImage;

        // Only draw if the selected pipe image is loaded
        if (pipeImg.complete && pipeImg.naturalWidth > 0) {
            const drawWidth = pipeImg.naturalWidth;
            const drawHeight = pipeImg.naturalHeight;

            // Draw the first pipe (bottom)
            ctx.drawImage(pipeImg, this.x, this.gapY + this.gapSize / 2, drawWidth, drawHeight);

            // Draw the second pipe (top)
            ctx.save()
            ctx.scale(1, -1);
            ctx.drawImage(pipeImg, this.x, -this.gapY + this.gapSize / 2, drawWidth, drawHeight);
            ctx.restore();
        }

        // Draw collision boxes
        if (debug) {
            this.drawCollisionBoxes(ctx, canvasHeight);
        }
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

        // Pipe spawn height configuration
        this.minPipeHeight = 200;  // Minimum height for pipe gap center
        this.maxPipeHeight = 650; // Maximum height for pipe gap center
        this.pipeHeightRange = this.maxPipeHeight - this.minPipeHeight; // 350
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
            this.pipeTimer -= this.pipeDelay;
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
        const gapY = (Math.random() * this.pipeHeightRange) + this.minPipeHeight;
        const pipe = new Pipe(canvasWidth + 100, gapY, 200);
        this.addPipe(pipe);
    }

    draw(ctx, canvasHeight) {
        this.pipeList.forEach(pipe => pipe.draw(ctx, canvasHeight));

        if (debug) {
            this.drawPipeSpawnHeights(ctx, canvasHeight);
        }
    }

    drawPipeSpawnHeights(ctx, canvasHeight) {
        ctx.save();

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        // Draw minimum spawn height line
        ctx.beginPath();
        ctx.moveTo(0, this.minPipeHeight);
        ctx.lineTo(ctx.canvas.width, this.minPipeHeight);
        ctx.stroke();

        // Draw maximum spawn height line
        ctx.beginPath();
        ctx.moveTo(0, this.maxPipeHeight);
        ctx.lineTo(ctx.canvas.width, this.maxPipeHeight);
        ctx.stroke();

        // Draw labels
        ctx.setLineDash([]);
        ctx.fillStyle = 'blue';
        ctx.font = '14px Arial';
        ctx.fillText(`Min: ${this.minPipeHeight}`, 40, this.minPipeHeight - 5);
        ctx.fillText(`Max: ${this.maxPipeHeight}`, 40, this.maxPipeHeight + 15);

        ctx.restore();
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

        // Pre-load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = path_image_background;

        this.backgroundImageNight = new Image();
        this.backgroundImageNight.src = path_image_background_night;

        this.groundImage = new Image();
        this.groundImage.src = path_image_ground;

        this.groundImageNight = new Image();
        this.groundImageNight.src = path_image_ground_night;

        //Score image
        this.scoreImage = new Image();
        this.scoreImage.src = path_image_score;
        
        this.customFontLoaded = false;
        this.setupEventListeners();
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
        //const pollInterval = (this.started && !this.gameOver) ? 50 : 200;
        //setTimeout(() => this.checkPythonCommands(), pollInterval);
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
            this.start();
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
        // Keyboard controls
        //document.addEventListener('keydown', (e) => {
        //    if (e.code === 'Space') {
        //        e.preventDefault();
        //        this.handleJump();
        //    }
        //});

        //// Mouse/touch controls
        //this.canvas.addEventListener('click', handleJump);
    }

    start() {
        this.started = true;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(() => this.gameLoop());
    }

    gameLoop() {
        if (!this.running || this.gameOver) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if(deltaTime > 0.2) {
            this.checkPythonCommands();
        }
            
        this.update(deltaTime);
        if(!this.gameOver){
            this.draw();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        const deltaS = deltaTime / 1000;
        
        this.bird.update(deltaTime);
        
        if (this.started) {
            this.pipes.update(this.bird, deltaS);
            
            // Animate ground scroll like reference
            this.groundX = (this.groundX - deltaS * 300) % 200;
        }

        const lastDigit = Math.abs(this.bird.score % 10);

        if (lastDigit >= 5 && lastDigit <= 9 && this.bird.score != 0) {
            nightMode = true;
        } else {
            nightMode = false;
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
        if (nightMode) {
            if (this.backgroundImageNight.complete && this.backgroundImageNight.naturalWidth > 0) {
                this.ctx.drawImage(this.backgroundImageNight, 0, 0, this.canvas.width, this.canvas.height);
            }
        } else {
            if (this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
                this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            }
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

            // Update highscore display
            this.updateHighscoreDisplay();
        }
    }

    updateHighscoreDisplay() {
        const highscoreValue = document.getElementById('highscoreValue');
        if (highscoreValue && this.bird) {
            highscoreValue.textContent = this.bird.bestScore;
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
                if (nightMode) {
                    this.ctx.drawImage(this.groundImageNight, x, groundY, tileWidth, groundHeight);
                } else {
                    this.ctx.drawImage(this.groundImage, x, groundY, tileWidth, groundHeight);
                }
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
            // Update highscore display immediately
            this.updateHighscoreDisplay();
        }

        // Submit score to leaderboard if user is logged in
        if (tracker && tracker.isLoggedIn() && this.bird.score > 0) {
            tracker.submitScore(this.bird.score).then(result => {
                if (result) {
                    console.log('Score submitted successfully:', result);
                }
            });
        }

        if (this.scoreImage.complete) {
        	this.ctx.drawImage(this.scoreImage, this.canvas.width/2 - this.scoreImage.width/2, this.canvas.height/2 - this.scoreImage.height/2);//, this.canvas.width/2, this.canvas.height/
            if(this.bird){
                //this.ctx.font = `46px ${fontFamily}, sans-serif`;
                this.ctx.fillText(this.bird.score.toString(), this.canvas.width/2, this.canvas.height/2 - 12);
                this.ctx.fillText(this.bird.bestScore.toString(), this.canvas.width/2, this.canvas.height/2 + (48*2) - 24);
            }
       }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleJump();
                removeEventListener('keydown', this);
            }
        });

        // Show game over screen
        //document.getElementById('gameOverScreen').style.display = 'block';
    }
}

class HighscoreTracker {
    constructor() {
        this.currentUser = null;
        this.initAuth()
    }

    async initAuth() {
        console.log('🔐 [AUTH] Initializing authentication...');
        console.log('🔐 [AUTH] Supabase URL:', SUPABASE_URL);
        console.log('🔐 [AUTH] Current URL:', window.location.href);

        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ [AUTH] Error getting session:', error);
        }

        this.currentUser = data.session?.user || null;
        console.log('🔐 [AUTH] Current user:', this.currentUser ? this.currentUser.email : 'Not logged in');

        // Update UI on initial load
        this.updateUI();

        // If user is already logged in, hide overlay and start game
        if (this.currentUser) {
            console.log('✅ [AUTH] User already logged in, starting game');
            this.hideLoginOverlay();
            startGameLoop();
        } else {
            console.log('⚠️ [AUTH] No user session found');
        }

        supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔄 [AUTH] Auth state changed:', event);
            console.log('🔄 [AUTH] Session:', session ? 'Active' : 'None');

            this.currentUser = session?.user || null;
            if (event === 'SIGNED_IN') {
                console.log('✅ [AUTH] User signed in:', this.currentUser.email);
                this.updateUI();
                this.hideLoginOverlay();
                // Start the game after successful login
                startGameLoop();
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 [AUTH] User signed out');
                this.updateUI();
            }
        });
    }

    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            // User is logged in
            const displayName = this.currentUser.user_metadata?.full_name ||
                              this.currentUser.email?.split('@')[0] ||
                              'User';
            userName.textContent = displayName;
            userInfo.style.display = 'block';
        } else {
            // User is not logged in
            userInfo.style.display = 'none';
        }
    }

    hideLoginOverlay() {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }
    }

    showLoginOverlay() {
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.style.display = 'flex';
        }
    }

    async signInWithGoogle() {
        console.log('🚀 [AUTH] Starting Google sign-in...');
        console.log('🚀 [AUTH] Redirect URL will be:', window.location.origin);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error('❌ [AUTH] Error during sign-in:', error);
            console.error('❌ [AUTH] Error message:', error.message);
            console.error('❌ [AUTH] Error details:', error);
            alert('Login failed: ' + error.message);
        } else {
            console.log('✅ [AUTH] OAuth initiated successfully');
            console.log('✅ [AUTH] OAuth data:', data);
            console.log('✅ [AUTH] Redirecting to Google...');
        }
    }

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error during sign-out:', error.message);
        } else {
            this.showLoginOverlay();
        }
    }

    async resetScore() {
        if (!this.currentUser) {
            console.log('Cannot reset score: Not logged in');
            return false;
        }

        const confirmed = confirm('Are you sure you want to reset your highscore in the database? This cannot be undone!');
        if (!confirmed) {
            return false;
        }

        const { error } = await supabase
            .from('highscores')
            .delete()
            .eq('user_id', this.currentUser.id);

        if (error) {
            console.error('Error resetting score:', error.message);
            alert('Failed to reset score: ' + error.message);
            return false;
        }

        console.log('Score reset successfully in database');
        alert('Your highscore has been reset in the database!');
        return true;
    }

    resetLocalScore() {
        const confirmed = confirm('Are you sure you want to reset your local highscore? This cannot be undone!');
        if (!confirmed) {
            return false;
        }

        localStorage.removeItem('flappyBestScore');
        if (game && game.bird) {
            game.bird.bestScore = 0;
            game.updateHighscoreDisplay();
        }

        console.log('Local score reset successfully');
        alert('Your local highscore has been reset!');
        return true;
    }

    async submitScore(score) {
        if (!this.currentUser) return null;

        const username = this.currentUser.user_metadata?.full_name ||
                        this.currentUser.email.split('@')[0];

        // First, check if user already has a highscore entry
        const { data: existingData, error: fetchError } = await supabase
            .from('highscores')
            .select('score')
            .eq('user_id', this.currentUser.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching existing score:', fetchError.message);
        }

        // If user has an existing score, only update if new score is higher
        if (existingData) {
            if (score > existingData.score) {
                // Update with new high score
                const { data, error } = await supabase
                    .from('highscores')
                    .update({
                        score: score,
                        username: username // Update username in case it changed
                    })
                    .eq('user_id', this.currentUser.id)
                    .select();

                if (error) {
                    console.error('Error updating score:', error.message);
                    return null;
                }

                console.log('New high score! Updated from', existingData.score, 'to', score);
                return data[0];
            } else {
                console.log('Score not higher than existing high score:', existingData.score);
                return null;
            }
        } else {
            // No existing entry, insert new one
            const { data, error } = await supabase
                .from('highscores')
                .insert([{
                    user_id: this.currentUser.id,
                    username: username,
                    score: score
                }])
                .select();

            if (error) {
                console.error('Error inserting score:', error.message);
                return null;
            }

            console.log('First high score submitted:', score);
            return data[0];
        }
    }

    async getTopScores(limit = 5) {
        const { data, error } = await supabase
            .from('highscores')
            .select('username, score, created_at')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching top scores:', error.message);
            return [];
        }

        return data;
    }

    async getUserRank() {
        if (!this.currentUser) return null;

        // Get all scores ordered by score descending
        const { data, error } = await supabase
            .from('highscores')
            .select('user_id, username, score')
            .order('score', { ascending: false });

        if (error) {
            console.error('Error fetching user rank:', error.message);
            return null;
        }

        // Find the user's position in the list
        const userIndex = data.findIndex(entry => entry.user_id === this.currentUser.id);

        if (userIndex === -1) {
            return null; // User not found in leaderboard
        }

        return {
            rank: userIndex + 1,
            username: data[userIndex].username,
            score: data[userIndex].score
        };
    }

    async displayLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        const userRankEntry = document.getElementById('userRankEntry');
        const userRankSeparator = document.getElementById('userRankSeparator');

        // Clear existing content
        leaderboardList.innerHTML = '';
        userRankEntry.style.display = 'none';
        userRankSeparator.style.display = 'none';

        // Get top 5 scores
        const topScores = await this.getTopScores(5);

        // Display top 5 or message if empty
        if (topScores.length === 0) {
            leaderboardList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No scores yet. Be the first to set a highscore!</div>';
        } else {
            topScores.forEach((entry, index) => {
                const rank = index + 1;
                const entryElement = this.createLeaderboardEntry(rank, entry.username, entry.score);
                leaderboardList.appendChild(entryElement);
            });
        }

        // Get user's rank if logged in
        if (this.currentUser) {
            const userRank = await this.getUserRank();

            if (userRank && userRank.rank > 5) {
                // User is not in top 5, show separator and user's entry
                userRankSeparator.style.display = 'block';
                userRankEntry.style.display = 'flex';

                // Create user's entry
                const userEntryContent = this.createLeaderboardEntryContent(
                    userRank.rank,
                    userRank.username + ' (You)',
                    userRank.score
                );
                userRankEntry.innerHTML = userEntryContent;
            }
        } else {
            // User is not logged in, show message
            userRankSeparator.style.display = 'block';
            userRankEntry.style.display = 'flex';
            userRankEntry.innerHTML = `
                <div style="text-align: center; width: 100%; padding: 10px; color: #666; font-size: 14px;">
                    Sign in to track your rank and compete!
                </div>
            `;
        }
    }

    createLeaderboardEntry(rank, username, score) {
        const entry = document.createElement('div');
        entry.className = 'leaderboard-entry';

        // Add special styling for top 3
        if (rank <= 3) {
            entry.classList.add(`rank-${rank}`);
        }

        entry.innerHTML = this.createLeaderboardEntryContent(rank, username, score);

        return entry;
    }

    createLeaderboardEntryContent(rank, username, score) {
        return `
            <div class="rank-number">${rank}</div>
            <div class="player-info">
                <div class="player-name">${username}</div>
            </div>
            <div class="player-score">${score}</div>
        `;
    }

    showLeaderboard() {
        const leaderboardOverlay = document.getElementById('leaderboardOverlay');
        leaderboardOverlay.style.display = 'flex';
        this.displayLeaderboard();
    }

    hideLeaderboard() {
        const leaderboardOverlay = document.getElementById('leaderboardOverlay');
        leaderboardOverlay.style.display = 'none';
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Fill these in with our database API key and Supabase URL.
// Make sure that the API key is the one that we can use publicly.
const SUPABASE_URL = 'https://kkobhqxhpmstzkxteqet.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrb2JocXhocG1zdHpreHRlcWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzY3MTAsImV4cCI6MjA3NTkxMjcxMH0.IoFHhUlZlpis1jasRcwMIURuueA62IdOAwVNB30o2zs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let game;
let tracker;
let debug = false;
let nightMode = false;
const path_image_background       = "./images/background.png";
const path_image_background_night = "./images/background_night.jpg";
const path_image_pipe             = "./images/pipe.png";
const path_image_pipe_night       = "./images/pipe_night.png";
const path_image_ground           = "./images/ground.png";
const path_image_ground_night     = "./images/ground_night.png";
const path_image_bird             = "./images/bird.png";
const path_image_score            = "./images/score.png";

function initializeGame() {
    // Initialize game without starting it
    game = new Game();
    game.initialize();
    // Don't start the game loop yet
}

function startGameLoop() {
    // Actually start the game loop
    if (game && !game.running) {
        game.start();
    }
}

function startGame() {
    tracker = new HighscoreTracker();

    // Initialize game but don't start it yet
    initializeGame();

	document.addEventListener('keydown', (e) => {
	    if (e.code === 'Space') {
            console.log('Jump Handled');
            e.preventDefault();
            game.handleJump();
	    }

        if (e.code === 'KeyD') {
            e.preventDefault();
            debug = !debug;
            console.log('Debug mode:', debug);

            if (debug) {
                console.log('%c=== DEBUG MODE ENABLED ===', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
                console.log('%cDebug Commands:', 'color: #2196F3; font-weight: bold;');
                console.log('  Press R - Reset local highscore');
                console.log('  Press Shift+R - Reset database highscore (requires login)');
                console.log('  Press D - Toggle debug mode off');
            } else {
                console.log('%c=== DEBUG MODE DISABLED ===', 'color: #f44336; font-weight: bold; font-size: 14px;');
            }
        }

        // Debug mode: Reset local score with R
        if (e.code === 'KeyR' && debug && !e.shiftKey) {
            e.preventDefault();
            tracker.resetLocalScore();
        }

        // Debug mode: Reset database score with Shift+R
        if (e.code === 'KeyR' && debug && e.shiftKey) {
            e.preventDefault();
            tracker.resetScore();
        }
	});

    // Setup login/logout button event listeners
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const skipLoginBtn = document.getElementById('skipLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            tracker.signInWithGoogle();
            // Game will start after successful login via auth state change
        });
    }

    if (skipLoginBtn) {
        skipLoginBtn.addEventListener('click', () => {
            tracker.hideLoginOverlay();
            // Start the game when user skips login
            startGameLoop();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            tracker.signOut();
        });
    }

    // Setup leaderboard button event listeners
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    const refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
    const leaderboardOverlay = document.getElementById('leaderboardOverlay');

    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            tracker.showLeaderboard();
        });
    }

    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', () => {
            tracker.hideLeaderboard();
        });
    }

    if (refreshLeaderboardBtn) {
        refreshLeaderboardBtn.addEventListener('click', () => {
            tracker.displayLeaderboard();
        });
    }

    // Close leaderboard when clicking outside the container
    if (leaderboardOverlay) {
        leaderboardOverlay.addEventListener('click', (e) => {
            if (e.target === leaderboardOverlay) {
                tracker.hideLeaderboard();
            }
        });
    }
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    game.initialize();
}

// Start the game when page loads
window.addEventListener('load', startGame);
