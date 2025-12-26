<script setup>
import { ref, computed } from 'vue'
import { getCuisineProgress } from '@/utils/progress'

const emit = defineEmits(['select-level', 'back'])

const currentSection = ref(0)

const cuisines = [
  { key: 'asian', name: 'Ázijská kuchyňa', icon: '🏮', color: '#e53935', levels: [1, 2, 3, 4] },
  { key: 'mexican', name: 'Mexická kuchyňa', icon: '🌵', color: '#43a047', levels: [5, 6, 7, 8] },
  { key: 'italian', name: 'Talianska kuchyňa', icon: '🍕', color: '#fdd835', levels: [9, 10, 11, 12] },
  { key: 'american', name: 'Americký Fast Food', icon: '🍔', color: '#1e88e5', levels: [13, 14, 15, 16] }
]

const nextSection = () => {
  if (currentSection.value < cuisines.length - 1) currentSection.value++
}

const prevSection = () => {
  if (currentSection.value > 0) currentSection.value--
}

const currentCuisine = computed(() => cuisines[currentSection.value])

/**
 * Progress pre aktuálnu kuchyňu
 * { unlocked: 1..5, stars: {1:0..3,2:..} }
 */
const progress = computed(() => getCuisineProgress(currentCuisine.value.key))

/**
 * Je kuchyňa odomknutá?
 * - asian vždy odomknutá
 * - ostatné iba ak predchádzajúca kuchyňa má dokončené 4 levely (unlocked > 4)
 */
const isCuisineUnlocked = (cuisineKey) => {
  const idx = cuisines.findIndex(c => c.key === cuisineKey)
  if (idx <= 0) return true // asian vždy

  const prevKey = cuisines[idx - 1].key
  const prevProg = getCuisineProgress(prevKey)

  return prevProg.unlocked > 4
}

/**
 * Je level odomknutý v rámci kuchyne? (1..4)
 */
const isLevelUnlocked = (localLevel) => {
  return localLevel <= (progress.value?.unlocked || 1)
}

/**
 * Klik na level:
 * localLevel 1..4 -> globálny levelId podľa cuisines[current].levels
 */
const selectLevel = (localLevel) => {
  if (!isCuisineUnlocked(currentCuisine.value.key)) return
  if (!isLevelUnlocked(localLevel)) return

  const globalLevelId = currentCuisine.value.levels[localLevel - 1]
  emit('select-level', globalLevelId)
}
</script>

<template>
  <div
    class="levels-container"
    :style="{ backgroundColor: currentCuisine.color + '22' }"
  >
    <button class="back-home" @click="emit('back')">🏠 Domov</button>

    <div class="carousel">
      <div
        class="cuisine-card"
        :class="{ locked: !isCuisineUnlocked(currentCuisine.key) }"
      >
        <div class="icon">{{ currentCuisine.icon }}</div>
        <h2>{{ currentCuisine.name }}</h2>

        <!-- 🔒 Zamknutá kuchyňa -->
        <div
          v-if="!isCuisineUnlocked(currentCuisine.key)"
          class="locked-cuisine"
        >
          🔒 Dokonči predchádzajúcu krajinu
        </div>

        <!-- 🔓 Odomknutá kuchyňa -->
        <div v-else class="levels-grid">
          <button
            v-for="localLvl in [1,2,3,4]"
            :key="localLvl"
            class="level-btn"
            :disabled="!isLevelUnlocked(localLvl)"
            @click="selectLevel(localLvl)"
          >
            Level {{ localLvl }}

            <span v-if="!isLevelUnlocked(localLvl)">🔒</span>

            <span v-else class="stars">
              <span v-for="i in 3" :key="i" class="star">
                {{ i <= (progress.stars?.[localLvl] || 0) ? '★' : '☆' }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="navigation">
      <button @click="prevSection" :disabled="currentSection === 0" class="nav-btn">←</button>

      <span class="dots">
        <span
          v-for="(c, i) in cuisines"
          :key="c.key"
          :class="{ active: i === currentSection }"
        ></span>
      </span>

      <button @click="nextSection" :disabled="currentSection === cuisines.length - 1" class="nav-btn">→</button>
    </div>
  </div>
</template>

<style scoped>
.levels-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s ease;
}

.back-home {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px;
  cursor: pointer;
}

.cuisine-card {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  width: 350px;
}

.cuisine-card.locked {
  opacity: 0.75;
}

.locked-cuisine {
  margin-top: 18px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(0,0,0,0.07);
  font-weight: bold;
}

.icon { font-size: 60px; }

.levels-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}

.level-btn {
  padding: 15px;
  border: 2px solid #333;
  background: white;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

.level-btn:hover { background: #333; color: white; }

.level-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stars {
  margin-left: 8px;
}

.star {
  font-size: 14px;
}

.navigation {
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-btn {
  font-size: 24px;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 50%;
  border: 1px solid #333;
}

.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.dots span {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background: #ccc;
  border-radius: 50%;
}

.dots span.active { background: #333; transform: scale(1.3); }
</style>
