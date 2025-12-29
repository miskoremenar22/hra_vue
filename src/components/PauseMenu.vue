<template>
  <div class="pause-overlay">
    <div class="pause-card">
      <h1>HRA POZASTAVENÁ</h1>
      
      <div class="pause-buttons">
        <button @click="$emit('resume')" class="btn resume">Pokračovať</button>
        <button @click="$emit('retry')" class="btn retry">Skúsiť Znova</button>
        <button @click="$emit('toLevels')" class="btn levels">Výber Levelov</button>
        <button @click="$emit('toMain')" class="btn main">Hlavné Menu</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Pozadie s hlbokým rozmazaním */
.pause-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(28, 15, 10, 0.6); /* Tmavšia hnedá pre hĺbku */
  backdrop-filter: blur(12px) brightness(0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

/* Karta - masívna, čistá a luxusná */
.pause-card {
  background: #ffffff;
  padding: 3rem 2rem;
  border-radius: 40px;
  width: 100%;
  max-width: 360px;
  text-align: center;
  position: relative;
  /* Dvojitý tieň pre efekt vyvýšenia */
  box-shadow: 
    0 30px 60px rgba(0,0,0,0.3),
    inset 0 0 0 2px #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.9) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Nadpis - dominantný a elegantný */
h1 {
  font-size: 1.5rem;
  font-weight: 900;
  color: #3e2723;
  margin: 0 0 2.5rem 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  position: relative;
}

/* Dekoratívna čiara pod nadpisom (ako v StatsModal) */
h1::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: #4caf50;
  border-radius: 2px;
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tlačidlá - Jednotný štýl s výrazným 3D klikom */
.btn {
  width: 100%;
  padding: 1.1rem;
  border: none;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hlavné tlačidlo - JEDINÁ výrazná farba (Smaragdová zelená) */
.resume {
  background: #4caf50;
  color: white;
  box-shadow: 0 6px 0 #2e7d32;
  margin-bottom: 8px; /* Optické oddelenie */
}

.resume:hover {
  background: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 8px 0 #2e7d32;
}

/* Vedľajšie tlačidlá - Soft "Cappuccino" štýl */
.retry, .levels, .main {
  background: #f8f5f2;
  color: #5d4037;
  box-shadow: 0 6px 0 #d7ccc8;
}

.retry:hover, .levels:hover, .main:hover {
  background: #efebe9;
  transform: translateY(-2px);
  box-shadow: 0 8px 0 #d7ccc8;
}

/* Efekt stlačenia pre všetky tlačidlá */
.btn:active {
  transform: translateY(4px) !important;
  box-shadow: 0 2px 0 transparent !important;
}

/* Responzivita pre úplne malé zariadenia */
@media (max-width: 380px) {
  .pause-card {
    padding: 2rem 1.5rem;
  }
  h1 { font-size: 1.2rem; }
  .btn { padding: 0.9rem; font-size: 0.95rem; }
}
</style>