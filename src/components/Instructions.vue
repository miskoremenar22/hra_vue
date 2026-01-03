<script setup>
defineEmits(['close']);

const printPage = () => {
  window.print();
};
</script>

<template>
  <div class="instructions-overlay no-print-bg">
    <div class="instructions-card">
      <button class="close-btn no-print" @click="$emit('close')">×</button>

      <div class="printable-content">
        <h1 class="print-title">Master Chef - Popis a Návod</h1>
        
        <section>
          <h2>Popis hry</h2>
          <p>
            Master Chef je interaktívna kuchárska simulácia, kde sa hráč stáva šéfkuchárom 
            v štyroch svetových kuchyniach. Cieľom je správne kombinovať suroviny podľa 
            receptov a obsluhovať hladných zákazníkov v časovom limite.
          </p>
        </section>

        <section>
          <h2>Návod na riešenie</h2>
          <ol>
            <li><strong>Výber levelu:</strong> Zvoľte si kuchyňu a konkrétnu úroveň.</li>
            <li><strong>Príprava:</strong> Otvorte špajzu (🥫), pozrite si recepty (📖) a potiahnite správne suroviny na tácku.</li>
            <li><strong>Varenie:</strong> Po skompletizovaní receptu kliknite na "Uvariť" (🛎️).</li>
            <li><strong>Servírovanie:</strong> Po uvarení jedla, pretiahnite tácku s jedlom na daného zákazníka.</li>
          </ol>
        </section>

        <section class="mobile-instructions">
          <h2>Pokyny pre mobilné zariadenia 📱</h2>
          <p>
            Na mobilných zariadeniach používajte dlhé podržanie na surovine pre jej 
            uchopenie. Menu receptov sa ovláda potiahnutím (swipe) do strán.
          </p>
        </section>

        <button class="print-btn no-print" @click="printPage">
          🖨️ Vytlačiť návod
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Štýl pre obrazovku */
.instructions-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.instructions-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: #333;
  text-align: left;
}

.print-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 30px;
  border: none;
  background: none;
  cursor: pointer;
}

/* --- OPTIMALIZÁCIA PRE TLAČ --- */
@media print {
  /* Skryjeme všetko okrem návodu */
  :global(.menu-wrapper), 
  :global(.bg-decor), 
  :global(.menu-card), 
  :global(.game-screen),
  .no-print {
    display: none !important;
  }

  /* Upravíme kontajner pre čistý papier */
  .instructions-overlay {
    position: static;
    background: white;
    padding: 0;
  }

  .instructions-card {
    box-shadow: none;
    border: none;
    padding: 0;
    max-height: none;
    overflow: visible;
  }

  .print-title {
    display: block;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
  }
}

/* Zobrazenie mobilných pokynov len na malých displejoch */
@media (min-width: 769px) {
  .mobile-instructions {
    background: #f9f9f9;
    padding: 10px;
    border-left: 4px solid #ff9800;
  }
}
</style>