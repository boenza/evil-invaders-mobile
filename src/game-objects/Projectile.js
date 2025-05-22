import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'bullet') {
    // Siden bullets er bare rektangler, bruker vi et placeholder-sprite
    super(scene, x, y, 'particle');
    
    // Legger prosjektilet til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Prosjektil-type (bullet = spillerens skudd, lava = fiende-skudd)
    this.type = type;
    
    // Sett opp størrelse og egenskaper basert på type
    if (type === 'bullet') {
      this.width = CONSTANTS.BULLET_WIDTH;
      this.height = CONSTANTS.BULLET_HEIGHT;
      this.setVelocityY(-scene.game.globals.laserSpeed); // Beveger oppover
      this.setTint(0xFFFF00); // Gul laser
    } else {
      this.width = CONSTANTS.LAVA_WIDTH;
      this.height = CONSTANTS.LAVA_HEIGHT;
      this.setVelocityY(CONSTANTS.LAVA_SPEED); // Beveger nedover
      this.setTint(0xFF8800); // Oransje lava
    }
    
    // Setter faktisk størrelse
    this.setDisplaySize(this.width, this.height);
    
    // Partikkeleffekter for prosjektilet
    this.createParticleTrail(scene);
  }
  
  createParticleTrail(scene) {
    try {
      // Lag partikkel-tekstur hvis den ikke finnes
      if (!scene.textures.exists('particle')) {
        const graphics = scene.make.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 4, 4);
        graphics.generateTexture('particle', 4, 4);
        graphics.destroy();
      }

      // Opprett partikkelspor for prosjektilet
      this.particles = scene.add.particles(this.x, this.y, 'particle', {
        lifespan: 300,
        speed: { min: 10, max: 50 },
        scale: { start: 0.1, end: 0 },
        quantity: 1,
        blendMode: 'ADD',
        emitting: true,
        // Sett partikkelfarger basert på prosjektiltype
        tint: this.type === 'bullet' ? [0xFFFF66, 0xFFDD00] : [0xFF8800, 0xFF4400]
      });
      
    } catch (error) {
      console.warn("Could not create particle trail:", error);
      this.particles = null;
    }
  }
  
  update(delta) {
    // Oppdater partikkelposisjon
    if (this.particles) {
      if (this.type === 'bullet') {
        this.particles.setPosition(this.x, this.y + this.height);
      } else {
        this.particles.setPosition(this.x, this.y - this.height / 2);
      }
    }
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

export default Projectile;
