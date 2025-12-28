<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gameData from '../data/gameData.json'
import levels from '@/data/levels.json'

import IngredientsMenu from './IngredientsMenu.vue'
import RecipesMenu from './RecipesMenu.vue'
import Customer from './Customers.vue'
import { ingredientIcons } from '../utils/icons'

import bgAsian from '../assets/backgrounds/bg-asian.png'
import bgMexican from '../assets/backgrounds/bg-mexican.png'
import bgItalian from '../assets/backgrounds/bg-italian.png'
import bgAmerican from '../assets/backgrounds/bg-american.png'

import { updateLevelResult } from '@/utils/progress'
import trayImg from '../assets/restaurant/tray.svg'
import tackaImg from '../assets/restaurant/tacka_hranata.png'

const props = defineProps(['levelId', 'cuisineType'])
const emit = defineEmits(['back'])

/* =====================
   UKONČENIE LEVELU
===================== */
const levelEnded = ref(false)

const endLevel = () => {
  if (levelEnded.value) return
  levelEnded.value = true

  // 🔑 globálny → lokálny level
  const localLevel = ((props.levelId - 1) % 4) + 1

  updateLevelResult(
    props.cuisineType, // 'asian'
    localLevel,        // 1–4
    stars.value
  )

  setTimeout(() => {
    emit('back')
  }, 1500)
}

/* =====================
   LEVEL CONFIG
===================== */
const cuisineLevels = computed(() => {
  return levels[props.cuisineType]?.levels || []
})

const currentLevelConfig = computed(() => {
  return cuisineLevels.value.find(l => l.level === props.levelId)
})

const allowedRecipeIds = computed(() => {
  return cuisineLevels.value
    .filter(l => l.level <= props.levelId)
    .flatMap(l => l.recipes)
})

/* =====================
   DATA Z KUCHYNE
===================== */
const cuisineData = computed(() => gameData[props.cuisineType])

const allowedRecipes = computed(() => {
  if (!cuisineData.value) return []
  return cuisineData.value.recipes.filter(r =>
    allowedRecipeIds.value.includes(r.id)
  )
})

const allowedIngredients = computed(() => {
  const set = new Set()
  allowedRecipes.value.forEach(r =>
    r.ingredients.forEach(i => set.add(i))
  )
  return Array.from(set)
})

const getIcon = (n) => ingredientIcons[n] || '📦'

/* =====================
   STAVY HRY
===================== */
const onPlate = ref([])
const score = ref(0)

const cooking = ref(false)
const cookProgress = ref(0)

/* =====================
   INGREDIENCIE
===================== */
const plateRef = ref(null)

const handleIngredientSelect = (ing) => {
  if (levelEnded.value) return
  if (!cooking.value && onPlate.value.length < 6) {
    onPlate.value.push(ing)
  }
}

const handleDropIngredient = ({ ingredient, x, y }) => {
  if (levelEnded.value || cooking.value || !plateRef.value) return
  const r = plateRef.value.getBoundingClientRect()

  if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
    if (onPlate.value.length < 6) {
      const posX = ((x - r.left) / r.width) * 100
      const posY = ((y - r.top) / r.height) * 100
      
      onPlate.value.push({
        name: ingredient,
        x: posX,
        y: posY
      })
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

const servedMeals = ref([])

const servePlate = () => {
  if (levelEnded.value || cooking.value || onPlate.value.length === 0) return

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

  const ingredientNamesOnPlate = onPlate.value.map(i => i.name)

  const found = allowedRecipes.value.find(r =>
    sameIngredients(ingredientNamesOnPlate, r.ingredients)
  )

  servedMeals.value.push({
    id: Date.now() + Math.random(),
    name: found ? found.name : 'Nepodarené jedlo',
    correct: !!found,
    points: found?.points || 0,
    x: null,
    y: null,
    dragging: false,
    offsetX: 0,
    offsetY: 0
  })

  onPlate.value = []
}

/* =====================
   ZÁKAZNÍCI
===================== */
const customers = ref([])
const customerRefs = ref({})
const customerOrders = ref({})

let spawnTimer = null

const spawnCustomer = () => {
  if (levelEnded.value || !currentLevelConfig.value) return
  if (customers.value.length >= currentLevelConfig.value.maxCustomers) return

  customers.value.push({
    id: Date.now() + Math.random(),
    cuisine: props.cuisineType
  })
}

const scheduleNextCustomer = () => {
  if (levelEnded.value || !currentLevelConfig.value) return

  const { min, max } = currentLevelConfig.value.spawnInterval
  const delay = (min + Math.random() * (max - min)) * 1000

  spawnTimer = setTimeout(() => {
    spawnCustomer()
    scheduleNextCustomer()
  }, delay)
}

const removeCustomer = (id) => {
  // odstráni zákazníka z fronty
  customers.value = customers.value.filter(c => c.id !== id)

  // vyčistí referencie
  delete customerOrders.value[id]
  delete customerRefs.value[id]

  // ⏭️ POKRAČUJ V SPAWNE
  if (!levelEnded.value) {
    scheduleNextCustomer()
  }
}

/* =====================
   DRAG & DROP TÁCKY
===================== */
const draggedMeal = ref(null)

const startDragServed = (meal, e) => {
  if (levelEnded.value) return
  draggedMeal.value = meal
  meal.dragging = true

  const rect = e.currentTarget.getBoundingClientRect()
  meal.offsetX = e.clientX - rect.left
  meal.offsetY = e.clientY - rect.top

  window.addEventListener('mousemove', moveDrag)
  window.addEventListener('mouseup', dropDrag)
}

const moveDrag = (e) => {
  if (!draggedMeal.value) return
  draggedMeal.value.x = e.clientX - draggedMeal.value.offsetX
  draggedMeal.value.y = e.clientY - draggedMeal.value.offsetY
}

const dropDrag = (e) => {
  window.removeEventListener('mousemove', moveDrag)
  window.removeEventListener('mouseup', dropDrag)

  const meal = draggedMeal.value
  if (!meal) return
  meal.dragging = false

  const hitCustomer = customers.value.find(c => {
    const comp = customerRefs.value[c.id]
    const r = comp?.getRect?.()
    return r &&
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
  })

  if (!hitCustomer) {
    draggedMeal.value = null
    return
  }

  const order = customerOrders.value[hitCustomer.id]
  const comp = customerRefs.value[hitCustomer.id]
  if (!comp || !order) return

  if (meal.correct && meal.name === order.name) {
    score.value += meal.points
    comp.react('happy')
  } else {
    comp.react('angry')
  }

  servedMeals.value = servedMeals.value.filter(m => m.id !== meal.id)
  draggedMeal.value = null
}

/* =====================
   TIMER
===================== */
const timeLeft = ref(0)
let timerInterval = null

onMounted(() => {
  if (currentLevelConfig.value) {
    timeLeft.value = currentLevelConfig.value.timeLimit
    startTimer()
    scheduleNextCustomer()
  }
})

const startTimer = () => {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else {
      clearInterval(timerInterval)
      endLevel()
    }
  }, 1000)
}

const timeProgress = computed(() => {
  if (!currentLevelConfig.value) return 0
  return (timeLeft.value / currentLevelConfig.value.timeLimit) * 100
})

const formattedTime = computed(() => {
  const min = Math.floor(timeLeft.value / 60)
  const sec = timeLeft.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

/* =====================
   LEVEL PROGRESS
===================== */
const levelProgress = computed(() => {
  if (!currentLevelConfig.value) return 0
  const max = currentLevelConfig.value.requiredScore * 1.6
  return Math.min(100, (score.value / max) * 100)
})

const stars = computed(() => {
  if (!currentLevelConfig.value) return 0
  const base = currentLevelConfig.value.requiredScore
  if (score.value >= base * 1.6) return 3
  if (score.value >= base * 1.3) return 2
  if (score.value >= base) return 1
  return 0
})

watch(stars, (val) => {
  if (val >= 3) endLevel()
})

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

onUnmounted(() => {
  if (spawnTimer) clearTimeout(spawnTimer)
  if (cookRAF) cancelAnimationFrame(cookRAF)
  clearInterval(timerInterval)
})
</script>



<template>
  <div class="game-container" :style="backgroundStyle">
    <div class="hud">
      <button @click="emit('back')" class="exit-btn">❌ Menu</button>
      <div class="level-info">
        Level {{ levelId }} | {{ cuisineType.toUpperCase() }}
      </div>
      
      <div class="level-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: levelProgress + '%' }" />
          <div class="stars-row">
            <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= stars }">★</span>
          </div>
        </div>
        <div class="score-text">
          {{ score }} / {{ currentLevelConfig.requiredScore }}
        </div>
      </div>
    </div>

    <div class="game">
      <div class="timer">
        <div class="timer-bar">
          <div class="timer-fill" :style="{ width: timeProgress + '%' }" />
        </div>
        <div class="timer-text">⏱️ {{ formattedTime }}</div>
      </div>

      <Customer
        v-for="(c, i) in customers"
        :key="c.id"
        :ref="el => customerRefs[c.id] = el"
        :cuisine="c.cuisine"
        :queueIndex="i"
        :allowedRecipes="allowedRecipes"
        @order-ready="order => customerOrders[c.id] = order"
        @left="removeCustomer(c.id)"
      />
    </div>

    <div class="counter-top">
      <div class="tray-system">
        <div v-if="cooking" class="cook-bar">
          <div class="cook-progress" :style="{ width: cookProgress + '%' }"></div>
        </div>

        <div class="plate" ref="plateRef">
          <img :src="tackaImg" class="tray-on-counter" />

          <div v-for="(ing, i) in onPlate" :key="i" class="ing-animated"
               :style="{ left: ing.x + '%', top: ing.y + '%', position: 'absolute' }">
            {{ getIcon(ing.name) }}
          </div>
        </div>
      </div>
    </div> <div
      v-for="(meal, index) in servedMeals"
      :key="meal.id"
      class="served-meal"
      :style="meal.dragging
        ? { position: 'fixed', left: meal.x + 'px', top: meal.y + 'px', zIndex: 999 }
        : { left: `calc(30% + ${index * 120}px)`, bottom: '46%' }"
      @mousedown.prevent="startDragServed(meal, $event)"
    >
      <div class="served-label">{{ meal.name }}</div>
      <img :src="trayImg" />
    </div>

    <IngredientsMenu
      :ingredients="allowedIngredients"
      :is-serve-disabled="cooking || onPlate.length === 0"
      @select-ingredient="handleIngredientSelect"
      @drop-ingredient="handleDropIngredient"
      @serve="servePlate"
    />

    <RecipesMenu :recipes="allowedRecipes" />
  </div>
</template>

<style scoped>

/* =========================================
   1. ZÁKLADNÝ LAYOUT A KONTAJNERY
   ========================================= */
.game-container, .game {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* =========================================
   2. HUD (Horná lišta, Skóre, Hviezdy)
   ========================================= */
.hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 25px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  backdrop-filter: blur(5px);
  z-index: 100;
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

.level-progress { width: 260px; }

.progress-bar {
  position: relative;
  height: 22px;
  background: rgba(255,255,255,0.25);
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff9800);
  transition: width 0.4s ease;
}

.stars-row {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 18px;
  padding-right: 16px;
  pointer-events: none;
}

.star {
  font-size: 20px;
  color: rgba(255,255,255,0.35);
  transition: all 0.3s ease;
}

.star.active {
  color: #ffd700;
  text-shadow: 0 0 6px rgba(255,215,0,0.9);
  transform: scale(1.25);
}

.score-text {
  margin-top: 4px;
  font-size: 12px;
  font-weight: bold;
  text-align: right;
  color: rgba(255,255,255,0.85);
}

/* =========================================
   3. ČASOVAČ (Timer)
   ========================================= */
.timer { margin-top: 8px; }

.timer-bar {
  height: 8px;
  background: rgba(255,255,255,0.25);
  border-radius: 6px;
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #f44336);
  transition: width 1s linear;
}

.timer-text {
  margin-top: 4px;
  font-size: 12px;
  text-align: right;
  color: rgba(255,255,255,0.85);
}

/* =========================================
   4. ZÁKAZNÍCI A INTERAKCIA
   ========================================= */
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

/* =========================================
   5. PRÍPRAVNÝ PULTOVÝ SYSTÉM (Tácka)
   ========================================= */
.counter-top {
  height: 40%;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* Aby neblokoval menu pod ním */
}

.tray-system {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  pointer-events: auto;
  margin-bottom: 20px; /* Jemné posunutie vyššie */
}

.plate {
  /* 1. Šírku teraz definujeme cez VH (viewport height) */
  /* Skúsime cca 35vh až 40vh, aby na mobile vyzerala dostatočne veľká */
  width: clamp(160px, 38vh, 320px); 
  
  /* 2. Poistka: Na extrémne úzkych mobiloch nesmie byť širšia ako 90% obrazovky */
  max-width: 90vw;

  /* Pomer strán 2:1 držíme stále */
  aspect-ratio: 2 / 1; 

  position: relative;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.tray-on-counter {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: fill; 
  z-index: 1;
  pointer-events: none;
}

/* SUROVINY NA TÁCKE - Tiež zmenšené */
.ing-animated {
  z-index: 5;
  /* Suroviny teraz tiež škálujeme podľa výšky (vh) */
  font-size: clamp(20px, 4vh, 35px); 
  filter: drop-shadow(1.5px 1.5px 0px rgba(0,0,0,0.1));
  transform: translate(-50%, -50%);
  position: absolute;
  pointer-events: none;
}

.plate-empty { color: #323232; font-style: italic; font-size: 0.8rem; }

/* =========================================
   6. VARENIE A SERVÍROVANIE
   ========================================= */
.cook-bar {
  /* Lišta varenia sa tiež prispôsobí výške */
  width: clamp(100px, 25vh, 180px);
  height: clamp(6px, 1.2vh, 10px);
  background: white;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid rgba(0,0,0,0.15);
}

.cook-progress {
  height: 100%;
  background: linear-gradient(90deg, #ff9800, #2ecc71);
}

/* JEDLO PRIPRAVENÉ NA ODDOVZDANIE */
.served-meal {
  position: absolute;
  right: 64%;
  bottom: 46%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: grab;
  z-index: 50;
}

.served-meal img {
  width: 60px;
  filter: drop-shadow(0 8px 15px rgba(0,0,0,0.3));
}

.served-label {
  background: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

/* GHOST PRI ŤAHANÍ */
.served-ghost {
  position: fixed;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.served-ghost img { width: 60px; }

/* =========================================
   7. TLAČIDLÁ A AKCIE
   ========================================= */
.serve {
  width: 70px;
  height: 70px;
  border-radius: 15px;
  border: 4px solid #fff;
  background: #2ecc71;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 #27ae60;
  transition: all 0.1s;
  cursor: pointer;
}

.serve:disabled {
  background: #bdc3c7;
  box-shadow: 0 4px 0 #95a5a6;
  opacity: 0.6;
}

.serve:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #27ae60;
}

.btn-action {
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  color: white;
}


</style>