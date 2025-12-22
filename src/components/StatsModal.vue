<script setup>
const emit = defineEmits(['close']);
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="emit('close')">×</button>
      <h2>Vaše Štatistiky</h2>
      
      <div class="stats-grid">
        <div class="stat-item">
          <span>Obslúžení zákazníci:</span>
          <strong>12</strong>
        </div>
        <div class="stat-item">
          <span>Spálené jedlá:</span>
          <strong>2</strong>
        </div>
        <div class="stat-item">
          <span>Získané hviezdičky:</span>
          <strong>⭐⭐⭐</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Aby bol vždy navrchu */
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 400px;
  max-width: 90%;
  color: #333;
  position: relative;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.stats-grid {
  margin-top: 20px;
  text-align: left;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
</style>