<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gameData from '../data/gameData.json'
import IngredientsMenu from './IngredientsMenu.vue'
import RecipesMenu from './RecipesMenu.vue'
import Customer from './Customers.vue'
import { ingredientIcons } from '../utils/icons'

import bgAsian from '../assets/backgrounds/bg-asian.jpg'
import bgMexican from '../assets/backgrounds/bg-mexican.jpg'
import bgItalian from '../assets/backgrounds/bg-italian.jpg'
import bgAmerican from '../assets/backgrounds/bg-american.png'

import trayImg from '../assets/restaurant/tray.svg'

const props = defineProps(['levelId', 'cuisineType'])
const emit = defineEmits(['back'])

/* =====================
   STAVY
===================== */
const onPlate = ref([])
const score = ref(0)

const cooking = ref(false)
const cookProgress = ref(0)

const servedMeals = ref([]) // viac taccok
const draggedMeal = ref(null)

const dragging = ref(false)
const ghostX = ref(0)
const ghostY = ref(0)

/* =====================
   DATA
===================== */
const cuisineData = computed(() => gameData[props.cuisineType])
const getIcon = (n) => ingredientIcons[n] || '📦'

/* =====================
   INGREDIENCIE
===================== */
const handleIngredientSelect = (ing) => {
  if (!cooking.value && onPlate.value.length < 6) {
    onPlate.value.push(ing)
  }
}

const plateRef = ref(null)

const handleDropIngredient = ({ ingredient, x, y }) => {
  if (cooking.value || !plateRef.value) return
  const r = plateRef.value.getBoundingClientRect()

  if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
    if (onPlate.value.length < 6) {
      onPlate.value.push(ingredient)
    }
  }
}

/* =====================
   VARENIE
===================== */
const COOK_TIME = 5000
let cookRAF = null

const sameIngredients = (a, b) => {
  if (!a || !b || a.length !== b.length) return false
  return [...a].sort().every((v, i) => v === [...b].sort()[i])
}

const servePlate = () => {
  if (cooking.value || onPlate.value.length === 0) return

  cooking.value = true
  cookProgress.value = 0

  const start = performance.now()

  const tick = (now) => {
    cookProgress.value = Math.min(100, ((now - start) / COOK_TIME) * 100)
    if (now - start < COOK_TIME) {
      cookRAF = requestAnimationFrame(tick)
    } else {
      finishCooking()
    }
  }

  cookRAF = requestAnimationFrame(tick)
}

const finishCooking = () => {
  cooking.value = false
  cookProgress.value = 0

  const recipes = cuisineData.value.recipes
  const found = recipes.find(r =>
    sameIngredients(onPlate.value, r.ingredients)
  )

  servedMeals.value.push({
    id: Date.now() + Math.random(),
    name: found ? found.name : 'Nepodarené jedlo',
    correct: false,
    points: found?.points || 0
  })

  onPlate.value = []
}

/* =====================
   ZÁKAZNÍCI (VIAC)
===================== */
const customers = ref([])
const customerRefs = ref({})
const customerOrders = ref({})

let spawnTimer = null

const MAX_CUSTOMERS = 4

const spawnCustomer = () => {
  if (customers.value.length >= MAX_CUSTOMERS) return

  customers.value.push({
    id: Date.now() + Math.random(),
    cuisine: props.cuisineType
  })
}

const scheduleNextCustomer = () => {
  const delay = 5000 + Math.random() * 10000
  spawnTimer = setTimeout(() => {
    spawnCustomer()
    scheduleNextCustomer()
  }, delay)
}

/* =====================
   DRAG TÁCKY
===================== */
const startDragServed = (meal, e) => {
  draggedMeal.value = meal
  dragging.value = true
  ghostX.value = e.clientX
  ghostY.value = e.clientY

  window.addEventListener('mousemove', moveDrag)
  window.addEventListener('mouseup', dropDrag)
}

const moveDrag = (e) => {
  ghostX.value = e.clientX
  ghostY.value = e.clientY
}

const dropDrag = (e) => {
  dragging.value = false
  window.removeEventListener('mousemove', moveDrag)
  window.removeEventListener('mouseup', dropDrag)

  if (!draggedMeal.value) return

  // 🔍 nájdi zákazníka, na ktorého si dropol
  const hitCustomer = customers.value.find(c => {
    const comp = customerRefs.value[c.id]
    const r = comp?.getRect?.()
    if (!r) return false

    return (
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    )
  })

  if (!hitCustomer) {
    draggedMeal.value = null
    return
  }

  const order = customerOrders.value[hitCustomer.id]
  const comp = customerRefs.value[hitCustomer.id]

  if (draggedMeal.value.name === order.name) {
    score.value += draggedMeal.value.points
    comp.react(`Ďakujem! +${draggedMeal.value.points}`)
  } else {
    comp.react('NIE TO SOM CHCEL!')
  }

  // 🧹 odstráň tácku hneď
  servedMeals.value = servedMeals.value.filter(
    m => m.id !== draggedMeal.value.id
  )

  // ⏳ ODLOŽ ODCHOD ZÁKAZNÍKA
  setTimeout(() => {
    customers.value = customers.value.filter(c => c.id !== hitCustomer.id)
    delete customerOrders.value[hitCustomer.id]
  }, 2500) // musí byť ≥ čas react() animácie

  draggedMeal.value = null
}


/* =====================
   POZADIE
===================== */
const backgrounds = {
  asian: bgAsian,
  mexican: bgMexican,
  italian: bgItalian,
  american: bgAmerican
}

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${backgrounds[props.cuisineType]})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}))

onMounted(() => {
  scheduleNextCustomer()
})

onUnmounted(() => {
  if (spawnTimer) clearTimeout(spawnTimer)
  if (cookRAF) cancelAnimationFrame(cookRAF)
})
</script>

<template>
  <div class="game-container" :style="backgroundStyle">
    <div class="hud">
      <button @click="emit('back')" class="exit-btn">❌ Menu</button>
      <div class="level-info">
        Level {{ levelId }} | {{ cuisineType.toUpperCase() }}
      </div>
      <div class="score-box">Body: {{ score }}</div>
    </div>

    <!-- ZÁKAZNÍCI -->
    <div class="game">
      <Customer
        v-for="(c, i) in customers"
        :key="c.id"
        :ref="el => customerRefs[c.id] = el"
        :cuisine="c.cuisine"
        :queueIndex="i"
        @order-ready="order => customerOrders[c.id] = order"
      />
    </div>

    <!-- PULT -->
    <div class="counter-top">
      <div class="tray-system">
        <div class="plate" ref="plateRef">
          <div v-for="(ing, i) in onPlate" :key="i" class="ing-animated">
            {{ getIcon(ing) }}
          </div>
          <p v-if="onPlate.length === 0" class="plate-empty">
            Položte suroviny...
          </p>
        </div>

        <div v-if="cooking" class="cook-bar">
          <div class="cook-progress" :style="{ width: cookProgress + '%' }" />
        </div>

        <div class="plate-actions">
          <button class="btn-action serve" @click="servePlate">
            ZVONIŤ 🛎️
          </button>
        </div>
      </div>
    </div>

    <!-- TÁCKY -->
    <div
      v-for="(meal, index) in servedMeals"
      :key="meal.id"
      class="served-meal"
      :style="{ right: `calc(65% - ${index * 100}px)` }"
      @mousedown.prevent="startDragServed(meal, $event)"
    >
      <div class="served-label">{{ meal.name }}</div>
      <img :src="trayImg" />
    </div>

    <!-- GHOST -->
    <Teleport to="body">
      <div
        v-if="dragging"
        class="served-ghost"
        :style="{ left: ghostX + 'px', top: ghostY + 'px' }"
      >
        <div class="served-label">{{ draggedMeal?.name }}</div>
        <img :src="trayImg" />
      </div>
    </Teleport>

    <IngredientsMenu
      :ingredients="cuisineData.ingredients"
      @select-ingredient="handleIngredientSelect"
      @drop-ingredient="handleDropIngredient"
    />

    <RecipesMenu :recipes="cuisineData.recipes" />
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