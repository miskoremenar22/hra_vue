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
      <!-- <span class="label">Recepty</span> -->
    </button>

    <div v-if="isOpen" class="side-menu">
      <div class="menu-header">
        <h3>Recepty</h3>
        <button class="close-btn" @click="isOpen = false">✕</button>
        
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

      <div v-if="recipes.length > itemsPerPage" class="menu-footer">
        <span class="page-info">
          {{ currentPage + 1 }} / {{ Math.ceil(recipes.length / itemsPerPage) }}
        </span>
        <button class="next-btn" @click="nextPage">
          {{ (currentPage + 1) * itemsPerPage < recipes.length ? '➡' : '⬅' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recipes-system { position: absolute; bottom: 20px; right: 20px; z-index: 100; }

.open-trigger {
  width: 80px; height: 80px; border-radius: 15px; border: 4px solid #fff;
  background: #4caf50; font-size: 2.5rem; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}

.open-trigger .label { font-size: 10px; color: white; font-weight: bold; }

.side-menu {
  width: 280px;
  height: 500px;
  background: white; /* Čisté biele pozadie pre vnútro */
  border-radius: 20px;
  border: 3px solid #2e7d32;
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 20px;
  right: 20px;
  box-shadow: -5px 5px 20px rgba(0,0,0,0.3);
  overflow: hidden; /* Dôležité: aby nič nepretekalo cez zaoblené rohy */
}

.menu-header {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Toto rozdelí nadpis a X na kraje */
  background: #2e7d32;
  color: white;
}

.recipes-list {
  flex-grow: 1; /* Vyplní priestor medzi headerom a footerom */
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fdfdfd; /* Jemne odlíšené pozadie zoznamu */
}

/* UPRAVENÝ FOOTER */
.menu-footer {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between; /* Text vľavo, šípka vpravo */
  align-items: center;
  background: #f1f8e9; /* Svetlozelený podklad päty */
  border-top: 2px solid #c8e6c9; /* Deliaca čiara od zoznamu */
}

.page-info {
  font-size: 13px;
  color: #2e7d32;
  font-weight: bold;
}

.next-btn {
  background: #4caf50;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 0.2s;
}

.next-btn:active {
  transform: scale(0.9);
}

.close-btn {
  background: rgba(255,255,255,0.2); 
  border: none; 
  color: white; 
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px; 
  cursor: pointer; 
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255,255,255,0.4);
}

.close-btn:active {
  transform: scale(0.9);
}

/* =========================
   MOBILE LANDSCAPE – RECEPTY
========================= */
@media (max-width: 900px) and (orientation: landscape) {

  .recipes-system {
    bottom: 10px;
    right: 10px;
  }

  .open-trigger {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }

  .open-trigger .label {
    font-size: 9px;
  }

  .side-menu {
    width: 250px;
    height: 320px;
    bottom: 0;
    right: 0;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.25);
  }

  .menu-header {
    padding: 8px 12px;
    font-size: 14px;
  }

  .recipes-list {
    padding: 8px;
    gap: 6px;
    overflow-y: auto;
  }

  .menu-footer {
    padding: 6px 10px;
  }

  .page-info {
    font-size: 11px;
  }

  .next-btn {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  .close-btn {
    font-size: 18px;
    margin-right: 8px;
  }
}
</style>