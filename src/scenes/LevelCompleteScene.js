import Phaser from 'phaser';
import { CONSTANTS, LEVEL_PAR_TIMES } from '../utils/Constants';

class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelCompleteScene' });
    
    // Animasjonsvariabler
    this.timeBonus = 0;
    this.lifeBonus = 0;
    this.totalBonus = 0;
    this.originalScore = 0;
    this.displayedTimeBonus = 0;
    this.displayedLifeBonus = 0;
    this.displayedTotalBonus = 0;
    this.displayedScore = 0;
    this.countingTimeBonus = true;
    this.countingLifeBonus = false;
    this.countingTotalBonus = false;
    this.countingScore = false;
    this.finished = false;
    this.counterSound = null;
    this.soundIsPlaying = false;
    this.lastSoundTime = 0;
  }

  create() {
    this.game.globals.gameState = 'levelComplete';
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Sett bakgrunnsbilde basert på nivået
    const levelNum = this.game.globals.level;
    const bgKey = `background${levelNum}`;
    
    if (this.textures.exists(bgKey)) {
      this.add.image(width / 2, height / 2, bgKey)
        .setDisplaySize(width, height)
        .setAlpha(0.3); // Gjør bakgrunnen mørkere for bedre lesbarhet
    } else {
      // Fallback til svart bakgrunn
      this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
      this.createStarfield();
    }
    
    // Beregn bonuser
    this.calculateBonuses();
    
    // Opprett UI-elementer
    this.createUI();
    
    // Start poenganimasjon
    this.animateScores();
    
    // Legg til input-håndtering
    this.input.on('pointerdown', () => this.skipAnimation());
    this.input.keyboard.on('keydown', () => this.skipAnimation());
  }
  
  createStarfield() {
    // Opprett stjernebakgrunn som fallback
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
  
  calculateBonuses() {
    // Hent spillinformasjon
    this.level = this.game.globals.level;
    this.lives = this.game.globals.lives;
    this.originalScore = this.game.globals.score;
    
    // Beregn tidsbonus
    const currentTime = Date.now();
    const levelTime = currentTime - this.game.globals.levelStartTime;
    const parTime = LEVEL_PAR_TIMES[this.level] || 30000;
    
    // Beregn tidsbonus
    if (this.level < 6) {
      // For levels 1-5, gi en grunnbonus pluss ekstra for rask fullføring
      const baseBonus = 50;
      if (levelTime < parTime) {
        const multiplier = 6 - this.level;
        this.timeBonus = baseBonus + Math.floor((parTime - levelTime) / 1000) * 10 * multiplier;
      } else {
        this.timeBonus = baseBonus;
      }
    } else {
      // For levels 6+, gi kun bonus for å slå par-tiden
      if (levelTime < parTime) {
        this.timeBonus = Math.floor((parTime - levelTime) / 1000) * 10;
      } else {
        this.timeBonus = 0;
      }
    }
    
    // Beregn livsbonus
    this.lifeBonus = this.lives * 50;
    
    // Beregn total bonus
    this.totalBonus = this.timeBonus + this.lifeBonus;
    
    // Oppdater displayedScore til å starte på den originale scoren
    this.displayedScore = this.originalScore;
    
    // Beregn hastighet for animasjon
    this.animationSpeedTime = Math.max(2, this.timeBonus / 200);
    this.animationSpeedLife = Math.max(3, this.lifeBonus / 150);
    this.animationSpeedTotal = Math.max(5, this.totalBonus / 150);
  }
  
  createUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Tittel
    const titleText = this.add.text(width / 2, 100, `LEVEL ${this.level} COMPLETE!`, {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: CONSTANTS.COLORS.NEON_PINK
    }).setOrigin(0.5);
    
    titleText.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 15, true, true);
    
    // Score
    this.scoreLabel = this.add.text(width / 2 - 150, height / 2 - 60, 'Score:', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0, 0.5);
    
    this.scoreLabel.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    this.scoreValue = this.add.text(width / 2 + 150, height / 2 - 60, this.displayedScore.toString(), {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(1, 0.5);
    
    this.scoreValue.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    // Time Bonus
    this.timeBonusLabel = this.add.text(width / 2 - 150, height / 2 - 20, 'Time Bonus:', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0, 0.5);
    
    this.timeBonusLabel.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    this.timeBonusValue = this.add.text(width / 2 + 150, height / 2 - 20, '0', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(1, 0.5);
    
    this.timeBonusValue.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    // Life Bonus
    this.lifeBonusLabel = this.add.text(width / 2 - 150, height / 2 + 20, 'Life Bonus:', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0, 0.5);
    
    this.lifeBonusLabel.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    this.lifeBonusValue = this.add.text(width / 2 + 150, height / 2 + 20, '0', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(1, 0.5);
    
    this.lifeBonusValue.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    // Total Bonus
    this.totalBonusLabel = this.add.text(width / 2 - 150, height / 2 + 70, 'Total Bonus:', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: CONSTANTS.COLORS.NEON_YELLOW
    }).setOrigin(0, 0.5);
    
    this.totalBonusLabel.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 10, true, true);
    
    this.totalBonusValue = this.add.text(width / 2 + 150, height / 2 + 70, '0', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: CONSTANTS.COLORS.NEON_YELLOW
    }).setOrigin(1, 0.5);
    
    this.totalBonusValue.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 10, true, true);
    
    // Continue-tekst (skjult først)
    this.continueText = this.add.text(width / 2, height - 100, 'TAP TO CONTINUE', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5).setAlpha(0);
    
    this.continueText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 8, true, true);
    
    // Opprett lydeffekter
    this.counterSound = this.sound.add('counter', { volume: 0.5 });
  }
  
  animateScores() {
    const currentTime = Date.now();
    
    // Animer tidsbonus
    if (this.countingTimeBonus) {
      if (this.displayedTimeBonus < this.timeBonus) {
        this.displayedTimeBonus += this.animationSpeedTime;
        if (this.displayedTimeBonus > this.timeBonus) {
          this.displayedTimeBonus = this.timeBonus;
        }
        
        // Spill tellerlyd
        this.playCountSound();
      } else {
        this.countingTimeBonus = false;
        this.countingLifeBonus = true;
        
        // Kort pause før neste tellefase
        setTimeout(() => {
          if (this.counterSound) {
            this.counterSound.stop();
          }
          this.soundIsPlaying = false;
        }, 300);
      }
    }
    
    // Animer livsbonus
    if (this.countingLifeBonus) {
      if (this.displayedLifeBonus < this.lifeBonus) {
        this.displayedLifeBonus += this.animationSpeedLife;
        if (this.displayedLifeBonus > this.lifeBonus) {
          this.displayedLifeBonus = this.lifeBonus;
        }
        
        // Spill tellerlyd
        this.playCountSound();
      } else {
        this.countingLifeBonus = false;
        this.countingTotalBonus = true;
        
        // Kort pause før neste tellefase
        setTimeout(() => {
          if (this.counterSound) {
            this.counterSound.stop();
          }
          this.soundIsPlaying = false;
        }, 300);
      }
    }
    
    // Animer totalbonus
    if (this.countingTotalBonus) {
      if (this.displayedTotalBonus < this.totalBonus) {
        this.displayedTotalBonus += this.animationSpeedTotal;
        if (this.displayedTotalBonus > this.totalBonus) {
          this.displayedTotalBonus = this.totalBonus;
        }
        
        // Spill tellerlyd
        this.playCountSound();
      } else {
        this.countingTotalBonus = false;
        this.countingScore = true;
        
        // Kort pause før neste tellefase
        setTimeout(() => {
          if (this.counterSound) {
            this.counterSound.stop();
          }
          this.soundIsPlaying = false;
        }, 300);
      }
    }
    
    // Animer total score
    if (this.countingScore) {
      const scoreIncrement = Math.max(10, (this.originalScore + this.totalBonus - this.displayedScore) / 20);
      
      if (this.displayedScore < this.originalScore + this.totalBonus) {
        this.displayedScore += scoreIncrement;
        if (this.displayedScore > this.originalScore + this.totalBonus) {
          this.displayedScore = this.originalScore + this.totalBonus;
        }
        
        // Spill tellerlyd
        this.playCountSound();
      } else {
        // Cleanup
        if (this.counterSound) {
          this.counterSound.stop();
        }
        this.soundIsPlaying = false;
        
        // Litt forsinkelse før vi markerer animasjonen som ferdig
        setTimeout(() => {
          this.finished = true;
          
          // Vis "trykk for å fortsette"-teksten med en fade-in animasjon
          this.tweens.add({
            targets: this.continueText,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              // Legg til blinkeanimasjon
              this.tweens.add({
                targets: this.continueText,
                alpha: 0.5,
                yoyo: true,
                duration: 800,
                repeat: -1
              });
            }
          });
        }, 500);
      }
    }
    
    // Oppdater UI
    this.timeBonusValue.setText(Math.floor(this.displayedTimeBonus).toString());
    this.lifeBonusValue.setText(Math.floor(this.displayedLifeBonus).toString());
    this.totalBonusValue.setText(Math.floor(this.displayedTotalBonus).toString());
    this.scoreValue.setText(Math.floor(this.displayedScore).toString());
    
    // Fortsett animasjon hvis ikke ferdig
    if (!this.finished) {
      this.animeTimer = setTimeout(() => {
        this.animateScores();
      }, 16); // Ca. 60 FPS
    } else {
      // Oppdater faktisk score
      this.game.globals.score = this.originalScore + this.totalBonus;
      console.log(`Level ${this.level} completed. Bonus points: ${this.totalBonus}`);
    }
  }
  
  playCountSound() {
    const currentTime = Date.now();
    
    // Spill kun lyd hvis det har gått minst 100ms siden siste lyd
    // og det ikke allerede spilles en lyd
    if (currentTime - this.lastSoundTime > 100 && !this.soundIsPlaying) {
      try {
        // Sørg for at lyden er stoppet før du spiller den igjen
        this.counterSound.stop();
        
        // Spill lyden
        this.soundIsPlaying = true;
        this.counterSound.play();
        this.lastSoundTime = currentTime;
        
        // Merk at lyden er spilt ferdig etter en viss tid
        setTimeout(() => {
          this.soundIsPlaying = false;
        }, 50);
      } catch (e) {
        console.log("Error playing count sound:", e);
        this.soundIsPlaying = false;
      }
    }
  }
  
  skipAnimation() {
    // Skip animasjonen og vis endelige verdier med en gang
    clearTimeout(this.animeTimer);
    
    this.displayedTimeBonus = this.timeBonus;
    this.displayedLifeBonus = this.lifeBonus;
    this.displayedTotalBonus = this.totalBonus;
    this.displayedScore = this.originalScore + this.totalBonus;
    
    // Oppdater UI med endelige verdier
    this.timeBonusValue.setText(this.displayedTimeBonus.toString());
    this.lifeBonusValue.setText(this.displayedLifeBonus.toString());
    this.totalBonusValue.setText(this.displayedTotalBonus.toString());
    this.scoreValue.setText(this.displayedScore.toString());
    
    // Stopp animasjonen
    this.countingTimeBonus = false;
    this.countingLifeBonus = false;
    this.countingTotalBonus = false;
    this.countingScore = false;
    
    // Stopp lyden
    if (this.counterSound) {
      this.counterSound.stop();
    }
    this.soundIsPlaying = false;
    
    // Hvis animasjonen ikke er ferdig ennå, gjør den ferdig
    if (!this.finished) {
      this.finished = true;
      
      // Oppdater faktisk score
      this.game.globals.score = this.originalScore + this.totalBonus;
      
      // Vis "trykk for å fortsette"-teksten
      this.continueText.setAlpha(1);
      
      // Legg til blinkeanimasjon
      this.tweens.add({
        targets: this.continueText,
        alpha: 0.5,
        yoyo: true,
        duration: 800,
        repeat: -1
      });
    } else {
      // Hvis animasjonen allerede er ferdig, gå til neste nivå
      this.nextLevel();
    }
  }
  
  nextLevel() {
    // Stopp eventuelle animasjoner og timere
    this.tweens.killAll();
    clearTimeout(this.animeTimer);
    
    // Øk level
    this.game.globals.level++;
    
    // Hvis vi har nådd maks nivå, vis victory-skjermen
    if (this.game.globals.level > CONSTANTS.MAX_LEVEL) {
      this.scene.start('VictoryScene');
    } else {
      // Ellers, start neste nivå
      this.scene.start('LevelStartScene');
    }
  }
}

export default LevelCompleteScene;