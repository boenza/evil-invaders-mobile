import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';
import LavaDrop from './LavaDrop';

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, health, speed, row, col, isNewRow = false) {
    super(scene, x, y, textureKey);
    
    // Legger fienden til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp fysikkegenskaper
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    
    // Setter opp størrelse
    this.setDisplaySize(CONSTANTS.UFO_WIDTH, CONSTANTS.UFO_HEIGHT);
    
    // Fiendevariabler
    this.health = health;
    this.speed = speed;
    this.direction = 1; // 1 = høyre, -1 = venstre
    this.verticalStep = CONSTANTS.UFO_HEIGHT / 2;
    this.row = row;
    this.col = col;
    this.isNewRow = isNewRow;
    this.isLarge = false;
    this.lastLavaDrop = 0;
    this.lavaProbability = 0.001; // 0.1% sjanse per frame
    
    // Spesielt for nye rader
    if (isNewRow) {
      this.newRowBatch = 0; // Vil bli satt av GameScene
      this.creationTime = scene.time.now;
    }
    
    // Start animasjon hvis tilgjengelig
    this.play(textureKey);
  }
  
  update(delta, speedBonus = 0) {
    const currentSpeed = this.speed + speedBonus;
    
    // For nye rader som faller nedover
    if (this.isNewRow) {
      // Bestem målposisjon for den nye raden
      const batchNumber = this.newRowBatch || 0;
      const targetY = 50 + Math.abs(this.row) * (CONSTANTS.UFO_HEIGHT + 10);
      
      if (this.y < targetY) {
        // Beveg nedover til målet
        this.y += 2;
      } else {
        // Stopp ved målposisjonen
        this.y = targetY;
        
        // Når målet er nådd, fjern isNewRow-flagget etter en viss tid
        if (this.scene.time.now - this.creationTime > 5000) {
          this.isNewRow = false;
        }
      }
    }
    
    // Vanlig horisontal bevegelse
    this.x += currentSpeed * this.direction * (delta / 16.66); // Normaliser for 60 FPS
    
    // Endre retning og beveg nedover når vi treffer kanten
    const gameWidth = this.scene.cameras.main.width;
    if (this.x + this.width >= gameWidth || this.x <= 0) {
      this.direction *= -1;
      
      // Beveg nedover - tilpass mengden basert på nivå og type
      const verticalMovement = this.isNewRow ? 
        Math.max(5, this.height / (12 - this.scene.game.globals.level)) : // Nye rader
        this.verticalStep; // Originale rader
        
      this.y += verticalMovement;
    }
    
    // Lava-drypping (kun for vanlige fiender, ikke boss)
    if (!this.isLarge && Math.random() < (this.lavaProbability * (1 + speedBonus / 3))) {
      this.dropLava();
    }
  }
  
  hit() {
    // Reduser helse når truffet
    this.health--;
    
    // Lag en liten "treff"-effekt
    this.createHitEffect();
    
    // Hvis helsen er 0 eller mindre, er fienden ødelagt
    if (this.health <= 0) {
      return true; // Returnerer true for å indikere at fienden er ødelagt
    }
    
    return false;
  }
  
  createHitEffect() {
    // Flash-effekt når fienden blir truffet
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 1,
      ease: 'Power1'
    });
    
    // Små partikler for treffeffekt
    if (this.scene.textures.exists('particle')) {
      // Partikkeleksplosjon
      const particles = this.scene.add.particles(this.x, this.y, 'particle', {
        lifespan: 300,
        speed: { min: 50, max: 150 },
        scale: { start: 0.2, end: 0 },
        quantity: 5,
        blendMode: 'ADD',
        emitting: false
      });
      
      // Tilpass fargen basert på UFO-type
      if (this.texture.key.includes('ufo1')) {
        particles.setTint(0xff0000);
      } else if (this.texture.key.includes('ufo2')) {
        particles.setTint(0x00ff00);
      } else if (this.texture.key.includes('ufo3')) {
        particles.setTint(0x0000ff);
      } else if (this.texture.key.includes('ufo4')) {
        particles.setTint(0xffff00);
      } else {
        particles.setTint(0xffffff);
      }
      
      // Emitt partikler én gang
      particles.explode(10, this.x, this.y);
      
      // Fjern partikkelsystemet etter at partiklene er ferdige
      this.scene.time.delayedCall(500, () => {
        particles.destroy();
      });
    }
  }
  
  dropLava() {
    // Sjekk om det er tid for å slippe lava (cooldown)
    const now = this.scene.time.now;
    
    if (now - this.lastLavaDrop < 1000) {
      return;
    }
    
    this.lastLavaDrop = now;
    
    // Opprett en lava-dråpe under fienden
    const lava = new LavaDrop(
      this.scene,
      this.x + this.width / 2,
      this.y + this.height
    );
    
    // Legg til i lavaDrops-gruppen i scenen
    this.scene.lavaDrops.add(lava);
  }
  
  destroy() {
    // Kaller foreldreimplementasjonen av destroy
    super.destroy();
  }
}

export default Enemy;