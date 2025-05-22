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
      gameState: 'start',
      autoFireEnabled: false,
      laserSpeed: 400,
      laserCount: 1,
      bossShieldActive: false,
      bossShieldHealth: 0,
      largeUfoCreated: false,
      largeUfo2Created: false,
      levelExtraLifeDropped: false,
      levelStartTime: 0
    };
  }
}

// Når siden er lastet, opprett spillinstansen
window.onload = function() {
  console.log('Loading Evil Invaders II...');
  
  // Forhindre kontekstmeny på høyreklikk
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Deaktiver scrolling for mobilenheter
  document.addEventListener('touchmove', (e) => {
    // Only prevent default for game area, not the entire page
    if (e.target.tagName === 'CANVAS') {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent zoom on double tap for iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // For iOS Safari - prevent viewport scaling
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  });
  
  // Wake lock for modern browsers (optional - doesn't require NoSleep library)
  if ('wakeLock' in navigator) {
    let wakeLock = null;
    
    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen wake lock acquired');
        
        wakeLock.addEventListener('release', () => {
          console.log('Screen wake lock released');
        });
      } catch (err) {
        console.log('Wake lock request failed:', err);
      }
    };
    
    // Request wake lock when user first interacts with the page
    document.addEventListener('click', requestWakeLock, { once: true });
    document.addEventListener('touchstart', requestWakeLock, { once: true });
    
    // Re-acquire wake lock when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        requestWakeLock();
      }
    });
  }
  
  // Initialiser spillet
  try {
    window.game = new Game();
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        color: #ff0000;
        padding: 20px;
        border: 2px solid #ff0000;
        font-family: monospace;
        text-align: center;
        z-index: 9999;
      ">
        <h2>Game Failed to Load</h2>
        <p>Error: ${error.message}</p>
        <p>Please refresh the page to try again.</p>
        <button onclick="location.reload()" style="
          background: #ff0000;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-family: monospace;
          cursor: pointer;
          margin-top: 10px;
        ">REFRESH</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
};

// For hot module replacement under utvikling
if (module.hot) {
  module.hot.accept(() => {
    console.log('Hot reload detected');
    if (window.game) {
      window.game.destroy(true);
    }
    window.game = new Game();
  });
}
