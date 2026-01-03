<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gameData from '../data/gameData.json'
import levelsData from '@/data/levels.json'
import levels from '@/data/levels.json'

// Komponenty
import IngredientsMenu from './IngredientsMenu.vue'
import RecipesMenu from './RecipesMenu.vue'
import Customer from './Customers.vue'
import PauseMenu from './PauseMenu.vue' // Pridaný import

// Utility a aktíva
import { ingredientIcons } from '../utils/icons'
import { updateLevelResult, saveGameToStats } from '@/utils/progress'
import bgAsian from '../assets/backgrounds/bg-asian.png'
import bgMexican from '../assets/backgrounds/bg-mexican.png'
import bgItalian from '../assets/backgrounds/bg-italian.png'
import bgAmerican from '../assets/backgrounds/bg-american.png'
import trayImg from '../assets/restaurant/tray.svg'
import tackaImg from '../assets/restaurant/tacka_hranata.png'
import { incrementLevelAttempt } from '@/utils/progress'
import GameOverMenu from './GameOverMenu.vue'

const props = defineProps(['levelId', 'cuisineType'])
const emit = defineEmits(['back', 'backToMain', 'backToLevels'])

const startTime = ref(Date.now());
const timeToFirstStar = ref(null);
const currentAttempts = ref(0);

const findLevelById = (levelId, preferredCuisineKey = null) => {
  // 1) Preferovaná kuchyňa 
  if (preferredCuisineKey && levelsData?.[preferredCuisineKey]?.levels) {
    const cuisine = levelsData[preferredCuisineKey]
    const idx = cuisine.levels.findIndex(l => l.level === levelId)
    if (idx !== -1) {
      return {
        cuisineKey: preferredCuisineKey,
        level: cuisine.levels[idx],
        localLevel: idx + 1, // 1-based v rámci kuchyne
        localIndex: idx
      }
    }
  }

  // 2) Fallback: nájdi prvý match v celom JSON 
  for (const [cuisineKey, cuisine] of Object.entries(levelsData || {})) {
    const idx = cuisine.levels.findIndex(l => l.level === levelId)
    if (idx !== -1) {
      return {
        cuisineKey,
        level: cuisine.levels[idx],
        localLevel: idx + 1,
        localIndex: idx
      }
    }
  }

  return null
}

/* =========================================
   1. ZÁKLADNÉ STAVY HRY (Score, Pause, End)
   ========================================= */
const score = ref(0)
const levelEnded = ref(false)
const isPaused = ref(false) // Stav pauzy
const servedTotalCount = ref(0)

/**
 * =========================================
 * 2. KONFIGURÁCIA LEVELU A DÁTA (OPRAVA)
 * =========================================
 */
const levelEntry = computed(() => findLevelById(props.levelId, props.cuisineType))

const currentLevelConfig = computed(() => levelEntry.value?.level)
const currentCuisineKey = computed(() => levelEntry.value?.cuisineKey || props.cuisineType)
const localLevelNumber = computed(() => levelEntry.value?.localLevel || 1)
const localLevelIndex = computed(() => levelEntry.value?.localIndex ?? 0)

// Všetky levely danej kuchyne
const cuisineLevels = computed(() => levels[currentCuisineKey.value]?.levels || [])

// Získame hranicu pre 1. hviezdu z JSON dát
const threshold1Star = computed(() => {
  const cfg = currentLevelConfig.value
  return cfg?.requiredScore || 0
})

// Sledujeme skóre
watch(score, (newScore) => {
  if (newScore >= threshold1Star.value && timeToFirstStar.value === null) {
    // V momente dosiahnutia 1. hviezdy vypočítame čas v sekundách
    timeToFirstStar.value = Math.floor((Date.now() - startTime.value) / 1000);
  }
})

const endLevel = () => {
  if (levelEnded.value) return
  levelEnded.value = true
  clearInterval(timerInterval)

  updateLevelResult(
    currentCuisineKey.value,
    localLevelNumber.value,
    stars.value,
    timeToFirstStar.value
  )

  saveGameToStats({
    score: score.value,
    served: servedTotalCount.value,
    stars: stars.value
  })
}

// Funkcia pre REŠTART levelu
const handleRetry = () => {
  // Vyčistenie hernej plochy
  score.value = 0
  servedTotalCount.value = 0
  onPlate.value = []
  servedMeals.value = []
  customers.value = []
  customerOrders.value = {}

  // Reset varenia
  cooking.value = false
  cookProgress.value = 0
  if (cookRAF) cancelAnimationFrame(cookRAF)

  // Reset stavov
  levelEnded.value = false
  isPaused.value = false

  // Reset času a spawn zákazníkov
  if (currentLevelConfig.value) {
    timeLeft.value = currentLevelConfig.value.timeLimit
    startTimer()
    scheduleNextCustomer()
  }
}

// Pri skončení hry v metóde stopGame (alebo tam, kde voláš updateLevelResult)
const handleGameOver = () => {
  const starsCount = calculateStars(score.value);
  // !!! OPRAVA: tiež lokálny level
  updateLevelResult(currentCuisineKey.value, localLevelNumber.value, starsCount, timeToFirstStar.value);
  levelEnded.value = true;
};

onMounted(() => {
  currentAttempts.value = incrementLevelAttempt(currentCuisineKey.value, localLevelNumber.value);
})

/**
 * =========================================
 *  DYNAMICKÉ POVOLENÉ RECEPTY:
 * =========================================
 */
const allowedRecipeIds = computed(() => {
  const arr = cuisineLevels.value
  if (!arr.length) return []
  const upto = Math.min(localLevelIndex.value, arr.length - 1)
  return arr
    .slice(0, upto + 1)
    .flatMap(l => l.recipes || [])
})

const cuisineData = computed(() => gameData[currentCuisineKey.value])

const allowedRecipes = computed(() => {
  if (!cuisineData.value) return []
  return cuisineData.value.recipes.filter(r => allowedRecipeIds.value.includes(r.id))
})

const allowedIngredients = computed(() => {
  const set = new Set()
  allowedRecipes.value.forEach(r => r.ingredients.forEach(i => set.add(i)))
  return Array.from(set)
})

const getIcon = (n) => ingredientIcons[n] || '📦'

/* =========================================
   3. ČASOVAČ (TIMER)
   ========================================= */
const timeLeft = ref(0)
let timerInterval = null

const startTimer = () => {
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    // Ak je pauza alebo koniec, čas stojí
    if (isPaused.value || levelEnded.value) return

    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
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

/* =========================================
   4. TÁCKA A INGREDIENCIE
   ========================================= */
const onPlate = ref([])
const plateRef = ref(null)

const handleIngredientSelect = (ing) => {
  if (levelEnded.value || isPaused.value || cooking.value) return
  if (onPlate.value.length < 6) {
    onPlate.value.push(ing)
  }
}

const handleDropIngredient = ({ ingredient, x, y }) => {
  if (levelEnded.value || isPaused.value || cooking.value || !plateRef.value) return
  const r = plateRef.value.getBoundingClientRect()

  if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
    if (onPlate.value.length < 6) {
      const posX = ((x - r.left) / r.width) * 100
      const posY = ((y - r.top) / r.height) * 100
      onPlate.value.push({ name: ingredient, x: posX, y: posY })
    }
  }
}

/* =========================================
   5. SYSTÉM VARENIA (RAF s podporou pauzy)
   ========================================= */
const cooking = ref(false)
const cookProgress = ref(0)
const COOK_TIME = 2000
let cookRAF = null
let cookStartTime = null
let elapsedOnPause = 0

const sameIngredients = (a, b) => {
  if (!a || !b || a.length !== b.length) return false
  return [...a].sort().every((v, i) => v === [...b].sort()[i])
}

const servedMeals = ref([])

const servePlate = () => {
  if (levelEnded.value || isPaused.value || cooking.value || onPlate.value.length === 0) return

  cooking.value = true
  cookProgress.value = 0
  elapsedOnPause = 0
  cookStartTime = performance.now()

  const tick = (now) => {
    if (isPaused.value) {
      // Počas pauzy posúvame "štartovací čas", aby sme po resume pokračovali tam, kde sme prestali
      cookStartTime = now - elapsedOnPause
      cookRAF = requestAnimationFrame(tick)
      return
    }

    elapsedOnPause = now - cookStartTime
    cookProgress.value = Math.min(100, (elapsedOnPause / COOK_TIME) * 100)

    if (elapsedOnPause < COOK_TIME) {
      cookRAF = requestAnimationFrame(tick)
    } else {
      finishCooking()
    }
  }
  cookRAF = requestAnimationFrame(tick)
}

const finishCooking = () => {
  cooking.value = false
  const ingredientNamesOnPlate = onPlate.value.map(i => i.name)
  const found = allowedRecipes.value.find(r => sameIngredients(ingredientNamesOnPlate, r.ingredients))

  servedMeals.value.push({
    id: Date.now() + Math.random(),
    name: found ? found.name : 'Nepodarené jedlo',
    correct: !!found,
    points: found?.points || 0,
    dragging: false
  })
  onPlate.value = []
}

/* =========================================
   6. ZÁKAZNÍCI
   ========================================= */
const customers = ref([])
const customerRefs = ref({})
const customerOrders = ref({})

const spawnCustomer = () => {
  if (levelEnded.value || isPaused.value || !currentLevelConfig.value) return
  if (customers.value.length >= currentLevelConfig.value.maxCustomers) return

  customers.value.push({
    id: Date.now() + Math.random(),
    cuisine: currentCuisineKey.value, 
    leaving: false
  })
}

let firstSpawn = true
let spawnTimer = null

const scheduleNextCustomer = () => {
  if (levelEnded.value || !currentLevelConfig.value) return

  // vyčistíme predchádzajúci timeout (poistka)
  if (spawnTimer) {
    clearTimeout(spawnTimer)
    spawnTimer = null
  }

  let delay = 0

  if (firstSpawn) {
    // 1️⃣ PRVÝ ZÁKAZNÍK HNEĎ
    firstSpawn = false
    delay = 0
  } else {
    // 2️⃣ ĎALŠÍ PODĽA INTERVALU
    const { min, max } = currentLevelConfig.value.spawnInterval
    delay = (min + Math.random() * (max - min)) * 1000
  }

  spawnTimer = setTimeout(() => {
    if (!isPaused.value && !levelEnded.value) {
      spawnCustomer()
    }
    scheduleNextCustomer()
  }, delay)
}

const removeCustomer = (id) => {
  const customer = customers.value.find(c => c.id === id)
  if (!customer) return

  // 🔥 vyradíme z fronty OKAMŽITE
  customer.leaving = true
}

const getQueueIndex = (customer) => {
  return customers.value
    .filter(c => !c.leaving)
    .indexOf(customer)
}

const destroyCustomer = (id) => {
  customers.value = customers.value.filter(c => c.id !== id)
}

/* =========================================
   7. DRAG & DROP JEDLA
   ========================================= */
const draggedMeal = ref(null)

const startDragServed = (meal, e) => {
  if (levelEnded.value || isPaused.value) return
  draggedMeal.value = meal
  meal.dragging = true

  const rect = e.currentTarget.getBoundingClientRect()
  meal.offsetX = e.clientX - rect.left
  meal.offsetY = e.clientY - rect.top

  window.addEventListener('mousemove', moveDrag)
  window.addEventListener('mouseup', dropDrag)
}

const moveDrag = (e) => {
  if (!draggedMeal.value || isPaused.value) return
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
    return r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
  })

  if (hitCustomer) {
    const order = customerOrders.value[hitCustomer.id]
    const comp = customerRefs.value[hitCustomer.id]
    if (comp && order) {
      if (meal.correct && meal.name === order.name) {
        score.value += meal.points

        servedTotalCount.value++

        comp.react('happy')
      } else {
        comp.react('angry')
      }
      servedMeals.value = servedMeals.value.filter(m => m.id !== meal.id)
    }
  }
  draggedMeal.value = null
}

/* =========================================
   8. PROGRESS A HVIEZDY
   ========================================= */
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

/* =========================================
   9. VIZUÁL A LIFECYCLE
   ========================================= */
const backgrounds = { asian: bgAsian, mexican: bgMexican, italian: bgItalian, american: bgAmerican }
const backgroundStyle = computed(() => ({
  // !!! OPRAVA: background podľa reálneho cuisineKey (nie props.cuisineType)
  backgroundImage: `url(${backgrounds[currentCuisineKey.value]})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}))

onMounted(() => {
  if (currentLevelConfig.value) {
    timeLeft.value = currentLevelConfig.value.timeLimit
    startTimer()
    scheduleNextCustomer()
  }
})

onUnmounted(() => {
  if (spawnTimer) clearTimeout(spawnTimer)
  if (cookRAF) cancelAnimationFrame(cookRAF)
  clearInterval(timerInterval)
})
</script>

<template>
  <div class="game-container" :style="backgroundStyle">
    <div class="hud">
      <button class="pause-trigger" @click.stop="isPaused = true">PAUZA</button>

      <div class="level-info">
        Level {{ levelId }} | {{ (currentCuisineKey || '').toUpperCase() }}
      </div>

      <div class="level-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: levelProgress + '%' }" />
          <div class="stars-row">
            <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= stars }">★</span>
          </div>
        </div>

        <div class="score-text">
          {{ score }} / {{ currentLevelConfig?.requiredScore ?? 0 }}
        </div>
      </div>
    </div>

    <PauseMenu
      v-if="isPaused"
      @resume="isPaused = false"
      @retry="handleRetry"
      @toLevels="emit('backToLevels')"
      @toMain="emit('backToMain')"
    />

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
        :queueIndex="getQueueIndex(c)"
        :allowedRecipes="allowedRecipes"
        :is-paused="isPaused"
        @order-ready="order => customerOrders[c.id] = order"
        @left="removeCustomer(c.id)"
        @left-complete="destroyCustomer(c.id)"
      />
    </div>

    <div class="counter-top">
      <div class="tray-system">
        <div v-if="cooking" class="cook-bar">
          <div class="cook-progress" :style="{ width: cookProgress + '%' }"></div>
        </div>

        <div class="plate" ref="plateRef">
          <img :src="tackaImg" class="tray-on-counter" />

          <div
            v-for="(ing, i) in onPlate"
            :key="i"
            class="ing-animated"
            :style="{ left: ing.x + '%', top: ing.y + '%', position: 'absolute' }"
          >
            {{ getIcon(ing.name) }}
          </div>
        </div>
      </div>
    </div>

    <div
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

    <GameOverMenu
      v-if="levelEnded"
      :stars="stars"
      :score="score"
      :servedCount="servedTotalCount"
      :attempts="currentAttempts"
      :timeToPass="timeToFirstStar"
      @retry="handleRetry"
      @toLevels="emit('backToLevels')"
    />
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

.pause-trigger {
  background: #f8f5f2; 
  color: #5d4037;
  border: 1px solid #efebe9;
  
  /* Rozmery a tvar */
  padding: 8px 18px;
  border-radius: 15px;
  cursor: pointer;
  
  /* Typografia */
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  /* 3D efekt */
  box-shadow: 0 4px 0 #d7ccc8;
  
  /* Animácia */
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* HOVER - Identické so sekundárnymi tlačidlami v menu */
.pause-trigger:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #d7ccc8;
}

/* ACTIVE - Zatlačenie pri kliknutí */
.pause-trigger:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 transparent;
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
  font-size: clamp(25.6px, 5.1vh, 44.8px);
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


@media (max-width: 400px) {
  .pause-trigger {
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 12px;
  }
}


</style>