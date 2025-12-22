<script setup>
import { ref, computed } from 'vue';
import { ingredientIcons } from '../utils/icons';

const props = defineProps({
  ingredients: { type: Array, required: true }
});

const emit = defineEmits(['select-ingredient']);

const isOpen = ref(false);
const currentPage = ref(0); // 0 = prvá strana, 1 = druhá strana

// Získanie ikony podľa názvu
const getIcon = (name) => ingredientIcons[name] || "📦";

// Výpočet pre 2 stĺpce x 5 riadkov
const displayedIngredients = computed(() => {
  const start = currentPage.value * 10;
  return props.ingredients.slice(start, start + 10);
});

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const nextPage = () => {
  currentPage.value = currentPage.value === 0 ? 1 : 0;
};
</script>

<template>
  <div class="ingredients-system">
    <button v-if="!isOpen" class="open-trigger" @click="toggleMenu">
      🥫
      <span class="label">Suroviny</span>
    </button>

    <div v-if="isOpen" class="side-menu">
      <div class="menu-header">
        <h3>Špajza</h3>
        <button class="close-btn" @click="toggleMenu">✕</button>
      </div>

      <div class="ingredients-grid">
        <div 
          v-for="ing in displayedIngredients" 
          :key="ing" 
          class="ing-item"
          @click="emit('select-ingredient', ing)"
        >
          <div class="ing-icon">{{ getIcon(ing) }}</div>
          <span class="ing-name">{{ ing }}</span>
        </div>
      </div>

      <div class="menu-footer">
        <span class="page-info">{{ currentPage + 1 }} / 2</span>
        <button class="nav-btn" @click="nextPage">
          {{ currentPage === 0 ? '➡' : '⬅' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ingredients-system {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
}

.open-trigger {
  width: 80px;
  height: 80px;
  border-radius: 15px;
  border: 4px solid #fff;
  background: #ff9800;
  font-size: 30px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.open-trigger .label { font-size: 10px; color: white; font-weight: bold; }

.side-menu {
  width: 240px;
  height: 520px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  border: 3px solid #5d4037;
  display: flex;
  flex-direction: column;
  box-shadow: 5px 5px 20px rgba(0,0,0,0.4);
  position: absolute;
  bottom: 0;
  left: 0;
}

.menu-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #5d4037;
  color: white;
  border-radius: 15px 15px 0 0;
}

.close-btn { background: none; border: none; color: white; font-size: 22px; cursor: pointer; }

.ingredients-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
  padding: 10px;
}

.ing-item {
  background: #fff;
  border: 2px solid #eee;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.ing-item:hover {
  transform: translateY(-3px);
  border-color: #ff9800;
  background: #fffdf9;
}

.ing-icon { font-size: 28px; margin-bottom: 2px; }
.ing-name { font-size: 10px; text-align: center; font-weight: bold; color: #5d4037; padding: 0 5px; }

.menu-footer {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-btn {
  background: #ff9800;
  border: none;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.page-info { font-size: 12px; color: #777; font-weight: bold; margin-left: 10px; }
</style>