<template>
  <div class="pause-overlay">
    <div class="pause-card">
      <h1>HRA POZASTAVENÁ</h1>
      
      <div class="pause-buttons">
        <button @click="$emit('resume')" class="btn resume">Pokračovať</button>
        <button @click="$emit('retry')" class="btn retry">Odblokovať (Retry)</button>
        <button @click="$emit('toLevels')" class="btn levels">Výber Levelov</button>
        <button @click="$emit('toMain')" class="btn main">Hlavné Menu</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pause-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Musí byť úplne navrchu */
}

.pause-card {
  background: #2c3e50;
  padding: 40px;
  border-radius: 25px;
  border: 4px solid #f1c40f;
  text-align: center;
  color: white;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  min-width: 300px;
}

h1 { margin-bottom: 30px; color: #f1c40f; font-size: 2rem; }

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 15px 25px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s;
}

.btn:active { transform: scale(0.95); }

.resume { background: #2ecc71; color: white; }
.retry { background: #3498db; color: white; }
.levels { background: #9b59b6; color: white; }
.main { background: #e67e22; color: white; }
</style>