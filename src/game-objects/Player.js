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
    // Opprett partikkeleffekt for motoren
    if (scene.textures.exists('particle')) {
      this.thruster = scene.add.particles(0, 0, 'particle', {
        x: this.x,
        y: this.y + (this.height / 2),
        lifespan: 600,
        speed: { min: 50, max: 120 },
        scale: { start: 0.2, end: 0 },
        quantity: 1,
        blendMode: 'ADD',
        emitting: false
      });
      
      // Sett farger på partiklene
      this.thruster.setTint(0x00ffff, 0x1100ff);
    } else {
      // Hvis vi ikke har en partikkel-tekstur, opprett en enkel
      const graphics = scene.make.graphics();
      graphics.fillStyle(0xffffff);
      graphics.fillRect(0, 0, 4, 4);
      graphics.generateTexture('particle', 4, 4);
      
      this.thruster = scene.add.particles(0, 0, 'particle', {
        x: this.x,
        y: this.y + (this.height / 2),
        lifespan: 600,
        speed: { min: 50, max: 120 },
        scale: { start: 0.2, end: 0 },
        quantity: 1,
        blendMode: 'ADD',
        emitting: false
      });
      
      // Sett farger på partiklene
      this.thruster.setTint(0x00ffff, 0x1100ff);
    }
  }
  
  update(time, delta) {
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
    if (this.thruster) {
      this.thruster.emitting = true;
      this.thruster.setPosition(this.x + 5, this.y + (this.height / 2) - 5);
    }
  }
  
  moveRight() {
    // Beveger spilleren til høyre
    this.setVelocityX(this.speed);
    
    // Setter partikkelsystemet til å emittere
    if (this.thruster) {
      this.thruster.emitting = true;
      this.thruster.setPosition(this.x - 5, this.y + (this.height / 2) - 5);
    }
  }
  
  stopMoving() {
    // Stopper horisontal bevegelse
    this.setVelocityX(0);
    
    // Stopper partikkelemittering
    if (this.thruster) {
      this.thruster.emitting = false;
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