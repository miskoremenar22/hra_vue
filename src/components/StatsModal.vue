<script setup>
const emit = defineEmits(['close']);
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-bg-decor">
      <span class="m-float m-1">⭐</span>
      <span class="m-float m-2">👨‍🍳</span>
      <span class="m-float m-3">🔥</span>
    </div>

    <div class="modal-card animate-pop">
      <button class="close-x" @click="emit('close')">×</button>
      
      <div class="header-section">
        <div class="header-icon-glow">🏆</div>
        <h2 class="title">Vaše Štatistiky</h2>
        <div class="divider"></div>
      </div>
      
      <div class="stats-list">
        <div class="stat-row">
          <div class="stat-info">
            <span class="stat-label">Obslúžení zákazníci:</span>
            <strong class="stat-value">12</strong>
          </div>
          <div class="stat-icon-bg">👥</div>
        </div>

        <div class="stat-row burnt">
          <div class="stat-info">
            <span class="stat-label">Spálené jedlá:</span>
            <strong class="stat-value">2</strong>
          </div>
          <div class="stat-icon-bg">🔥</div>
        </div>

        <div class="stat-row">
          <div class="stat-info">
            <span class="stat-label">Získané hviezdičky:</span>
            <div class="stars-display">⭐⭐⭐</div>
          </div>
          <div class="stat-icon-bg">✨</div>
        </div>
      </div>

      <button class="confirm-btn" @click="emit('close')">
        ROZUMIEM
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Pozadie - priehľadné a rozmazané */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(45, 26, 18, 0.45); /* Jemný hnedastý nádych, vysoká priehľadnosť */
  backdrop-filter: blur(10px); /* Poriadne rozmazanie pozadia */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
  overflow: hidden;
}

/* Hlavná karta - kompaktná a responzívna */
.modal-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 35px;
  width: 100%;
  max-width: 380px; /* Ideálna veľkosť pre PC aj Mobil */
  position: relative;
  z-index: 10;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.2), inset 0 0 0 2px white;
  border: 1px solid rgba(255,255,255,0.5);
}

/* Animácia pop-in */
.animate-pop {
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.8) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* X v rohu */
.close-x {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #bdc3c7;
  transition: all 0.2s;
}

.close-x:hover { transform: scale(1.2); color: #e74c3c; }

/* Hlavička */
.header-section { margin-bottom: 1.5rem; }
.header-icon-glow {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(255, 152, 0, 0.4));
  margin-bottom: 0.5rem;
}
.title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #5d4037;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.divider {
  height: 4px;
  width: 40px;
  background: #ff9800;
  margin: 10px auto;
  border-radius: 2px;
}

/* Zoznam štatistík */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 2rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.stat-row:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  border-color: #ffe0b2;
}

.stat-info {
  text-align: left;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: #8d6e63;
  font-weight: 700;
}

.stat-value {
  font-size: 1.4rem;
  color: #2d1a12;
}

.stat-icon-bg {
  font-size: 1.5rem;
  background: #fdf5e6;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

/* Červený efekt pre spálené */
.burnt .stat-label { color: #e53935; }
.burnt .stat-value { color: #e53935; }
.burnt .stat-icon-bg { background: #ffebee; }

.stars-display {
  font-size: 1.2rem;
  letter-spacing: 3px;
}

/* 3D Tlačidlo */
.confirm-btn {
  width: 100%;
  padding: 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 1.1rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 0 #388e3c;
  transition: all 0.1s;
}

.confirm-btn:hover { background: #45a049; }
.confirm-btn:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #388e3c;
}

/* Plávajúce dekorácie na pozadí */
.modal-bg-decor .m-float {
  position: absolute;
  font-size: 2.5rem;
  opacity: 0.2;
  z-index: 1;
}
.m-1 { top: 20%; left: 20%; animation: float 6s infinite; }
.m-2 { bottom: 20%; right: 20%; animation: float 8s infinite 1s; }
.m-3 { top: 50%; left: 10%; animation: float 7s infinite 0.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* Responzivita pre malé mobily */
@media (max-width: 400px) {
  .modal-card { padding: 1.5rem 1rem; }
  .stat-label { font-size: 0.75rem; }
  .stat-value { font-size: 1.2rem; }
}
</style>