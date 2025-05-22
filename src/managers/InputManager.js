class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.musicVolume = 0.5;
    this.soundVolume = 0.5;
    this.muted = false;
    this.musicMuted = false;
    this.soundMuted = false;
    this.scene = null;
  }
  
  init(scene) {
    this.scene = scene;
    this.loadSettings();
  }
  
  loadSettings() {
    // Last innstillinger fra lokal lagring
    try {
      const audioSettings = localStorage.getItem('evilInvadersAudio');
      
      if (audioSettings) {
        const settings = JSON.parse(audioSettings);
        this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.5;
        this.soundVolume = settings.soundVolume !== undefined ? settings.soundVolume : 0.5;
        this.muted = settings.muted !== undefined ? settings.muted : false;
        this.musicMuted = settings.musicMuted !== undefined ? settings.musicMuted : false;
        this.soundMuted = settings.soundMuted !== undefined ? settings.soundMuted : false;
      }
    } catch (error) {
      console.error("Error loading audio settings:", error);
      // Bruk standardverdier
    }
  }
  
  saveSettings() {
    // Lagre innstillinger til lokal lagring
    try {
      const settings = {
        musicVolume: this.musicVolume,
        soundVolume: this.soundVolume,
        muted: this.muted,
        musicMuted: this.musicMuted,
        soundMuted: this.soundMuted
      };
      
      localStorage.setItem('evilInvadersAudio', JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving audio settings:", error);
    }
  }
  
  addSound(key, config = {}) {
    if (!this.scene) {
      console.error("AudioManager not initialized with a scene");
      return;
    }
    
    // Standardverdier for lydkonfigurasjon
    const defaultConfig = {
      volume: this.soundVolume,
      loop: false
    };
    
    // Opprett lydobjekt
    const sound = this.scene.sound.add(key, { ...defaultConfig, ...config });
    
    // Oppdater volum basert på innstillinger
    sound.setVolume(this.soundMuted ? 0 : this.soundVolume);
    
    // Lagre lyden
    this.sounds[key] = sound;
    
    return sound;
  }
  
  playSound(key, config = {}) {
    if (this.muted || this.soundMuted) return;
    
    // Hvis lyden ikke er lastet ennå, last den
    if (!this.sounds[key] && this.scene) {
      this.addSound(key, config);
    }
    
    // Spill lyden hvis den eksisterer
    if (this.sounds[key]) {
      this.sounds[key].play(config);
    }
  }
  
  stopSound(key) {
    if (this.sounds[key]) {
      this.sounds[key].stop();
    }
  }
  
  playMusic(key, fade = false) {
    if (!this.scene) {
      console.error("AudioManager not initialized with a scene");
      return;
    }
    
    // Stopp eventuell eksisterende musikk
    if (this.music) {
      if (fade) {
        this.music.stop();
      } else {
        this.music.stop();
      }
    }
    
    // Opprett nytt musikkobjekt
    this.music = this.scene.sound.add(key, {
      volume: this.musicMuted ? 0 : this.musicVolume,
      loop: true
    });
    
    // Start musikken
    if (fade) {
      this.music.play({ volume: 0 });
      this.scene.tweens.add({
        targets: this.music,
        volume: this.musicMuted ? 0 : this.musicVolume,
        duration: 1000
      });
    } else {
      this.music.play();
    }
  }
  
  stopMusic(fade = false) {
    if (!this.music) return;
    
    if (fade) {
      this.scene.tweens.add({
        targets: this.music,
        volume: 0,
        duration: 1000,
        onComplete: () => {
          this.music.stop();
        }
      });
    } else {
      this.music.stop();
    }
  }
  
  setMusicVolume(volume) {
    this.musicVolume = volume;
    
    if (this.music && !this.musicMuted) {
      this.music.setVolume(volume);
    }
    
    this.saveSettings();
  }
  
  setSoundVolume(volume) {
    this.soundVolume = volume;
    
    // Oppdater volumet for alle lyder
    Object.values(this.sounds).forEach(sound => {
      if (!this.soundMuted) {
        sound.setVolume(volume);
      }
    });
    
    this.saveSettings();
  }
  
  toggleMute() {
    this.muted = !this.muted;
    
    if (this.muted) {
      // Mute all lyd
      if (this.music) {
        this.music.setVolume(0);
      }
      
      Object.values(this.sounds).forEach(sound => {
        sound.setVolume(0);
      });
    } else {
      // Unmute basert på individuelle innstillinger
      if (this.music && !this.musicMuted) {
        this.music.setVolume(this.musicVolume);
      }
      
      if (!this.soundMuted) {
        Object.values(this.sounds).forEach(sound => {
          sound.setVolume(this.soundVolume);
        });
      }
    }
    
    this.saveSettings();
  }
  
  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    
    if (this.music) {
      this.music.setVolume(this.musicMuted ? 0 : this.musicVolume);
    }
    
    this.saveSettings();
  }
  
  toggleSoundMute() {
    this.soundMuted = !this.soundMuted;
    
    Object.values(this.sounds).forEach(sound => {
      sound.setVolume(this.soundMuted ? 0 : this.soundVolume);
    });
    
    this.saveSettings();
  }
  
  isMuted() {
    return this.muted;
  }
  
  isMusicMuted() {
    return this.musicMuted || this.muted;
  }
  
  isSoundMuted() {
    return this.soundMuted || this.muted;
  }
}

// Eksportere en singleton-instans
export default new AudioManager();