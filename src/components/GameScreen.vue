<script setup>
import { ref, computed } from 'vue';
import gameData from '../data/gameData.json';
import IngredientsMenu from './IngredientsMenu.vue';
import RecipesMenu from './RecipesMenu.vue';
import { ingredientIcons } from '../utils/icons';

// Importy obrázkov
import bgAsian from '../assets/backgrounds/bg-asian.jpg';
import bgMexican from '../assets/backgrounds/bg-mexican.jpg';
import bgItalian from '../assets/backgrounds/bg-italian.jpg';
import bgAmerican from '../assets/backgrounds/bg-american.png';

const props = defineProps(['levelId', 'cuisineType']);
const emit = defineEmits(['back']);

// --- LOGIKA HRY ---
const onPlate = ref([]);
const score = ref(0);

const cuisineData = computed(() => gameData[props.cuisineType]);

const getIcon = (name) => ingredientIcons[name] || "📦";

const handleIngredientSelect = (ingName) => {
  if (onPlate.value.length < 6) {
    onPlate.value.push(ingName);
  }
};

const clearPlate = () => {
  onPlate.value = [];
};

const servePlate = () => {
  // Tu neskôr príde logika kontroly receptu
  alert("Podávate: " + onPlate.value.join(", "));
  clearPlate();
};

// --- POZADIE ---
const backgrounds = {
  asian: bgAsian,
  mexican: bgMexican,
  italian: bgItalian,
  american: bgAmerican
};

const backgroundStyle = computed(() => {
  return {
    backgroundImage: `url(${backgrounds[props.cuisineType]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
});
</script>

<template>
  <div class="game-container" :style="backgroundStyle">
    
    <div class="hud">
      <button @click="emit('back')" class="exit-btn">❌ Menu</button>
      <div class="level-info">
        Level: {{ levelId }} | {{ props.cuisineType.toUpperCase() }}
      </div>
      <div class="score-box">Body: {{ score }}</div>
    </div>

    <div class="customer-area">
      <div class="order-bubble">
        <p>Prosím si: <strong>Maki Losos</strong> 🍣</p>
      </div>
    </div>

    <div class="counter-top">
      
      <div class="tray-system">
        <div class="plate">
          <div v-for="(ing, idx) in onPlate" :key="idx" class="ing-animated" :title="ing">
            {{ getIcon(ing) }}
          </div>
          <p v-if="onPlate.length === 0" class="plate-empty">Položte suroviny...</p>
        </div>

        <div class="plate-actions">
          <button @click="clearPlate" class="btn-action clear" :disabled="onPlate.length === 0">🗑️</button>
          <button @click="servePlate" class="btn-action serve" :disabled="onPlate.length === 0">ZVONIŤ 🛎️</button>
        </div>
      </div>

    </div>

    <IngredientsMenu 
      :ingredients="cuisineData.ingredients" 
      @select-ingredient="handleIngredientSelect"
    />

    <RecipesMenu 
      :recipes="cuisineData.recipes" 
    />

  </div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 25px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  backdrop-filter: blur(5px);
}

.exit-btn {
  background: #e74c3c;
  border: none;
  color: white;
  padding: 6px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.score-box {
  background: #f1c40f;
  color: #333;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.customer-area {
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.order-bubble {
  background: white;
  padding: 15px 30px;
  border-radius: 50px 50px 50px 5px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  font-size: 1.2rem;
}

.counter-top {
  height: 40%;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tray-system {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.plate {
  width: 450px;
  height: 140px;
  background: rgba(255, 255, 255, 0.9);
  border: 5px solid #bdc3c7;
  border-radius: 50% / 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 0 #95a5a6;
}

.plate-empty { color: #bdc3c7; font-style: italic; }

.ing-animated {
  font-size: 40px;
  filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.1));
}

.plate-actions { display: flex; gap: 10px; }

.btn-action {
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  color: white;
}

.clear { background: #95a5a6; }
.serve { background: #2ecc71; font-size: 1.1rem; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
</style>