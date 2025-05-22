import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Vi bruker diamant-teksturen, men kan bytte den ut med custom grafikk
    super(scene, x, y, 'diamond');
    
    // Legger power-up til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp størrelse og egenskaper
    this.displayWidth = 40;
    this.displayHeight = 40;
    
    // Setter hastighet
    this.setVelocityY(CONSTANTS.POWERUP_SPEED);
    
    // Bestem hvilken type power-up dette er basert på nivået
    this.level = scene.game.globals.level;
    
    // Sett farge basert på power-up-typen
    if (this.level === 3) {
      // Nivå 3: Raskere skudd + autofire (cyan)
      this.setTint(0x00FFFF);
    } else if (this.level === 5) {
      // Nivå 5: Dobbelt-skudd (gul)
      this.setTint(0xFFFF00);
    } else if (this.level === 9) {
      // Nivå 9: Quad-skudd (rosa)
      this.setTint(0xFF00FF);
    } else {
      // Standard power-up (hvit)
      this.setTint(0xFFFFFF);
    }
    
    // Partikkeleffekter
    this.createGlowEffect(scene);
    
    // Roter power-up jevnt
    this.rotateSpeed = 1;
  }
  
  createGlowEffect(scene) {
    // Opprett et glow-partikkelsystem rundt power-upen
    if (scene.textures.exists('particle')) {
      // Bestem glow-farge basert på power-up-typen
      let color;
      
      if (this.level === 3) {
        color = 0x00FFFF; // Cyan
      } else if (this.level === 5) {
        color = 0xFFFF00; // Gul
      } else if (this.level === 9) {
        color = 0xFF00FF; // Rosa
      } else {
        color = 0xFFFFFF; // Hvit
      }
      
      this.particles = scene.add.particles(0, 0, 'particle', {
        x: this.x,
        y: this.y,
        lifespan: 600,
        speed: { min: 10, max: 40 },
        scale: { start: 0.2, end: 0 },
        quantity: 1,
        blendMode: 'ADD'
      });
      
      // Sett partikkelfarge
      this.particles.setTint(color);
    }
  }
  
  update(delta) {
    // Roter power-up
    this.angle += this.rotateSpeed * (delta / 16.67);
    
    // Oppdater partikkelposisjon
    if (this.particles) {
      this.particles.setPosition(this.x, this.y);
    }
    
    // Pulse-effekt
    const scalePulse = 1 + 0.1 * Math.sin(this.scene.time.now / 200);
    this.setScale(scalePulse);
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

export default PowerUp;