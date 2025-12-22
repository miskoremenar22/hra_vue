<script setup>
import { ref, computed } from 'vue';
import { ingredientIcons } from '../utils/icons';

const props = defineProps(['recipes']);
const isOpen = ref(false);
const currentPage = ref(0);
const itemsPerPage = 5;

const displayedRecipes = computed(() => {
  const start = currentPage.value * itemsPerPage;
  return props.recipes.slice(start, start + itemsPerPage);
});

const getIcon = (name) => ingredientIcons[name] || "📦";

const nextPage = () => {
  if ((currentPage.value + 1) * itemsPerPage < props.recipes.length) currentPage.value++;
  else currentPage.value = 0;
};
</script>

<template>
  <div class="recipes-system">
    <button v-if="!isOpen" class="open-trigger" @click="isOpen = true">
      📖
      <span class="label">Recepty</span>
    </button>

    <div v-if="isOpen" class="side-menu">
      <div class="menu-header">
        <button class="close-btn" @click="isOpen = false">✕</button>
        <h3>Kuchárka</h3>
      </div>

      <div class="recipes-list">
        <div v-for="recipe in displayedRecipes" :key="recipe.id" class="recipe-item">
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-formula">
            <span v-for="ing in recipe.ingredients" :key="ing" :title="ing">
              {{ getIcon(ing) }}
            </span>
          </div>
        </div>
      </div>

      <div class="menu-footer">
        <button class="next-btn" @click="nextPage">➡</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipes-system { position: absolute; bottom: 20px; right: 20px; z-index: 100; }

.open-trigger {
  width: 80px; height: 80px; border-radius: 15px; border: 4px solid #fff;
  background: #4caf50; font-size: 30px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}

.open-trigger .label { font-size: 10px; color: white; font-weight: bold; }

.side-menu {
  width: 280px; height: 500px; background: rgba(255, 255, 255, 0.95);
  border-radius: 20px; border: 3px solid #2e7d32;
  display: flex; flex-direction: column; position: absolute; bottom: 0; right: 0;
}

.menu-header {
  padding: 15px; display: flex; align-items: center;
  background: #2e7d32; color: white; border-radius: 15px 15px 0 0;
}

.close-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; margin-right: 10px; }

.recipes-list { flex-grow: 1; padding: 10px; display: flex; flex-direction: column; gap: 8px; }

.recipe-item {
  background: #f1f8e9; padding: 10px; border-radius: 10px;
  border-bottom: 2px solid #c8e6c9;
}

.recipe-name { font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #1b5e20; }

.recipe-formula { font-size: 20px; letter-spacing: 5px; }

.menu-footer { padding: 10px; display: flex; justify-content: center; }

.next-btn {
  background: #4caf50; border: none; color: white;
  width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
}
</style>