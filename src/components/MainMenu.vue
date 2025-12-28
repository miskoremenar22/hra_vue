<script setup>
// Funkčnosť zostáva identická s tvojím pôvodným kódom
const emit = defineEmits(['start-game', 'show-stats']);
</script>

<template>
  <div class="menu-wrapper">
    <div class="bg-decor">
      <span class="float icon-1">🍕</span>
      <span class="float icon-2">🍳</span>
      <span class="float icon-3">🍅</span>
      <span class="float icon-4">🥦</span>
      <span class="float icon-5">🧂</span>
    </div>

    <div class="menu-card">
      <div class="chef-section">
        <div class="chef-avatar">
          <span class="chef-emoji">👨‍🍳</span>
          <div class="chef-badge">PRO</div>
        </div>
      </div>

      <h1 class="title">
        <span class="title-sub">Virtual</span>
        Master Chef
        <span class="title-dot">.</span>
      </h1>
      
      <div class="button-group">
        <button @click="emit('start-game')" class="btn btn-play">
          <span class="btn-icon">▶</span>
          OTVORIŤ REŠTAURÁCIU
        </button>
        
        <button @click="emit('show-stats')" class="btn btn-stats">
          <span class="btn-icon">📊</span>
          ŠTATISTIKY
        </button>
      </div>

      <p class="footer-text">Pripravte sa na varenie!</p>
    </div>
  </div>
</template>

<style scoped>
/* Celkový obal s kuchynským gradientom */
.menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(circle at center, #fff5e6 0%, #ffeccc 100%);
  overflow: hidden;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Karta menu */
.menu-card {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 3rem;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(93, 64, 55, 0.15);
  border: 2px solid white;
  text-align: center;
  width: 90%;
  max-width: 450px;
}

/* Sekcia s kuchárom */
.chef-section {
  margin-bottom: 1.5rem;
}

.chef-avatar {
  position: relative;
  display: inline-block;
  background: white;
  width: 120px;
  height: 120px;
  line-height: 120px;
  border-radius: 50%;
  font-size: 70px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  animation: float-chef 4s ease-in-out infinite;
}

.chef-badge {
  position: absolute;
  bottom: 0;
  right: -5px;
  background: #ff5722;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 20px;
  border: 3px solid white;
}

/* Nadpis */
.title {
  color: #5d4037;
  font-size: 2.8rem;
  font-weight: 900;
  margin-bottom: 2.5rem;
  line-height: 1;
  text-transform: uppercase;
}

.title-sub {
  display: block;
  font-size: 1rem;
  color: #ff9800;
  letter-spacing: 5px;
  margin-bottom: 5px;
}

.title-dot { color: #4caf50; }

/* Tlačidlá */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.btn {
  position: relative;
  padding: 18px 30px;
  font-size: 1.1rem;
  font-weight: 800;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
  box-shadow: 0 8px 0 rgba(0,0,0,0.1);
}

.btn-icon { font-size: 1.4rem; }

/* PLAY Tlačidlo - Zelené */
.btn-play {
  background: #4caf50;
  box-shadow: 0 8px 0 #388e3c;
}

.btn-play:hover {
  transform: translateY(-2px);
  background: #43a047;
}

.btn-play:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #388e3c;
}

/* STATS Tlačidlo - Oranžové */
.btn-stats {
  background: #ff9800;
  box-shadow: 0 8px 0 #e68a00;
}

.btn-stats:hover {
  transform: translateY(-2px);
  background: #fb8c00;
}

.btn-stats:active {
  transform: translateY(6px);
  box-shadow: 0 2px 0 #e68a00;
}

.footer-text {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #8d6e63;
  font-weight: 500;
  opacity: 0.7;
}

/* Dekorácie na pozadí */
.bg-decor .float {
  position: absolute;
  font-size: 40px;
  opacity: 0.2;
  filter: blur(1px);
  z-index: 1;
}

.icon-1 { top: 10%; left: 10%; animation: float-anim 6s infinite; }
.icon-2 { top: 70%; left: 15%; animation: float-anim 8s infinite 1s; }
.icon-3 { top: 20%; right: 15%; animation: float-anim 7s infinite 0.5s; }
.icon-4 { top: 80%; right: 10%; animation: float-anim 9s infinite 2s; }
.icon-5 { top: 45%; left: 5%; animation: float-anim 10s infinite; }

/* Animácie */
@keyframes float-chef {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes float-anim {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  33% { transform: translate(20px, 40px) rotate(20deg); }
  66% { transform: translate(-20px, 20px) rotate(-20deg); }
}

/* Pre mobilné zariadenia */
@media (max-width: 480px) {
  .menu-card { padding: 2rem 1.5rem; }
  .title { font-size: 2.2rem; }
  .chef-avatar { width: 100px; height: 100px; font-size: 60px; line-height: 100px; }
}
</style>