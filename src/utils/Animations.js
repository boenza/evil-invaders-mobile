/**
 * Definerer alle spillanimasjoner
 */
export default function createAnimations(scene) {
  // Eksplosjonsanimasjon
  scene.anims.create({
    key: 'explosion',
    frames: [
      { key: 'explosion1' },
      { key: 'explosion2' },
      { key: 'explosion3' },
      { key: 'explosion4' },
      { key: 'explosion5' }
    ],
    frameRate: 10,
    repeat: 0
  });

  // Spillerskip animasjon (tilleggsfunksjonalitet du kan implementere)
  scene.anims.create({
    key: 'player_idle',
    frames: [{ key: 'player' }],
    frameRate: 10,
    repeat: -1
  });

  // Spillerskip nivå 3 animasjon
  scene.anims.create({
    key: 'player_lvl3',
    frames: [{ key: 'playerLvl3' }],
    frameRate: 10,
    repeat: -1
  });

  // Spillerskip nivå 6 animasjon
  scene.anims.create({
    key: 'player_lvl6',
    frames: [{ key: 'playerLvl6' }],
    frameRate: 10,
    repeat: -1
  });

  // Spillerskip nivå 9 animasjon
  scene.anims.create({
    key: 'player_lvl9',
    frames: [{ key: 'playerLvl9' }],
    frameRate: 10,
    repeat: -1
  });

  // UFO animasjon (du kan legge til flere frames for bevegelse)
  for (let i = 1; i <= 4; i++) {
    scene.anims.create({
      key: `ufo${i}`,
      frames: [{ key: `ufo${i}` }],
      frameRate: 10,
      repeat: -1
    });
  }

  // Boss animasjoner
  scene.anims.create({
    key: 'boss_lvl5',
    frames: [{ key: 'bossLvl5' }],
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'boss_lvl10',
    frames: [{ key: 'bossLvl10' }],
    frameRate: 10,
    repeat: -1
  });
}