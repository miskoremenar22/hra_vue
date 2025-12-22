<script setup>
const emit = defineEmits(['start-game', 'show-stats']);
</script>

<template>
  <div class="menu-container">
    <div class="chef-icon">👨‍🍳</div>
    <h1 class="title">Master Chef Game</h1>
    
    <div class="buttons">
      <button @click="emit('start-game')" class="btn play">OTVORIŤ REŠTAURÁCIU</button>
      <button @click="emit('show-stats')" class="btn stats">ŠTATISTIKY</button>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #fdf5e6; /* Krémová "kuchynská" farba */
  color: #5d4037;
}

.chef-icon { font-size: 80px; margin-bottom: 10px; }

.title {
  font-size: 3rem;
  margin-bottom: 3rem;
  font-family: 'Comic Sans MS', cursive; /* Alebo iný hravý font */
}

.buttons { display: flex; flex-direction: column; gap: 15px; }

.btn {
  padding: 15px 40px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 10px;
  border: none;
  transition: transform 0.2s;
}

.play { background: #4caf50; color: white; }
.play:hover { transform: scale(1.05); background: #45a049; }

.stats { background: #ff9800; color: white; }
.stats:hover { transform: scale(1.05); }
</style>