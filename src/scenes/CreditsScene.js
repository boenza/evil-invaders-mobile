import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {
    this.game.globals.gameState = 'credits';
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Opprett mørk bakgrunn med stjernefelt
    this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    this.createStarfield();
    
    // Opprett credits-innhold
    this.createCreditsContent(width, height);
    
    // Legg til input-håndtering for å gå tilbake
    this.input.on('pointerdown', () => this.goBack());
    this.input.keyboard.on('keydown', () => this.goBack());
    
    // Auto-timeout for å gå tilbake etter 10 sekunder
    this.time.delayedCall(10000, () => {
      this.goBack();
    });
  }
  
  createStarfield() {
    // Opprett stjernebakgrunn
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Lag 100 stjerner med ulike størrelser og posisjoner
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      
      const star = this.add.circle(x, y, size, 0xffffff);
      star.alpha = Phaser.Math.FloatBetween(0.3, 1);
    }
  }
  
  createCreditsContent(width, height) {
    // Opprett en container for credits
    const creditsContainer = this.add.container(width / 2, height / 2 - 100);
    
    // Credits-tittel
    const titleText = this.add.text(0, -160, 'CREDITS', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0.5);
    
    titleText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 15, true, true);
    
    // Definere credits-innhold
    const credits = [
      { title: 'GAME DESIGN & PROGRAMMING', name: 'BOENZA' },
      { title: 'RELEASED', name: '2025' },
      { title: 'REMEMBER', name: 'Don\'t Make Fashion Of Our Heavy Metal Passion' }
    ];
    
    // Opprett credits-elementer
    const creditItems = [];
    
    credits.forEach((item, index) => {
      const yPos = -50 + index * 80;
      
      // Tittel
      const titleItem = this.add.text(0, yPos, item.title, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: CONSTANTS.COLORS.NEON_YELLOW
      }).setOrigin(0.5);
      
      titleItem.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 8, true, true);
      
      // Navn (med forsinkelse i animasjonen basert på indeks)
      const nameItem = this.add.text(0, yPos + 30, item.name, {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: CONSTANTS.COLORS.NEON_PINK
      }).setOrigin(0.5);
      
      nameItem.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 12, true, true);
      
      // Animasjon for navn-tekst
      this.tweens.add({
        targets: nameItem,
        scale: 1.1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: index * 300
      });
      
      creditItems.push(titleItem, nameItem);
    });
    
    // Legg til alle credits-elementer i containeren
    creditsContainer.add(creditItems);
    creditsContainer.add(titleText);
    
    // Legg til "Tap to continue"-tekst nederst
    const continueText = this.add.text(width / 2, height - 80, 'TAP TO CONTINUE', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5);
    
    continueText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 8, true, true);
    
    // Blink-animasjon
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }
  
  goBack() {
    // Gå tilbake til game over/highscore
    if (this.scene.get('GameOverScene').sys.settings.active) {
      this.scene.start('HighscoreScene');
    } else {
      this.scene.start('GameOverScene');
    }
  }
}

export default CreditsScene;