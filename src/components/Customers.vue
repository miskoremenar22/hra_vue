<template>
  <div class="customer-wrapper">
    <div
      class="customer"
      :style="{ transform: `translateX(${x}px)` }"
    >
      <div v-if="arrived && order" class="order-bubble">
        Prosím si:<br />
        <strong>{{ order.name }}</strong>
      </div>

      <img :src="customerSprite" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gameData from '@/data/gameData.json'
import customerSprite from '@/assets/customers/customer.svg'

const props = defineProps({
  cuisine: { type: String, required: true }
})

const emit = defineEmits(['order-ready'])

/* ===== POHYB ===== */
const x = ref(0)
const arrived = ref(false)

let startX = 0
let targetX = 0
let startTime = null
const DURATION = 10000 // ms – plynulé

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/* ===== OBJEDNÁVKA ===== */
const order = ref(null)

const generateOrder = () => {
  const recipes = gameData[props.cuisine].recipes
  order.value = recipes[Math.floor(Math.random() * recipes.length)]
  emit('order-ready', order.value)
}

/* ===== ANIMÁCIA ===== */
const animate = (timestamp) => {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const t = Math.min(elapsed / DURATION, 1)

  const eased = easeOutCubic(t)
  x.value = startX + (targetX - startX) * eased

  if (t < 1) {
    requestAnimationFrame(animate)
  } else {
    arrived.value = true
    generateOrder()
  }
}

const recalcPositions = () => {
  const vw = window.innerWidth
  startX = -vw * 0.6        // príde zľava (60 % šírky)
  targetX = vw * 0.09      // finálna pozícia (5 % doprava)
  x.value = startX
}

onMounted(() => {
  recalcPositions()
  window.addEventListener('resize', recalcPositions)
  requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalcPositions)
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
