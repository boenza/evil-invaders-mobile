// Spillkonstanter
export const CONSTANTS = {
  // Skjerm
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
  
  // Spiller
  PLAYER_WIDTH: 60,
  PLAYER_HEIGHT: 60,
  PLAYER_SPEED: 300,
  
  // Fiender
  UFO_WIDTH: 50,
  UFO_HEIGHT: 30,
  UFO_ROWS: 4,
  UFO_COLS: 10,
  UFO_SPEED: 100,
  
  // Skudd
  BULLET_WIDTH: 7,
  BULLET_HEIGHT: 15,
  BULLET_SPEED: 400,
  BULLET_COOLDOWN: 500, // ms
  
  // Lava/fiendeskudd
  LAVA_WIDTH: 5,
  LAVA_HEIGHT: 10,
  LAVA_SPEED: 120,
  
  // Power-ups
  POWERUP_SPEED: 100,
  EXTRALIFE_SPEED: 80,
  
  // Asteroider
  ASTEROID_SIZE: 40,
  
  // Nivåer
  MAX_LEVEL: 10,
  BOSS_LEVEL_1: 5,
  BOSS_LEVEL_2: 10,
  
  // Farger (i hex)
  COLORS: {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    YELLOW: '#FFFF00',
    RED: '#FF0000',
    GREEN: '#008000',
    BLUE: '#0000FF',
    PURPLE: '#800080',
    ORANGE: '#FFA500',
    CYAN: '#00FFFF',
    PINK: '#FFC0CB',
    NEON_YELLOW: '#FFFF66',
    NEON_GREEN: '#39FF14',
    NEON_PINK: '#FF14A3'
  }
};

// Spillhistorie tekst
export const INTRO_TEXT = [
  "YEAR 2228",
  "",
  "Two centuries after Belon Smusk and the PayPal Mafia",
  "bailed to Mars, they're back—and they're pissed.",
  "Mars ran out of neural implant fuel.",
  "Now they're coming back to Earth",
  "But this time as EVIL INVADERS.",
  "",
  "HUMANITY'S LAST STAND BEGINS NOW.",
  "YOU ARE THE FINAL DEFENSE.",
  "Lock. Load. Light 'em up!"
];

// Par-tider for hvert nivå (i millisekunder)
export const LEVEL_PAR_TIMES = {
  1: 30000,
  2: 35000,
  3: 40000,
  4: 45000,
  5: 60000,
  6: 50000,
  7: 55000,
  8: 60000,
  9: 65000,
  10: 90000
};

// Firebase konfigurasjon
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBHQSa-gRonCbOS-y8eGyq9gQEY9ritBNY",
  authDomain: "evil-invaders-ii.firebaseapp.com",
  projectId: "evil-invaders-ii",
  storageBucket: "evil-invaders-ii.firebasestorage.app",
  messagingSenderId: "354911968962",
  appId: "1:354911968962:web:9dbab52240137e8a85655b"
};