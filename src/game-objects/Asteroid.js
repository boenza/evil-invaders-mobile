import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Hvis x og y ikke er spesifisert, plasserer vi asteroiden tilfeldig
    if (x === undefined || y === undefined) {
      const gameWidth = scene.cameras.main.width;
      const gameHeight = scene.cameras.main.height;
      
      // Bestem hvilken side asteroiden kommer fra
      const side = Math.random() < 0.33 ? 'left' : (Math.random() < 0.5 ? 'right' : 'top');
      
      if (side === 'left') {
        x = -CONSTANTS.ASTEROID_SIZE;
        y = Math.random() * (gameHeight / 2);
      } else if (side === 'right') {
        x = gameWidth + CONSTANTS.ASTEROID_SIZE;
        y = Math.random() * (gameHeight / 2);
      } else { // top
        x = Math.random() * (gameWidth - 50);
        y = -CONSTANTS.ASTEROID_SIZE;
      }
    }
    
    // Bruk asteroid-teksturen
    super(scene, x, y, 'asteroid');
    
    // Legger asteroiden til i scenen og fysikkmotoren
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Setter opp størrelse
    this.setDisplaySize(CONSTANTS.ASTEROID_SIZE, CONSTANTS.ASTEROID_SIZE);
    
    // Bestem fart og retning basert på startposisjon
    let speedX, speedY;
    
    if (x < 0) {
      // Fra venstre
      speedX = Math.random() * 2 + 1;
      speedY = Math.random() * 1 + 1;
    } else if (x > scene.cameras.main.width) {
      // Fra høyre
      speedX = -(Math.random() * 2 + 1);
      speedY = Math.random() * 1 + 1;
    } else {
      // Fra toppen
      speedX = Math.random() * 2 - 1;
      speedY = Math.random() * 1 + 2;
    }
    
    // Sett hastighet
    this.speedX = speedX;
    this.speedY = speedY;
    this.setVelocity(speedX * 100, speedY * 100);
    
    // Rotasjon
    this.rotation = 0;
    this.rotationSpeed = Math.random() * 4 - 2;
    
    // Farge (standard: neon grønn)
    this.color = CONSTANTS.COLORS.NEON_GREEN;
    this.setTint(this.color);
    
    // Hvis vi har et faktisk bilde, trenger vi ikke opprette grafikk
    if (!scene.textures.exists('asteroid')) {
      this.createAsteroidGraphics(scene);
    }
  }
  
  createAsteroidGraphics(scene) {
    // Opprett en tilfeldig asteroide-form
    const graphics = scene.make.graphics();
    
    // Fyll med neon-grønn
    graphics.fillStyle(CONSTANTS.COLORS.NEON_GREEN, 1);
    
    // Tegn en uregelmessig asteroide-form
    graphics.beginPath();
    
    const radius = CONSTANTS.ASTEROID_SIZE / 2;
    const center = { x: radius, y: radius };
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.PI * 2 * i / 12;
      const pointRadius = radius * (0.8 + Math.sin(i * 2.5) * 0.2);
      const x = center.x + Math.cos(angle) * pointRadius;
      const y = center.y + Math.sin(angle) * pointRadius;
      
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    
    graphics.closePath();
    graphics.fill();
    
    // Legg til en kant
    graphics.lineStyle(2, 0xFFFFFF, 1);
    graphics.stroke();
    
    // Legg til noen detaljer (kratere)
    for (let i = 0; i < 3; i++) {
      const craterX = center.x + (Math.random() - 0.5) * radius;
      const craterY = center.y + (Math.random() - 0.5) * radius;
      const craterSize = Math.random() * 5 + 3;
      
      graphics.fillStyle(0x007700, 0.8);
      graphics.fillCircle(craterX, craterY, craterSize);
    }
    
    // Generer tekstur fra grafikken
    graphics.generateTexture('asteroid', CONSTANTS.ASTEROID_SIZE, CONSTANTS.ASTEROID_SIZE);
    
    // Bruk teksturen
    this.setTexture('asteroid');
  }
  
  update(delta) {
    // Oppdater rotasjon
    this.angle += this.rotationSpeed * (delta / 16.67);
    
    // Oppdater posisjon manuelt hvis vi ikke bruker physics-motion
    if (!this.body.moves) {
      this.x += this.speedX * (delta / 16.67);
      this.y += this.speedY * (delta / 16.67);
    }
  }
  
  split() {
    // Når asteroiden blir truffet, kan den splitte seg i to mindre asteroider
    // Dette er en valgfri funksjonalitet som kan implementeres senere
  }
}

export default Asteroid;