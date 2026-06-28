import BaseScene from './BaseScene';

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);

        this.player = null;
        this.obstacles = null;
        this.isPaused = false;

        this.PLAYER_VELOCITY = {
            Y: 300,
            X: 0
        }

        this.OBSTACLES_TO_RENDER = 4;

        this.score = 0;
        this.scoreText = '';
        this.bestScore = 0;
        this.bestScoreText = '';

        this.currentDifficulty = 'easy';
        this.difficulties = {
            'easy': {
                obstalceHorizontalDistanceRange: [300, 350],
                obstacleVerticalDistanceRange: [150, 250]
            },
            'normal': {
                obstalceHorizontalDistanceRange: [280, 330],
                obstacleVerticalDistanceRange: [140, 190]
            },
            'hard': {
                obstalceHorizontalDistanceRange: [250, 310],
                obstacleVerticalDistanceRange: [120, 170]
            },
        }
    }

    create() {
        this.currentDifficulty = 'easy';
        super.create();
        this.createPlayer();
        this.createObstacles();
        this.createColliders();
        this.createScore();
        this.createPauseButton();
        this.handleInputs();
        this.listenToEvents();
        
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('player', {
                start: 8,
                end: 15
            }),
            frameRate: 8,
            repeat: -1
        });

        this.player.play('fly');
    }

    update() { 
        this.checkPlayerPosition();
        this.recycleObstacles();
    }

    moveLeftToRight() {
        /* Moving from left to righ and IF reach end, then move back to left and so on */
        const playerPositionX = this.player.body.position.x;

        if (playerPositionX >= (this.config.width - this.player.body.width)) {
            this.player.body.velocity.x = -200;
        }

        if (playerPositionX <= 0) {
            this.player.body.velocity.x = 200;
        }
    }

    checkPlayerPosition() {
        const playerPositionY = this.player.body.position.y;

        if (playerPositionY <= 0 || this.player.getBounds().bottom >= this.config.height ) {
            this.gameOver();
        }
    }

    createPlayer() {
        this.player = this.physics.add.sprite(
            this.config.startPosition.X, 
            this.config.startPosition.Y, 
            'player'
        )
        .setFlipX(true)
        .setScale(3)
        .setOrigin(0);

        this.player.setBodySize(this.player.width, this.player.height - 8);

        this.player.body.gravity.y = 600;

        this.player.setCollideWorldBounds(true);
    }

    createObstacles() {
        this.obstacles = this.physics.add.group();

        for (let i = 0; i < this.OBSTACLES_TO_RENDER; i++) {  
            const upperObstacle = this.obstacles
                .create(0, 0, 'obstacle')
                .setImmovable(true)
                .setOrigin(0, 1);
                
            const lowerObstacle = this.obstacles
                .create(0, 0, 'obstacle')
                .setImmovable(true)
                .setOrigin(0, 0);
            
            this.placeObstacle(upperObstacle, lowerObstacle)
        }

        this.obstacles.setVelocityX(-200);
    }

    createColliders() {
        this.physics.add.collider(this.player, this.obstacles, this.gameOver, null, this);
    }

    createScore() {
        this.score = 0;
        const bestScore = localStorage.getItem('bestScore');
        this.scoreText = this.add.text(
            16, 
            16,
            `Score ${0}`, 
            { 
                fontSize: '32px', 
                fill: '#000' 
            }
        );

        this.bestScoreText = this.add.text(
            16, 
            50,
            `Best Score ${bestScore || 0}`, 
            { 
                fontSize: '20px', 
                fill: '#000' 
            }
        );
    }

    createPauseButton() {
        const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
            .setInteractive()    
            .setScale(3)
            .setOrigin(1);

        pauseButton.on('pointerdown', this.pauseGame, this);
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    handleInputs() {
        this.input.on('pointerdown', this.playerJump, this);
        this.input.keyboard.on('keydown-SPACE', this.playerJump, this);

        this.game.events.on(Phaser.Core.Events.HIDDEN, this.pauseGame, this);

    }

    listenToEvents() {
        if (this.pauseEvent) {
            return;
        }

        this.pauseEvent = this.events.on('resume', () => {
            this.initialTime = 3;
            this.countDownText = this.add.text(...this.screenCenter, `Starts in: ${this.initialTime}`, this.fontOptions)
                .setOrigin(0.5, 1);

            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countdown,
                callbackScope: this,
                loop: true
            })
        })
    }

    countdown() {
        this.initialTime--;
        this.countDownText.setText(`Starts in: ${this.initialTime}`);

        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.countDownText.setText('');
            this.physics.resume();
            this.timedEvent.remove();
        }
    }

    placeObstacle(upObstacle, lowObstacle) {
        const difficulty = this.difficulties[this.currentDifficulty];
        const rightMostX = this.getRightMostObstacle();
        const verticalDistance = Phaser.Math.Between(...difficulty.obstacleVerticalDistanceRange);
        const verticalPosition = Phaser.Math.Between(30, this.config.height - 20 - verticalDistance);
        const horinzontalDistance = Phaser.Math.Between(...difficulty.obstalceHorizontalDistanceRange);
    
        upObstacle.x = rightMostX + horinzontalDistance;
        upObstacle.y = verticalPosition;
    
        lowObstacle.x = upObstacle.x;
        lowObstacle.y = upObstacle.y + verticalDistance;
    }
    
    recycleObstacles() {
      const tempObstacles = [];
    
      this.obstacles.getChildren().forEach((obstacle) => {
        if (obstacle.getBounds().right < 0) {
          tempObstacles.push(obstacle);
    
          if (tempObstacles.length === 2) {
            this.placeObstacle(...tempObstacles);
            this.increaScore();
            this.saveBestScore();
            this.increaseDifficulty();
          }
        }
      })
    }
    
    getRightMostObstacle() {
      let rightMostX = 0;
    
      this.obstacles.getChildren().forEach((obstacle) => {
        rightMostX = Math.max(obstacle.x, rightMostX);
      });
    
      return rightMostX;
    }
    
    gameOver() {
      this.physics.pause();
      this.player.setTint(0xff0000); // Hex color #ff0000

      this.saveBestScore();

      this.time.addEvent({
        delay: 1000,
        callback: () => {
            this.scene.restart();
        },
        loop: false
      })
    }
    
    playerJump() {
        if (this.isPaused) {
            return;
        }
        this.player.body.velocity.y = -this.PLAYER_VELOCITY.Y;
    }

    increaScore() {
        this.score++;
        this.scoreText.setText(`Score ${this.score}`);
    }

    saveBestScore() {
      const bestScoreText = localStorage.getItem('bestScore');
      const bestScore = bestScoreText && parseInt(bestScoreText, 10);

      if (!bestScore || this.score > bestScore) {
        localStorage.setItem('bestScore', this.score);
      }
    }

    increaseDifficulty() {
        if (this.score === 20) {
            this.currentDifficulty = 'normal';
        }

        if (this.score === 50) {
            this.currentDifficulty = 'hard';
        }
    }
}

export default PlayScene; 