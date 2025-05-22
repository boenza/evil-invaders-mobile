import Phaser from 'phaser';

// Import scener
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import IntroScene from './scenes/IntroScene';
import GameScene from './scenes/GameScene';
import LevelStartScene from './scenes/LevelStartScene';
import LevelCompleteScene from './scenes/LevelCompleteScene';
import GameOverScene from './scenes/GameOverScene';
import HighscoreScene from './scenes/HighscoreScene';
import VictoryScene from './scenes/VictoryScene';
import CreditsScene from './scenes/CreditsScene';

// Standard spillstørrelse (vil bli skalert)
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const config = {
  type: Phaser.AUTO,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: false,
  
  // FPS and timing configuration - KRITISK FOR Å FIKSE SPEED-PROBLEMET
  fps: {
    target: 60,
    forceSetTimeOut: true,
    deltaHistory: 10,
    panicMax: 120,
    smoothStep: true
  },
  
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 },
      fps: 60 // Eksplisitt sett physics FPS
    }
  },
  
  // Render configuration
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
    mipmapFilter: 'LINEAR',
    autoResize: true
  },
  
  // Audio configuration
  audio: {
    disableWebAudio: false,
    context: false,
    noAudio: false
  },
  
  scene: [
    BootScene,
    TitleScene,
    IntroScene,
    GameScene,
    LevelStartScene,
    LevelCompleteScene,
    GameOverScene,
    HighscoreScene,
    VictoryScene,
    CreditsScene
  ]
};

export default config;
