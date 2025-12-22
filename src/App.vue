<script setup>
import { ref } from 'vue';
import MainMenu from './components/MainMenu.vue';
import LevelsMenu from './components/LevelsMenu.vue';
import GameScreen from './components/GameScreen.vue';
import StatsModal from './components/StatsModal.vue';

const currentScreen = ref('menu');
const isStatsOpen = ref(false);
const selectedLevel = ref(null);
const currentCuisine = ref(''); // Sem uložíme 'asian', 'mexican', atď.

const startLevel = (levelId) => {
  selectedLevel.value = levelId;
  
  // Určíme typ kuchyne podľa čísla levelu
  if (levelId <= 4) currentCuisine.value = 'asian';
  else if (levelId <= 8) currentCuisine.value = 'mexican';
  else if (levelId <= 12) currentCuisine.value = 'italian';
  else currentCuisine.value = 'american';

  currentScreen.value = 'game';
};
</script>

<template>
  <div class="app-wrapper">
    <MainMenu 
      v-if="currentScreen === 'menu'" 
      @start-game="currentScreen = 'levels'" 
      @show-stats="isStatsOpen = true" 
    />

    <LevelsMenu 
      v-else-if="currentScreen === 'levels'"
      @back="currentScreen = 'menu'"
      @select-level="startLevel"
    />

    <GameScreen 
      v-else-if="currentScreen === 'game'" 
      :levelId="selectedLevel" 
      :cuisineType="currentCuisine"
      @back="currentScreen = 'levels'" 
    />

    <StatsModal v-if="isStatsOpen" @close="isStatsOpen = false" />
  </div>
</template>