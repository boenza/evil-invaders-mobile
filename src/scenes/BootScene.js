import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Vis lastemeldingen
    this.createLoadingScreen();

    // Laster alle bildefiler
    this.loadImages();

    // Laster alle lydfiler
    this.loadAudio();

    // Laster alle fonter (om nødvendig)
    // this.loadFonts();
  }

  create() {
    console.log('Assets loaded, starting game...');
    
    // Sett opp globale funksjoner eller data
    this.initializeGlobals();
    
    // Gå til tittelskjermen
    this.scene.start('TitleScene');
  }

  createLoadingScreen() {
    // Bakgrunnsfarge
    this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    
    // Vis lasteprosent
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Tittel
    this.add.text(width / 2, height / 2 - 50, 'EVIL INVADERS II', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: CONSTANTS.COLORS.NEON_PINK,
      align: 'center'
    }).setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 10).setOrigin(0.5);
    
    // Undertittel
    this.add.text(width / 2, height / 2, 'LOADING ASSETS...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: CONSTANTS.COLORS.NEON_GREEN,
      align: 'center'
    }).setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 5).setOrigin(0.5);
    
    // Lastestolpe
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 30, 320, 30);
    
    // Vis lasteprosent
    const loadingText = this.add.text(width / 2, height / 2 + 45, '0%', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Oppdater lastefremgang
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x39ff14, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 40, 300 * value, 20);
      loadingText.setText(parseInt(value * 100) + '%');
    });
    
    // Rydd opp etter lasting
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  loadImages() {
    // Spillerbilder
    this.load.image('player', 'assets/images/player.png');
    this.load.image('playerLvl3', 'assets/images/new_player_ship_lvl3.png');
    this.load.image('playerLvl6', 'assets/images/new_player_ship_lvl6.png');
    this.load.image('playerLvl9', 'assets/images/new_player_ship_lvl9.png');
    
    // UFO-bilder
    this.load.image('ufo1', 'assets/images/ufo1.png');
    this.load.image('ufo2', 'assets/images/ufo2.png');
    this.load.image('ufo3', 'assets/images/ufo3.png');
    this.load.image('ufo4', 'assets/images/ufo4.png');
    
    // Boss-fiender
    this.load.image('bossLvl5', 'assets/images/large_ufo_level5.png');
    this.load.image('bossLvl10', 'assets/images/large_ufo_level10.png');
    
    // Eksplosjoner
    this.load.image('explosion1', 'assets/images/explosion1.png');
    this.load.image('explosion2', 'assets/images/explosion2.png');
    this.load.image('explosion3', 'assets/images/explosion3.png');
    this.load.image('explosion4', 'assets/images/explosion4.png');
    this.load.image('explosion5', 'assets/images/explosion5.png');
    
    // Power-ups og gjenstander
    this.load.image('diamond', 'assets/images/diamond.png');
    this.load.image('extralife', 'assets/images/extralife.svg');
    this.load.image('asteroid', 'assets/images/asteroid.png');
    
    // Bakgrunner for nivåer
    for (let i = 1; i <= 10; i++) {
      this.load.image(`background${i}`, `assets/images/background${i}.webp`);
    }
    
    // Tittelskjermbakgrunn
    this.load.image('titleBackground', 'assets/images/title_screen.jpg');
    
    // UI-elementer
    this.load.image('button', 'assets/images/button.png');
  }

  loadAudio() {
    // Lydeffekter
    this.load.audio('shoot', 'assets/sounds/shoot.wav');
    this.load.audio('explosion', 'assets/sounds/explosion.wav');
    this.load.audio('hit', 'assets/sounds/hit.wav');
    this.load.audio('powerup', 'assets/sounds/powerup.mp3');
    this.load.audio('counter', 'assets/sounds/counter.wav');
    this.load.audio('morse', 'assets/sounds/morse.mp3');
    
    // Bakgrunnsmusikk
    this.load.audio('titleMusic', 'assets/sounds/Evil Invaders.mp3');
    for (let i = 1; i <= 10; i++) {
      this.load.audio(`backgroundMusic${i}`, `assets/sounds/background_music${i}.mp3`);
    }
  }

  initializeGlobals() {
    // Initialiser globale spillvariabler
    this.game.globals = {
      score: 0,
      lives: 5,
      level: 1,
      highscores: [],
      lastShot: 0,
      autoFireEnabled: false,
      laserSpeed: CONSTANTS.BULLET_SPEED,
      laserCount: 1,
      bossShieldActive: false,
      bossShieldHealth: 0,
      largeUfoCreated: false,
      largeUfo2Created: false,
      levelExtraLifeDropped: false,
      levelStartTime: 0,
      gameState: 'start'
    };
    
    // Prøv å laste highscores fra lokal lagring
    this.loadHighscores();
  }
  
  loadHighscores() {
    try {
      const savedScores = localStorage.getItem('evilInvadersHighscores');
      if (savedScores) {
        this.game.globals.highscores = JSON.parse(savedScores);
      } else {
        // Ingen highscores funnet, la oss lage noen standard verdier
        this.game.globals.highscores = [
          { name: 'BOENZA', score: 5000, level: 10 },
          { name: 'MASTER', score: 4000, level: 8 },
          { name: 'SHOOTER', score: 3000, level: 6 },
          { name: 'DEFENDER', score: 2000, level: 4 },
          { name: 'ROOKIE', score: 1000, level: 2 }
        ];
      }
    } catch (e) {
      console.error('Error loading highscores:', e);
      // Fallback til tomme highscores
      this.game.globals.highscores = [];
    }
  }