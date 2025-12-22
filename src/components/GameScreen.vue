<script setup>
import { ref, computed, onUnmounted } from 'vue';
import gameData from '../data/gameData.json';
import IngredientsMenu from './IngredientsMenu.vue';
import RecipesMenu from './RecipesMenu.vue';
import { ingredientIcons } from '../utils/icons';

import Customer from './Customers.vue'

// Importy obrázkov
import bgAsian from '../assets/backgrounds/bg-asian.jpg';
import bgMexican from '../assets/backgrounds/bg-mexican.jpg';
import bgItalian from '../assets/backgrounds/bg-italian.jpg';
import bgAmerican from '../assets/backgrounds/bg-american.png';

// ⬅️ PRIDANÉ (tácka na hotové jedlo)
import trayImg from '../assets/restaurant/tray.svg';

const props = defineProps(['levelId', 'cuisineType']);
const emit = defineEmits(['back']);

// --- LOGIKA HRY ---
const onPlate = ref([]);
const score = ref(0);

const cuisineData = computed(() => gameData[props.cuisineType]);

const getIcon = (name) => ingredientIcons[name] || "📦";

const handleIngredientSelect = (ingName) => {
  // nechávam tvoje správanie + blok počas varenia
  if (onPlate.value.length < 6 && !cooking.value) {
    onPlate.value.push(ingName);
  }
};

const clearPlate = () => {
  if (!cooking.value) onPlate.value = [];
};

/* =========================
   OBJEDNÁVKA + VARENIE
========================= */
const currentOrder = ref(null);      
const cooking = ref(false);         
const cookProgress = ref(0);        
const servedMeal = ref(null);       

const COOK_TIME = 5000;              
let cookRaf = null;

const sameIngredients = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
};

const servePlate = () => {
  if (cooking.value) return;
  if (!currentOrder.value) return;        // ešte nemáme objednávku
  if (onPlate.value.length === 0) return; // nič na tanieri
  if (servedMeal.value) return;           // už máme hotové jedlo na tácke

  // spusti varenie
  cooking.value = true;
  cookProgress.value = 0;

  const start = performance.now();

  const tick = (now) => {
    const elapsed = now - start;
    cookProgress.value = Math.min(100, (elapsed / COOK_TIME) * 100);

    if (elapsed < COOK_TIME) {
      cookRaf = requestAnimationFrame(tick);
    } else {
      finishCooking();
    }
  };

  cookRaf = requestAnimationFrame(tick);
};

const finishCooking = () => {
  cooking.value = false
  cookProgress.value = 0

  const recipes = cuisineData.value.recipes

  // 1️⃣ nájdi recept podľa ingrediencií
  const matchedRecipe = recipes.find(r =>
    sameIngredients(onPlate.value, r.ingredients)
  )

  if (!matchedRecipe) {
    // ❌ žiadny recept neexistuje
    servedMeal.value = {
      name: 'Nepodarené jedlo',
      correct: false,
      points: 0
    }
  } else if (matchedRecipe.name === currentOrder.value.name) {
    // ✅ správne jedlo
    servedMeal.value = {
      name: matchedRecipe.name,
      correct: true,
      points: matchedRecipe.points
    }
  } else {
    // ⚠️ iné existujúce jedlo
    servedMeal.value = {
      name: matchedRecipe.name,
      correct: false,
      points: 0
    }
  }

  onPlate.value = []
}

onUnmounted(() => {
  if (cookRaf) cancelAnimationFrame(cookRaf);
});

/* =========================
   DRAG & DROP SUROVÍN
========================= */
const plateRef = ref(null)

const handleDropIngredient = ({ ingredient, x, y }) => {
  if (cooking.value) return;
  const plate = plateRef.value.getBoundingClientRect()

  if (
    x >= plate.left &&
    x <= plate.right &&
    y >= plate.top &&
    y <= plate.bottom
  ) {
    if (onPlate.value.length < 6) {
      onPlate.value.push(ingredient)
    }
  }
}

/* =========================
   DRAG & DROP HOTOVÉHO JEDLA
========================= */
const customerRef = ref(null);
const customerKey = ref(0);

const draggingServed = ref(false);
const servedGhostX = ref(0);
const servedGhostY = ref(0);

const startDragServed = (e) => {
  if (!servedMeal.value) return;

  draggingServed.value = true;
  servedGhostX.value = e.clientX;
  servedGhostY.value = e.clientY;

  window.addEventListener('mousemove', onMoveServed);
  window.addEventListener('mouseup', onDropServed);
};

const onMoveServed = (e) => {
  servedGhostX.value = e.clientX;
  servedGhostY.value = e.clientY;
};

const onDropServed = (e) => {
  const rect = customerRef.value?.getRect?.();
  const droppedOnCustomer =
    rect &&
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (droppedOnCustomer && servedMeal.value) {

  if (servedMeal.value.correct) {
    score.value += servedMeal.value.points

    customerRef.value?.react?.(
      `Ďakujem! +${servedMeal.value.points} bodov`
    )
  } else {
    customerRef.value?.react?.(`NIE TO SOM CHCEL!`)
  }

  servedMeal.value = null
  currentOrder.value = null

  // nový zákazník po odchode
  setTimeout(() => {
    customerKey.value += 1
  }, 1800)
}

  draggingServed.value = false;
  window.removeEventListener('mousemove', onMoveServed);
  window.removeEventListener('mouseup', onDropServed);
};

/* --- POZADIE --- */
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

    <div class="game">
      <Customer
        :key="customerKey"
        ref="customerRef"
        :cuisine="cuisineType"
        @order-ready="currentOrder = $event"
      />
    </div>

    <div class="counter-top">
      
      <div class="tray-system">
        <div class="plate" ref="plateRef">
          <div
            v-for="(ing, idx) in onPlate"
            :key="idx"
            class="ing-animated"
            :title="ing"
          >
            {{ getIcon(ing) }}
          </div>
          <p v-if="onPlate.length === 0" class="plate-empty">
            Položte suroviny...
          </p>
        </div>

        <!-- ⬅️ PRIDANÉ: SLIDER VARENIA (5s) -->
        <div v-if="cooking" class="cook-bar">
          <div class="cook-progress" :style="{ width: cookProgress + '%' }"></div>
        </div>

        <div class="plate-actions">
          <button
            @click="clearPlate"
            class="btn-action clear"
            :disabled="onPlate.length === 0 || cooking"
          >
            🗑️
          </button>
          <button
            @click="servePlate"
            class="btn-action serve"
            :disabled="onPlate.length === 0 || cooking || servedMeal"
          >
            ZVONIŤ 🛎️
          </button>
        </div>
      </div>

    </div>

    <!-- ⬅️ PRIDANÉ: HOTOVÉ JEDLO NA TÁCKE (DRAGGABLE) -->
    <div
      v-if="servedMeal"
      class="served-meal"
      :style="{ opacity: draggingServed ? 0 : 1 }"
      @mousedown.prevent="startDragServed"
      title="Potiahni k zákazníkovi"
    >
      <div class="served-label">{{ servedMeal.name }}</div>
      <img :src="trayImg" alt="tray" />
    </div>

    <!-- 👻 GHOST PRE DRAG SERVED-MEAL -->
    <Teleport to="body">
      <div
        v-if="draggingServed"
        class="served-ghost"
        :style="{ left: servedGhostX + 'px', top: servedGhostY + 'px' }"
      >
        <div class="served-label ghost-label">{{ servedMeal?.name }}</div>
        <img :src="trayImg" alt="tray" />
      </div>
    </Teleport>

    <IngredientsMenu 
      :ingredients="cuisineData.ingredients" 
      @select-ingredient="handleIngredientSelect"
      @drop-ingredient="handleDropIngredient"
    />

    <RecipesMenu 
      :recipes="cuisineData.recipes" 
    />

  </div>
</template>

<style scoped>

.game {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

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

/* =========================
   ⬅️ PRIDANÉ ŠTÝLY (NECHÁVAJÚ TVOJE NEDOTKNUTÉ)
========================= */

.cook-bar {
  width: 320px;
  height: 14px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 7px;
  overflow: hidden;
  border: 2px solid rgba(0,0,0,0.15);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

.cook-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff9800, #2ecc71);
  transition: width 0.05s linear;
}

/* HOTOVÉ JEDLO NA PULTE – TU SI MENÍŠ POZÍCIU A VEĽKOSŤ */
.served-meal {
  position: absolute;
  right: 64%;
  bottom: 46%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: grab;
  user-select: none;
}

.served-meal:active { cursor: grabbing; }

.served-label {
  background: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: bold;
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
}

.served-meal img {
  width: 70px;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,0.3));
}

/* GHOST POČAS DRAG */
.served-ghost {
  position: fixed;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 999999;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,0.35));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.served-ghost img {
  width: 70px;
}

.ghost-label {
  font-size: 14px;
}
</style>