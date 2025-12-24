<script setup>
import { ref, computed } from 'vue'
import { ingredientIcons } from '../utils/icons'

const props = defineProps({
  ingredients: { type: Array, required: true }
})

// Odstránil som select-ingredient, zostáva len drop
const emit = defineEmits(['drop-ingredient'])

const isOpen = ref(false)
const currentPage = ref(0)

/* ===== DRAG STATE ===== */
const dragging = ref(false)
const draggedIngredient = ref(null)
const ghostX = ref(0)
const ghostY = ref(0)

/* ===== ICON ===== */
const getIcon = (name) => ingredientIcons[name] || '📦'

/* ===== PAGING ===== */
const displayedIngredients = computed(() => {
  const start = currentPage.value * 10
  return props.ingredients.slice(start, start + 10)
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const nextPage = () => {
  currentPage.value = currentPage.value === 0 ? 1 : 0
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
          @mousedown.prevent="startDrag($event, ing)"
        >
          <div class="ing-icon">{{ getIcon(ing) }}</div>
          <span class="ing-name">{{ ing }}</span>
        </div>
      </div>

      <div v-if="ingredients.length > 10" class="menu-footer">
        <span class="page-info">{{ currentPage + 1 }} / {{ Math.ceil(ingredients.length / 10) }}</span>
  
        <button class="nav-btn" @click="nextPage">
        {{ (currentPage + 1) * 10 < ingredients.length ? '➡' : '⬅' }}
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
  cursor: grab; /* Zmenené na grab pre vizuálnu spätnú väzbu */
  transition: all 0.2s;
  user-select: none;
}

.ing-item:active { cursor: grabbing; }

.ing-item:hover {
  transform: translateY(-3px);
  border-color: #ff9800;
  background: #fffdf9;
}

.ing-icon { font-size: 28px; margin-bottom: 2px; pointer-events: none; }
.ing-name { font-size: 10px; text-align: center; font-weight: bold; color: #5d4037; padding: 0 5px; pointer-events: none; }

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

.drag-ghost {
  position: fixed;
  pointer-events: none;
  font-size: 45px;
  transform: translate(-50%, -50%);
  z-index: 999999;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
}
</style>