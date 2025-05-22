import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class LevelStartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelStartScene' });
    this.countdown = 3;
  }

  create() {
    this.game.globals.gameState = 'levelStart';
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Sett bakgrunnsbildet basert på nivået
    const levelNum = this.game.globals.level;
    const bgKey = `background${levelNum}`;
    
    if (this.textures.exists(bgKey)) {
      this.add.image(width / 2, height / 2, bgKey)
        .setDisplaySize(width, height)
        .setAlpha(0.5); // Halv gjennomsiktig for å fremheve teksten
    } else {
      // Fallback til svart bakgrunn
      this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    }
    
    // Sett opp nivåtekst
    const levelText = this.add.text(width / 2, height / 2 - 100, 'LEVEL', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5);
    
    levelText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 10, true, true);
    
    // Vis nivånummer
    const levelNumber = this.add.text(width / 2, height / 2, String(levelNum), {
      fontFamily: 'monospace',
      fontSize: '96px',
      color: CONSTANTS.COLORS.NEON_YELLOW
    }).setOrigin(0.5);
    
    levelNumber.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 15, true, true);
    
    // Puls-animasjon på nivånummeret
    this.tweens.add({
      targets: levelNumber,
      scale: 1.2,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Nedtellingstekst
    this.countdownText = this.add.text(width / 2, height / 2 + 100, String(this.countdown), {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0.5);
    
    this.countdownText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 12, true, true);
    
    // Spill nedtellingslyd
    this.countdownSound = this.sound.add('counter', { volume: 0.5 });
    this.countdownSound.play();
    
    // Start nedtellingstimer
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      callback: this.updateCountdown,
      callbackScope: this,
      repeat: this.countdown - 1
    });
    
    // Legg til mulighet for å hoppe over nedtellingen
    this.skipText = this.add.text(width / 2, height - 50, 'TAP TO SKIP', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: CONSTANTS.COLORS.WHITE,
      alpha: 0.7
    }).setOrigin(0.5);
    
    // Legg til input-hendelser
    this.input.on('pointerdown', () => this.startGame());
    this.input.keyboard.on('keydown', () => this.startGame());
  }
  
  updateCountdown() {
    this.countdown--;
    
    if (this.countdown > 0) {
      // Oppdater nedtellingsteksten
      this.countdownText.setText(String(this.countdown));
      
      // Spill lyden igjen
      this.countdownSound.play();
      
      // Legg til skalerings-animasjon på tallet
      this.tweens.add({
        targets: this.countdownText,
        scale: 1.5,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    } else {
      // Nedtellingen er ferdig, start spillet
      this.startGame();
    }
  }
  
  startGame() {
    // Stopp timeren hvis den fortsatt kjører
    if (this.countdownTimer) {
      this.countdownTimer.remove();
    }
    
    // Sørg for at vi bare starter én gang (forhindre dobbeltklikk)
    if (this.scene.isActive('GameScene')) return;
    
    // Sett levelStartTime
    this.game.globals.levelStartTime = Date.now();
    
    // Start spillscenen
    this.scene.start('GameScene');
  }
}

export default LevelStartScene;