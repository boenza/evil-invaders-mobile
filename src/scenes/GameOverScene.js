import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
    this.isNewHighscore = false;
    this.playerName = 'PLAYER';
    this.rotation = null;
    this.rotationTimer = null;
    this.currentRotationScreen = 'gameOver';
  }

  create() {
    this.game.globals.gameState = 'gameOver';
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Opprett mørk bakgrunn med stjernefelt
    this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    this.createStarfield();
    
    // Opprett Game Over-tekst
    this.createGameOverText(width, height);
    
    // Sjekk om scoren er en ny highscore
    this.checkHighscore();
    
    if (this.isNewHighscore) {
      // Vis input for highscore
      this.createHighscoreInput(width, height);
    } else {
      // Opprett knapper
      this.createButtons(width, height);
      
      // Start skjermrotasjon
      this.startScreenRotation();
    }
    
    // Spill tittelmusikk
    this.playTitleMusic();
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
  
  createGameOverText(width, height) {
    // Game Over tekst
    this.gameOverText = this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: CONSTANTS.COLORS.NEON_PINK
    }).setOrigin(0.5);
    
    this.gameOverText.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 15, true, true);
    
    // Puls-animasjon
    this.tweens.add({
      targets: this.gameOverText,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Vis endelig score
    this.finalScoreText = this.add.text(width / 2, height / 4 + 80, `FINAL SCORE: ${this.game.globals.score}`, {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: CONSTANTS.COLORS.NEON_YELLOW
    }).setOrigin(0.5);
    
    this.finalScoreText.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 10, true, true);
  }
  
  checkHighscore() {
    const score = this.game.globals.score;
    const highscores = this.game.globals.highscores;
    
    // Sjekk om poengsum kvalifiserer som highscore
    if (highscores.length < 10) {
      this.isNewHighscore = true;
    } else {
      // Finn den laveste highscoren
      const lowestScore = Math.min(...highscores.map(hs => hs.score));
      if (score > lowestScore) {
        this.isNewHighscore = true;
      }
    }
  }
  
  createHighscoreInput(width, height) {
    // Opprett highscore-melding
    const highscoreText = this.add.text(width / 2, height / 2 - 50, 'NEW HIGHSCORE!', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0.5);
    
    highscoreText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 15, true, true);
    
    // Puls-animasjon for highscore-tekst
    this.tweens.add({
      targets: highscoreText,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Opprett input container
    const inputContainer = this.add.container(width / 2, height / 2 + 50);
    
    // Bakgrunn for inputfelt
    const inputBg = this.add.rectangle(0, 0, 300, 60, 0x000000, 0.7);
    inputBg.setStrokeStyle(2, 0x39ff14);
    
    // Text for inputfelt (vil bli oppdatert)
    this.inputText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: CONSTANTS.COLORS.WHITE,
      align: 'center'
    }).setOrigin(0.5);
    
    // "Enter your name:" tekst
    const promptText = this.add.text(0, -50, 'ENTER YOUR NAME:', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.WHITE
    }).setOrigin(0.5);
    
    // Legg til elementer i containeren
    inputContainer.add([inputBg, this.inputText, promptText]);
    
    // På mobile enheter, vis et virtuelt tastatur
    if (this.sys.game.device.input.touch) {
      this.createVirtualKeyboard(width, height);
    }
    
    // Registrer tastaturtilbakemelding
    this.input.keyboard.on('keydown', this.handleKeyInput, this);
    
    // Opprett send-knapp
    const submitButton = this.add.rectangle(0, 80, 200, 50, 0x000000, 0.7);
    submitButton.setStrokeStyle(2, 0x39ff14);
    submitButton.setInteractive({ useHandCursor: true });
    
    const submitText = this.add.text(0, 80, 'SUBMIT', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    }).setOrigin(0.5);
    
    submitText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
    
    // Legg til submit-knapp i containeren
    inputContainer.add([submitButton, submitText]);
    
    // Håndter submit-klikk
    submitButton.on('pointerdown', () => {
      this.submitHighscore();
    });
    
    // Tilslutt, afspill en highscore-lyd hvis tilgjengelig
    if (this.game.globals.sfx && this.game.globals.sfx.powerup) {
      this.game.globals.sfx.powerup.play();
    }
  }
  
  createVirtualKeyboard(width, height) {
    // Opprett virtuelt tastatur for mobile enheter
    // Dette er en enkel versjon som bare viser knapper for bokstaver og tall
    
    const keyboard = this.add.container(width / 2, height - 150);
    
    const keys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '-'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<-', '_', '->']
    ];
    
    const keySize = 30;
    const padding = 5;
    const rows = keys.length;
    const cols = keys[0].length;
    
    // Bakgrunn for tastaturet
    const keyboardBg = this.add.rectangle(
      0, 0,
      (keySize + padding) * cols + padding,
      (keySize + padding) * rows + padding,
      0x000000, 0.7
    );
    keyboardBg.setStrokeStyle(2, 0xFFFFFF);
    keyboard.add(keyboardBg);
    
    // Opprett hver tast
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const keyValue = keys[row][col];
        const x = col * (keySize + padding) - (keyboardBg.width / 2) + keySize / 2 + padding;
        const y = row * (keySize + padding) - (keyboardBg.height / 2) + keySize / 2 + padding;
        
        const key = this.add.rectangle(x, y, keySize, keySize, 0x333333);
        key.setStrokeStyle(1, 0x39ff14);
        key.setInteractive({ useHandCursor: true });
        
        const keyText = this.add.text(x, y, keyValue, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
        
        keyboard.add([key, keyText]);
        
        // Håndter tastetrykk
        key.on('pointerdown', () => {
          if (keyValue === '<-') {
            // Backspace
            this.playerName = this.playerName.slice(0, -1);
          } else if (keyValue === '->') {
            // Enter/submit
            this.submitHighscore();
          } else if (keyValue === '_') {
            // Space
            if (this.playerName.length < 15) {
              this.playerName += ' ';
            }
          } else {
            // Legg til bokstav/tall
            if (this.playerName.length < 15) {
              this.playerName += keyValue;
            }
          }
          
          // Oppdater input-tekst
          this.inputText.setText(this.playerName);
        });
      }
    }
    
    keyboard.setVisible(true);
  }
  
  handleKeyInput(event) {
    // Håndter tastetrykkene for highscore-input
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
      // Enter = submit
      this.submitHighscore();
    } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
      // Backspace = slett siste bokstav
      this.playerName = this.playerName.slice(0, -1);
    } else if (event.key.length === 1 && this.playerName.length < 15) {
      // Legg til bokstav/tall/symbol (ett tegn)
      this.playerName += event.key.toUpperCase();
    }
    
    // Oppdater input-tekst
    this.inputText.setText(this.playerName);
  }
  
  submitHighscore() {
    // Hvis navnet er tomt, bruk 'PLAYER' som standard
    if (this.playerName.trim() === '') {
      this.playerName = 'PLAYER';
    }
    
    // Sanitiser spillernavnet (fjern uønskede tegn)
    const sanitizedName = this.playerName.replace(/[^a-zA-ZæøåÆØÅ0-9\s]/gi, '').substring(0, 15);
    
    // Opprett highscore-objekt
    const highscoreData = {
      name: sanitizedName,
      score: this.game.globals.score,
      level: this.game.globals.level,
      date: new Date().toISOString()
    };
    
    // Legg til i highscores-listen
    this.game.globals.highscores.push(highscoreData);
    
    // Sorter highscores
    this.game.globals.highscores.sort((a, b) => b.score - a.score);
    
    // Behold bare de 20 beste
    this.game.globals.highscores = this.game.globals.highscores.slice(0, 20);
    
    // Lagre til lokal lagring
    try {
      localStorage.setItem('evilInvadersHighscores', JSON.stringify(this.game.globals.highscores));
    } catch (e) {
      console.error('Error saving highscores:', e);
    }
    
    // Her kan du legge til kode for å sende highscore til en server
    // For eksempel med Firebase eller annen backend
    
    // Gå til highscore-skjermen
    this.scene.start('HighscoreScene');
  }
  
  createButtons(width, height) {
    // Opprett en container for knapper
    const buttonContainer = this.add.container(width / 2, height / 2 + 50);
    
    // Felles knappestil
    const buttonStyle = {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    };
    
    // Retry-knapp
    const retryButton = this.add.rectangle(0, 0, 200, 50, 0x000000, 0.7);
    retryButton.setStrokeStyle(2, 0x39ff14);
    retryButton.setInteractive({ useHandCursor: true });
    
    const retryText = this.add.text(0, 0, '1. RETRY', buttonStyle).setOrigin(0.5);
    retryText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
    
    // Exit-knapp
    const exitButton = this.add.rectangle(0, 70, 200, 50, 0x000000, 0.7);
    exitButton.setStrokeStyle(2, 0x39ff14);
    exitButton.setInteractive({ useHandCursor: true });
    
    const exitText = this.add.text(0, 70, '2. EXIT', buttonStyle).setOrigin(0.5);
    exitText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
    
    // Highscore-knapp
    const highscoreButton = this.add.rectangle(0, 140, 200, 50, 0x000000, 0.7);
    highscoreButton.setStrokeStyle(2, 0x39ff14);
    highscoreButton.setInteractive({ useHandCursor: true });
    
    const highscoreText = this.add.text(0, 140, 'H. HIGHSCORES', buttonStyle).setOrigin(0.5);
    highscoreText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
    
    // Legg til knapper i containeren
    buttonContainer.add([
      retryButton, retryText,
      exitButton, exitText,
      highscoreButton, highscoreText
    ]);
    
    // Legg til hendelser for knappene
    retryButton.on('pointerdown', () => this.restartGame());
    exitButton.on('pointerdown', () => this.exitGame());
    highscoreButton.on('pointerdown', () => this.showHighscores());
    
    // Legg også til tastaturhendelser
    this.input.keyboard.on('keydown-ONE', () => this.restartGame());
    this.input.keyboard.on('keydown-TWO', () => this.exitGame());
    this.input.keyboard.on('keydown-H', () => this.showHighscores());
  }
  
  restartGame() {
    // Stopp rotasjonstimeren hvis den kjører
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer);
      this.rotationTimer = null;
    }
    
    // Nullstill spillet og start på nytt
    this.game.globals.score = 0;
    this.game.globals.lives = 5;
    this.game.globals.level = 1;
    this.game.globals.autoFireEnabled = false;
    this.game.globals.laserSpeed = CONSTANTS.BULLET_SPEED;
    this.game.globals.laserCount = 1;
    
    this.scene.start('LevelStartScene');
  }
  
  exitGame() {
    // Stopp rotasjonstimeren hvis den kjører
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer);
      this.rotationTimer = null;
    }
    
    // Gå tilbake til tittelskjermen
    this.scene.start('TitleScene');
  }
  
  showHighscores() {
    // Stopp rotasjonstimeren hvis den kjører
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer);
      this.rotationTimer = null;
    }
    
    // Gå til highscore-skjermen
    this.scene.start('HighscoreScene');
  }
  
  startScreenRotation() {
    // Stopp eksisterende timer hvis den finnes
    if (this.rotationTimer) {
      clearTimeout(this.rotationTimer);
    }
    
    // Start med game over-skjermen
    this.currentRotationScreen = 'gameOver';
    
    // Funksjon for å rotere til neste skjerm
    const rotateToNextScreen = () => {
      // Roter til neste skjerm basert på gjeldende skjerm
      if (this.currentRotationScreen === 'gameOver') {
        this.currentRotationScreen = 'highscores';
        this.scene.start('HighscoreScene');
        // Venter 10 sekunder på highscore-skjermen
        this.rotationTimer = setTimeout(rotateToNextScreen, 10000);
      } else if (this.currentRotationScreen === 'highscores') {
        this.currentRotationScreen = 'credits';
        this.scene.start('CreditsScene');
        // Venter 5 sekunder på credits-skjermen
        this.rotationTimer = setTimeout(rotateToNextScreen, 5000);
      } else {
        this.currentRotationScreen = 'gameOver';
        this.scene.start('GameOverScene');
        // Venter 5 sekunder på game over-skjermen
        this.rotationTimer = setTimeout(rotateToNextScreen, 5000);
      }
    };
    
    // Start rotasjonen - vent 5 sekunder på den første game over-skjermen
    this.rotationTimer = setTimeout(rotateToNextScreen, 5000);
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
}

export default GameOverScene;