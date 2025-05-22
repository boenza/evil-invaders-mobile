import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class LavaDrop extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, color = null, isFragment = false) {
    // Vi bruker et enkelt partikkelsprite som grunnlag
    super(scene, x, y, 'particle');
    
    // Legger lava-dråpen til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp størrelse og hastighet
    this.lavaWidth = isFragment ? CONSTANTS.LAVA_WIDTH * 2 : CONSTANTS.LAVA_WIDTH;
    this.lavaHeight = isFragment ? CONSTANTS.LAVA_HEIGHT * 2 : CONSTANTS.LAVA_HEIGHT;
    this.setDisplaySize(this.lavaWidth, this.lavaHeight);
    
    // Lava-egenskaper
    this.lavaSpeed = CONSTANTS.LAVA_SPEED;
    this.color = color || 0xFF8800; // Standard: oransje
    this.pulse = Math.random(); // 0-1 for pulseringssyklusen
    this.growing = true; // Vokser eller krymper
    this.rotation = Math.random() * 360; // Tilfeldig rotasjon
    this.rotationSpeed = Math.random() * 10 - 5; // Tilfeldig rotasjonshastighet
    this.isFragment = isFragment;
    this.lifetime = isFragment ? 500 : null; // Levetid i ms (brukes bare for fragmenter)
    
    // For fragmenter, legg til horisontal hastighet
    if (isFragment) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 50;
      this.velocityX = Math.cos(angle) * speed;
      this.velocityY = Math.sin(angle) * speed;
      this.setVelocity(this.velocityX, this.velocityY);
      this.setGravityY(200); // Legg til litt tyngdekraft
    } else {
      // Vanlig lava beveger seg bare nedover
      this.setVelocityY(this.lavaSpeed);
    }
    
    // Partikkeleffekter
    this.createGlowEffect(scene);
  }
  
  createGlowEffect(scene) {
    // Vi bruker alpha og skala i stedet for partikkeleffekter for bedre ytelse
    // men kan legge til partikkeleffekter senere for mer visuell effekt
  }
  
  update(delta) {
    // For normale lava-dråper (ikke fragmenter), oppdater pulsering
    if (!this.isFragment) {
      // Oppdater pulsering
      if (this.growing) {
        this.pulse += 0.05;
        if (this.pulse >= 1.3) {
          this.growing = false;
        }
      } else {
        this.pulse -= 0.05;
        if (this.pulse <= 0.7) {
          this.growing = true;
        }
      }
      
      // Oppdater skala basert på pulsering
      const scale = 1 * this.pulse;
      this.setScale(scale, scale);
    } else {
      // For fragmenter, reduser livetid
      if (this.lifetime) {
        this.lifetime -= delta;
        if (this.lifetime <= 0) {
          this.destroy();
          return;
        }
        
        // Gjør fragmentet gradvis gjennomsiktig mot slutten
        if (this.lifetime < 100) {
          this.alpha = this.lifetime / 100;
        }
      }
    }
    
    // Oppdater rotasjon
    this.angle += this.rotationSpeed * (delta / 16.67);
    
    // Sett farge (for både fragmenter og vanlige lava-dråper)
    this.setTint(this.color);
    
    // For fragmenter, oppdater posisjonen manuelt basert på hastighet
    if (this.isFragment) {
      this.velocityY += 0.1 * delta; // Gravitasjon
      this.x += this.velocityX * (delta / 16.67);
      this.y += this.velocityY * (delta / 16.67);
    }
  }
  
  createFragments(count = 3) {
    // Opprett små fragmenter når lava-dråpen blir ødelagt
    for (let i = 0; i < count; i++) {
      const fragment = new LavaDrop(
        this.scene,
        this.x,
        this.y,
        this.color,
        true // isFragment = true
      );
      
      // Legg fragmentet til i lavaDrops-gruppen
      this.scene.lavaDrops.add(fragment);
    }
  }
  
  destroy() {
    // Opprett fragmenter når den ødelegges, men bare for vanlige lava-dråper
    if (!this.isFragment && Math.random() < 0.5) {
      this.createFragments();
    }
    
    // Kaller foreldreimplementasjonen av destroy
    super.destroy();
  }
}

export default LavaDrop;