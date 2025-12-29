// src/utils/progress.js
const KEY = 'chef-progress'

const CUISINE_ORDER = ['asian', 'mexican', 'italian', 'american']

const DEFAULT_PROGRESS = {
  asian:   { unlocked: 1, stars: {}, attempts: {}, bestTimes: {}, completed: false },
  mexican: { unlocked: 0, stars: {}, attempts: {}, bestTimes: {}, completed: false },
  italian: { unlocked: 0, stars: {}, attempts: {}, bestTimes: {}, completed: false },
  american:{ unlocked: 0, stars: {}, attempts: {}, bestTimes: {}, completed: false }
}

// Funkcia na započítanie pokusu (voláme pri štarte levelu)
export const incrementLevelAttempt = (cuisine, level) => {
  const all = loadProgress();
  if (!all[cuisine].attempts) all[cuisine].attempts = {};
  
  all[cuisine].attempts[level] = (all[cuisine].attempts[level] || 0) + 1;
  saveProgress(all);
  return all[cuisine].attempts[level]; // Vrátime aktuálny počet pokusov
};


export const loadProgress = () => {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : structuredClone(DEFAULT_PROGRESS)
}

export const saveProgress = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export const getCuisineProgress = (cuisine) => {
  const all = loadProgress()

  if (!all[cuisine]) {
    all[cuisine] = { unlocked: 0, stars: {}, completed: false }
    saveProgress(all)
  }

  return all[cuisine]
}

export const updateLevelResult = (cuisine, level, stars, timeInSeconds) => {
  const all = loadProgress()

  // Poistka, ak by krajina v objekte chýbala
  if (!all[cuisine]) {
    all[cuisine] = { unlocked: 1, stars: {}, completed: false, bestTimes: {}, attempts: {} }
  }

  const prog = all[cuisine]

  // 1. Uloženie najlepšieho výsledku hviezd
  prog.stars[level] = Math.max(prog.stars[level] || 0, stars)

  // 2. Uloženie najlepšieho času (iba ak hráč získal aspoň 1 hviezdu)
  // Teraz už funkcia vie, čo je timeInSeconds
  if (stars >= 1 && timeInSeconds != null) {
    if (!prog.bestTimes) prog.bestTimes = {};
    const oldBest = prog.bestTimes[level];
    
    if (!oldBest || timeInSeconds < oldBest) {
      prog.bestTimes[level] = timeInSeconds;
    }
  }

  // 3. Posun odomknutia ďalšieho levelu
  if (stars > 0 && level === prog.unlocked) {
    prog.unlocked = level + 1
  }

  // 4. Ak je prejdených všetkých 4 levelov, odomkneme ďalšiu krajinu
  if (prog.unlocked > 4) {
    prog.completed = true
    unlockNextCuisine(all, cuisine)
  }

  all[cuisine] = prog
  saveProgress(all) // TENTO RIADOK SA PREDTÝM NIKDY NESPUSTIL KVÔLI CHYBE
}

/* =====================
    INTERNÉ
===================== */

const unlockNextCuisine = (all, cuisine) => {
  const idx = CUISINE_ORDER.indexOf(cuisine)
  const next = CUISINE_ORDER[idx + 1]

  // Ak existuje ďalšia krajina a je zamknutá (0), odomkneme jej 1. level
  if (next && all[next].unlocked === 0) {
    all[next].unlocked = 1
  }
}

/* =====================
    GLOBÁLNE ŠTATISTIKY
===================== */

const STATS_KEY = 'master_chef_global_stats'

export const getGlobalStats = () => {
  // 1. Načítame základné globálne štatistiky (skóre, hviezdy, obslúžení zákazníci)
  const raw = localStorage.getItem(STATS_KEY)
  const global = raw ? JSON.parse(raw) : {
    totalScore: 0,
    totalServed: 0,
    totalStars: 0
  }

  // 2. Načítame detailný progres, kde máš uložené 'attempts' (pokusy) pre každý level
  const progress = loadProgress()
  let totalAttempts = 0

  // 3. Prejdeme všetky krajiny (asian, mexican, atď.) a sčítame všetky pokusy
  Object.values(progress).forEach(cuisine => {
    if (cuisine.attempts) {
      // cuisine.attempts vyzerá napr. takto: { "1": 5, "2": 3 }
      Object.values(cuisine.attempts).forEach(count => {
        totalAttempts += (count || 0)
      })
    }
  })

  // 4. Vrátime jeden spojený objekt, ktorý StatsModal.vue očakáva
  return {
    totalScore: global.totalScore || 0,
    totalServed: global.totalServed || 0,
    totalStars: global.totalStars || 0,
    totalGames: totalAttempts // Toto sa v StatsModal zobrazí ako "Odohrané levely/hry"
  }
}

// PRIDAL SOM SEM TIETO ZÁTVORKY { }, aby to vedelo prečítať ten objekt z GameScreen
export const saveGameToStats = ({ score, served, stars }) => {
  const stats = getGlobalStats()
  
  // Pridaná poistka (|| 0), aby sa nepripočítalo "undefined"
  stats.totalScore += (score || 0)
  stats.totalServed += (served || 0)
  stats.totalStars += (stars || 0)
  stats.totalGames = (stats.totalGames || 0) + 1

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}