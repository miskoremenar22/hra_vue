<script setup>
import { ref } from 'vue'
import MainMenu from './components/MainMenu.vue'
import LevelsMenu from './components/LevelsMenu.vue'
import GameScreen from './components/GameScreen.vue'
import StatsModal from './components/StatsModal.vue'

const currentScreen = ref('menu')
const isStatsOpen = ref(false)

const selectedLevel = ref(null)
const currentCuisine = ref(null)

const startLevel = (levelId) => {
  selectedLevel.value = levelId

  // MAPOVANIE LEVEL → KUCHYŇA
  if (levelId <= 4) currentCuisine.value = 'asian'
  else if (levelId <= 8) currentCuisine.value = 'mexican'
  else if (levelId <= 12) currentCuisine.value = 'italian'
  else currentCuisine.value = 'american'

  currentScreen.value = 'game'
}
</script>

<template>
  <MainMenu
    v-if="currentScreen === 'menu'"
    @start-game="currentScreen = 'levels'"
    @show-stats="isStatsOpen = true"
  />

  <LevelsMenu
    v-else-if="currentScreen === 'levels'"
    @select-level="startLevel"
    @back="currentScreen = 'menu'"
  />

  <GameScreen
    v-else-if="currentScreen === 'game'"
    :levelId="selectedLevel"
    :cuisineType="currentCuisine"
    @back="currentScreen = 'levels'"
  />

  <StatsModal v-if="isStatsOpen" @close="isStatsOpen = false" />
</template>
