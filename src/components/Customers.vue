<script setup>
import { ref, computed, onMounted, onUnmounted, defineExpose } from 'vue'

/* =====================
   RANDOM SKINY
===================== */
const SKINS = [
  'customer1.svg',
  'customer2.svg',
  'customer3.svg',
  'customer4.svg',
  'customer5.svg',
  'customer6.svg'
]

const selectedSkin = SKINS[Math.floor(Math.random() * SKINS.length)]

const customerSprite = computed(() =>
  new URL(`../assets/customers/${selectedSkin}`, import.meta.url).href
)

/* =====================
   PROPS
===================== */
const props = defineProps({
  cuisine: String,
  allowedRecipes: {
    type: Array,
    required: true
  },
  queueIndex: {
    type: Number,
    default: 0
  },
  isPaused: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['order-ready', 'left', 'left-complete'])

/* =====================
   STAVY
===================== */
const x = ref(0)
const arrived = ref(false)
const message = ref(null)
const order = ref(null)
const customerEl = ref(null)
const served = ref(false)
const mood = ref(null)

/* =====================
   PAUZOVATEĽNÁ ANIMÁCIA
===================== */
let startX = 0
let targetX = 0
let lastTimestamp = 0
let accumulatedAnimationTime = 0
let accumulatedPatienceTime = 0

const DURATION = 9000
const phase = ref('enter') // enter | leave

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/* =====================
   TRPEZLIVOSŤ
===================== */
const checkPatience = (delta) => {
  if (served.value || !arrived.value) return

  accumulatedPatienceTime += delta

  if (accumulatedPatienceTime > 45000) {
    leave()
  } else if (accumulatedPatienceTime > 30000) {
    mood.value = 'angry'
  } else if (accumulatedPatienceTime > 15000) {
    mood.value = 'neutral'
  }
}

/* =====================
   ANIMATE LOOP
===================== */
const animate = (ts) => {
  if (!lastTimestamp) lastTimestamp = ts
  const delta = ts - lastTimestamp
  lastTimestamp = ts

  if (props.isPaused) {
    requestAnimationFrame(animate)
    return
  }

  accumulatedAnimationTime += delta
  const t = Math.min(accumulatedAnimationTime / DURATION, 1)

  x.value = startX + (targetX - startX) * easeOutCubic(t)

  if (arrived.value) {
    checkPatience(delta)
  }

  if (t < 1) {
  requestAnimationFrame(animate)
  } else {
    if (phase.value === 'enter' && !arrived.value) {
      arrived.value = true
      mood.value = 'happy'
      generateOrder()
      requestAnimationFrame(animate)
    } else if (phase.value === 'leave') {
      // 🔥 KONIEC ANIMÁCIE ODCHODU
      emit('left-complete')
    } else {
      requestAnimationFrame(animate)
    }
  }
}

/* =====================
   LOGIKA
===================== */
const generateOrder = () => {
  const recipes = props.allowedRecipes
  if (!recipes || recipes.length === 0) return
  order.value = recipes[Math.floor(Math.random() * recipes.length)]
  emit('order-ready', order.value)
}

const leave = () => {
  if (phase.value === 'leave') return

  // 🔥 LOGICKÝ ODCHOD OKAMŽITE
  emit('left')

  arrived.value = false
  phase.value = 'leave'
  accumulatedAnimationTime = 0
  startX = x.value
  targetX = window.innerWidth + 300
}

const react = (type) => {
  if (served.value) return
  served.value = true
  mood.value = type

  setTimeout(() => {
    mood.value = null
    leave()
  }, 2000)
}

const moodEmoji = computed(() => {
  if (mood.value === 'happy') return '😄'
  if (mood.value === 'neutral') return '😐'
  if (mood.value === 'angry') return '😠'
  return ''
})

/* =====================
   RESIZE
===================== */
const recalc = () => {
  const vw = window.innerWidth
  startX = -vw * 0.6
  targetX = vw * 0.12
}

defineExpose({
  getRect: () => customerEl.value?.getBoundingClientRect(),
  react
})

const spacing = ref(150)

const recalcSpacing = () => {
  const vw = window.innerWidth

  if (vw < 480) spacing.value = 80       // malé mobily
  else if (vw < 768) spacing.value = 80 // mobily
  else if (vw < 1024) spacing.value = 150 // tablet
  else if (vw < 1440) spacing.value = 160 // desktop
  else spacing.value = 180               // veľké monitory
}

onMounted(() => {
  recalc()
  recalcSpacing()
  window.addEventListener('resize', recalc)
  phase.value = 'enter'
  x.value = startX
  requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalc)
})
</script>

<template>
  <div class="customer-wrapper">
    <!-- POHYB ZÁKAZNÍKA -->
    <div class="customer" :style="{ transform: `translateX(${x}px)` }">
      <!-- POHYB FRONTY -->
      <div
        class="queue-offset"
        ref="customerEl"
        :style="{ transform: `translateX(${-queueIndex * spacing}px)` }"
      >
        <div v-if="mood" class="mood-bubble">
          {{ moodEmoji }}
        </div>

        <div v-if="message" class="order-bubble">
          <strong>{{ message }}</strong>
        </div>

        <div v-else-if="arrived && order" class="order-bubble">
          Prosím si:<br />
          <strong>{{ order.name }}</strong>
        </div>

        <img :src="customerSprite" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-wrapper {
  position: absolute;
  bottom: 54%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

/* pohyb zákazníka */
.customer {
  will-change: transform;
}

/* 🔥 PLYNULÝ POSUN FRONTY */
.queue-offset {
  transition: transform 2.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.customer img {
  width: clamp(90px, 12vw, 140px);
}

.order-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 16px;
  border-radius: 18px 18px 18px 6px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  white-space: nowrap;
  margin-bottom: 6px;
}

.mood-bubble {
  position: absolute;
  bottom: 150%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  animation: pop 0.3s ease;
}

@keyframes pop {
  0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

.customer-wrapper {
  position: absolute;
  bottom: 54%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

/* 📱 MOBILY */
@media (max-width: 768px) {
  .customer-wrapper {
    bottom: 58%;
  }
}

/* 📱 MOBILE LANDSCAPE */
@media (max-width: 950px) and (orientation: landscape) {
  .customer-wrapper {
    bottom: 60%;
  }

  .customer img {
    width: clamp(80px, 10vw, 120px);
  }

  .order-bubble {
    font-size: 0.55rem;
    bottom: 95%;
  }

  .mood-bubble {
    font-size: 25px;
    bottom: 145%;
  }
}

/* 💻 MENŠÍ DESKTOP */
@media (min-width: 1024px) and (max-width: 1439px) {
  .customer-wrapper {
    bottom: 54%;
  }
}

/* 🖥 FULL HD */
@media (min-width: 1440px) and (max-width: 1919px) {
  .customer-wrapper {
    bottom: 53%;
  }
}

/* 🖥 2K */
@media (min-width: 1920px) {
  .customer-wrapper {
    bottom: 51%;
  }

  .customer img {
    width: clamp(120px, 10vw, 200px);
  }

  .order-bubble {
    font-size: 1.2rem;
    bottom: 92%;
  }

  .mood-bubble {
    font-size: 60px;
    bottom: 130%;
  }
}

</style>
