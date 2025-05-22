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
    
    // Timing kontroll
    this.lastTime = 0;
    this.frameCount = 0;
    this.targetFPS = 60;
    this.targetDelta = 1000 / this.targetFPS; // 16.67ms for 60fps
  }

  init() {
    // Spillvariabler
    this.score = this.game.globals.score || 0;
    this.lives = this.game.globals.lives || 5;
    this.level = this.game.globals.level || 1;
    
    // Reset timing
    this.lastTime = 0;
    this.frameCount = 0;
    
    // Våpenvariabler
    this.lastShot = 0;
    this.autoFireEnabled = this.game.globals.autoFireEnabled || false;
    this.laserSpeed = this.game.globals.laserSpeed || CONSTANTS.BULLET_SPEED;
    this.laserCount = this.game.globals.laserCount || 1;
    
    // Spilltilstandsvariabler
    this.bossShieldActive = this.game.globals.bossShieldActive || false;
    this.bossShieldHealth = this.game.globals.bossShieldHealth || 0;
    this.largeUfoCreated = this.game.globals.largeUfoCreated || false;
    this.largeUfo2Created = this.game.globals.largeUfo2Created || false;
    this.levelExtraLifeDropped = this.game.globals.levelExtraLifeDropped || false;
    this.levelStartTime = this.game.globals.levelStartTime || Date.now();
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
    console.log('GameScene create() called - Level:', this.level);
    this.game.globals.gameState = 'playing';
    
    // Reset timing ved oppstart
    this.lastTime = this.time.now;
    
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
    // AGGRESSIVE TIMING CONTROL - Dette er kritisk!
    this.frameCount++;
    
    // Beregn faktisk delta fra siste frame
    if (this.lastTime === 0) {
      this.lastTime = time;
      return; // Skip første frame
    }
    
    const actualDelta = time - this.lastTime;
    this.lastTime = time;
    
    // Begrens delta til realistiske verdier
    let safeDelta = actualDelta;
    
    if (safeDelta > 100) { // Hvis mer enn 100ms har gått
      safeDelta = this.targetDelta; // Bruk 16.67ms (60fps)
      console.warn('Delta too high, capping at target:', actualDelta, '->', safeDelta);
    } else if (safeDelta < 5) { // Hvis mindre enn 5ms
      safeDelta = this.targetDelta;
    }
    
    // Debug hvert 60. frame
    if (this.frameCount % 60 === 0) {
      console.log('Frame timing - Actual delta:', actualDelta, 'Safe delta:', safeDelta, 'FPS:', Math.round(1000/actualDelta));
    }
    
    // Sjekk om spillet er i "playing"-tilstand
    if (this.game.globals.gameState !== 'playing') return;
    
    // Oppdater spilleren
    this.updatePlayer(safeDelta);
    
    // Oppdater fiendene
    this.updateEnemies(safeDelta);
    
    // Oppdater prosjektiler
    this.updateProjectiles(safeDelta);
    
    // Oppdater power-ups
    this.updatePowerUps(safeDelta);
    
    // Oppdater asteroider
    this.updateAsteroids(safeDelta);
    
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
    if (this.level >= 9 && this.textures.exists('playerLvl9')) {
      this.player.setTexture('playerLvl9');
    } else if (this.level >= 6 && this.textures.exists('playerLvl6')) {
      this.player.setTexture('playerLvl6');
    } else if (this.level >= 3 && this.textures.exists('playerLvl3')) {
      this.player.setTexture('playerLvl3');
    }
  }
  
  createEnemies() {
    console.log('Creating enemies for level', this.level);
    
    // Grunnleggende UFO-rader
    const baseRows = CONSTANTS.UFO_ROWS;
    
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
    // Opprett lydeffekter (try-catch for å unngå errors)
    this.sfx = {};
    
    try {
      this.sfx.shoot = this.sound.add('shoot', { volume: 0.15 });
    } catch (e) {
      console.warn('Could not load shoot sound');
    }
    
    try {
      this.sfx.explosion = this.sound.add('explosion', { volume: 0.15 });
    } catch (e) {
      console.warn('Could not load explosion sound');
    }
    
    try {
      this.sfx.hit = this.sound.add('hit', { volume: 0.15 });
    } catch (e) {
      console.warn('Could not load hit sound');
    }
    
    try {
      this.sfx.powerup = this.sound.add('powerup', { volume: 0.5 });
    } catch (e) {
      console.warn('Could not load powerup sound');
    }
    
    // Lagre i globals
    this.game.globals.sfx = this.sfx;
  }
  
  createMusic() {
    // Skip musikk for nå - kan forårsake problemer
    console.log('Skipping music for debugging');
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
   * UPDATE METODER - Med aggressiv timing-kontroll
   * ------------------------------ */
   
  updatePlayer(delta) {
    // Ikke oppdater hvis spiller er ødelagt
    if (!this.player || !this.player.active) return;
    
    // Bevegelse basert på tastaturinput
    if (this.cursors.left.isDown || (this.touchInput.isMoving && this.touchInput.direction === 'left')) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown || (this.touchInput.isMoving && this.touchInput.direction === 'right')) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }
    
    // Skyting - bruk time.now i stedet for delta-basert timing
    const canFire = this.time.now > this.lastShot + CONSTANTS.BULLET_COOLDOWN;
    
    if ((this.fireButton.isDown || this.touchInput.isFiring || this.autoFireEnabled) && canFire) {
      this.shoot();
    }
    
    // Oppdater spilleren med kontrollert delta
    if (this.player.update) {
      this.player.update(this.time.now, delta);
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
    }
    
    // Oppdater lastShot og spill lyd
    this.lastShot = this.time.now;
    if (this.sfx && this.sfx.shoot) {
      this.sfx.shoot.play();
    }
  }
  
  updateEnemies(delta) {
    // Oppdater hver fiende med kontrollert delta
    this.enemies.getChildren().forEach(enemy => {
      if (enemy && enemy.update && enemy.active) {
        enemy.update(delta, 0); // Ingen speed bonus for nå
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
  }
  
  updateProjectiles(delta) {
    // Oppdater kulenes posisjon
    this.bullets.getChildren().forEach(bullet => {
      if (bullet && bullet.update && bullet.active) {
        bullet.update(delta);
      }
      
      // Fjern kuler som er utenfor skjermen
      if (bullet && bullet.y < -bullet.height) {
        bullet.destroy();
      }
    });
    
    // Oppdater lavadroppenes posisjon
    this.lavaDrops.getChildren().forEach(lava => {
      if (lava && lava.update && lava.active) {
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
      if (powerup && powerup.update && powerup.active) {
        powerup.update(delta);
      }
      
      // Fjern power-ups som er utenfor skjermen
      if (powerup && powerup.y > this.cameras.main.height) {
        powerup.destroy();
      }
    });
    
    // Oppdater ekstra liv
    this.extraLives.getChildren().forEach(extraLife => {
      if (extraLife && extraLife.update && extraLife.active) {
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
      if (asteroid && asteroid.update && asteroid.active) {
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
    if (enemy.hit && enemy.hit()) {
      // Fienden er ødelagt
      this.addScore(10);
      
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
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
    
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
    
    // Håndter input for å fortsette
    const continueHandler = () => {
      // Fjern overlayet og teksten
      overlay.destroy();
      victoryText.destroy();
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
}

export default GameScene;
