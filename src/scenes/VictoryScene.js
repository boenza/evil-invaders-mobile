import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create() {
    this.game.globals.gameState = 'victory';
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Opprett mørk bakgrunn med stjernefelt
    this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    this.createStarfield();
    
    // Hent spillinformasjon
    const score = this.game.globals.score;
    const lives = this.game.globals.lives;
    
    // Beregn endelig bonus (ekstra liv * 100)
    const finalBonus = lives * 100;
    const finalScore = score + finalBonus;
    
    // Oppdater global score med bonus
    this.game.globals.score = finalScore;
    
    // Opprett ferdiganimeringen
    this.createVictoryAnimation(width, height, finalBonus, finalScore);
    
    // Spill victory-musikk
    this.playVictoryMusic();
    
    // Legg til input-håndtering
    this.input.on('pointerdown', () => this.endGame());
    this.input.keyboard.on('keydown', () => this.endGame());
    
    // Auto-fortsett etter 20 sekunder
    this.time.delayedCall(20000, () => {
      this.endGame();
    });
  }
  
  createStarfield() {
    // Opprett en flott stjernebakgrunn med forskjellige farger
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Lag 200 stjerner med ulike størrelser, farger og posisjoner
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 3);
      
      // Velg farge basert på stjernetype
      let color;
      const starType = Phaser.Math.Between(1, 10);
      
      if (starType <= 6) {
        // Hvite stjerner (60%)
        color = 0xFFFFFF;
      } else if (starType <= 8) {
        // Blåaktige stjerner (20%)
        color = 0xAADDFF;
      } else if (starType <= 9) {
        // Rødaktige stjerner (10%)
        color = 0xFFCCAA;
      } else {
        // Gulaktige stjerner (10%)
        color = 0xFFFFAA;
      }
      
      const star = this.add.circle(x, y, size, color);
      star.alpha = Phaser.Math.FloatBetween(0.5, 1);
      
      // Gi noen stjerner et blinkende utseende
      if (i % 5 === 0) {
        this.tweens.add({
          targets: star,
          alpha: 0.2,
          duration: Phaser.Math.Between(1000, 5000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
    
    // Legg til en tåkeaktig bakgrunn (nebula-liknende)
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(100, 300);
      
      // Velg en tilfeldig nebula-farge
      const nebulaPalette = [0x5500FF, 0xFF0066, 0x00FFAA, 0xFFAA00, 0x00AAFF];
      const color = nebulaPalette[i % nebulaPalette.length];
      
      const nebula = this.add.circle(x, y, size, color, 0.03);
      
      // Puls-animasjon
      this.tweens.add({
        targets: nebula,
        alpha: 0.01,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 8000 + i * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  createVictoryAnimation(width, height, finalBonus, finalScore) {
    // Opprett victory container for å animere alt sammen
    const victoryContainer = this.add.container(width / 2, height / 2);
    
    // Victory-tittel
    const victoryText = this.add.text(0, -150, 'YOU WON THE GAME!', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: CONSTANTS.COLORS.NEON_YELLOW
    }).setOrigin(0.5);
    
    victoryText.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 20, true, true);
    
    // Legg til pulserende animasjon
    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Finale bonustekst
    const bonusText = this.add.text(0, -50, `FINAL BONUS: ${finalBonus}`, {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0.5);
    
    bonusText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 15, true, true);
    
    // Final score tekst
    const scoreText = this.add.text(0, 0, `FINAL SCORE: ${finalScore}`, {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: CONSTANTS.COLORS.NEON_PINK
    }).setOrigin(0.5);
    
    scoreText.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 15, true, true);
    
    // "Thanks for playing" tekst
    const thanksText = this.add.text(0, 70, 'THANKS FOR PLAYING!', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5);
    
    thanksText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 10, true, true);
    
    // "Tap to continue" tekst
    const continueText = this.add.text(0, 150, 'TAP TO CONTINUE', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5);
    
    continueText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 8, true, true);
    
    // Blink-animasjon for "Tap to continue"
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Legg til alle elementer i containeren
    victoryContainer.add([victoryText, bonusText, scoreText, thanksText, continueText]);
    
    // Fade-in animasjon for hele containeren
    victoryContainer.alpha = 0;
    this.tweens.add({
      targets: victoryContainer,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Opprett konfetti-effekt
    this.createConfettiEffect();
  }
  
  createConfettiEffect() {
    // Opprett et partikkelsystem for konfetti
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Partikkelfarger
    const colors = [
      CONSTANTS.COLORS.NEON_PINK,
      CONSTANTS.COLORS.NEON_GREEN,
      CONSTANTS.COLORS.NEON_YELLOW,
      CONSTANTS.COLORS.CYAN,
      0xFF6600,  // Oransje
      0x9900FF   // Lilla
    ];
    
    // Opprett konfetti-partikkelsystem
    const particles = this.add.particles(0, 0, 'particle', {
      frame: 0,
      x: { min: 0, max: width },
      y: -10,
      lifespan: 8000,
      speedY: { min: 50, max: 200 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.4, end: 0.1 },
      gravityY: 100,
      bounce: 0.5,
      bounds: { x: 0, y: 0, w: width, h: height },
      blendMode: 'ADD'
    });
    
    // Hvis 'particle' bildet ikke er lastet, bruk grafikk i stedet
    if (!this.textures.exists('particle')) {
      // Lag en enkel partikkel-tekstur
      const graphics = this.make.graphics();
      graphics.fillStyle(0xffffff);
      graphics.fillRect(0, 0, 4, 4);
      graphics.generateTexture('particle', 4, 4);
      
      particles.setTexture('particle');
    }
    
    // Endre farge på partiklene
    particles.setTint(colors);
    
    // Emitt partikler
    particles.flow(200, 5);
  }
  
  playVictoryMusic() {
    // Stopp eventuell eksisterende musikk
    if (this.game.globals.backgroundMusic) {
      this.game.globals.backgroundMusic.stop();
    }
    
    // Spill tittelmusikk som victory-musikk (eller bruk en annen hvis tilgjengelig)
    this.game.globals.backgroundMusic = this.sound.add('titleMusic', {
      volume: 0.6,
      loop: true
    });
    
    this.game.globals.backgroundMusic.play();
    
    // Spill også en triumferende lydeffekt hvis tilgjengelig
    if (this.game.globals.sfx && this.game.globals.sfx.powerup) {
      this.game.globals.sfx.powerup.play();
      
      // Spill den igjen etter en forsinkelse for ekstra effekt
      this.time.delayedCall(800, () => {
        if (this.game.globals.sfx && this.game.globals.sfx.powerup) {
          this.game.globals.sfx.powerup.play();
        }
      });
    }
  }
  
  endGame() {
    // Gå til game over/highscore-skjermen
    this.scene.start('GameOverScene');
  }
}

export default VictoryScene;