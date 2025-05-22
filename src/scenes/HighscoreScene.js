import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants';

class HighscoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HighscoreScene' });
  }

  create() {
    this.game.globals.gameState = 'highscores';
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Sett bakgrunnsfarge
    this.cameras.main.setBackgroundColor(CONSTANTS.COLORS.BLACK);
    this.createStarfield();
    
    // Tittel
    const titleText = this.add.text(width / 2, 60, 'HIGH SCORES', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: CONSTANTS.COLORS.NEON_PINK
    }).setOrigin(0.5);
    
    titleText.setShadow(0, 0, CONSTANTS.COLORS.NEON_PINK, 15, true, true);
    
    // Puls-animasjon
    this.tweens.add({
      targets: titleText,
      scale: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Opprett highscore-liste container
    this.createHighscoreList(width, height);
    
    // Tilbake-knapp
    this.createBackButton(width, height);
    
    // Sjekk om vi skal starte auto-rotasjon
    if (this.game.globals.gameState === 'highscores' && !this.scene.settings.data?.noRotation) {
      // Legg til auto-timeout for å gå tilbake til GameOver
      this.backTimer = this.time.delayedCall(10000, () => {
        this.goBack();
      });
    }
  }
  
  createStarfield() {
    // Opprett stjernebakgrunn
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Lag 100 stjerner med ulike størrelser og posisjoner
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      
      const star = this.add.circle(x, y, size, 0xffffff);
      star.alpha = Phaser.Math.FloatBetween(0.3, 1);
    }
  }
  
  createHighscoreList(width, height) {
    // Container for highscore-listen
    const listContainer = this.add.container(width / 2, height / 2);
    
    // Bakgrunn for listen
    const listBg = this.add.rectangle(0, 0, width * 0.8, height * 0.6, 0x000000, 0.5);
    listBg.setStrokeStyle(2, 0x39ff14, 0.3);
    listContainer.add(listBg);
    
    // Overskrift
    const headerStyle = {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: CONSTANTS.COLORS.NEON_GREEN
    };
    
    // Opprett header
    const rankHeader = this.add.text(-listBg.width / 2 + 50, -listBg.height / 2 + 20, 'RANK', headerStyle);
    const nameHeader = this.add.text(-listBg.width / 2 + 150, -listBg.height / 2 + 20, 'NAME', headerStyle);
    const scoreHeader = this.add.text(listBg.width / 2 - 200, -listBg.height / 2 + 20, 'SCORE', headerStyle);
    const levelHeader = this.add.text(listBg.width / 2 - 50, -listBg.height / 2 + 20, 'LEVEL', headerStyle);
    
    rankHeader.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 5, true, true);
    nameHeader.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 5, true, true);
    scoreHeader.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 5, true, true);
    levelHeader.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 5, true, true);
    
    listContainer.add([rankHeader, nameHeader, scoreHeader, levelHeader]);
    
    // Skillelinje under overskriften
    const headerLine = this.add.rectangle(0, -listBg.height / 2 + 40, listBg.width - 20, 2, 0x39ff14, 0.7);
    listContainer.add(headerLine);
    
    // Neon-farger for topp 20
    const neonColors = [
      CONSTANTS.COLORS.NEON_PINK,    // 1st plass - Neon rosa
      CONSTANTS.COLORS.NEON_YELLOW,  // 2nd plass - Neon gul
      CONSTANTS.COLORS.NEON_GREEN,   // 3rd plass - Neon grønn
      CONSTANTS.COLORS.CYAN,         // 4th plass - Cyan
      CONSTANTS.COLORS.NEON_YELLOW,  // 5th plass - Neon gul
      CONSTANTS.COLORS.NEON_PINK,    // osv.
      CONSTANTS.COLORS.NEON_GREEN,
      CONSTANTS.COLORS.CYAN,
      CONSTANTS.COLORS.NEON_YELLOW,
      CONSTANTS.COLORS.NEON_PINK,
      '#FF9966', // Lysoransje
      '#66FFFF', // Lysere cyan
      '#CCFF99', // Lysegrønn
      '#FF99CC', // Lysrosa
      '#99CCFF', // Lyseblå
      '#FFCC99', // Fersken
      '#CCFFFF', // Svært lys cyan
      '#FFFFCC', // Svært lys gul
      '#FFCCFF', // Svært lys rosa
      '#CCCCFF'  // Svært lys lilla
    ];
    
    // Hent spillerens siste highscore (hvis den finnes)
    let playerName = '';
    const playerScore = this.game.globals.score;
    
    // Finn om det er en match på scoren i highscores-listen
    // Dette er ikke perfekt, men det beste vi kan gjøre uten å lagre mer info
    const highscoreMatch = this.game.globals.highscores.find(
      hs => hs.score === playerScore && Math.abs(new Date(hs.date).getTime() - Date.now()) < 60000
    );
    
    if (highscoreMatch) {
      playerName = highscoreMatch.name;
    }
    
    // Vis highscores
    const highscores = this.game.globals.highscores;
    
    if (highscores.length === 0) {
      // Ingen highscores, vis en melding
      const noScoresText = this.add.text(0, 0, 'NO HIGHSCORES YET!', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: CONSTANTS.COLORS.NEON_YELLOW
      }).setOrigin(0.5);
      
      noScoresText.setShadow(0, 0, CONSTANTS.COLORS.NEON_YELLOW, 10, true, true);
      
      listContainer.add(noScoresText);
    } else {
      // Legg til hver highscore
      highscores.forEach((scoreEntry, index) => {
        if (index >= 20) return; // Bare vis topp 20
        
        // Y-posisjon for denne raden
        const yPos = -listBg.height / 2 + 70 + index * 25;
        
        // Format rank
        let rankText;
        if (index === 0) rankText = '1ST';
        else if (index === 1) rankText = '2ND';
        else if (index === 2) rankText = '3RD';
        else rankText = `${index + 1}TH`;
        
        // Sett neon-farge basert på plassering
        const neonColor = neonColors[index % neonColors.length];
        
        // Sett base tekstsil
        const textStyle = {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: neonColor
        };
        
        // Opprett tekster
        const rank = this.add.text(-listBg.width / 2 + 50, yPos, rankText, textStyle);
        const name = this.add.text(-listBg.width / 2 + 150, yPos, scoreEntry.name, textStyle);
        const score = this.add.text(listBg.width / 2 - 200, yPos, scoreEntry.score.toLocaleString(), textStyle);
        const level = this.add.text(listBg.width / 2 - 50, yPos, scoreEntry.level ? `${scoreEntry.level}` : '-', textStyle);
        
        // Legg til tekstskygge
        rank.setShadow(0, 0, neonColor, 5, true, true);
        name.setShadow(0, 0, neonColor, 5, true, true);
        score.setShadow(0, 0, neonColor, 5, true, true);
        level.setShadow(0, 0, neonColor, 5, true, true);
        
        // Legg til elementer i containeren
        listContainer.add([rank, name, score, level]);
        
        // Sjekk om dette er spillerens nyeste highscore
        const isNewHighscore = scoreEntry.name === playerName && scoreEntry.score === playerScore;
        
        // Hvis dette er en ny highscore, legg til en spesiell markering
        if (isNewHighscore) {
          // Bakgrunn for raden
          const rowBg = this.add.rectangle(
            0, yPos,
            listBg.width - 40, 24,
            0x39ff14, 0.1
          );
          
          // Legg til bakgrunnen først (bak teksten)
          listContainer.add(rowBg);
          listContainer.sendToBack(rowBg);
          
          // NEW-merke
          const newBadge = this.add.text(
            listBg.width / 2 - 120, yPos,
            'NEW!',
            {
              fontFamily: 'monospace',
              fontSize: '16px',
              color: '#000000',
              backgroundColor: CONSTANTS.COLORS.NEON_GREEN,
              padding: { left: 5, right: 5, top: 2, bottom: 2 }
            }
          ).setOrigin(0.5);
          
          // Blink-animasjon for NEW-merke
          this.tweens.add({
            targets: newBadge,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1
          });
          
          listContainer.add(newBadge);
        }
        
        // Legg til delays i animasjonene basert på indeks
        this.time.delayedCall(index * 100, () => {
          // Fade-inn animasjon
          rank.setAlpha(0);
          name.setAlpha(0);
          score.setAlpha(0);
          level.setAlpha(0);
          
          this.tweens.add({
            targets: [rank, name, score, level],
            alpha: 1,
            duration: 300,
            ease: 'Power2'
          });
          
          // Flyt-animasjon (for topp 10)
          if (index < 10) {
            this.tweens.add({
              targets: [rank, name, score, level],
              y: '+=3',
              duration: 2000 + index * 300,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        });
      });
    }
    
    // Legg til oppdateringstid
    const updateTime = this.add.text(
      listBg.width / 2 - 20,
      listBg.height / 2 - 20,
      'Last updated: ' + new Date().toLocaleTimeString(),
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#999999'
      }
    ).setOrigin(1);
    
    listContainer.add(updateTime);
  }
  
  createBackButton(width, height) {
    // Back button for å gå tilbake til Game Over-skjermen
    const backButtonBg = this.add.rectangle(
      width / 2,
      height - 60,
      200, 50,
      0x000000, 0.7
    );
    backButtonBg.setStrokeStyle(2, 0x39ff14);
    backButtonBg.setInteractive({ useHandCursor: true });
    
    const backText = this.add.text(
      width / 2,
      height - 60,
      'BACK',
      {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: CONSTANTS.COLORS.NEON_GREEN
      }
    ).setOrigin(0.5);
    
    backText.setShadow(0, 0, CONSTANTS.COLORS.NEON_GREEN, 8, true, true);
    
    // Håndter klikk på back-knappen
    backButtonBg.on('pointerdown', () => {
      this.goBack();
    });
    
    // Håndter tastaturinput for å gå tilbake
    this.input.keyboard.on('keydown', () => {
      this.goBack();
    });
  }
  
  goBack() {
    // Hvis vi har en aktiv timer, stopp den
    if (this.backTimer) {
      this.backTimer.remove();
    }
    
    // Gå tilbake til Game Over-skjermen
    this.scene.start('GameOverScene');
  }
}

export default HighscoreScene;