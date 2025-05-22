import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';
import LavaDrop from './LavaDrop';

class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, health, speed) {
    super(scene, x, y, textureKey);
    
    // Legger bossen til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp størrelse basert på boss-type
    if (textureKey === 'bossLvl5') {
      this.setDisplaySize(100, 80);
    } else {
      this.setDisplaySize(150, 120);
    }
    
    // Setter opp fysikkegenskaper
    this.setBounce(0);
    this.setCollideWorldBounds(true);
    
    // Boss-variabler
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.direction = 1; // 1 = høyre, -1 = venstre
    this.verticalDirection = 1; // 1 = ned, -1 = opp
    this.isLarge = true;
    this.level = textureKey === 'bossLvl5' ? 5 : 10;
    this.attackTimer = scene.time.now;
    this.spawnTimer = scene.time.now;
    this.attackPattern = 0;
    this.shieldActive = false;
    this.shieldHealth = 0;
    
    // Opprett boss-shield
    this.createShield();
    
    // Start animasjon hvis tilgjengelig
    this.play(textureKey);
  }
  
  createShield() {
    // Opprett skjold-grafikk
    const size = this.width * 1.2;
    
    // Opprett skjoldet som en grafikk-sirkel
    this.shield = this.scene.add.graphics();
    this.updateShieldGraphics();
    
    // Sett skjoldet til inaktivt først
    this.shield.setVisible(false);
  }
  
  updateShieldGraphics() {
    // Tegn skjoldet basert på helseprosent
    this.shield.clear();
    
    const shieldAlpha = this.shieldActive ? 0.7 * (this.shieldHealth / 100) : 0;
    const size = this.width * 1.3;
    
    if (this.level === 5) {
      // Grønt skjold for level 5-boss
      this.shield.lineStyle(4, CONSTANTS.COLORS.NEON_GREEN, shieldAlpha);
      this.shield.fillStyle(CONSTANTS.COLORS.NEON_GREEN, shieldAlpha * 0.3);
    } else {
      // Rosa skjold for level 10-boss
      this.shield.lineStyle(4, CONSTANTS.COLORS.NEON_PINK, shieldAlpha);
      this.shield.fillStyle(CONSTANTS.COLORS.NEON_PINK, shieldAlpha * 0.3);
    }
    
    // Tegn skjoldet som en ellipse rundt bossen
    this.shield.fillCircle(this.x, this.y, size / 2);
    this.shield.strokeCircle(this.x, this.y, size / 2);
  }
  
  update(delta) {
    const currentTime = this.scene.time.now;
    const gameWidth = this.scene.cameras.main.width;
    const gameHeight = this.scene.cameras.main.height;
    
    // Horisontal bevegelse
    this.x += this.speed * this.direction * (delta / 16.66); // Normaliser for 60 FPS
    
    // Endre retning når vi treffer kanten
    if (this.x + this.width >= gameWidth) {
      this.x = gameWidth - this.width;
      this.direction = -1;
    } else if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
    }
    
    // Vertikal bevegelse
    this.y += (this.speed / 2) * this.verticalDirection * (delta / 16.66);
    
    // Endre vertikal retning ved grenser
    if (this.y + this.height >= gameHeight - 100) {
      this.y = gameHeight - 100 - this.height;
      this.verticalDirection = -1;
    } else if (this.y <= 50) {
      this.y = 50;
      this.verticalDirection = 1;
    }
    
    // Oppdater skjoldposisjon
    this.updateShieldGraphics();
    
    // Boss angriper hvert 3. sekund
    if (currentTime - this.attackTimer > 3000) {
      // Skift angrepspattern for hver gang
      this.attackPattern = (this.attackPattern + 1) % 3;
      
      // Utfør angrepet
      this.attack();
      
      // Oppdater angrep-timer
      this.attackTimer = currentTime;
    }
    
    // Aktiver skjold når helsen er lav (under 50%)
    if (this.health < this.maxHealth * 0.5 && !this.shieldActive && this.level === 10) {
      this.activateShield();
    }
    
    // Spawn fiender periodisk for level 10-boss
    if (this.level === 10 && currentTime - this.spawnTimer > 8000) {
      this.spawnEnemies();
      this.spawnTimer = currentTime;
    }
  }
  
  attack() {
    // Bestem angrepsfargen basert på boss-nivå
    const attackColor = this.level === 5 ? CONSTANTS.COLORS.NEON_GREEN : CONSTANTS.COLORS.NEON_PINK;
    
    // Velg angrep basert på pattern
    if (this.attackPattern === 0) {
      // Burst attack - spredt angrep i alle retninger
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;
        
        // Opprett lava med forsinkelse for å spre angrepet over tid
        this.scene.time.delayedCall(i * 100, () => {
          this.dropLava(this.x + this.width / 2 + offsetX, this.y + this.height + offsetY, attackColor);
        });
      }
    } else if (this.attackPattern === 1) {
      // Line attack - horisontal linje
      for (let i = -2; i <= 2; i++) {
        this.dropLava(this.x + this.width / 2 + (i * 30), this.y + this.height, attackColor);
      }
    } else if (this.attackPattern === 2) {
      // Cross attack - kryss-formet angrep
      for (let i = -2; i <= 2; i++) {
        this.dropLava(this.x + this.width / 2 + (i * 30), this.y + this.height + (i * 30), attackColor);
        this.dropLava(this.x + this.width / 2 - (i * 30), this.y + this.height + (i * 30), attackColor);
      }
    }
  }
  
  dropLava(x, y, color = null) {
    // Opprett en lava-dråpe på angitt posisjon
    const lava = new LavaDrop(this.scene, x, y, color);
    
    // Legg til i lavaDrops-gruppen i scenen
    this.scene.lavaDrops.add(lava);
  }
  
  activateShield() {
    // Aktiver skjoldet
    this.shieldActive = true;
    this.shieldHealth = 100;
    this.shield.setVisible(true);
    
    // Spill lyd for aktivering av skjold
    if (this.scene.game.globals.sfx && this.scene.game.globals.sfx.powerup) {
      this.scene.game.globals.sfx.powerup.play();
    }
  }
  
  spawnEnemies() {
    // Bare level 10 boss kan spawne fiender
    if (this.level !== 10) return;
    
    // Opprett to nye fiender, en på hver side av bossen
    const offsetX = 50;
    const offsetY = -30;
    
    // Importer Enemy-klassen for å opprette nye fiender
    import('./Enemy').then((EnemyModule) => {
      const Enemy = EnemyModule.default;
      
      // Venstre fiende
      const enemy1 = new Enemy(
        this.scene,
        this.x - offsetX,
        this.y + offsetY,
        'ufo1',
        2,
        CONSTANTS.UFO_SPEED,
        -1, // Spesialrad
        0   // Første kolonne
      );
      
      // Høyre fiende
      const enemy2 = new Enemy(
        this.scene,
        this.x + this.width + offsetX,
        this.y + offsetY,
        'ufo2',
        2,
        CONSTANTS.UFO_SPEED,
        -1, // Spesialrad
        1   // Andre kolonne
      );
      
      // Legg fiendene til i fiende-gruppen
      this.scene.enemies.add(enemy1);
      this.scene.enemies.add(enemy2);
    });
  }
  
  hit() {
    // Hvis skjoldet er aktivt, reduser skjoldets helse først
    if (this.shieldActive && this.shieldHealth > 0) {
      this.shieldHealth -= 10;
      
      // Oppdater skjoldgrafikken
      this.updateShieldGraphics();
      
      // Hvis skjoldet er ødelagt, deaktiver det
      if (this.shieldHealth <= 0) {
        this.shieldActive = false;
        this.shield.setVisible(false);
        
        // Spill lyd for deaktivering av skjold
        if (this.scene.game.globals.sfx && this.scene.game.globals.sfx.hit) {
          this.scene.game.globals.sfx.hit.play();
        }
      }
      
      return false; // Bossen tar ikke skade
    }
    
    // Reduser helse når truffet
    this.health--;
    
    // Flash-effekt når bossen blir truffet
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
      repeat: 1,
      ease: 'Power1'
    });
    
    // Hvis helsen er lav, øk angrepshastigheten
    if (this.health < this.maxHealth * 0.3) {
      this.speed *= 1.1;
    }
    
    // Hvis helsen er 0 eller mindre, er bossen beseiret
    if (this.health <= 0) {
      return true; // Returnerer true for å indikere at bossen er beseiret
    }
    
    return false;
  }
  
  destroy() {
    // Rydd opp ressurser ved ødeleggelse
    if (this.shield) {
      this.shield.destroy();
    }
    
    // Kaller foreldreimplementasjonen av destroy
    super.destroy();
  }
}

export default Boss;