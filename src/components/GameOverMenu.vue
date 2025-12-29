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
        <button @click="$emit('retry')" class="btn btn-retry">🔄 Skúsiť znova</button>
        <button @click="$emit('toLevels')" class="btn btn-menu">📂 Výber levelov</button>
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
/* Pôvodné štýly zostávajú, pridávame/upravujeme len title */

.game-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.game-over-card {
  background: #2c3e50;
  padding: 40px;
  border-radius: 30px;
  border: 5px solid #bdc3c7; /* Neutrálny rámik pre prehru */
  text-align: center;
  color: white;
  min-width: 350px;
  animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Zlatý rámik ak hráč vyhral aspoň jednu hviezdu */
.card-win {
  border-color: #f1c40f;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 0px #000;
  transition: color 0.3s;
}

/* FARBY PODĽA ÚSPECHU */
.title-0 { color: #e74c3c; } /* Červená - Prehra */
.title-1 { color: #3498db; } /* Modrá - Dobrá */
.title-2 { color: #2ecc71; } /* Zelená - Skvelá */
.title-3 { color: #f1c40f; } /* Zlatá - Perfektná */

/* ... Zvyšok tvojich pôvodných štýlov (stars, stats, buttons) ... */

@keyframes slideIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.stars-display {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.star-wrapper {
  position: relative;
  font-size: 60px;
}

.star-empty {
  color: #34495e;
}

.star-filled {
  position: absolute;
  top: 0;
  left: 0;
  color: #f1c40f;
  text-shadow: 0 0 15px rgba(241, 196, 15, 0.6);
  transform: scale(0);
}

.animate-star {
  animation: popStar 0.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popStar {
  0% { transform: scale(0); }
  70% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.stats-container {
  background: rgba(0,0,0,0.2);
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.stat-value {
  font-weight: bold;
}

.highlight {
  color: #2ecc71;
  font-size: 1.4rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
}

.btn:active { transform: scale(0.95); }

.btn-retry { background: #3498db; color: white; }
.btn-retry:hover { background: #2980b9; }

.btn-menu { background: #95a5a6; color: white; }
.btn-menu:hover { background: #7f8c8d; }
</style>