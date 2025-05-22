import FirebaseManager from './FirebaseManager';

class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.highscores = [];
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Forsøk å laste highscores fra Firebase
      this.highscores = await FirebaseManager.loadHighscores();
    } catch (error) {
      console.error("Error initializing ScoreManager:", error);
      // Fallback til lokale highscores
      this.loadLocalHighscores();
    }
    
    this.initialized = true;
  }
  
  setScore(score) {
    this.currentScore = score;
  }
  
  getScore() {
    return this.currentScore;
  }
  
  addPoints(points) {
    this.currentScore += points;
    return this.currentScore;
  }
  
  resetScore() {
    this.currentScore = 0;
  }
  
  getHighscores() {
    return this.highscores;
  }
  
  async saveHighscore(playerName, level) {
    // Opprett highscore-objekt
    const highscoreData = {
      name: playerName,
      score: this.currentScore,
      level: level,
      date: new Date().toISOString()
    };
    
    try {
      // Prøv å lagre til Firebase
      await FirebaseManager.saveHighscore(highscoreData);
    } catch (error) {
      console.error("Error saving highscore:", error);
      // Fallback til lokal lagring
      this.saveHighscoreLocally(highscoreData);
    }
    
    // Oppdater lokale highscores
    this.highscores.push(highscoreData);
    this.highscores.sort((a, b) => b.score - a.score);
    this.highscores = this.highscores.slice(0, 20); // Behold bare topp 20
    
    return true;
  }
  
  loadLocalHighscores() {
    try {
      const savedHighscores = localStorage.getItem('evilInvadersHighscores');
      
      if (savedHighscores) {
        this.highscores = JSON.parse(savedHighscores);
      } else {
        // Opprett noen standard highscores
        this.highscores = [
          { name: 'BOENZA', score: 5000, level: 10, date: new Date().toISOString() },
          { name: 'MASTER', score: 4000, level: 8, date: new Date().toISOString() },
          { name: 'SHOOTER', score: 3000, level: 6, date: new Date().toISOString() },
          { name: 'DEFENDER', score: 2000, level: 4, date: new Date().toISOString() },
          { name: 'ROOKIE', score: 1000, level: 2, date: new Date().toISOString() }
        ];
        
        localStorage.setItem('evilInvadersHighscores', JSON.stringify(this.highscores));
      }
    } catch (error) {
      console.error("Error loading highscores from local storage:", error);
      this.highscores = [];
    }
  }
  
  saveHighscoreLocally(highscoreData) {
    try {
      // Legg til den nye highscoren
      this.highscores.push(highscoreData);
      
      // Sorter og behold bare topp 20
      this.highscores.sort((a, b) => b.score - a.score);
      this.highscores = this.highscores.slice(0, 20);
      
      // Lagre til lokal lagring
      localStorage.setItem('evilInvadersHighscores', JSON.stringify(this.highscores));
      
      return true;
    } catch (error) {
      console.error("Error saving highscore to local storage:", error);
      return false;
    }
  }
  
  isHighscore(score) {
    // Hvis vi har mindre enn 20 highscores, eller scoren er høyere enn den laveste
    if (this.highscores.length < 20) return true;
    
    // Finn den laveste scoren i highscores
    const lowestScore = Math.min(...this.highscores.map(hs => hs.score));
    return score > lowestScore;
  }
}

// Eksportere en singleton-instans
export default new ScoreManager();