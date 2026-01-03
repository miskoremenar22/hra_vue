// src/utils/audioManager.js
const sounds = {
  menu: new Audio(new URL('../assets/audio/menu-music.mp3', import.meta.url).href),
  game: new Audio(new URL('../assets/audio/game-music.mp3', import.meta.url).href),
};

// Nastavenia
Object.values(sounds).forEach(s => {
  s.loop = true;
  s.volume = 0.4; // Hlasitosť na 40%
});

let currentSound = null;
let isMuted = false;

export const audioManager = {
  play(key) {
    if (isMuted) return;
    
    const nextSound = sounds[key];
    if (!nextSound) return;

    // 🔥 KĽÚČOVÁ ZMENA: 
    // Ak skladba, ktorú chceme pustiť, je tá istá, ktorá už hrá, nerobíme nič.
    if (currentSound === nextSound && !currentSound.paused) {
      return;
    }

    // Ak hrá niečo iné, zastavíme to
    if (currentSound) {
      currentSound.pause();
    }
    
    currentSound = nextSound;
    currentSound.currentTime = 0; // Resetujeme len pri skutočnej zmene skladby
    currentSound.play().catch(e => console.log("Audio čaká na interakciu..."));
  },
  
  stop() {
    if (currentSound) currentSound.pause();
  },

  toggleMute() {
    isMuted = !isMuted;
    if (isMuted) this.stop();
    else if (currentSound) currentSound.play();
    return isMuted;
  },

  setVolume(value) {
    const vol = parseFloat(value);
    Object.values(sounds).forEach(s => {
      s.volume = vol;
    });
    return vol;
  }

};
