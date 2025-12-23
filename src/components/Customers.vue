<template>
  <div class="customer-wrapper">
    <div
      class="customer"
      ref="customerEl"
      :style="{ transform: `translateX(${x - queueIndex * 150}px)` }"
    >
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
import { ref, onMounted, onUnmounted, defineExpose } from 'vue'
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

const emit = defineEmits(['order-ready'])

/* =====================
   STAVY
===================== */
const x = ref(0)
const arrived = ref(false)
const message = ref(null)
const order = ref(null)
const customerEl = ref(null)

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

const react = (text) => {
  message.value = text
  setTimeout(() => {
    message.value = null
    leave()
  }, 1300)
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
</style>
