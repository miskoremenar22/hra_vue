<template>
  <div class="game-over-overlay">
    <div class="game-over-card">
      <h1 class="title">ČAS VYPRŠAL</h1>
      
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
      </div>

      <div class="action-buttons">
        <button @click="$emit('retry')" class="btn btn-retry">🔄 Skúsiť znova</button>
        <button @click="$emit('toLevels')" class="btn btn-menu">📂 Výber levelov</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  stars: Number,
  score: Number,
  servedCount: Number
})

defineEmits(['retry', 'toLevels'])

const animatedStars = ref(0)

onMounted(() => {
  // Animácia hviezdičiek po jednej
  if (props.stars > 0) {
    for (let i = 1; i <= props.stars; i++) {
      setTimeout(() => {
        animatedStars.value = i
      }, 500 * i) // Každá hviezda vyskočí po pol sekunde
    }
  }
})
</script>

<style scoped>
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
  border: 5px solid #f1c40f;
  text-align: center;
  color: white;
  min-width: 350px;
  animation: slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.title {
  font-size: 2.5rem;
  color: #e74c3c;
  margin-bottom: 20px;
  text-shadow: 2px 2px 0px #000;
}

/* Hviezdy */
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

/* Štatistiky */
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

/* Tlačidlá */
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