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

    // Handle loading errors
    this.load.on('loaderror', (file) => {
      console.warn(`Failed to load asset: ${file.key} from ${file.url}`);
    });
  }

  create() {
    console.log('Assets loaded, starting game...');
    
    // Sett opp globale funksjoner eller data
    this.initializeGlobals();
    
    // Create fallback textures for missing assets
    this.createFallbackTextures();
    
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
    // Load images with error handling - use try/catch or check if files exist
    
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
    // Lydeffekter - with error handling
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

  createFallbackTextures() {
    // Create simple colored rectangles as fallback textures for missing images
    
    // Create particle texture if it doesn't exist
    if (!this.textures.exists('particle')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0xffffff);
      graphics.fillRect(0, 0, 4, 4);
      graphics.generateTexture('particle', 4, 4);
      graphics.destroy();
    }
    
    // Create fallback player texture
    if (!this.textures.exists('player')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0x00ff00); // Green
      graphics.fillRect(0, 0, CONSTANTS.PLAYER_WIDTH, CONSTANTS.PLAYER_HEIGHT);
      graphics.generateTexture('player', CONSTANTS.PLAYER_WIDTH, CONSTANTS.PLAYER_HEIGHT);
      graphics.destroy();
    }
    
    // Create fallback UFO textures
    for (let i = 1; i <= 4; i++) {
      if (!this.textures.exists(`ufo${i}`)) {
        const graphics = this.make.graphics();
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // Red, Green, Blue, Yellow
        graphics.fillStyle(colors[i - 1]);
        graphics.fillRect(0, 0, CONSTANTS.UFO_WIDTH, CONSTANTS.UFO_HEIGHT);
        graphics.generateTexture(`ufo${i}`, CONSTANTS.UFO_WIDTH, CONSTANTS.UFO_HEIGHT);
        graphics.destroy();
      }
    }
    
    // Create fallback boss textures
    if (!this.textures.exists('bossLvl5')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0xff8800); // Orange
      graphics.fillRect(0, 0, 100, 80);
      graphics.generateTexture('bossLvl5', 100, 80);
      graphics.destroy();
    }
    
    if (!this.textures.exists('bossLvl10')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0xff0088); // Pink
      graphics.fillRect(0, 0, 150, 120);
      graphics.generateTexture('bossLvl10', 150, 120);
      graphics.destroy();
    }
    
    // Create fallback explosion textures
    for (let i = 1; i <= 5; i++) {
      if (!this.textures.exists(`explosion${i}`)) {
        const graphics = this.make.graphics();
        graphics.fillStyle(0xffaa00); // Orange
        const size = 20 + i * 5;
        graphics.fillCircle(size/2, size/2, size/2);
        graphics.generateTexture(`explosion${i}`, size, size);
        graphics.destroy();
      }
    }
    
    // Create fallback diamond texture
    if (!this.textures.exists('diamond')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0x00ffff); // Cyan
      graphics.fillRect(0, 0, 30, 30);
      graphics.generateTexture('diamond', 30, 30);
      graphics.destroy();
    }
    
    // Create fallback extra life texture
    if (!this.textures.exists('extralife')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0xff3e61); // Pink heart color
      graphics.fillCircle(10, 10, 8);
      graphics.generateTexture('extralife', 20, 20);
      graphics.destroy();
    }
    
    // Create fallback asteroid texture
    if (!this.textures.exists('asteroid')) {
      const graphics = this.make.graphics();
      graphics.fillStyle(0x666666); // Gray
      graphics.fillCircle(20, 20, 20);
      graphics.generateTexture('asteroid', 40, 40);
      graphics.destroy();
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
      gameState: 'start',
      backgroundMusic: null,
      sfx: {}
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
          { name: 'BOENZA', score: 5000, level: 10, date: new Date().toISOString() },
          { name: 'MASTER', score: 4000, level: 8, date: new Date().toISOString() },
          { name: 'SHOOTER', score: 3000, level: 6, date: new Date().toISOString() },
          { name: 'DEFENDER', score: 2000, level: 4, date: new Date().toISOString() },
          { name: 'ROOKIE', score: 1000, level: 2, date: new Date().toISOString() }
        ];
        
        // Save default highscores
        localStorage.setItem('evilInvadersHighscores', JSON.stringify(this.game.globals.highscores));
      }
    } catch (e) {
      console.error('Error loading highscores:', e);
      // Fallback til tomme highscores
      this.game.globals.highscores = [];
    }
  }
}

export default BootScene;
