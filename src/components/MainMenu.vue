<script setup>
import { computed } from 'vue'

const props = defineProps({
  isMuted: Boolean,
  volume: Number
});

const emit = defineEmits(['start-game', 'show-stats', 'toggle-music', 'change-volume', 'show-instructions']);


// 100 polôh pre ikony - menia sa plynulejšie
const volumeIcon = computed(() => {
  if (props.isMuted || props.volume <= 0) return '🔇';
  if (props.volume < 0.33) return '🔈';
  if (props.volume < 0.67) return '🔉';
  return '🔊';
});

const onVolumeInput = (e) => {
  // Posielame presné desatinné číslo (0.00 až 1.00)
  emit('change-volume', parseFloat(e.target.value));
};
</script>

<template>
  <div class="menu-wrapper">
    <div class="bg-decor">
      <span class="float icon-1">🍕</span>
      <span class="float icon-2">🍳</span>
      <span class="float icon-3">🍅</span>
      <span class="float icon-4">🥦</span>
      <span class="float icon-5">🧂</span>
    </div>

    <div class="menu-card">
      <div class="chef-section">
        <div class="chef-avatar">
          <span class="chef-emoji">👨‍🍳</span>
          <div class="chef-badge">PRO</div>
        </div>
      </div>

      <h1 class="title">Master Chef<span class="title-dot">.</span></h1>
      
      <div class="button-group">
        <button @click="emit('start-game')" class="btn btn-play">
          <span class="btn-icon">▶</span>
          OTVORIŤ REŠTAURÁCIU
        </button>
        
        <button @click="emit('show-stats')" class="btn btn-stats">
          <span class="btn-icon">📊</span>
          ŠTATISTIKY
        </button>

        

        <button @click="emit('show-instructions')" class="btn btn-info">
          <span class="btn-icon">ℹ</span>
          NÁVOD KU HRE
        </button>

        <button @click="emit('toggle-music')" class="btn btn-music">
          <div class="btn-content">
            <span class="btn-icon-fixed">{{ volumeIcon }}</span>
            
            <div class="slider-container" v-if="!isMuted">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                :value="volume"
                @input="onVolumeInput"
                @click.stop 
                class="volume-slider"
              />
            </div>
            <span v-else class="btn-text-mute">HUDBA VYPNUTÁ</span>
          </div>
        </button>
      </div>

      <p class="footer-text">Pripravte sa na varenie!</p>
    </div>
  </div>
</template>

<style scoped>
/* 1. ZÁKLADNÉ ROZLOŽENIE */
.menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at center, #fff5e6 0%, #ffeccc 100%);
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.menu-card {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(93, 64, 55, 0.15);
  border: 2px solid white;
  text-align: center;
  width: 90%;
  max-width: 450px;
}

/* 2. CHÉF SEKCIÁ A NADPIS */
.chef-section {
  margin-bottom: 1.5rem;
}

.chef-avatar {
  position: relative;
  display: inline-block;
  background: white;
  width: 120px;
  height: 120px;
  line-height: 120px;
  border-radius: 50%;
  font-size: 70px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  animation: float-chef 4s ease-in-out infinite;
}

.chef-badge {
  position: absolute;
  bottom: 0;
  right: -5px;
  background: #ff5722;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 20px;
  border: 3px solid white;
}

.title {
  color: #5d4037;
  font-size: 2.8rem;
  font-weight: 900;
  margin-bottom: 2.5rem;
  line-height: 1;
  text-transform: uppercase;
}

.title-dot { color: #4caf50; }

/* 3. TLAČIDLÁ - ZÁKLADNÝ ŠTÝL */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.btn {
  position: relative;
  width: 100%; /* Jednotná šírka */
  padding: 18px 30px; /* JEDNOTNÁ VÝŠKA PRE VŠETKY */
  font-size: 1.1rem;
  font-weight: 800;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-sizing: border-box; /* Dôležité pre správny výpočet šírky */
}

/* PLAY Tlačidlo */
.btn-play {
  background: #4caf50;
  box-shadow: 0 8px 0 #388e3c;
}

.btn-play:hover {
  transform: translateY(-2px);
  background: #43a047;
  box-shadow: 0 10px 0 #388e3c;
}

/* STATS Tlačidlo */
.btn-stats {
  background: #ff9800;
  box-shadow: 0 8px 0 #e68a00;
}

.btn-stats:hover {
  transform: translateY(-2px);
  background: #fb8c00;
  box-shadow: 0 10px 0 #e68a00;
}

/* MUSIC Tlačidlo (Fialové) */
.btn-music {
  background: #7e57c2;
  box-shadow: 0 8px 0 #5e35b1;
  padding: 18px 25px; /* Mierne upravený bočný padding pre slider */
}

.btn-music:hover {
  transform: translateY(-2px);
  background: #9575cd;
  box-shadow: 0 10px 0 #5e35b1;
}

/* Spoločný efekt pri kliknutí */
.btn:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 rgba(0,0,0,0.2);
}

/* 4. VNÚTORNÝ OBSAH TLAČIDLA HUDBY */
.btn-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.btn-icon-fixed {
  font-size: 1.4rem;
  min-width: 35px; /* Fixná šírka, aby tlačidlo neskákalo pri zmene ikony */
  display: flex;
  justify-content: center;
}

.slider-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.volume-slider {
  width: 100%;
  height: 6px;
  cursor: pointer;
  accent-color: #ffffff;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  outline: none;
  -webkit-appearance: none;
}

/* Štýl "bežca" na slideri */
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.btn-text-mute {
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 5. OSTATNÉ */
.btn-icon { font-size: 1.4rem; margin-right: 8px; }

.footer-text {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #8d6e63;
  font-weight: 500;
  opacity: 0.7;
}

.bg-decor .float {
  position: absolute;
  font-size: 40px;
  opacity: 0.2;
  filter: blur(1px);
  z-index: 1;
}

.icon-1 { top: 10%; left: 10%; animation: float-anim 6s infinite; }
.icon-2 { top: 70%; left: 15%; animation: float-anim 8s infinite 1s; }
.icon-3 { top: 20%; right: 15%; animation: float-anim 7s infinite 0.5s; }
.icon-4 { top: 80%; right: 10%; animation: float-anim 9s infinite 2s; }
.icon-5 { top: 45%; left: 5%; animation: float-anim 10s infinite; }

@keyframes float-chef {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes float-anim {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  33% { transform: translate(20px, 40px) rotate(20deg); }
  66% { transform: translate(-20px, 20px) rotate(-20deg); }
}

@media (max-width: 480px) {
  .menu-card { padding: 2rem 1.5rem; }
  .title { font-size: 2.2rem; }
  .chef-avatar { width: 100px; height: 100px; font-size: 60px; line-height: 100px; }
}

.btn-info {
  background: #00bcd4; /* Azúrová farba */
  box-shadow: 0 8px 0 #0097a7;
}
.btn-info:hover { background: #26c6da; }

/* 6. RESPONSIVE PRE MOBIL NA ŠÍRKU (LANDSCAPE) */
@media (orientation: landscape) and (max-height: 500px) {
  .menu-wrapper {
    padding: 10px;
    align-items: center; /* Vycentrovanie na stred výšky */
  }

  .menu-card {
    display: flex;
    flex-direction: row; /* Prvky vedľa seba */
    align-items: center;
    justify-content: space-between;
    width: 95%;
    max-width: 850px;
    padding: 1.5rem 2rem;
    gap: 30px;
    border-radius: 30px;
  }

  /* Ľavá strana: Chef a Nadpis */
  .chef-section {
    margin-bottom: 0;
    flex: 1;
  }

  .chef-avatar {
    width: 80px;
    height: 80px;
    line-height: 80px;
    font-size: 45px;
  }

  .title {
    font-size: 1.8rem;
    margin-top: 10px;
    margin-bottom: 0;
  }

  /* Pravá strana: Tlačidlá do mriežky 2x2 */
  .button-group {
    flex: 2;
    display: grid;
    grid-template-columns: 1fr 1fr; /* Dva stĺpce */
    gap: 12px;
  }

  .btn {
    padding: 12px 15px;
    font-size: 0.9rem;
    border-radius: 12px;
  }

  /* Špeciálne pre hudobné tlačidlo v mriežke */
  .btn-music {
    grid-column: span 1; /* Ak chceš, aby hudba zaberala 1 slot */
    padding: 12px 15px;
  }

  /* Úprava slidera pre menšie tlačidlo */
  .btn-content {
    gap: 8px;
  }
  
  .btn-icon-fixed {
    min-width: 25px;
    font-size: 1.1rem;
  }

  .volume-slider::-webkit-slider-thumb {
    height: 14px;
    width: 14px;
  }

  .footer-text {
    display: none; /* Schováme text naspodu, aby nezaberal miesto */
  }

  /* Zmenšenie dekoratívnych ikon, aby nezavadzali */
  .bg-decor .float {
    font-size: 25px;
  }
}

/* Úprava pre veľmi nízke displeje (napr. staršie iPhony v landscape) */
@media (orientation: landscape) and (max-height: 380px) {
  .menu-card {
    padding: 1rem;
    gap: 15px;
  }
  .title { font-size: 1.5rem; }
  .chef-avatar { display: none; } /* Schováme avatara úplne, ak je fakt málo miesta */
}
</style>