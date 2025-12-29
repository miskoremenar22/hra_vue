<template>
  <div class="game-over-overlay">
    <div class="game-over-card" :class="{ 'card-win': stars > 0 }">
      <h1 class="title" :class="`title-${stars}`">{{ statusTitle }}</h1>
      
      <div class="stars-display">
        <div v-for="i in 3" :key="i" class="star-wrapper">
          <span class="star-empty">★</span>
          <span 
            class="star-filled" 
            :class="{ 'animate-star': i <= animatedStars }"
            v-if="i <= animatedStars"
          >★</span>
        </div>
      </div>

      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-label">Obslúžení ľudia:</span>
          <span class="stat-value">{{ servedCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Dosiahnuté skóre:</span>
          <span class="stat-value highlight">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Čas pre 1. hviezdu:</span>
          <span class="stat-value">{{ timeToPass ? formatTime(timeToPass) : '--:--' }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Počet pokusov:</span>
          <span class="stat-value">{{ attempts }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="$emit('retry')" class="btn btn-retry">Skúsiť znova</button>
        <button @click="$emit('toLevels')" class="btn btn-menu">Výber levelov</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 },
  stars: { type: Number, default: 0 },
  servedCount: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  timeToPass: { type: Number, default: null }
})

defineEmits(['retry', 'toLevels'])

// LOGIKA PRE DYNAMICKÝ TEXT
const statusTitle = computed(() => {
  if (props.stars === 3) return 'PERFEKTNÁ PRÁCA!'
  if (props.stars === 2) return 'SKVELÁ PRÁCA!'
  if (props.stars === 1) return 'DOBRÁ PRÁCA!'
  return 'ČAS VYPRŠAL'
})

const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const animatedStars = ref(0)

onMounted(() => {
  if (props.stars > 0) {
    for (let i = 1; i <= props.stars; i++) {
      setTimeout(() => {
        animatedStars.value = i
      }, 500 * i)
    }
  }
})
</script>

<style scoped>
/* 1. POZADIE (Zhodné s PauseMenu) */
.game-over-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(28, 15, 10, 0.6);
  backdrop-filter: blur(12px) brightness(0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 15px;
}

/* 2. KARTA (Zhodná s PauseMenu) */
.game-over-card {
  background: #ffffff;
  padding: 2.5rem 2rem;
  border-radius: 40px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  position: relative;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3), inset 0 0 0 2px #ffffff;
  border: 4px solid #f1c40f; /* Zlatý rámik */
  animation: modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-height: 95vh;
  overflow-y: auto;
}

.game-over-card:not(.card-win) { border-color: #d7ccc8; }

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* 3. NADPIS A HVIEZDY (Zhustené) */
.title {
  font-size: 1.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.title-0 { color: #d32f2f; }
.title-1 { color: #1976d2; }
.title-2 { color: #388e3c; }
.title-3 { color: #fbc02d; }

.stars-display {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1.2rem;
}

.star-wrapper { position: relative; font-size: 45px; }
.star-empty { color: #eeeeee; }
.star-filled {
  position: absolute;
  top: 0; left: 0;
  color: #f1c40f;
  transform: scale(0);
}

.animate-star { animation: popStar 0.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popStar {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* 4. ŠTATISTIKY (Kompaktný blok) */
.stats-container {
  background: #f8f5f2;
  border-radius: 20px;
  border: 1px solid #efebe9;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 1.2rem;
  border-bottom: 1px solid #efebe9;
}

.stat-item:last-child { border-bottom: none; }
.stat-label { font-size: 1.15rem; font-weight: 700; color: #8d6e63; }
.stat-value { font-size: 1rem; font-weight: 800; color: #3e2723; }
.highlight { color: #4caf50; font-size: 1.1rem; }

/* 5. TLAČIDLÁ (IDENTICKÉ EFEKTY AKO PAUSE MENU) */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn {
  width: 100%;
  padding: 1.1rem;
  border: none;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Skúsiť znova = Zelené (ako Resume v PauseMenu) */
.btn-retry {
  background: #4caf50;
  color: white;
  box-shadow: 0 6px 0 #2e7d32;
}

.btn-retry:hover {
  background: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 8px 0 #2e7d32;
}

/* Výber levelov = Cappuccino (ako ostatné v PauseMenu) */
.btn-menu {
  background: #f8f5f2;
  color: #5d4037;
  box-shadow: 0 6px 0 #d7ccc8;
}

.btn-menu:hover {
  background: #efebe9;
  transform: translateY(-2px);
  box-shadow: 0 8px 0 #d7ccc8;
}

/* SPOLOČNÝ KLIK PRE OBA */
.btn:active {
  transform: translateY(4px) !important;
  box-shadow: 0 2px 0 transparent !important;
}

/* 6. RESPONZIVITA (Zhodná s PauseMenu) */
@media (max-width: 380px) {
  .game-over-card { padding: 1.5rem 1.2rem; }
  .title { font-size: 1.2rem; }
  .star-wrapper { font-size: 38px; }
  .btn { padding: 0.9rem; font-size: 0.95rem; }
  .stat-item { padding: 0.5rem 1rem; }
}

@media (max-height: 600px) {
  .game-over-card { padding: 1rem; }
  .title { margin-bottom: 0.2rem; }
  .stars-display { margin-bottom: 0.5rem; }
  .stats-container { margin-bottom: 0.8rem; }
}
</style>