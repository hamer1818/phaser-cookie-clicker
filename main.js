// main.js

class CookieClickerScene extends Phaser.Scene {
    constructor() {
      super('CookieClickerScene');
      // Game state variables
      this.score = 0;
      this.autoClickers = 0;
      this.autoClickerCost = 50;
      this.clickPower = 1;
      this.clickPowerCost = 25;
      this.autoClickerSpeed = 1;
      this.speedUpgradeCost = 100;
      this.achievements = [100, 500, 1000];
      this.unlockedAchievements = [];
      this.musicStarted = false;
    }
  
    preload() {
      this.load.on('loaderror', (file) => {
        console.error('Error loading asset:', file.src);
      });
  
      this.load.image('cookie', 'assets/goldCookie.png');
      this.load.audio('clickSound', 'assets/click.mp3');
    //   this.load.audio('bgMusic', 'assets/music.mp3');
    }
  
    create() {
  
      // Background gradient
      const gradient = this.add.graphics();
      gradient.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
      gradient.fillRect(0, 0, this.scale.width, this.scale.height);
  
      // Score panel
      const scorePanel = this.add.graphics();
      scorePanel.fillStyle(0xffffff, 0.1);
      scorePanel.lineStyle(2, 0xffffff, 0.2);
      scorePanel.fillRoundedRect(this.scale.width / 2 - 150, 20, 300, 70, 15);
      scorePanel.strokeRoundedRect(this.scale.width / 2 - 150, 20, 300, 70, 15);
  
      // Score text
      this.scoreText = this.add
        .text(this.scale.width / 2, 55, `${Math.floor(this.score)}`, {
          fontFamily: 'Poppins',
          fontSize: '32px',
          color: '#ffffff',
          fontWeight: 'bold',
        })
        .setOrigin(0.5);
  
      // Auto clicker text
      this.autoClickerText = this.add
        .text(
          this.scale.width / 2,
          90,
          `Auto Clickers: ${this.autoClickers} | Power: ${this.clickPower}x | Speed: ${this.autoClickerSpeed.toFixed(
            1
          )}x`,
          {
            fontFamily: 'Poppins',
            fontSize: '16px',
            color: '#ffffff',
          }
        )
        .setOrigin(0.5);
  
      // Cookie with glow
      const cookieGlow = this.add
        .sprite(this.scale.width / 2, this.scale.height / 2, 'cookie')
        .setScale(0.9)
        .setTint(0x00ffff)
        .setAlpha(0.2);
  
      const cookie = this.add
        .sprite(this.scale.width / 2, this.scale.height / 2, 'cookie')
        .setInteractive()
        .setScale(0.8);
  
      // Upgrade panel
      const upgradesPanel = this.add.graphics();
      upgradesPanel.fillStyle(0xffffff, 0.1);
      upgradesPanel.lineStyle(2, 0xffffff, 0.2);
      upgradesPanel.fillRoundedRect(50, this.scale.height - 170, this.scale.width - 100, 120, 15);
      upgradesPanel.strokeRoundedRect(50, this.scale.height - 170, this.scale.width - 100, 120, 15);
  
      // Upgrade buttons
      const buttonStyle = {
        fontSize: '16px',
        fontFamily: 'Poppins',
        color: '#ffffff',
        backgroundColor: '#4a4a8a',
        padding: { x: 15, y: 10 },
        align: 'center',
      };
  
      this.buyAutoClicker = this.createUpgradeButton(
        this.scale.width / 2 - 200,
        this.scale.height - 110,
        `Auto Clicker (${this.autoClickerCost})`,
        () => {
          if (this.score >= this.autoClickerCost) {
            this.score -= this.autoClickerCost;
            this.autoClickers++;
            this.autoClickerCost = Math.floor(this.autoClickerCost * 1.5);
            this.updateDisplays();
          }
        },
        buttonStyle
      );
  
      this.buyClickPower = this.createUpgradeButton(
        this.scale.width / 2,
        this.scale.height - 110,
        `Click Power (${this.clickPowerCost})`,
        () => {
          if (this.score >= this.clickPowerCost) {
            this.score -= this.clickPowerCost;
            this.clickPower++;
            this.clickPowerCost = Math.floor(this.clickPowerCost * 1.8);
            this.updateDisplays();
          }
        },
        buttonStyle
      );
  
      this.buySpeedUpgrade = this.createUpgradeButton(
        this.scale.width / 2 + 200,
        this.scale.height - 110,
        `Speed Up (${this.speedUpgradeCost})`,
        () => {
          if (this.score >= this.speedUpgradeCost) {
            this.score -= this.speedUpgradeCost;
            this.autoClickerSpeed *= 1.5;
            this.speedUpgradeCost = Math.floor(this.speedUpgradeCost * 2);
            this.updateDisplays();
          }
        },
        buttonStyle
      );
  
      // Particles
      const particles = this.add.particles('cookie');
      const emitter = particles.createEmitter({
        speed: { min: 100, max: 200 },
        scale: { start: 0.1, end: 0 },
        blendMode: 'ADD',
        lifespan: 800,
      });
      emitter.stop();
  
      // Sounds
      this.clickSound = this.sound.add('clickSound');
    //   this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
  
      // Cookie events
      cookie.on('pointerdown', () => {
        this.score += this.clickPower;
        this.updateDisplays();
        this.clickSound.play();
  
        if (!this.musicStarted) {
        //   this.bgMusic.play();
        //   this.musicStarted = true;
        }
  
        this.tweens.add({
          targets: cookie,
          scale: 0.75,
          duration: 100,
          yoyo: true,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            emitter.explode(8, cookie.x, cookie.y);
          },
        });
  
        const scorePopup = this.add
          .text(cookie.x, cookie.y, `+${this.clickPower}`, {
            fontFamily: 'Poppins',
            fontSize: '24px',
            color: '#ffffff',
          })
          .setOrigin(0.5);
  
        this.tweens.add({
          targets: scorePopup,
          y: cookie.y - 50,
          alpha: 0,
          duration: 1000,
          ease: 'Cubic.easeOut',
          onComplete: () => scorePopup.destroy(),
        });
      });
  
      cookie.on('pointerover', () => {
        this.tweens.add({
          targets: cookieGlow,
          alpha: 0.4,
          duration: 200,
        });
      });
  
      cookie.on('pointerout', () => {
        this.tweens.add({
          targets: cookieGlow,
          alpha: 0.2,
          duration: 200,
        });
      });

    }
  
    update(time, delta) {
      if (this.autoClickers > 0) {
        this.score += this.autoClickers * this.autoClickerSpeed * (delta / 1000);
        this.updateDisplays();
      }
  
      this.achievements.forEach((value) => {
        if (this.score >= value && !this.unlockedAchievements.includes(value)) {
          this.unlockedAchievements.push(value);
          this.showAchievement(value);
        }
      });
    }
  
    createUpgradeButton(x, y, text, clickHandler, style) {
      const button = this.add
        .text(x, y, text, style)
        .setOrigin(0.5)
        .setInteractive()
        .setPadding(15);
  
      button.on('pointerdown', () => {
        clickHandler();
        this.tweens.add({
          targets: button,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 100,
          yoyo: true,
        });
      });
  
      button.on('pointerover', () => {
        button.setStyle({ backgroundColor: '#5a5a9a' });
      });
  
      button.on('pointerout', () => {
        button.setStyle({ backgroundColor: '#4a4a8a' });
      });
  
      return button;
    }
  
    updateDisplays() {
      this.scoreText.setText(`${Math.floor(this.score)}`);
      this.autoClickerText.setText(
        `Auto Clickers: ${this.autoClickers} | Power: ${this.clickPower}x | Speed: ${this.autoClickerSpeed.toFixed(
          1
        )}x`
      );
      this.buyAutoClicker.setText(`Auto Clicker (${this.autoClickerCost})`);
      this.buyClickPower.setText(`Click Power (${this.clickPowerCost})`);
      this.buySpeedUpgrade.setText(`Speed Up (${this.speedUpgradeCost})`);
    }
  
    showAchievement(value) {
      const achievementBox = this.add.container(this.scale.width / 2, -50);
      const bg = this.add.graphics();
      bg.fillStyle(0x4caf50, 0.9);
      bg.fillRoundedRect(-200, -30, 400, 60, 10);
  
      const text = this.add
        .text(0, 0, `🏆 Achievement: ${value} Points!`, {
          fontFamily: 'Poppins',
          fontSize: '20px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
  
      achievementBox.add([bg, text]);
  
      this.tweens.add({
        targets: achievementBox,
        y: 100,
        duration: 800,
        ease: 'Back.easeOut',
        hold: 2000,
        yoyo: true,
      });
    }
  
  }
  
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: CookieClickerScene,
    backgroundColor: '#1a1a2e',
  };
  
  const game = new Phaser.Game(config);