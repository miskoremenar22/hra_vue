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

/* =====================
   ANIMÁCIA
===================== */
let startX = 0
let targetX = 0
let startTime = null
const DURATION = 9000
const phase = ref('enter') // enter | leave

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/* =====================
   OBJEDNÁVKA
===================== */
const generateOrder = () => {
  const recipes = props.allowedRecipes
  if (!recipes || recipes.length === 0) return

  order.value = recipes[Math.floor(Math.random() * recipes.length)]
  emit('order-ready', order.value)
}

/* =====================
   ANIMATE LOOP
===================== */
const animate = (ts) => {
  if (!startTime) startTime = ts
  const t = Math.min((ts - startTime) / DURATION, 1)

  x.value = startX + (targetX - startX) * easeOutCubic(t)

  if (t < 1) {
    requestAnimationFrame(animate)
  } else {
    if (phase.value === 'enter') {
      arrived.value = true
      generateOrder()
      startPatience()
    } else {
      emit('left')
    }
  }

}

/* =====================
   ODCHOD
===================== */
const leave = () => {
  arrived.value = false
  phase.value = 'leave'
  startTime = null
  startX = x.value
  targetX = window.innerWidth + 300
  requestAnimationFrame(animate)
}

const mood = ref(null) // 'happy' | 'neutral' | 'angry'
const react = (type) => {
  if (served.value) return // ❌ už obslúžený

  served.value = true      // ✅ zamkni zákazníka
  clearPatience()
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

let t1 = null
let t2 = null
let t3 = null

const startPatience = () => {
  mood.value = 'happy'

  t1 = setTimeout(() => {
    mood.value = 'neutral'
  }, 15000) // 🙂 → 😐 po 10s

  t2 = setTimeout(() => {
    mood.value = 'angry'
  }, 30000) // 😐 → 😠 po 20 s

  t3 = setTimeout(() => {
    if (mood.value === 'angry' && arrived.value) {
      leave()
    }
  }, 45000) // ODCHOD PO 30s
}

const clearPatience = () => {
  clearTimeout(t1)
  clearTimeout(t2)
  clearTimeout(t3)
}


/* =====================
   RESIZE
===================== */
const recalc = () => {
  const vw = window.innerWidth
  startX = -vw * 0.6
  targetX = vw * 0.09
}

/* =====================
   EXPOSE
===================== */
defineExpose({
  getRect: () => customerEl.value.getBoundingClientRect(),
  react
})

onMounted(() => {
  recalc()
  window.addEventListener('resize', recalc)

  phase.value = 'enter'
  startTime = null
  x.value = startX
  requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalc)
})
</script>

<style scoped>
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
