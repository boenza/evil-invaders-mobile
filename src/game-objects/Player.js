import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    
    // Legger spilleren til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp fysikkegenskaper
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setDrag(300);
    this.setMaxVelocity(CONSTANTS.PLAYER_SPEED * 2, 0);
    
    // Setter opp størrelse
    this.setDisplaySize(CONSTANTS.PLAYER_WIDTH, CONSTANTS.PLAYER_HEIGHT);
    
    // Spillervariabler
    this.speed = CONSTANTS.PLAYER_SPEED;
    this.immune = false;
    this.immunityTime = 0;
    
    // Partikkeleffekter (thruster/motor)
    this.createThrusterParticles(scene);
  }
  
  createThrusterParticles(scene) {
    try {
      // Lag partikkel-tekstur hvis den ikke finnes
      if (!scene.textures.exists('particle')) {
        const graphics = scene.make.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('particle', 4, 4);
        graphics.destroy();
      }

      // Opprett partikkeleffekt for motoren
      this.thruster = scene.add.particles(this.x, this.y + (this.height / 2), 'particle', {
        lifespan: 600,
        speed: { min: 50, max: 120 },
        scale: { start: 0.2, end: 0 },
        quantity: 1,
        blendMode: 'ADD',
        emitting: false,
        tint: [0x00ffff, 0x1100ff] // Bruk tint-property i stedet for setTint()
      });
    } catch (error) {
      console.warn("Could not create thruster particles:", error);
      this.thruster = null;
    }
  }
  
  update(time, delta) {
    // Normaliser delta til fornuftige verdier
    if (delta > 100) {
      delta = 16.67; // Cap at 60 FPS equivalent
    }
    
    // Oppdaterer partikkelsystemets posisjon
    if (this.thruster) {
      this.thruster.setPosition(this.x, this.y + (this.height / 2) - 5);
    }
    
    // Håndterer immunitet (etter å ha blitt truffet)
    if (this.immune) {
      // Blinkeeffekt
      this.alpha = Math.sin(time / 100) * 0.5 + 0.5;
      
      // Sjekk om immunitetstiden er over
      if (time > this.immunityTime) {
        this.immune = false;
        this.alpha = 1;
      }
    }
  }
  
  moveLeft() {
    // Beveger spilleren til venstre
    this.setVelocityX(-this.speed);
    
    // Setter partikkelsystemet til å emittere
    if (this.thruster && !this.thruster.emitting) {
      this.thruster.start();
      this.thruster.setPosition(this.x + 5, this.y + (this.height / 2) - 5);
    }
  }
  
  moveRight() {
    // Beveger spilleren til høyre
    this.setVelocityX(this.speed);
    
    // Setter partikkelsystemet til å emittere
    if (this.thruster && !this.thruster.emitting) {
      this.thruster.start();
      this.thruster.setPosition(this.x - 5, this.y + (this.height / 2) - 5);
    }
  }
  
  stopMoving() {
    // Stopper horisontal bevegelse
    this.setVelocityX(0);
    
    // Stopper partikkelemittering
    if (this.thruster && this.thruster.emitting) {
      this.thruster.stop();
    }
  }
  
  setImmunity(duration = 2000) {
    // Gjør spilleren immun mot skade for en viss tid
    this.immune = true;
    this.immunityTime = this.scene.time.now + duration;
  }
  
  destroy() {
    // Rydder opp ressurser ved ødeleggelse
    if (this.thruster) {
      this.thruster.destroy();
    }
    
    // Kaller foreldreimplementasjonen av destroy
    super.destroy();
  }
}

export default Player;
