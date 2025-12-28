<script setup>
import { ref, computed, onMounted, onUnmounted, defineExpose } from 'vue'
import customerSprite from '@/assets/customers/customer.svg'

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
  isPaused: { // 👈 Dôležité pre pauzu
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['order-ready', 'left'])

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
   TRPEZLIVOSŤ (Pauzovateľná)
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

  // AK JE PAUZA, STOJÍME
  if (props.isPaused) {
    requestAnimationFrame(animate)
    return
  }

  // Ak nie je pauza, počítame progres
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
      emit('left')
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

const recalc = () => {
  const vw = window.innerWidth
  startX = -vw * 0.6
  targetX = vw * 0.09
}

defineExpose({
  getRect: () => customerEl.value?.getBoundingClientRect(),
  react
})

onMounted(() => {
  recalc()
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
    <div
      class="customer"
      ref="customerEl"
      :style="{ transform: `translateX(${x - queueIndex * 150}px)` }"
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
</template>

<style scoped>
/* VRÁTENÉ PÔVODNÉ CSS */
.customer-wrapper {
  position: absolute;
  bottom: 54%;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
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
</style>