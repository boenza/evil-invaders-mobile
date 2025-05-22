import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, isPlayer = false, scale = 1, colorMod = null, durationMultiplier = 1) {
    super(scene, x, y, 'explosion1');
    
    // Legger eksplosjonen til i scenen
    scene.add.existing(this);
    
    // Eksplosjonsegenskaper
    this.isPlayer = isPlayer;        // Er dette en spiller-eksplosjon?
    this.scale = scale;              // Størrelsesskala
    this.colorMod = colorMod;        // Farge-modifikator
    this.durationMultiplier = durationMultiplier;  // Varighetsmultiplikator
    this.frameIndex = 0;             // Gjeldende frame-indeks
    this.timer = 0;                  // Timer for animasjon
    this.isBossExplosion = scale > 1;  // Er dette en boss-eksplosjon?
    
    // Setter størrelsen
    this.setScale(scale);
    
    // Sett alpha til 1
    this.setAlpha(1);
    
    // Spill eksplosjonsanimasjonen
    this.playExplosionAnimation();
    
    // Hvis vi har en partikkeltekstur, legg til partikkeleffekt
    if (scene.textures.exists('particle')) {
      this.createParticleEffect(scene);
    }
  }
  
  playExplosionAnimation() {
    // Start eksplosjonsanimasjonen
    this.play('explosion');
    
    // Når animasjonen er ferdig, ødelegg eksplosjonen
    this.on('animationcomplete', () => {
      this.destroy();
    });
  }
  
  createParticleEffect(scene) {
    // Bestemmer partikkelfarger basert på eksplosjonstype
    let colors;
    
    if (this.isPlayer) {
      // Blå/hvit for spilleren
      colors = [0x00ffff, 0x0066ff, 0xffffff];
    } else if (this.isBossExplosion) {
      // Gul/rød for boss
      colors = [0xffff00, 0xff6600, 0xff0000];
    } else if (this.colorMod) {
      // Bruk angitt farge hvis spesifisert
      // Konverter hex-string til nummer om nødvendig
      if (typeof this.colorMod === 'string') {
        this.colorMod = parseInt(this.colorMod.replace('#', '0x'));
      }
      colors = [this.colorMod];
    } else {
      // Standard eksplosjon: gul/oransje
      colors = [0xffff00, 0xff8800, 0xff4400];
    }
    
    // Opprett partikler
    const particleCount = this.isBossExplosion ? 20 : 10;
    
    this.particles = scene.add.particles(0, 0, 'particle', {
      x: this.x,
      y: this.y,
      lifespan: 500 * this.durationMultiplier,
      speed: { min: 50, max: 200 },
      scale: { start: 0.4 * this.scale, end: 0 },
      quantity: 1,
      blendMode: 'ADD',
      emitting: false
    });
    
    // Sett partikkelfarger
    this.particles.setTint(colors);
    
    // Emitter én gang
    this.particles.explode(particleCount, this.x, this.y);
    
    // Fjern partikkelsystemet etter at partiklene er ferdige
    scene.time.delayedCall(1000 * this.durationMultiplier, () => {
      if (this.particles && !this.particles.destroyed) {
        this.particles.destroy();
      }
    });
  }
  
  update(time, delta) {
    // Ikke nødvendig å oppdatere manuelt siden vi bruker Phaser's animasjonssystem
  }
  
  destroy() {
    // Rydd opp ressurser ved ødeleggelse
    if (this.particles && !this.particles.destroyed) {
      this.particles.destroy();
    }
    
    // Kaller foreldreimplementasjonen av destroy
    super.destroy();
  }
}

export default Explosion;