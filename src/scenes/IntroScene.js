import Phaser from 'phaser';
import { CONSTANTS, INTRO_TEXT } from '../utils/Constants';

class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
    
    this.typingSpeed = 50;
    this.currentLine = 0;
    this.currentChar = 0;
    this.introTextComplete = false;
    this.textLines = [];
    this.startPrompt = null;
    this.typingSound = null;
    this.isSkipped = false;
  }

  create() {
    this.game.globals.gameState = 'intro';
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Opprett bakgrunnsstjerner
    this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    this.createStarfield();
    
    // Tittel øverst på skjermen
    const title = this.add.text(width / 2, 50, 'EVIL INVADERS II', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: CONSTANTS.COLORS.NEON_PINK
    }).setOrigin(0.5);
    
    title.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 10, true, true);
    
    // Opprett tekstboksen for historien
    const storyContainer = this.add.container(width / 2, height / 2);
    
    // Opprett tekstlinjene
    for (let i = 0; i < INTRO_TEXT.length; i++) {
      const yPos = -100 + (i * 30);
      const textLine = this.add.text(0, yPos, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: CONSTANTS.COLORS.NEON_GREEN,
        align: 'left'
      }).setOrigin(0.5, 0);
      
      textLine.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 5, true, true);
      this.textLines.push(textLine);
      storyContainer.add(textLine);
    }
    
    // Opprett "trykk for å fortsette"-teksten, men skjul den først
    this.startPrompt = this.add.text(width / 2, height - 100, 'TAP TO START', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5);
    
    this.startPrompt.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 8, true, true);
    this.startPrompt.setAlpha(0);
    
    // Legg til input-håndtering for å skipe tekst
    this.input.on('pointerdown', () => {
      if (!this.introTextComplete) {
        this.completeIntroText();
      } else {
        this.startGame();
      }
    });
    
    this.input.keyboard.on('keydown', () => {
      if (!this.introTextComplete) {
        this.completeIntroText();
      } else {
        this.startGame();
      }
    });
    
    // Opprett og spill morse-lyden
    this.typingSound = this.sound.add('morse', {
      volume: 0.1,
      loop: true
    });
    
    // Start skriveanimasjonen
    this.startTypingAnimation();
  }
  
  createStarfield() {
    const stars = [];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Lag 100 stjerner med ulike størrelser og posisjoner
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      
      const star = this.add.circle(x, y, size, 0xffffff);
      star.alpha = Phaser.Math.FloatBetween(0.3, 1);
      
      stars.push(star);
    }
  }
  
  startTypingAnimation() {
    // Start skriveanimasjon
    this.typingTimer = this.time.addEvent({
      delay: this.typingSpeed,
      callback: this.typeNextChar,
      callbackScope: this,
      loop: true
    });
    
    // Start morselyden
    this.typingSound.play();
  }
  
  typeNextChar() {
    if (this.currentLine < INTRO_TEXT.length) {
      const currentText = INTRO_TEXT[this.currentLine];
      const textObject = this.textLines[this.currentLine];
      
      if (this.currentChar < currentText.length) {
        // Legg til ett tegn
        const displayedText = currentText.substring(0, this.currentChar + 1);
        textObject.setText(displayedText);
        this.currentChar++;
      } else {
        // Gå til neste linje
        this.currentLine++;
        this.currentChar = 0;
        
        // Sjekk om vi har fullført alle linjene
        if (this.currentLine >= INTRO_TEXT.length) {
          this.completeIntroText();
        }
      }
    }
  }
  
  completeIntroText() {
    if (this.isSkipped) return;
    this.isSkipped = true;
    
    // Stopp skriveanimasjonen
    if (this.typingTimer) {
      this.typingTimer.remove();
    }
    
    // Stopp morselyden
    if (this.typingSound && this.typingSound.isPlaying) {
      this.typingSound.stop();
    }
    
    // Vis all introtekst umiddelbart
    for (let i = 0; i < INTRO_TEXT.length; i++) {
      this.textLines[i].setText(INTRO_TEXT[i]);
    }
    
    // Merk som fullført
    this.introTextComplete = true;
    
    // Vis "trykk for å starte"-teksten
    this.tweens.add({
      targets: this.startPrompt,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Legg til blinkeanimasjon
        this.tweens.add({
          targets: this.startPrompt,
          alpha: 0.5,
          yoyo: true,
          duration: 800,
          repeat: -1
        });
      }
    });
  }
  
  startGame() {
    // Gå til level start scene
    this.scene.start('LevelStartScene');
  }
}

export default IntroScene;