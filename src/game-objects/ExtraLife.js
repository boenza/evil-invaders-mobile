import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class ExtraLife extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Vi bruker extralife-teksturen (hjerteformet)
    super(scene, x, y, 'extralife');
    
    // Legger extra-life til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp størrelse og egenskaper
    this.displayWidth = 40;
    this.displayHeight = 40;
    
    // Setter hastighet
    this.setVelocityY(CONSTANTS.EXTRALIFE_SPEED);
    
    // Partikkeleffekter
    this.createGlowEffect(scene);
    
    // Sett en tilfeldig horisontal hastighet for å gjøre bevegelsen mer interessant
    const randomVelocityX = Phaser.Math.Between(-20, 20);
    this.setVelocityX(randomVelocityX);
    
    // Bounce mot veggene
    this.setCollideWorldBounds(true);
    this.setBounce(1, 0);
  }
  
  createGlowEffect(scene) {
    // Opprett et glow-partikkelsystem rundt extra-life
    if (scene.textures.exists('particle')) {
      this.particles = scene.add.particles(0, 0, 'particle', {
        x: this.x,
        y: this.y,
        lifespan: 600,
        speed: { min: 10, max: 30 },
        scale: { start: 0.2, end: 0 },
        quantity: 1,
        blendMode: 'ADD'
      });
      
      // Hjertepartikler er rosa
      this.particles.setTint(0xFF3E61);
    }
  }
  
  update(delta) {
    // Oppdater partikkelposisjon
    if (this.particles) {
      this.particles.setPosition(this.x, this.y);
    }
    
    // Pulse-effekt
    const time = this.scene.time.now;
    const scalePulse = 1 + 0.2 * Math.sin(time / 300);
    this.setScale(scalePulse);
    
    // Sørg for at extra-life bouncer horisontalt men faller vertikalt
    const gameWidth = this.scene.cameras.main.width;
    
    if (this.x <= 0) {
      this.x = 0;
      this.setVelocityX(Math.abs(this.body.velocity.x));
    } else if (this.x >= gameWidth - this.displayWidth) {
      this.x = gameWidth - this.displayWidth;
      this.setVelocityX(-Math.abs(this.body.velocity.x));
    }
    
    // Legg til litt gravitasjons-akselerasjon
    this.setVelocityY(this.body.velocity.y + 0.1 * delta);
  }
  
  destroy() {
    // Rydd opp ressurser ved ødeleggelse
    if (this.particles) {
      this.particles.destroy();
    }
    
    // Kaller foreldreimplementasjonen av destroy
    super.destroy();
  }
}

export default ExtraLife;