<script setup>
import { ref, computed } from 'vue'
import { ingredientIcons } from '../utils/icons'


const props = defineProps({
  ingredients: { type: Array, required: true },
  isServeDisabled: { type: Boolean, default: false }
})

const emit = defineEmits(['drop-ingredient', 'serve', 'select-ingredient']);

const isOpen = ref(false)
const currentPage = ref(0)
const itemsPerPage = 10;

/* ===== DRAG STATE ===== */
const dragging = ref(false)
const draggedIngredient = ref(null)
const ghostX = ref(0)
const ghostY = ref(0)

/* ===== ICON ===== */
const getIcon = (name) => ingredientIcons[name] || '📦'

/* ===== PAGING ===== */
const displayedIngredients = computed(() => {
  const start = currentPage.value * itemsPerPage
  return props.ingredients.slice(start, start + itemsPerPage)
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const nextPage = () => {
  // OPRAVA: Dynamický výpočet strán namiesto natvrdo 0 / 1
  if ((currentPage.value + 1) * itemsPerPage < props.ingredients.length) {
    currentPage.value++
  } else {
    currentPage.value = 0
  }
}

/* ===== DRAG LOGIKA (Iba Drag & Drop) ===== */
const startDrag = (e, ing) => {
  dragging.value = true
  draggedIngredient.value = ing
  ghostX.value = e.clientX
  ghostY.value = e.clientY

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onDrop)
}

const onMove = (e) => {
  ghostX.value = e.clientX
  ghostY.value = e.clientY
}

const onDrop = (e) => {
  // Vždy vyšleme pozíciu dropu tam, kde je myš v momente pustenia
  emit('drop-ingredient', {
    ingredient: draggedIngredient.value,
    x: e.clientX,
    y: e.clientY
  })

  dragging.value = false
  draggedIngredient.value = null

  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onDrop)
}
</script>

<template>
  <div class="ingredients-system">
    <div v-if="!isOpen" class="triggers-wrapper">
      <button class="open-trigger" @click="toggleMenu">
        <span class="icon">🥫</span>
        <!--<span class="label">Suroviny</span> -->
      </button>
    </div>

    <button 
      class="serve-btn" 
      :class="{ 'shifted': isOpen }"
      @click="$emit('serve')" 
      :disabled="isServeDisabled"
    >
      🛎️
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
          @mousedown.prevent="startDrag($event, ing)"
        >
          <div class="ing-icon">{{ getIcon(ing) }}</div>
          <span class="ing-name">{{ ing }}</span>
        </div>
      </div>

      <div v-if="props.ingredients.length > itemsPerPage" class="menu-footer">
      <span class="page-info">
        {{ currentPage + 1 }} / {{ Math.ceil(props.ingredients.length / itemsPerPage) }}
      </span>

      <button class="nav-btn" @click="nextPage">
        {{ (currentPage + 1) * itemsPerPage < props.ingredients.length ? '➡' : '⬅' }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="dragging"
        class="drag-ghost"
        :style="{ left: ghostX + 'px', top: ghostY + 'px' }"
      >
        {{ getIcon(draggedIngredient) }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* =========================================
   1. ZÁKLADNÝ KONTAJNER A SPOLEČNÉ TLAČIDLÁ
   ========================================= */
.ingredients-system {
  position: relative;
  z-index: 1000;
}

/* Obal pre tlačidlá v zatvorenom stave */
.triggers-wrapper {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

/* Spoločný základ pre hlavné ovládacie tlačidlá */
.open-trigger, .serve-btn {
  width: 80px;
  height: 80px;
  border-radius: 15px;
  border: 4px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.open-trigger:hover, .serve-btn:hover:not(:disabled) {
  transform: translateY(-5px);
  filter: brightness(1.1);
}

/* Tlačidlo Suroviny 🥫 */
.open-trigger {
  background: #ff9800;
}

.open-trigger .icon {
  font-size: 2.2rem;
  line-height: 1;
}

/* Tlačidlo Zvoniť 🛎️ */
.serve-btn {
  position: fixed;
  bottom: 20px;
  left: 115px; /* Základná pozícia: 20 (okraj) + 80 (tlačidlo) + 15 (gap) */
  background: #2ecc71;
  font-size: 2.5rem;
}

.serve-btn.shifted {
  left: 275px; /* Posun keď je menu otvorené */
  transform: scale(0.9);
}

.serve-btn:disabled {
  background: #bdc3c7;
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

/* =========================================
   2. ŠPAJZA (SIDE MENU) - KONTAJNER
   ========================================= */
.side-menu {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 240px;
  height: 520px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  border: 4px solid #5d4037;
  display: flex;
  flex-direction: column;
  box-shadow: 5px 5px 25px rgba(0,0,0,0.5);
  z-index: 1100;
  overflow: hidden; /* Dôležité: udrží obsah vnútri hnedého rámu */
}

.menu-header {
  flex-shrink: 0;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #5d4037;
  color: white;
}

.menu-header h3 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 1px;
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

.close-btn:hover { background: rgba(255,255,255,0.4); }

/* =========================================
   3. MRIEŽKA SO SUROVINAMI (GRID)
   ========================================= */
.ingredients-grid {
  flex: 1; /* Zaberie zvyšok miesta medzi hlavou a pätou */
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(5, 1fr);
  gap: 10px;
  padding: 12px;
  overflow-y: auto;
}

.ing-item {
  background: #fff;
  border: 2px solid #eee;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.ing-item:active { cursor: grabbing; }

.ing-item:hover {
  transform: scale(1.05);
  border-color: #ff9800;
  background: #fffdf9;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.ing-icon { font-size: 32px; margin-bottom: 2px; pointer-events: none; }

.ing-name { 
  font-size: 11px; 
  text-align: center; 
  font-weight: 800; 
  color: #5d4037; 
  padding: 0 5px; 
  pointer-events: none;
  text-transform: uppercase;
}

/* =========================================
   4. PÄTA (STRÁNKOVANIE)
   ========================================= */
.menu-footer {
  flex-shrink: 0; /* Nikdy sa nezmenší */
  height: 60px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #eee;
  background: white;
}

.nav-btn {
  background: #ff9800;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 3px 0 #e68a00;
}

.nav-btn:active { transform: translateY(2px); box-shadow: none; }

.page-info { font-size: 14px; color: #5d4037; font-weight: 900; }

/* =========================================
   5. OSTATNÉ (GHOST, RESPONZIVITA)
   ========================================= */
.drag-ghost {
  position: fixed;
  pointer-events: none;
  font-size: 50px;
  transform: translate(-50%, -50%);
  z-index: 999999;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));
}

@media (max-width: 900px) and (orientation: landscape) {
  .triggers-wrapper { gap: 0px; }

  .open-trigger, .serve-btn {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }

  .serve-btn.shifted { left: 350px; }

  .side-menu {
    width: 300px;
    height: 90vh;
    bottom: 0;
    left: 0;
    border-radius: 20px 20px 0 0;
  }

  .ingredients-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 4px;
    padding: 8px;
  }

  .ing-icon { font-size: 22px; }
  .ing-name { font-size: 9px; }
}
</style>