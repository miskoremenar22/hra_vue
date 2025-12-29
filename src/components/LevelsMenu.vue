<script setup>
import { ref, computed } from 'vue'
import { getCuisineProgress } from '@/utils/progress'

// LOGIKA ZOSTÁVA NEDOTKNUTÁ
const emit = defineEmits(['select-level', 'back'])
const currentSection = ref(0)

const cuisines = [
  { key: 'asian', name: 'Ázijská kuchyňa', icon: '🏮', color: '#e53935', levels: [1, 2, 3, 4] },
  { key: 'mexican', name: 'Mexická kuchyňa', icon: '🌵', color: '#43a047', levels: [5, 6, 7, 8] },
  { key: 'italian', name: 'Talianska kuchyňa', icon: '🍕', color: '#fdd835', levels: [9, 10, 11, 12] },
  { key: 'american', name: 'Americký Fast Food', icon: '🍔', color: '#1e88e5', levels: [13, 14, 15, 16] }
]

const nextSection = () => { if (currentSection.value < cuisines.length - 1) currentSection.value++ }
const prevSection = () => { if (currentSection.value > 0) currentSection.value-- }
const currentCuisine = computed(() => cuisines[currentSection.value])
const progress = computed(() => getCuisineProgress(currentCuisine.value.key))

const isCuisineUnlocked = (cuisineKey) => {
  const idx = cuisines.findIndex(c => c.key === cuisineKey)
  if (idx <= 0) return true
  const prevKey = cuisines[idx - 1].key
  const prevProg = getCuisineProgress(prevKey)
  return prevProg.unlocked > 4
}

const isLevelUnlocked = (localLevel) => {
  return localLevel <= (progress.value?.unlocked || 1)
}

const selectLevel = (localLevel) => {
  if (!isCuisineUnlocked(currentCuisine.value.key)) return
  if (!isLevelUnlocked(localLevel)) return
  const globalLevelId = currentCuisine.value.levels[localLevel - 1]
  emit('select-level', globalLevelId)
}

const showStatsFor = ref(null);

const toggleStats = (id) => {
  showStatsFor.value = showStatsFor.value === id ? null : id;
};

const getBestTime = (id) => {
  const time = progress.value.bestTimes?.[id];
  if (!time) return 'N/A';
  const m = Math.floor(time / 60);
  const s = time % 60;
  return `${m}:${s.toString().padStart(2, '0')}s`;
};

const getAttempts = (id) => {
  return progress.value.attempts?.[id] || 0;
};

</script>

<template>
  <div class="levels-screen" :style="{ '--theme-color': currentCuisine.color }">
    
    <div class="bg-decor">
      <span class="float icon-1">🥘</span>
      <span class="float icon-2">🔪</span>
      <span class="float icon-3">🥗</span>
      <span class="float icon-4">👨‍🍳</span>
      <span class="float icon-5">🍲</span>
    </div>
    <div class="bg-overlay"></div>

    <button class="back-btn" @click="emit('back')">
      <span class="back-icon">🏠</span>
      <span class="back-text">DOMOV</span>
    </button>

    <div class="main-carousel">
      <div 
        :key="currentCuisine.key"
        class="cuisine-container animate-in" 
        :class="{ 'is-locked': !isCuisineUnlocked(currentCuisine.key) }"
      >
        <div class="cuisine-header">
          <div class="cuisine-icon-wrapper pulse">
            <span class="main-icon">{{ currentCuisine.icon }}</span>
          </div>
          <h2 class="cuisine-title">{{ currentCuisine.name }}</h2>
        </div>

        <div v-if="!isCuisineUnlocked(currentCuisine.key)" class="lock-overlay">
          <div class="lock-content">
            <span class="lock-emoji">🔒</span>
            <p>Tento svet je ešte v príprave!<br><small>Dokonči predchádzajúcu krajinu</small></p>
          </div>
        </div>

        <div v-else class="levels-grid">
          <button
            v-for="localLvl in [1, 2, 3, 4]"
            :key="localLvl"
            class="level-tile"
            :class="{ 'tile-locked': !isLevelUnlocked(localLvl) }"
            :disabled="!isLevelUnlocked(localLvl)"
            @click="selectLevel(localLvl)"
          >
            <div 
              v-if="isLevelUnlocked(localLvl)" 
              class="info-btn" 
              @click.stop="toggleStats(localLvl)"
            >
              i
            </div>

            <div v-if="showStatsFor === localLvl" class="stats-popover animate-pop">
              <div class="popover-item">
                <span class="pop-label">⏱️ Naj čas:</span>
                <span class="pop-val">{{ getBestTime(localLvl) }}</span>
              </div>
              <div class="popover-item">
                <span class="pop-label">🎮 Pokusy:</span>
                <span class="pop-val">{{ getAttempts(localLvl) }}</span>
              </div>
            </div>

            <div class="level-number">LEVEL {{ localLvl }}</div>
            
            <div v-if="!isLevelUnlocked(localLvl)" class="tile-lock">🔒</div>
            <div v-else class="star-rating">
              <span 
                v-for="i in 3" 
                :key="i" 
                class="star" 
                :class="{ 'star-filled': i <= (progress.stars?.[localLvl] || 0) }"
              >★</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-nav">
      <button @click="prevSection" :disabled="currentSection === 0" class="arrow-btn">
        <span class="arrow">‹</span>
      </button>

      <div class="pagination">
        <span
          v-for="(c, i) in cuisines"
          :key="c.key"
          class="dot"
          :class="{ 'dot-active': i === currentSection }"
          :style="{ '--dot-color': c.color }"
        ></span>
      </div>

      <button @click="nextSection" :disabled="currentSection === cuisines.length - 1" class="arrow-btn">
        <span class="arrow">›</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.levels-screen {
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fdf5e6;
  transition: background-color 0.8s ease;
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* PLÁVAJÚCE POZADIE */
.bg-decor .float {
  position: absolute;
  font-size: 3rem;
  opacity: 0.15;
  z-index: 1;
  filter: grayscale(0.5);
}

.icon-1 { top: 10%; left: 10%; animation: float-slow 10s infinite alternate; }
.icon-2 { top: 75%; left: 15%; animation: float-slow 12s infinite alternate-reverse; }
.icon-3 { top: 20%; right: 15%; animation: float-slow 8s infinite alternate; }
.icon-4 { top: 80%; right: 10%; animation: float-slow 15s infinite alternate-reverse; }
.icon-5 { top: 45%; left: 5%; animation: float-slow 11s infinite alternate; }

@keyframes float-slow {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(30px, 50px) rotate(15deg); }
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, var(--theme-color) 300%);
  opacity: 0.2;
  pointer-events: none;
  z-index: 2;
}

/* HOME TLAČIDLO - BOMBA VERZIA */
.back-btn {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 900;
  color: #5d4037;
  box-shadow: 0 8px 0 #ddd;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.back-btn:hover {
  transform: scale(1.1) rotate(-2deg);
  background: var(--theme-color);
  color: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.back-btn:active {
  transform: scale(0.95) translateY(4px);
  box-shadow: 0 2px 0 #ddd;
}

/* HLAVNÝ KONTAJNER */
.main-carousel {
  position: relative;
  z-index: 10;
  width: 100%;
  display: flex;
  justify-content: center;
}

.cuisine-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  padding: 2.5rem;
  border-radius: 45px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.12);
  border: 3px solid white;
  text-align: center;
}

.animate-in {
  animation: slide-up 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.cuisine-icon-wrapper {
  font-size: 5rem;
  margin-bottom: 0.5rem;
}

.pulse {
  animation: pulse-icon 2s infinite ease-in-out;
}

@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.cuisine-title {
  font-size: 2.2rem;
  color: #2d1a12;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

/* LEVEL TLAČIDLÁ */
.levels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}

.level-tile {
  background: white;
  border: 2px solid transparent;
  padding: 1.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  box-shadow: 0 8px 0 #f0f0f0;
  position: relative;
}

.level-tile:not(:disabled):hover {
  border-color: var(--theme-color);
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0,0,0,0.08);
}

.level-tile:not(:disabled):active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #f0f0f0;
}

.level-number {
  font-size: 0.8rem;
  font-weight: 800;
  color: #a1887f;
  letter-spacing: 1px;
}

.star-rating {
  font-size: 1.5rem;
  margin-top: 5px;
}

.star { color: #eee; }
.star-filled { 
  color: #ffc107; 
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5); 
}

/* ZAMKNUTÝ STAV */
.tile-locked {
  background: #fafafa;
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: 0 4px 0 #eee;
}

.lock-overlay {
  background: rgba(0,0,0,0.03);
  border-radius: 30px;
  padding: 2rem;
  border: 2px dashed #ccc;
}

.lock-emoji { font-size: 3rem; margin-bottom: 1rem; display: block; }

/* NAVIGÁCIA */
.bottom-nav {
  margin-top: 3rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 10;
}

.arrow-btn {
  width: 55px;
  height: 55px;
  background: white;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 0 #ddd;
  transition: all 0.2s;
}

.arrow-btn:hover:not(:disabled) {
  background: var(--theme-color);
  color: white;
}

.arrow-btn:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #ddd;
}

.pagination {
  display: flex;
  gap: 15px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ccc;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dot-active {
  transform: scale(1.8);
  background: var(--dot-color) !important;
  box-shadow: 0 0 15px var(--dot-color);
}

/* RESPONZIVITA - BOMBA PRISPÔSOBENIE */
@media (max-width: 600px) {
  .back-btn {
    top: 1rem;
    left: 1rem;
    padding: 0.6rem 1rem;
  }
  .back-text { display: none; } /* Na mobile šetríme miesto, necháme len ikonu */
  
  .cuisine-container {
    padding: 1.5rem;
    width: 88%;
  }
  
  .cuisine-title { font-size: 1.6rem; }
  .cuisine-icon-wrapper { font-size: 3.5rem; }
  
  .levels-grid {
    gap: 0.8rem;
  }
  
  .level-tile { padding: 1rem 0.5rem; }
}

@media (max-height: 700px) {
  .cuisine-container { padding: 1rem; }
  .cuisine-header { margin-bottom: 1rem; }
  .bottom-nav { margin-top: 1.5rem; }
}

/* Základný kontajner dlaždice musí byť relative */
/* 1. Rodičovský prvok musí byť relative, inak absolute vnútri nefunguje */
.level-tile, .level-square { 
  position: relative !important; 
  overflow: visible !important; /* Aby popover nezmizol za okrajom */
}

/* 2. Ikona "i" - výrazná, jasná a v rohu */
.info-btn {
  position: absolute !important;
  top: 10px !important;    /* Odsadenie zhora */
  right: 10px !important;  /* Odsadenie zprava */
  
  width: 28px !important;  /* Zväčšená */
  height: 28px !important; /* Zväčšená */
  
  /* Farba pozadia (použije hlavnú farbu témy) a jasný biely okraj */
  background: var(--theme-color, #e53935) !important; 
  border: 2px solid white !important;
  border-radius: 50% !important;
  
  /* Písmo */
  font-size: 16px !important;
  font-weight: 900 !important;
  color: white !important;
  
  /* Vycentrovanie písmena "i" v krúžku */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
  cursor: pointer !important;
  z-index: 50 !important; /* Musí byť nad číslom levelu */
}

/* 3. Popover so štatistikami */
.stats-popover {
  position: absolute !important;
  top: 45px !important; /* Zobrazí sa pod ikonou "i" */
  right: 0 !important;
  
  background: #2c3e50 !important;
  color: white !important;
  padding: 10px !important;
  border-radius: 12px !important;
  width: 140px !important;
  font-size: 12px !important;
  box-shadow: 0 8px 15px rgba(0,0,0,0.4) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
  pointer-events: none;
  z-index: 100 !important;
}
</style>