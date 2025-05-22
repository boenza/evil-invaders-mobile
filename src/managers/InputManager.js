class InputManager {
  constructor() {
    this.keys = {};
    this.pointers = {};
    this.touchControls = {
      leftZone: null,
      rightZone: null,
      fireZone: null,
      isMovingLeft: false,
      isMovingRight: false,
      isFiring: false
    };
    this.scene = null;
    this.cursors = null;
    this.fireButton = null;
  }
  
  init(scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouch();
  }
  
  setupKeyboard() {
    if (!this.scene || !this.scene.input) return;
    
    // Opprett standard cursor keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    
    // Legg til space-knapp for skyting
    this.fireButton = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Legg til WASD-kontroller
    this.keys.W = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keys.A = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keys.S = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keys.D = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // Escape og pause
    this.keys.ESC = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keys.P = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }
  
  setupTouch() {
    if (!this.scene || !this.isMobileDevice()) return;
    
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Opprett touch-soner
    this.touchControls.leftZone = this.scene.add.zone(0, 0, width / 3, height)
      .setOrigin(0)
      .setInteractive();
      
    this.touchControls.rightZone = this.scene.add.zone(width * 2 / 3, 0, width / 3, height)
      .setOrigin(0)
      .setInteractive();
      
    this.touchControls.fireZone = this.scene.add.zone(width / 3, 0, width / 3, height)
      .setOrigin(0)
      .setInteractive();
    
    // Left zone events
    this.touchControls.leftZone.on('pointerdown', () => {
      this.touchControls.isMovingLeft = true;
    });
    
    this.touchControls.leftZone.on('pointerup', () => {
      this.touchControls.isMovingLeft = false;
    });
    
    this.touchControls.leftZone.on('pointerout', () => {
      this.touchControls.isMovingLeft = false;
    });
    
    // Right zone events
    this.touchControls.rightZone.on('pointerdown', () => {
      this.touchControls.isMovingRight = true;
    });
    
    this.touchControls.rightZone.on('pointerup', () => {
      this.touchControls.isMovingRight = false;
    });
    
    this.touchControls.rightZone.on('pointerout', () => {
      this.touchControls.isMovingRight = false;
    });
    
    // Fire zone events
    this.touchControls.fireZone.on('pointerdown', () => {
      this.touchControls.isFiring = true;
    });
    
    this.touchControls.fireZone.on('pointerup', () => {
      this.touchControls.isFiring = false;
    });
    
    this.touchControls.fireZone.on('pointerout', () => {
      this.touchControls.isFiring = false;
    });
  }
  
  // Input-sjekking metoder
  isLeftPressed() {
    return (this.cursors && this.cursors.left.isDown) || 
           (this.keys.A && this.keys.A.isDown) || 
           this.touchControls.isMovingLeft;
  }
  
  isRightPressed() {
    return (this.cursors && this.cursors.right.isDown) || 
           (this.keys.D && this.keys.D.isDown) || 
           this.touchControls.isMovingRight;
  }
  
  isUpPressed() {
    return (this.cursors && this.cursors.up.isDown) || 
           (this.keys.W && this.keys.W.isDown);
  }
  
  isDownPressed() {
    return (this.cursors && this.cursors.down.isDown) || 
           (this.keys.S && this.keys.S.isDown);
  }
  
  isFirePressed() {
    return (this.fireButton && this.fireButton.isDown) || 
           this.touchControls.isFiring;
  }
  
  isPausePressed() {
    return (this.keys.ESC && this.keys.ESC.isDown) || 
           (this.keys.P && this.keys.P.isDown);
  }
  
  // Hjelpemetoder
  isMobileDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }
  
  addKeyListener(key, callback, context = null) {
    if (!this.scene || !this.scene.input) return;
    
    const keyObj = this.scene.input.keyboard.addKey(key);
    keyObj.on('down', callback, context);
    
    return keyObj;
  }
  
  removeKeyListener(keyObj) {
    if (keyObj && keyObj.removeAllListeners) {
      keyObj.removeAllListeners();
    }
  }
  
  destroy() {
    // Rydd opp ressurser
    if (this.touchControls.leftZone) {
      this.touchControls.leftZone.destroy();
    }
    if (this.touchControls.rightZone) {
      this.touchControls.rightZone.destroy();
    }
    if (this.touchControls.fireZone) {
      this.touchControls.fireZone.destroy();
    }
    
    this.keys = {};
    this.pointers = {};
    this.touchControls = {
      leftZone: null,
      rightZone: null,
      fireZone: null,
      isMovingLeft: false,
      isMovingRight: false,
      isFiring: false
    };
  }
}

// Eksporter en singleton-instans
export default new InputManager();
