<script setup>
import { ref } from 'vue';

const emit = defineEmits(['select-level', 'back']);

const currentSection = ref(0);

const cuisines = [
  { name: 'Ázijská kuchyňa', icon: '🏮', color: '#e53935', levels: [1, 2, 3, 4] },
  { name: 'Mexická kuchyňa', icon: '🌵', color: '#43a047', levels: [5, 6, 7, 8] },
  { name: 'Talianska kuchyňa', icon: '🍕', color: '#fdd835', levels: [9, 10, 11, 12] },
  { name: 'Americký Fast Food', icon: '🍔', color: '#1e88e5', levels: [13, 14, 15, 16] }
];

const nextSection = () => {
  if (currentSection.value < cuisines.length - 1) currentSection.value++;
};

const prevSection = () => {
  if (currentSection.value > 0) currentSection.value--;
};
</script>

<template>
  <div class="levels-container" :style="{ backgroundColor: cuisines[currentSection].color + '22' }">
    <button class="back-home" @click="emit('back')">🏠 Domov</button>

    <div class="carousel">
      <div class="cuisine-card">
        <div class="icon">{{ cuisines[currentSection].icon }}</div>
        <h2>{{ cuisines[currentSection].name }}</h2>
        
        <div class="levels-grid">
          <button 
            v-for="lvl in cuisines[currentSection].levels" 
            :key="lvl"
            @click="emit('select-level', lvl)"
            class="level-btn"
          >
            Level {{ lvl }}
          </button>
        </div>
      </div>
    </div>

    <div class="navigation">
      <button @click="prevSection" :disabled="currentSection === 0" class="nav-btn">←</button>
      <span class="dots">
        <span v-for="(c, i) in cuisines" :key="i" :class="{ active: i === currentSection }"></span>
      </span>
      <button @click="nextSection" :disabled="currentSection === cuisines.length - 1" class="nav-btn">→</button>
    </div>
  </div>
</template>

<style scoped>
.levels-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s ease;
}

.back-home {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px;
  cursor: pointer;
}

.cuisine-card {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 350px;
}

.icon { font-size: 60px; }

.levels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.level-btn {
  padding: 15px;
  border: 2px solid #333;
  background: white;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

.level-btn:hover { background: #333; color: white; }

.navigation {
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-btn {
  font-size: 24px;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 50%;
  border: 1px solid #333;
}

.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.dots span {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background: #ccc;
  border-radius: 50%;
}

.dots span.active { background: #333; transform: scale(1.3); }
</style>