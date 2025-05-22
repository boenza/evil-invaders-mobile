import { FIREBASE_CONFIG } from '../utils/Constants';

class FirebaseManager {
  constructor() {
    this.initialized = false;
    this.firebase = null;
    this.db = null;
  }
  
  async initialize() {
    if (this.initialized) return Promise.resolve();
    
    try {
      // Laster firebase-moduler dynamisk
      await this.loadFirebaseScripts();
      
      // Initialiser Firebase
      this.firebase = window.firebase;
      this.firebase.initializeApp(FIREBASE_CONFIG);
      
      // Hent Firestore-instansen
      this.db = this.firebase.firestore();
      this.initialized = true;
      
      console.log("Firebase initialized successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      this.initialized = false;
      return Promise.reject(error);
    }
  }
  
  async loadFirebaseScripts() {
    return new Promise((resolve, reject) => {
      // Hvis Firebase allerede er lastet, returnerer vi umiddelbart
      if (window.firebase && window.firebase.firestore) {
        resolve();
        return;
      }
      
      // Last Firebase App-script
      const appScript = document.createElement('script');
      appScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
      appScript.async = true;
      
      appScript.onload = () => {
        // Last Firebase Firestore script
        const firestoreScript = document.createElement('script');
        firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
        firestoreScript.async = true;
        
        firestoreScript.onload = () => {
          resolve();
        };
        
        firestoreScript.onerror = (error) => {
          reject(new Error("Failed to load Firestore script"));
        };
        
        document.head.appendChild(firestoreScript);
      };
      
      appScript.onerror = (error) => {
        reject(new Error("Failed to load Firebase App script"));
      };
      
      document.head.appendChild(appScript);
    });
  }
  
  async loadHighscores() {
    if (!this.initialized) {
      await this.initialize().catch(error => {
        console.error("Could not initialize Firebase, using local storage:", error);
        return this.loadHighscoresFromLocal();
      });
    }
    
    try {
      // Hent de 20 beste poengene, sortert etter score i synkende rekkefølge
      const snapshot = await this.db.collection("highscores")
        .orderBy("score", "desc")
        .limit(20)
        .get();
      
      const highscores = [];
      snapshot.forEach((doc) => {
        highscores.push(doc.data());
      });
      
      console.log(`Loaded ${highscores.length} highscores from Firebase`);
      
      // Lagre også lokalt som backup
      localStorage.setItem('evilInvadersHighscores', JSON.stringify(highscores));
      
      return highscores;
    } catch (error) {
      console.error("Error loading highscores from Firebase:", error);
      return this.loadHighscoresFromLocal();
    }
  }
  
  async saveHighscore(highscoreData) {
    // Forsøk å initialisere Firebase hvis ikke allerede gjort
    if (!this.initialized) {
      await this.initialize().catch(error => {
        console.error("Could not initialize Firebase, saving to local storage:", error);
        return this.saveHighscoreToLocal(highscoreData);
      });
    }
    
    try {
      // Lagre til Firestore
      const docRef = await this.db.collection("highscores").add(highscoreData);
      console.log("Highscore saved with ID:", docRef.id);
      
      // Lagre også lokalt som backup
      const localHighscores = await this.loadHighscoresFromLocal();
      localHighscores.push(highscoreData);
      localHighscores.sort((a, b) => b.score - a.score);
      localHighscores.slice(0, 20); // Behold bare de 20 beste
      localStorage.setItem('evilInvadersHighscores', JSON.stringify(localHighscores));
      
      return true;
    } catch (error) {
      console.error("Error adding highscore to Firebase:", error);
      return this.saveHighscoreToLocal(highscoreData);
    }
  }
  
  loadHighscoresFromLocal() {
    try {
      const savedHighscores = localStorage.getItem('evilInvadersHighscores');
      
      if (savedHighscores) {
        return JSON.parse(savedHighscores);
      } else {
        // Opprett noen standard highscores
        const defaultHighscores = [
          { name: 'BOENZA', score: 5000, level: 10, date: new Date().toISOString() },
          { name: 'MASTER', score: 4000, level: 8, date: new Date().toISOString() },
          { name: 'SHOOTER', score: 3000, level: 6, date: new Date().toISOString() },
          { name: 'DEFENDER', score: 2000, level: 4, date: new Date().toISOString() },
          { name: 'ROOKIE', score: 1000, level: 2, date: new Date().toISOString() }
        ];
        
        localStorage.setItem('evilInvadersHighscores', JSON.stringify(defaultHighscores));
        return defaultHighscores;
      }
    } catch (error) {
      console.error("Error loading highscores from local storage:", error);
      return [];
    }
  }
  
  saveHighscoreToLocal(highscoreData) {
    try {
      const localHighscores = this.loadHighscoresFromLocal();
      localHighscores.push(highscoreData);
      localHighscores.sort((a, b) => b.score - a.score);
      const top20 = localHighscores.slice(0, 20);
      
      localStorage.setItem('evilInvadersHighscores', JSON.stringify(top20));
      return true;
    } catch (error) {
      console.error("Error saving highscore to local storage:", error);
      return false;
    }
  }
}

// Eksporter en singeltone-instans
export default new FirebaseManager();