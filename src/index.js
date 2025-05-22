import Phaser from 'phaser';
import config from './config';

// Importer konstanter og hjelpefunksjoner
import './utils/Constants';

class Game extends Phaser.Game {
  constructor() {
    super(config);
    
    // Global spilltilstand som kan deles mellom scener
    this.globals = {
      score: 0,
      lives: 5,
      level: 1,
      highscores: [],
      backgroundMusic: null,
      sfx: {},
      gameState: 'start'
    };
  }
}

// Når siden er lastet, opprett spillinstansen
window.onload = function() {
  // Forhindre kontekstmeny på høyreklikk
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Deaktiver scrolling for mobilenheter
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  
  // For iOS, gjør at skjermen forblir på
  if (navigator.standalone) {
    document.addEventListener('touchend', () => {
      const noSleep = new NoSleep();
      noSleep.enable();
    }, { once: true });
  }
  
  // Initialiser spillet
  window.game = new Game();
};

// For hot module replacement under utvikling
if (module.hot) {
  module.hot.accept(() => {
    if (window.game) {
      window.game.destroy(true);
    }
    window.game = new Game();
  });
}