/**
 * Hjelpefunksjoner for mobilspesifikk funksjonalitet
 */

// Sjekk om den nåværende enheten er en mobil/touch-enhet
export function isMobileDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    ('matchMedia' in window && window.matchMedia('(pointer:coarse)').matches)
  );
}

// Sjekk om enheten er i portrett-modus
export function isPortraitMode() {
  return window.innerHeight > window.innerWidth;
}

// Sjekk om enheten er i landskap-modus
export function isLandscapeMode() {
  return window.innerWidth > window.innerHeight;
}

// Sjekk om enheten er iOS
export function isIOS() {
  return (
    ['iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}

// Sjekk om enheten er Android
export function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

// Lås orienteringen (fungerer bare på noen enheter/nettlesere)
export function lockOrientation(mode = 'landscape') {
  try {
    // Ulike metodenavn på ulike nettlesere
    const lock = screen.orientation?.lock ||
                 screen.lockOrientation ||
                 screen.mozLockOrientation ||
                 screen.msLockOrientation;
    
    if (lock) {
      lock(mode === 'landscape' ? 'landscape' : 'portrait').catch(e => {
        console.warn('Kunne ikke låse skjermorientering:', e);
      });
    }
  } catch (e) {
    console.warn('Orientering låsing støttes ikke:', e);
  }
}

// Forespør fullskjerm-modus
export function requestFullscreen(element = document.documentElement) {
  try {
    const requestMethod = element.requestFullscreen ||
                          element.webkitRequestFullscreen ||
                          element.mozRequestFullScreen ||
                          element.msRequestFullscreen;
    
    if (requestMethod) {
      requestMethod.call(element);
    }
  } catch (e) {
    console.warn('Fullskjerm støttes ikke:', e);
  }
}

// Avslutt fullskjerm-modus
export function exitFullscreen() {
  try {
    const exitMethod = document.exitFullscreen ||
                       document.webkitExitFullscreen ||
                       document.mozCancelFullScreen ||
                       document.msExitFullscreen;
    
    if (exitMethod) {
      exitMethod.call(document);
    }
  } catch (e) {
    console.warn('Kunne ikke avslutte fullskjerm:', e);
  }
}

// Sjekk om vi er i fullskjerm-modus
export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

// Toggle fullskjerm-modus
export function toggleFullscreen(element = document.documentElement) {
  if (isFullscreen()) {
    exitFullscreen();
  } else {
    requestFullscreen(element);
  }
}

// Forhindre at enheten går i dvale (krever brukerinteraksjon)
export function preventSleep() {
  try {
    if (navigator.wakeLock) {
      let wakeLock = null;
      
      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock.addEventListener('release', () => {
            console.log('Skjerm våkenhet låsing frigitt');
          });
        } catch (e) {
          console.warn('Kunne ikke låse våkenhet:', e);
        }
      };
      
      // Ber om lås første gang
      requestWakeLock();
      
      // Ber om ny lås når dokumentet blir synlig igjen
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !wakeLock) {
          requestWakeLock();
        }
      });
    }
  } catch (e) {
    console.warn('WakeLock støttes ikke:', e);
  }
}

// Juster spillstørrelse for mobil
export function adjustGameForMobile(game, defaultWidth = 800, defaultHeight = 600) {
  const updateSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Beregn ønsket skalering for å oppnå beste mulige tilpasning
    let scale = Math.min(width / defaultWidth, height / defaultHeight);
    
    // Avrund til 2 desimaler for å unngå ustabile verdier
    scale = Math.round(scale * 100) / 100;
    
    // Oppdater spillets skala
    if (game.scale) {
      game.scale.resize(width, height);
    }
    
    // Juster canvas-elementet
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Sørg for at canvas fyller skjermen
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }
  };
  
  // Kjør ved oppstart
  updateSize();
  
  // Kjør ved endring av vindusstrørrelse eller orientering
  window.addEventListener('resize', updateSize);
  window.addEventListener('orientationchange', () => {
    // Liten forsinkelse for å la orienteringen fullføre endringen
    setTimeout(updateSize, 100);
  });
}

// Registrer vibrasjon - nyttig for feedback i spill
export function vibrateDevice(duration = 20) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (e) {
      console.warn('Kunne ikke vibrere enheten:', e);
    }
  }
}

// Eksporter samleobjekt for enkel import
export default {
  isMobileDevice,
  isPortraitMode,
  isLandscapeMode,
  isIOS,
  isAndroid,
  lockOrientation,
  requestFullscreen,
  exitFullscreen,
  isFullscreen,
  toggleFullscreen,
  preventSleep,
  adjustGameForMobile,
  vibrateDevice
};