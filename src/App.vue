<script setup>

import MainMenu from './components/MainMenu.vue'
import LevelsMenu from './components/LevelsMenu.vue'
import GameScreen from './components/GameScreen.vue'
import StatsModal from './components/StatsModal.vue'

import { ref, watch, onMounted } from 'vue'
import { audioManager } from './utils/audioManager.js'
import Instructions from './components/Instructions.vue'


const currentScreen = ref('menu')
const isStatsOpen = ref(false)

const selectedLevel = ref(null)
const currentCuisine = ref(null)
const isMuted = ref(false)

const startLevel = (levelId) => {
  selectedLevel.value = levelId

  // MAPOVANIE LEVEL → KUCHYŇA
  if (levelId <= 4) currentCuisine.value = 'asian'
  else if (levelId <= 8) currentCuisine.value = 'mexican'
  else if (levelId <= 12) currentCuisine.value = 'italian'
  else currentCuisine.value = 'american'

  currentScreen.value = 'game'
}

const volume = ref(0.4); // Predvolená hlasitosť 40%

const handleVolumeChange = (newVol) => {
  volume.value = audioManager.setVolume(newVol);
};

const isInstructionsOpen = ref(false);

// Sledovanie zmeny obrazovky, hudba
watch(currentScreen, (newScreen) => {
  if (newScreen === 'menu' || newScreen === 'levels') {
    audioManager.play('menu')
  } else if (newScreen === 'game') {
    audioManager.play('game')
  }
}, { immediate: true })

const toggleMusic = () => {
  isMuted.value = audioManager.toggleMute()
}

// Spustenie hudby pri prvom kliknutí (kvôli Chrome/Safari blokovaniu)
onMounted(() => {
  const startAudio = () => {
    audioManager.play('menu')
    window.removeEventListener('click', startAudio)
  }
  window.addEventListener('click', startAudio)
})
</script>

<template>
  <MainMenu
  v-if="currentScreen === 'menu'"
  @show-instructions="isInstructionsOpen = true"
  :isMuted="isMuted"
  :volume="volume"
  @start-game="currentScreen = 'levels'"
  @show-stats="isStatsOpen = true"
  @toggle-music="toggleMusic"
  @change-volume="handleVolumeChange"
/>

  <Instructions 
    v-if="isInstructionsOpen" 
    @close="isInstructionsOpen = false" 
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
  @backToLevels="currentScreen = 'levels'"  @backToMain="currentScreen = 'menu'"      
  />

  <StatsModal v-if="isStatsOpen" @close="isStatsOpen = false" />
</template>

<style scoped>

  /* Toto vložíš do App.vue alebo globálneho CSS */
:global(html), :global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Zakáže skrolovanie */
  position: fixed;  /* Fixne obrazovku na mieste */
  touch-action: none; /* Zabráni "ťahaniu" stránky na mobiloch */
}

#app {
  width: 100vw;
  height: 100vh;
  /* Ak používaš novšie prehliadače, použi 100dvh pre lepšiu podporu mobilných líšt */
  height: 100dvh; 
  overflow: hidden;
  position: relative;
}


</style>

<style>
  /* App.vue */

/* Tieto štýly sa aplikujú na celú aplikáciu */
html, body, #app {
  /* Zakáže označovanie textu (modré podfarbenie) */
  user-select: none;
  -webkit-user-select: none; /* Pre Safari */
  -moz-user-select: none;    /* Pre Firefox */
  -ms-user-select: none;     /* Pre starý IE */

  /* Vynúti klasický šípkový kurzor všade, aj nad textom */
  cursor: default;

  /* Zakáže "ťahanie" obrázkov (aby ti hráč omylom neodtiahol pozadie) */
  -webkit-user-drag: none;
  
  /* Odstráni modrý rámik/tieň pri kliknutí na mobiloch */
  -webkit-tap-highlight-color: transparent;
  
  /* Zabezpečí, že sa nebude dať scrollovať hore-dole (ak hra zaberá celú obrazovku) */
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Obrázky by sa tiež nemali dať označiť alebo kopírovať potiahnutím */
img {
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none; /* Ak nepotrebuješ na obrázky klikať */
}

/* Tlačidlá by mali mať stále "packu" (pointer), aby hráč vedel, že sú interaktívne */
button, .btn, [role="button"], .clickable {
  cursor: pointer;
}

</style>