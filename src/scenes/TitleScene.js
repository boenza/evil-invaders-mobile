import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.game.globals.gameState = 'start';
    
    // Legg til bakgrunnsbilde
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Bakgrunnsbilde for tittelskjermen
    if (this.textures.exists('titleBackground')) {
      this.add.image(width / 2, height / 2, 'titleBackground')
        .setDisplaySize(width, height);
    } else {
      // Fallback til svart bakgrunn med stjerner
      this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
      this.createStarfield();
    }
    
    // Legg til tittel med neon-effekt
    const title = this.add.text(width / 2, height / 3, 'EVIL INVADERS II', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: CONSTANTS.COLORS.NEON_PINK
    }).setOrigin(0.5);
    
    // Legg til glow-effekt (neon)
    title.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 15, true, true);
    
    // Animer tittelen med blinke-effekt
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      yoyo: true,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // "Press to Play" tekst
    const pressText = this.add.text(width / 2, height * 0.75, 'TAP TO START', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0.5);
    
    // Legg til glow-effekt
    pressText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    // Blinke-animasjon for "Press to Play" teksten
    this.tweens.add({
      targets: pressText,
      alpha: 0.5,
      yoyo: true,
      duration: 500,
      repeat: -1
    });
    
    // Spill tittel-musikk
    this.playTitleMusic();
    
    // Legg til interaktivitet - start spillet ved klikk/touch eller tastetrykk
    this.input.on('pointerdown', () => this.startGame());
    this.input.keyboard.on('keydown', () => this.startGame());
    
    // For mobile - fullskjerm-knapp (valgfritt)
    if (this.scale.isFullscreen === false && this.sys.game.device.os.iOS) {
      this.addFullscreenButton();
    }
  }
  
  createStarfield() {
    // Opprett stjernebakgrunn som fallback
    const stars = [];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Lag 200 stjerner med ulike størrelser og posisjoner
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 3);
      
      const star = this.add.circle(x, y, size, 0xffffff);
      
      // Gi noen stjerner et blinkende utseende
      if (i % 3 === 0) {
        this.tweens.add({
          targets: star,
          alpha: Phaser.Math.FloatBetween(0.2, 0.7),
          duration: Phaser.Math.Between(1000, 3000),
          yoyo: true,
          repeat: -1
        });
      }
      
      stars.push(star);
    }
  }
  
  playTitleMusic() {
    // Stopp eventuell eksisterende musikk
    if (this.game.globals.backgroundMusic) {
      this.game.globals.backgroundMusic.stop();
    }
    
    // Spill tittelmusikk
    this.game.globals.backgroundMusic = this.sound.add('titleMusic', {
      volume: 0.5,
      loop: true
    });
    
    this.game.globals.backgroundMusic.play();
  }
  
  addFullscreenButton() {
    // For iOS - legg til en knapp for fullskjerm
    const fullscreenText = this.add.text(this.cameras.main.width - 20, 20, '⛶', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(1, 0).setInteractive();
    
    fullscreenText.on('pointerdown', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });
  }
  
  startGame() {
    // Gå til introskjermen
    this.scene.start('IntroScene');
  }
}

export default TitleScene;