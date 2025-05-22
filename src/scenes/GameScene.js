import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';
import createAnimations from '../utils/Animations';

// Importer spillobjekter
import Player from '../game-objects/Player';
import Enemy from '../game-objects/Enemy';
import Boss from '../game-objects/Boss';
import Projectile from '../game-objects/Projectile';
import LavaDrop from '../game-objects/LavaDrop';
import PowerUp from '../game-objects/PowerUp';
import ExtraLife from '../game-objects/ExtraLife';
import Asteroid from '../game-objects/Asteroid';
import Explosion from '../game-objects/Explosion';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // Spillvariabler
    this.score = this.game.globals.score;
    this.lives = this.game.globals.lives;
    this.level = this.game.globals.level;
    
    // Våpenvariabler
    this.lastShot = 0;
    this.autoFireEnabled = this.game.globals.autoFireEnabled;
    this.laserSpeed = this.game.globals.laserSpeed;
    this.laserCount = this.game.globals.laserCount;
    
    // Spilltilstandsvariabler
    this.bossShieldActive = this.game.globals.bossShieldActive;
    this.bossShieldHealth = this.game.globals.bossShieldHealth;
    this.largeUfoCreated = this.game.globals.largeUfoCreated;
    this.largeUfo2Created = this.game.globals.largeUfo2Created;
    this.levelExtraLifeDropped = this.game.globals.levelExtraLifeDropped;
    this.levelStartTime = this.game.globals.levelStartTime;
    this.asteroidTimer = 0;
    
    // Objektgrupper
    this.bullets = null;
    this.enemies = null;
    this.lavaDrops = null;
    this.powerups = null;
    this.extraLives = null;
    this.explosions = null;
    this.asteroids = null;
    
    // Input
    this.cursors = null;
    this.fireButton = null;
    this.touchInput = {
      isMoving: false,
      direction: null,
      isFiring: false
    };
  }

  create() {
    console.log('GameScene create() called');
    this.game.globals.gameState = 'playing';
    
    // Opprett bakgrunn
    this.createBackground();
    
    // Opprett animasjoner
    createAnimations(this);
    
    // Opprett fysikkgrupper
    this.createGroups();
    
    // Opprett spilleren
    this.createPlayer();
    
    // Opprett fiender
    this.createEnemies();
    
    // Opprett UI
    this.createUI();
    
    // Opprett lydeffekter
    this.createSFX();
    
    // Opprett bakgrunnsmusikk
    this.createMusic();
    
    // Opprett styringsinngang (tastatur og touch)
    this.createInput();
    
    // Opprett power-ups hvis nivået tilsier det
    this.createInitialPowerUps();
    
    // Opprett kollisjonsdeteksjon
    this.createCollisions();
    
    // Start nivåspesifikke elementer
    this.setupLevelSpecifics();
  }
  
  update(time, delta) {
    // Normaliser delta til 60 FPS hvis det er for høyt
    if (delta > 100) {
      delta = 16.67; // 60 FPS
    }
    
    // Sjekk om spillet er i "playing"-tilstand
    if (this.game.globals.gameState !== 'playing') return;
    
    // Oppdater spilleren
    this.updatePlayer(delta);
    
    // Oppdater fiendene
    this.updateEnemies(delta);
    
    // Oppdater prosjektiler
    this.updateProjectiles(delta);
    
    // Oppdater power-ups
    this.updatePowerUps(delta);
    
    // Oppdater asteroider
    this.updateAsteroids(delta);
    
    // Sjekk nivåkomplettering
    this.checkLevelCompletion();
  }
  
  /* ------------------------------
   * CREATE METODER
   * ------------------------------ */
   
  createBackground() {
    console.log('Creating background for level', this.level);
    
    // Velg bakgrunnsbilde basert på nivå
    const bgKey = `background${this.level}`;
    
    if (this.textures.exists(bgKey)) {
      this.add.image(
        this.cameras.main.width / 2, 
        this.cameras.main.height / 2, 
        bgKey
      ).setDisplaySize(
        this.cameras.main.width,
        this.cameras.main.height
      );
    } else {
      // Fallback - lag en stjernebakgrunn
      console.log('Background image not found, using starfield');
      this.createStarfield();
    }
  }
  
  createStarfield() {
    // Opprett en bakgrunn med stjerner
    this.cameras.main.setBackgroundColor('#000033');
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      
      const star = this.add.circle(x, y, size, 0xffffff);
      
      // La noen stjerner blinke
      if (i % 3 === 0) {
        this.tweens.add({
          targets: star,
          alpha: Phaser.Math.FloatBetween(0.3, 0.7),
          duration: Phaser.Math.Between(1000, 3000),
          yoyo: true,
          repeat: -1
        });
      }
    }
  }
  
  createGroups() {
    // Opprett fysikkgrupper for spillobjekter
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.lavaDrops = this.physics.add.group();
    this.powerups = this.physics.add.group();
    this.extraLives = this.physics.add.group();
    this.explosions = this.add.group(); // Ikke fysikk
    this.asteroids = this.physics.add.group();
  }
  
  createPlayer() {
    // Opprett spilleren i bunnen av skjermen
    const x = this.cameras.main.width / 2;
    const y = this.cameras.main.height - 50;
    
    this.player = new Player(this, x, y);
    
    // Sett spilleranimasjon basert på nivå
    if (this.level >= 9) {
      this.player.setTexture('playerLvl9');
    } else if (this.level >= 6) {
      this.player.setTexture('playerLvl6');
    } else if (this.level >= 3) {
      this.player.setTexture('playerLvl3');
    }
  }
  
  createEnemies() {
    console.log('Creating enemies for level', this.level);
    
    // Grunnleggende UFO-rader
    const baseRows = CONSTANTS.UFO_ROWS;
    
    // Ekstra UFO-rader basert på nivå (nivå 6-10)
    let extraRows = 0;
    if (this.level >= 6) {
      extraRows = this.level - 5;
    }
    
    const totalRows = baseRows + extraRows;
    
    // Juster plassering basert på nivå
    const levelOffset = Math.min(this.level - 1, 3) * 10;
    
    // Beregn størrelsen på fiendegriden
    const gridWidth = CONSTANTS.UFO_COLS * (CONSTANTS.UFO_WIDTH + 10);
    const startX = (this.cameras.main.width - gridWidth) / 2 + (CONSTANTS.UFO_WIDTH / 2) + 10;
    
    // Vanlige UFO-rader
    for (let row = 0; row < baseRows; row++) {
      for (let col = 0; col < CONSTANTS.UFO_COLS; col++) {
        const ufoX = startX + col * (CONSTANTS.UFO_WIDTH + 10);
        const ufoY = 50 + row * (CONSTANTS.UFO_HEIGHT + 10) + levelOffset;
        
        // Sett helse basert på rad, fra topp til bunn: 4, 3, 2, 1
        const ufoHealth = 4 - row;
        const health = ufoHealth > 0 ? ufoHealth : 1;
        
        // Bestem hvilken UFO-type basert på raden
        const ufoType = `ufo${row % 4 + 1}`;
        
        // Opprett fiende
        const enemy = new Enemy(
          this,
          ufoX,
          ufoY,
          ufoType,
          health,
          CONSTANTS.UFO_SPEED,
          row,
          col
        );
        
        this.enemies.add(enemy);
      }
    }
    
    console.log(`Created ${this.enemies.getLength()} enemies`);
  }
  
  createUI() {
    // Opprett UI-elementer (poeng, liv, etc.)
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_YELLOW
    });
    
    this.scoreText.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 10, true, true);
    
    this.levelText = this.add.text(20, 50, `Level: ${this.level}`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_PINK
    });
    
    this.levelText.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 10, true, true);
    
    this.livesText = this.add.text(20, 80, 'Lives:', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: CONSTANTS.COLORS.NEON_GREEN
    });
    
    this.livesText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 10, true, true);
    
    // Opprett livikoner (bruk fallback hvis extralife ikke finnes)
    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      let lifeIcon;
      if (this.textures.exists('extralife')) {
        lifeIcon = this.add.image(95 + i * 25, 85, 'extralife').setScale(0.5);
      } else {
        // Fallback til sirkel
        lifeIcon = this.add.circle(95 + i * 25, 85, 8, 0xFF3E61);
      }
      
      if (i >= this.lives) {
        lifeIcon.setAlpha(0.3);
      }
      
      this.lifeIcons.push(lifeIcon);
    }
    
    // Vis ekstra liv-indikator hvis mer enn 5
    if (this.lives > 5) {
      this.extraLivesText = this.add.text(95 + 5 * 25 + 10, 85, `+${this.lives - 5}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: CONSTANTS.COLORS.NEON_GREEN,
        align: 'left'
      });
      
      this.extraLivesText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
    }
    
    // Touch-kontroller for mobile enheter
    this.createTouchControls();
  }
  
  createTouchControls() {
    // Sjekk om vi er på mobil/touch-enhet
    if (!this.sys.game.device.input.touch) return;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Opprett usynlige touch-soner
    const leftZone = this.add.zone(0, 0, width / 3, height)
      .setOrigin(0)
      .setInteractive();
      
    const rightZone = this.add.zone(width * 2 / 3, 0, width / 3, height)
      .setOrigin(0)
      .setInteractive();
      
    const centerZone = this.add.zone(width / 3, 0, width / 3, height)
      .setOrigin(0)
      .setInteractive();
      
    // Visuell indikator for venstre kontroll
    this.leftControl = this.add.circle(width / 6, height - 100, 40, 0x39ff14, 0.5)
      .setVisible(false);
    this.add.text(width / 6, height - 100, '←', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1);
    
    // Visuell indikator for høyre kontroll
    this.rightControl = this.add.circle(width * 5 / 6, height - 100, 40, 0x39ff14, 0.5)
      .setVisible(false);
    this.add.text(width * 5 / 6, height - 100, '→', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1);
    
    // Visuell indikator for skyte-knapp
    this.fireControl = this.add.circle(width / 2, height - 100, 50, 0xff14a3, 0.5)
      .setVisible(false);
    this.add.text(width / 2, height - 100, 'FIRE', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1);
    
    // Input-håndtering for venstre bevegelse
    leftZone.on('pointerdown', () => {
      this.touchInput.isMoving = true;
      this.touchInput.direction = 'left';
      this.leftControl.setVisible(true);
    });
    
    leftZone.on('pointerup', () => {
      if (this.touchInput.direction === 'left') {
        this.touchInput.isMoving = false;
      }
      this.leftControl.setVisible(false);
    });
    
    leftZone.on('pointerout', () => {
      if (this.touchInput.direction === 'left') {
        this.touchInput.isMoving = false;
      }
      this.leftControl.setVisible(false);
    });
    
    // Input-håndtering for høyre bevegelse
    rightZone.on('pointerdown', () => {
      this.touchInput.isMoving = true;
      this.touchInput.direction = 'right';
      this.rightControl.setVisible(true);
    });
    
    rightZone.on('pointerup', () => {
      if (this.touchInput.direction === 'right') {
        this.touchInput.isMoving = false;
      }
      this.rightControl.setVisible(false);
    });
    
    rightZone.on('pointerout', () => {
      if (this.touchInput.direction === 'right') {
        this.touchInput.isMoving = false;
      }
      this.rightControl.setVisible(false);
    });
    
    // Input-håndtering for skyting
    centerZone.on('pointerdown', () => {
      this.touchInput.isFiring = true;
      this.fireControl.setVisible(true);
    });
    
    centerZone.on('pointerup', () => {
      this.touchInput.isFiring = false;
      this.fireControl.setVisible(false);
    });
    
    centerZone.on('pointerout', () => {
      this.touchInput.isFiring = false;
      this.fireControl.setVisible(false);
    });
  }
  
  createSFX() {
    // Opprett lydeffekter
    this.sfx = {
      shoot: this.sound.add('shoot', { volume: 0.15 }),
      explosion: this.sound.add('explosion', { volume: 0.15 }),
      hit: this.sound.add('hit', { volume: 0.15 }),
      powerup: this.sound.add('powerup', { volume: 0.5 })
    };
    
    // Lagre i globals
    this.game.globals.sfx = this.sfx;
  }
  
  createMusic() {
    // Spill nivåspesifikk musikk
    if (this.game.globals.backgroundMusic) {
      this.game.globals.backgroundMusic.stop();
    }
    
    const musicKey = `backgroundMusic${this.level}`;
    
    // Sjekk om musikken eksisterer før vi prøver å spille den
    if (this.sound.sounds.find(sound => sound.key === musicKey)) {
      this.game.globals.backgroundMusic = this.sound.add(musicKey, {
        volume: 0.5,
        loop: true
      });
      
      this.game.globals.backgroundMusic.play();
    } else {
      console.log(`Background music ${musicKey} not found`);
    }
  }
  
  createInput() {
    // Opprett tastaturinput
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
  
  createInitialPowerUps() {
    // På bestemte nivåer, opprett power-ups
    if (this.level === 3 || this.level === 5 || this.level === 9) {
      const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
      const powerup = new PowerUp(this, x, 0);
      this.powerups.add(powerup);
    }
  }
  
  createCollisions() {
    // Kollisjon mellom skudd og fiender
    this.physics.add.collider(
      this.bullets,
      this.enemies,
      this.bulletEnemyCollision,
      null,
      this
    );
    
    // Kollisjon mellom spiller og fiender
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.playerEnemyCollision,
      null,
      this
    );
    
    // Kollisjon mellom spiller og lava
    this.physics.add.collider(
      this.player,
      this.lavaDrops,
      this.playerLavaCollision,
      null,
      this
    );
    
    // Kollisjon mellom spiller og power-ups
    this.physics.add.overlap(
      this.player,
      this.powerups,
      this.playerPowerUpCollision,
      null,
      this
    );
    
    // Kollisjon mellom spiller og ekstra liv
    this.physics.add.overlap(
      this.player,
      this.extraLives,
      this.playerExtraLifeCollision,
      null,
      this
    );
    
    // Kollisjon mellom spiller og asteroider
    this.physics.add.collider(
      this.player,
      this.asteroids,
      this.playerAsteroidCollision,
      null,
      this
    );
    
    // Kollisjon mellom skudd og asteroider
    this.physics.add.collider(
      this.bullets,
      this.asteroids,
      this.bulletAsteroidCollision,
      null,
      this
    );
  }
  
  setupLevelSpecifics() {
    // Periodisk asteroidespawning for boss-nivåer
    if (this.level === 5 || this.level === 10) {
      this.asteroidTimer = this.time.now;
      this.asteroidSpawnInterval = 2000; // 2 sekunder
    }
  }

  /* ------------------------------
   * UPDATE METODER
   * ------------------------------ */
   
  updatePlayer(delta) {
    // Ikke oppdater hvis spiller er ødelagt
    if (!this.player || !this.player.active) return;
    
    // Bevegelse basert på tastaturinput
    if (this.cursors.left.isDown || this.touchInput.isMoving && this.touchInput.direction === 'left') {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown || this.touchInput.isMoving && this.touchInput.direction === 'right') {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }
    
    // Skyting
    const canFire = this.time.now > this.lastShot + CONSTANTS.BULLET_COOLDOWN;
    
    if ((this.fireButton.isDown || this.touchInput.isFiring || this.autoFireEnabled) && canFire) {
      this.shoot();
    }
  }
  
  shoot() {
    // Skyt skudd basert på antall lasere
    if (this.laserCount === 1) {
      // Ett skudd
      const bullet = new Projectile(
        this, 
        this.player.x, 
        this.player.y - 20,
        'bullet'
      );
      this.bullets.add(bullet);
    } else if (this.laserCount === 2) {
      // To skudd
      const offsetX = 15;
      const bullet1 = new Projectile(
        this, 
        this.player.x - offsetX, 
        this.player.y - 20,
        'bullet'
      );
      const bullet2 = new Projectile(
        this, 
        this.player.x + offsetX, 
        this.player.y - 20,
        'bullet'
      );
      this.bullets.add(bullet1);
      this.bullets.add(bullet2);
    } else if (this.laserCount === 4) {
      // Fire skudd
      const offsetX = 20;
      const bullet1 = new Projectile(
        this, 
        this.player.x - offsetX, 
        this.player.y - 20,
        'bullet'
      );
      const bullet2 = new Projectile(
        this, 
        this.player.x - offsetX/2, 
        this.player.y - 20,
        'bullet'
      );
      const bullet3 = new Projectile(
        this, 
        this.player.x + offsetX/2, 
        this.player.y - 20,
        'bullet'
      );
      const bullet4 = new Projectile(
        this, 
        this.player.x + offsetX, 
        this.player.y - 20,
        'bullet'
      );
      this.bullets.add(bullet1);
      this.bullets.add(bullet2);
      this.bullets.add(bullet3);
      this.bullets.add(bullet4);
    }
    
    // Oppdater lastShot og spill lyd
    this.lastShot = this.time.now;
    if (this.sfx && this.sfx.shoot) {
      this.sfx.shoot.play();
    }
  }
  
  updateEnemies(delta) {
    // Filtrer ut vanlige UFO-er (ikke bosser) for å telle
    const regularEnemies = this.enemies.getChildren().filter(enemy => !enemy.isLarge);
    const remainingEnemies = regularEnemies.length;
    
    // Telle kun de originale UFO-ene (ikke nye rader)
    const originalEnemies = regularEnemies.filter(enemy => !enemy.isNewRow).length;
    
    // Sjekk om vi skal opprette en boss-UFO
    if (this.level === CONSTANTS.BOSS_LEVEL_1 && !this.largeUfoCreated && remainingEnemies <= 1) {
      this.createBoss(CONSTANTS.BOSS_LEVEL_1);
    } else if (this.level === CONSTANTS.BOSS_LEVEL_2 && !this.largeUfo2Created && 
              (remainingEnemies <= 5 || (this.time.now - this.levelStartTime > 60000))) {
      this.createBoss(CONSTANTS.BOSS_LEVEL_2);
    }
    
    // For level 6-10, sjekk om vi skal legge til nye rader
    if (this.level >= 6 && this.level <= 10) {
      // Sjekk om vi har få originale UFO-er igjen
      if (originalEnemies <= CONSTANTS.UFO_COLS && !this.newRowsCreated) {
        // Legg til nye rader
        this.addNewEnemyRows();
      }
    }
    
    // Øk hastigheten på UFOene basert på hvor mange som er igjen
    let speedBonus = 0;
    
    if (remainingEnemies <= 5) {
      speedBonus = 3.0;
    } else if (remainingEnemies <= 10) {
      speedBonus = 2.0;
    } else if (remainingEnemies <= 20) {
      speedBonus = 1.0;
    }
    
    // Oppdater hver fiende
    this.enemies.getChildren().forEach(enemy => {
      if (enemy && enemy.update) {
        enemy.update(delta, speedBonus);
      }
      
      // Sjekk om UFO har nådd bunnen av skjermen
      if (enemy && enemy.y + enemy.height >= this.cameras.main.height - 10 && !enemy.isLarge) {
        enemy.destroy();
        this.loseLife();
        
        // Opprett eksplosjon
        const explosion = new Explosion(
          this, 
          enemy.x, 
          this.cameras.main.height - 20
        );
        this.explosions.add(explosion);
        
        // Spill treff-lyd
        if (this.sfx && this.sfx.hit) {
          this.sfx.hit.play();
        }
      }
    });
    
    // Periodisk asteroidespawning for boss-nivåer
    if ((this.level === 5 || this.level === 10) && 
        this.time.now - this.asteroidTimer > this.asteroidSpawnInterval) {
      this.createAsteroid();
      this.asteroidTimer = this.time.now;
    }
  }
  
  createBoss(bossLevel) {
    console.log(`Creating boss for level ${bossLevel}`);
    
    // Fjern eventuelle gjenværende vanlige UFO-er
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy.isLarge) {
        enemy.destroy();
      }
    });
    
    // Bestem boss-egenskaper basert på nivå
    let bossHealth, bossSpeed;
    
    if (bossLevel === 5) {
      bossHealth = 50;
      bossSpeed = 3;
      this.largeUfoCreated = true;
    } else { // level 10
      bossHealth = 200;
      bossSpeed = 4;
      this.largeUfo2Created = true;
    }
    
    // Opprett boss-UFO
    const boss = new Boss(
      this,
      this.cameras.main.width / 2,
      100,
      bossLevel === 5 ? 'bossLvl5' : 'bossLvl10',
      bossHealth,
      bossSpeed
    );
    
    this.enemies.add(boss);
    
    // Oppdater globals
    this.game.globals.largeUfoCreated = this.largeUfoCreated;
    this.game.globals.largeUfo2Created = this.largeUfo2Created;
  }
  
  addNewEnemyRows() {
    // Antall ekstra rader som skal legges til for dette nivået
    const extraRowsForLevel = this.level - 5; // Level 6=1, 7=2, 8=3, 9=4, 10=5
    
    // Legg til hver ny rad
    for (let i = 0; i < extraRowsForLevel; i++) {
      this.createNewEnemyRow(i, extraRowsForLevel);
    }
    
    // Sett flagg for å hindre at vi legger til flere rader
    this.newRowsCreated = true;
  }
  
  createNewEnemyRow(rowIndex, totalNewRows) {
    // Beregn helsen til nye UFO-er (5, 6, 7, 8, 9 for hver nye rad)
    const baseHealth = 4;
    const health = baseHealth + rowIndex;
    
    // Beregn startposisjon - litt over toppen av skjermen
    // Radene med høyere indeks starter høyere opp for å unngå overlapping
    const startY = -20 - (rowIndex * (CONSTANTS.UFO_HEIGHT + 10));
    
    // Beregn x-posisjoner
    const gridWidth = CONSTANTS.UFO_COLS * (CONSTANTS.UFO_WIDTH + 10);
    const startX = (this.cameras.main.width - gridWidth) / 2 + (CONSTANTS.UFO_WIDTH / 2) + 10;
    
    // Legg til den nye raden
    for (let col = 0; col < CONSTANTS.UFO_COLS; col++) {
      const ufoX = startX + col * (CONSTANTS.UFO_WIDTH + 10);
      const ufoY = startY;
      
      // Opprett ny fiende med spesielle egenskaper
      const enemy = new Enemy(
        this,
        ufoX,
        ufoY,
        `ufo${rowIndex % 4 + 1}`,
        health,
        CONSTANTS.UFO_SPEED + 0.5,
        -rowIndex - 1, // Negative for å indikere at det er en ekstra rad
        col,
        true // isNewRow = true
      );
      
      enemy.newRowBatch = rowIndex + 1;
      enemy.creationTime = this.time.now;
      
      this.enemies.add(enemy);
    }
    
    // Spill en spesiell lyd for ny rad (kun for den første raden hvis det er flere)
    if (rowIndex === 0 && this.sfx && this.sfx.powerup) {
      this.sfx.powerup.play();
    }
  }
  
  updateProjectiles(delta) {
    // Oppdater kulenes posisjon
    this.bullets.getChildren().forEach(bullet => {
      if (bullet && bullet.update) {
        bullet.update(delta);
      }
      
      // Fjern kuler som er utenfor skjermen
      if (bullet && bullet.y < -bullet.height) {
        bullet.destroy();
      }
    });
    
    // Oppdater lavadroppenes posisjon
    this.lavaDrops.getChildren().forEach(lava => {
      if (lava && lava.update) {
        lava.update(delta);
      }
      
      // Fjern lava som er utenfor skjermen
      if (lava && lava.y > this.cameras.main.height) {
        lava.destroy();
      }
    });
  }
  
  updatePowerUps(delta) {
    // Oppdater power-ups
    this.powerups.getChildren().forEach(powerup => {
      if (powerup && powerup.update) {
        powerup.update(delta);
      }
      
      // Fjern power-ups som er utenfor skjermen
      if (powerup && powerup.y > this.cameras.main.height) {
        powerup.destroy();
      }
    });
    
    // Oppdater ekstra liv
    this.extraLives.getChildren().forEach(extraLife => {
      if (extraLife && extraLife.update) {
        extraLife.update(delta);
      }
      
      // Fjern ekstra liv som er utenfor skjermen
      if (extraLife && extraLife.y > this.cameras.main.height) {
        extraLife.destroy();
      }
    });
  }
  
  updateAsteroids(delta) {
    // Oppdater asteroider
    this.asteroids.getChildren().forEach(asteroid => {
      if (asteroid && asteroid.update) {
        asteroid.update(delta);
      }
      
      // Fjern asteroider som er utenfor skjermen
      if (asteroid && (asteroid.y > this.cameras.main.height || 
          asteroid.x < -asteroid.width || 
          asteroid.x > this.cameras.main.width + asteroid.width)) {
        asteroid.destroy();
      }
    });
  }
  
  /* ------------------------------
   * KOLLISJONSHÅNDTERINGSFUNKSJONER
   * ------------------------------ */
   
  bulletEnemyCollision(bullet, enemy) {
    // Fjern kulen
    bullet.destroy();
    
    // Håndter fiende-treff
    if (enemy.hit()) {
      // Fienden er ødelagt
      
      // Legg til poeng
      if (enemy.isLarge) {
        this.addScore(200); // Boss gir 200 poeng
        
        // Spesielle boss-effekter håndteres i Enemy-klassen
        this.handleBossDefeat(enemy);
      } else {
        // Vanlig UFO gir poeng basert på helsen
        let basePoints = 10;
        
        // Nye rader med høyere helse gir flere poeng
        if (enemy.isNewRow) {
          basePoints = 15 + (this.level - 6) * 5; // Øker med level
        }
        
        this.addScore(basePoints);
        
        // Sjanse for å slippe ekstra liv
        if (Phaser.Math.FloatBetween(0, 100) < 1) { // 1% sjanse
          const extraLife = new ExtraLife(
            this,
            enemy.x,
            enemy.y
          );
          this.extraLives.add(extraLife);
        }
      }
      
      // Spill eksplosjonslyd
      if (this.sfx && this.sfx.explosion) {
        this.sfx.explosion.play();
      }
    } else {
      // Fienden tok skade men er fortsatt i live
      if (this.sfx && this.sfx.hit) {
        this.sfx.hit.play();
      }
    }
  }
  
  playerEnemyCollision(player, enemy) {
    // Håndter kollisjon mellom spiller og fiende
    enemy.destroy();
    
    // Spilleren mister et liv
    this.loseLife();
    
    // Opprett eksplosjon ved spillerposisjonen
    const explosion = new Explosion(this, player.x, player.y, true);
    this.explosions.add(explosion);
    
    // Spill treff-lyd
    if (this.sfx && this.sfx.hit) {
      this.sfx.hit.play();
    }
  }
  
  playerLavaCollision(player, lava) {
    // Håndter kollisjon mellom spiller og lava
    lava.destroy();
    
    // Spilleren mister et liv
    this.loseLife();
    
    // Opprett eksplosjon ved spillerposisjonen
    const explosion = new Explosion(this, player.x, player.y, true);
    this.explosions.add(explosion);
    
    // Spill treff-lyd
    if (this.sfx && this.sfx.hit) {
      this.sfx.hit.play();
    }
  }
  
  playerPowerUpCollision(player, powerup) {
    // Håndter kollisjon mellom spiller og power-up
    powerup.destroy();
    
    // Anvend power-up-effekt
    this.applyPowerup();
    
    // Spill power-up-lyd
    if (this.sfx && this.sfx.powerup) {
      this.sfx.powerup.play();
    }
  }
  
  playerExtraLifeCollision(player, extraLife) {
    // Håndter kollisjon mellom spiller og ekstra liv
    extraLife.destroy();
    
    // Legg til et liv
    this.lives++;
    this.updateLivesDisplay();
    
    // Oppdater globale liv
    this.game.globals.lives = this.lives;
    
    // Spill power-up-lyd
    if (this.sfx && this.sfx.powerup) {
      this.sfx.powerup.play();
    }
  }
  
  playerAsteroidCollision(player, asteroid) {
    // Håndter kollisjon mellom spiller og asteroide
    asteroid.destroy();
    
    // Spilleren mister et liv
    this.loseLife();
    
    // Opprett eksplosjon ved spillerposisjonen
    const explosion = new Explosion(this, player.x, player.y, true);
    this.explosions.add(explosion);
    
    // Spill treff-lyd
    if (this.sfx && this.sfx.hit) {
      this.sfx.hit.play();
    }
  }
  
  bulletAsteroidCollision(bullet, asteroid) {
    // Håndter kollisjon mellom kule og asteroide
    bullet.destroy();
    asteroid.destroy();
    
    // Legg til poeng
    this.addScore(15);
    
    // Opprett eksplosjon
    const explosion = new Explosion(this, asteroid.x, asteroid.y);
    this.explosions.add(explosion);
    
    // Spill eksplosjonslyd
    if (this.sfx && this.sfx.explosion) {
      this.sfx.explosion.play();
    }
  }
  
  /* ------------------------------
   * HJELPEFUNKSJONER
   * ------------------------------ */
   
  addScore(points) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Oppdater globale poeng
    this.game.globals.score = this.score;
  }
  
  loseLife() {
    this.lives--;
    
    // Oppdater livvisningen
    this.updateLivesDisplay();
    
    // Oppdater globale liv
    this.game.globals.lives = this.lives;
    
    // Sjekk om spillet er over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }
  
  updateLivesDisplay() {
    // Oppdater livikoner
    for (let i = 0; i < 5; i++) {
      if (this.lifeIcons[i]) {
        if (i < this.lives) {
          this.lifeIcons[i].setAlpha(1);
        } else {
          this.lifeIcons[i].setAlpha(0.3);
        }
      }
    }
    
    // Oppdater tekst for ekstra liv
    if (this.lives > 5) {
      if (this.extraLivesText) {
        this.extraLivesText.setText(`+${this.lives - 5}`);
      } else {
        this.extraLivesText = this.add.text(95 + 5 * 25 + 10, 85, `+${this.lives - 5}`, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: CONSTANTS.COLORS.NEON_GREEN,
          align: 'left'
        });
        
        this.extraLivesText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
      }
    } else if (this.extraLivesText) {
      this.extraLivesText.destroy();
      this.extraLivesText = null;
    }
  }
  
  applyPowerup() {
    console.log(`Applying powerup for level ${this.level}`);
    
    if (this.level === 3) {
      this.laserSpeed += 2; // Raskere laserskudd
      this.autoFireEnabled = true; // Aktiver auto-skyting
      if (this.textures.exists('playerLvl3')) {
        this.player.setTexture('playerLvl3'); // Bruk level 3 spillerskip
      }
    } else if (this.level === 5) {
      this.laserCount = 2; // Dobbelt laserskudd
      if (this.textures.exists('playerLvl6')) {
        this.player.setTexture('playerLvl6'); // Bruk level 6 spillerskip
      }
    } else if (this.level === 9) {
      this.laserCount = 4; // Firedobbelt laserskudd
      if (this.textures.exists('playerLvl9')) {
        this.player.setTexture('playerLvl9'); // Bruk level 9 spillerskip
      }
    }
    
    // Oppdater globale verdier
    this.game.globals.autoFireEnabled = this.autoFireEnabled;
    this.game.globals.laserSpeed = this.laserSpeed;
    this.game.globals.laserCount = this.laserCount;
  }
  
  createAsteroid() {
    // Lag en ny asteroide
    const asteroid = new Asteroid(this);
    this.asteroids.add(asteroid);
  }
  
  handleBossDefeat(boss) {
    // Håndter når boss er beseiret
    // Dette kan inkludere spesielle effekter, animasjoner, etc.
    
    // Stopp spillsløyfen midlertidig for å vise effekter
    this.game.globals.gameState = 'bossDefeat';
    
    // Opprett stor eksplosjon med mange partikler
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * boss.width;
        const offsetY = (Math.random() - 0.5) * boss.height;
        
        const explosion = new Explosion(
          this,
          boss.x + offsetX,
          boss.y + offsetY,
          false,
          Phaser.Math.FloatBetween(1, 2)
        );
        
        this.explosions.add(explosion);
        
        if (i % 3 === 0 && this.sfx && this.sfx.explosion) {
          // Spill eksplosjonslyd med ulike intervaller
          this.sfx.explosion.play();
        }
      }, i * 200);
    }
    
    // Etter en forsinkelse, vis BOSS DEFEATED tekst
    this.time.delayedCall(2000, () => {
      // Legg til pulserende "BOSS DEFEATED" tekst
      const bossDefeatedText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 20,
        'BOSS DEFEATED',
        {
          fontFamily: 'monospace',
          fontSize: '40px',
          color: CONSTANTS.COLORS.NEON_YELLOW
        }
      ).setOrigin(0.5);
      
      bossDefeatedText.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 15, true, true);
      
      this.tweens.add({
        targets: bossDefeatedText,
        scale: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      
      // Legg til "Trykk for å fortsette" tekst
      const continueText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 30,
        'TAP TO CONTINUE',
        {
          fontFamily: 'monospace',
          fontSize: '24px',
          color: CONSTANTS.COLORS.WHITE
        }
      ).setOrigin(0.5);
      
      continueText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 8, true, true);
      
      this.tweens.add({
        targets: continueText,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      // Håndter input for å fortsette
      const continueHandler = () => {
        // Fjern teksten
        bossDefeatedText.destroy();
        continueText.destroy();
        
        // Stopp timeren
        if (this.continueTimer) {
          this.continueTimer.remove();
        }
        
        // Fjern event-lytteren
        this.input.off('pointerdown', continueHandler);
        
        // Gå til level-complete
        if (this.level === 10 && boss.level === 10) {
          this.victory();
        } else {
          this.levelComplete();
        }
      };
      
      // Legg til input-lytter
      this.input.once('pointerdown', continueHandler);
      
      // Auto-fortsett etter 10 sekunder hvis ingen input
      this.continueTimer = this.time.delayedCall(10000, continueHandler);
    });
  }
  
  checkLevelCompletion() {
    // Sjekk om spilleren har mistet alle liv
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    
    // Ignorer nivå-fullføring hvis vi allerede er i en annen tilstand
    if (this.game.globals.gameState !== 'playing') {
      return;
    }
    
    // Sjekk om alle fiender er ødelagt
    if (this.enemies.getLength() === 0) {
      // På level 5 og 10, håndteres fullføring i handleBossDefeat
      if ((this.level === 5 && this.largeUfoCreated) || (this.level === 10 && this.largeUfo2Created)) {
        // Blir håndtert i handleBossDefeat
        return;
      }
      
      // Vis nivå-fullført animasjon
      this.levelVictoryAnimation();
    }
  }
  
  levelVictoryAnimation() {
    // Endre spilltilstand først
    this.game.globals.gameState = 'levelVictory';
    
    // Opprett et midlertidig seier-overlay
    const overlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000, 0.7
    ).setOrigin(0);
    
    // Legg til seierstekst
    const victoryText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'LEVEL CLEARED!',
      {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: CONSTANTS.COLORS.NEON_PINK
      }
    ).setOrigin(0.5);
    
    victoryText.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 15, true, true);
    
    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    // Legg til nivånummer
    const levelText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 10,
      `LEVEL ${this.level} COMPLETE`,
      {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: CONSTANTS.COLORS.NEON_YELLOW
      }
    ).setOrigin(0.5);
    
    levelText.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 10, true, true);
    
    // Legg til "trykk for å fortsette" tekst
    const continueText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 80,
      'TAP TO CONTINUE',
      {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: CONSTANTS.COLORS.WHITE
      }
    ).setOrigin(0.5);
    
    continueText.setShadow(0, 0, CONSTANTS.COLORS.WHITE, 8, true, true);
    
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Spill victory-lyd hvis tilgjengelig
    if (this.sfx && this.sfx.powerup) {
      this.sfx.powerup.play();
    }
    
    // Håndter input for å fortsette
    const continueHandler = () => {
      // Fjern overlayet og teksten
      overlay.destroy();
      victoryText.destroy();
      levelText.destroy();
      continueText.destroy();
      
      // Stopp timeren
      if (this.continueTimer) {
        this.continueTimer.remove();
      }
      
      // Fjern event-lytteren
      this.input.off('pointerdown', continueHandler);
      
      // Gå til level-complete
      this.levelComplete();
    };
    
    // Legg til input-lytter
    this.input.once('pointerdown', continueHandler);
    
    // Auto-fortsett etter 10 sekunder hvis ingen input
    this.continueTimer = this.time.delayedCall(10000, continueHandler);
  }
  
  levelComplete() {
    // Lagre spilltilstand
    this.game.globals.score = this.score;
    this.game.globals.lives = this.lives;
    
    // Gå til level-complete skjermen
    this.scene.start('LevelCompleteScene');
  }
  
  gameOver() {
    // Lagre spilltilstand
    this.game.globals.score = this.score;
    
    // Gå til game-over skjermen
    this.scene.start('GameOverScene');
  }
  
  victory() {
    // Lagre spilltilstand
    this.game.globals.score = this.score;
    this.game.globals.lives = this.lives;
    
    // Gå til victory-skjermen
    this.scene.start('VictoryScene');
  }
}

export default GameScene;
