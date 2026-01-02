// src/utils/progress.js
import levelsData from '@/data/levels.json'

const KEY = 'chef-progress'
const STATS_KEY = 'master_chef_global_stats'

/**
 * Vráti poradie kuchýň:
 * - primárne zachová pôvodné poradie (ak existujú)
 * - doplní nové kuchyne z levels.json automaticky na koniec
 */
const BASE_CUISINE_ORDER = ['asian', 'mexican', 'italian', 'american']

const getCuisineOrder = () => {
  const fromJson = Object.keys(levelsData || {})
  const merged = [...BASE_CUISINE_ORDER]

  for (const k of fromJson) {
    if (!merged.includes(k)) merged.push(k)
  }
  return merged
}

const getCuisineLevelIds = (cuisine) => {
  return (levelsData?.[cuisine]?.levels || []).map(l => l.level)
}

const getCuisineLevelCount = (cuisine) => {
  const cnt = (levelsData?.[cuisine]?.levels || []).length
  return cnt > 0 ? cnt : 4 // fallback ak by JSON chýbal
}

/**
 * Prevedie vstupný `level` na "local level index" 1..N:
 * - ak príde globálne levelId (napr. 5), nájde ho v levels.json a vráti index+1
 * - ak príde už local index (1..N), nechá ho
 * - ak sa nedá nájsť, fallbackne ho nechá (aby to nepadlo)
 */
const toLocalLevelIndex = (cuisine, level) => {
  const ids = getCuisineLevelIds(cuisine)
  if (ids.length > 0) {
    const idx = ids.indexOf(level)
    if (idx !== -1) return idx + 1
  }
  return level
}

/**
 * Zabezpečí, že progress objekt obsahuje všetky kuchyne z levels.json
 * a má všetky potrebné polia.
 */
const normalizeAllProgress = (all) => {
  const order = getCuisineOrder()

  for (const cuisine of order) {
    if (!all[cuisine]) {
      // prvá kuchyňa defaultne odomknutá na 1, ostatné zamknuté
      all[cuisine] = {
        unlocked: cuisine === order[0] ? 1 : 0,
        stars: {},
        attempts: {},
        bestTimes: {},
        completed: false
      }
      continue
    }

    // doplnenie chýbajúcich polí (kvôli starým uloženým dátam)
    if (typeof all[cuisine].unlocked !== 'number') all[cuisine].unlocked = 0
    if (!all[cuisine].stars) all[cuisine].stars = {}
    if (!all[cuisine].attempts) all[cuisine].attempts = {}
    if (!all[cuisine].bestTimes) all[cuisine].bestTimes = {}
    if (typeof all[cuisine].completed !== 'boolean') all[cuisine].completed = false
  }

  return all
}

export const loadProgress = () => {
  const raw = localStorage.getItem(KEY)
  const parsed = raw ? JSON.parse(raw) : {}
  const normalized = normalizeAllProgress(parsed)
  // uložíme späť aby sa doplnili nové kuchyne aj do storage
  localStorage.setItem(KEY, JSON.stringify(normalized))
  return normalized
}

export const saveProgress = (data) => {
  const normalized = normalizeAllProgress(data || {})
  localStorage.setItem(KEY, JSON.stringify(normalized))
}

export const getCuisineProgress = (cuisine) => {
  const all = loadProgress()
  if (!all[cuisine]) {
    all[cuisine] = {
      unlocked: 0,
      stars: {},
      attempts: {},
      bestTimes: {},
      completed: false
    }
    saveProgress(all)
  }
  return all[cuisine]
}

/**
 * Započíta pokus pre level.
 * Prijme buď local level (1..N) alebo globálne levelId — uloží vždy pod local indexom.
 */
export const incrementLevelAttempt = (cuisine, level) => {
  const all = loadProgress()
  if (!all[cuisine]) all[cuisine] = getCuisineProgress(cuisine)

  const localLevel = toLocalLevelIndex(cuisine, level)

  if (!all[cuisine].attempts) all[cuisine].attempts = {}
  all[cuisine].attempts[localLevel] = (all[cuisine].attempts[localLevel] || 0) + 1

  saveProgress(all)
  return all[cuisine].attempts[localLevel]
}

/**
 * Uloží výsledok levelu.
 * Prijme buď local level (1..N) alebo globálne levelId — uloží vždy pod local indexom.
 */
export const updateLevelResult = (cuisine, level, stars, timeInSeconds) => {
  const all = loadProgress()

  if (!all[cuisine]) {
    all[cuisine] = {
      unlocked: 1,
      stars: {},
      attempts: {},
      bestTimes: {},
      completed: false
    }
  }

  const prog = all[cuisine]
  const localLevel = toLocalLevelIndex(cuisine, level)

  // 1) hviezdy
  prog.stars[localLevel] = Math.max(prog.stars[localLevel] || 0, stars)

  // 2) best time (len ak aspoň 1 hviezda)
  if (stars >= 1 && timeInSeconds != null) {
    const oldBest = prog.bestTimes?.[localLevel]
    if (!oldBest || timeInSeconds < oldBest) {
      prog.bestTimes[localLevel] = timeInSeconds
    }
  }

  // 3) odomknutie ďalšieho levelu (posúvame iba keď hráč prejde "aktuálne odomknutý")
  if (stars > 0 && localLevel === prog.unlocked) {
    prog.unlocked = localLevel + 1
  }

  // 4) dokončenie kuchyne podľa reálneho počtu levelov
  const totalLevels = getCuisineLevelCount(cuisine)
  if (prog.unlocked > totalLevels) {
    prog.completed = true
    unlockNextCuisine(all, cuisine)
  }

  all[cuisine] = prog
  saveProgress(all)
}

/* =====================
    INTERNÉ
===================== */

const unlockNextCuisine = (all, cuisine) => {
  const order = getCuisineOrder()
  const idx = order.indexOf(cuisine)
  const next = order[idx + 1]

  if (next) {
    if (!all[next]) {
      all[next] = {
        unlocked: 0,
        stars: {},
        attempts: {},
        bestTimes: {},
        completed: false
      }
    }

    // odomkni prvý level ďalšej kuchyne
    if (all[next].unlocked === 0) {
      all[next].unlocked = 1
    }
  }
}

/* =====================
    GLOBÁLNE ŠTATISTIKY
===================== */

export const getGlobalStats = () => {
  const raw = localStorage.getItem(STATS_KEY)
  const global = raw ? JSON.parse(raw) : {
    totalScore: 0,
    totalServed: 0,
    totalStars: 0
  }

  const progress = loadProgress()
  let totalAttempts = 0

  Object.values(progress).forEach(cuisine => {
    if (cuisine?.attempts) {
      Object.values(cuisine.attempts).forEach(count => {
        totalAttempts += (count || 0)
      })
    }
  })

  return {
    totalScore: global.totalScore || 0,
    totalServed: global.totalServed || 0,
    totalStars: global.totalStars || 0,
    totalGames: totalAttempts
  }
}

export const saveGameToStats = ({ score, served, stars }) => {
  const stats = getGlobalStats()

  stats.totalScore += (score || 0)
  stats.totalServed += (served || 0)
  stats.totalStars += (stars || 0)
  stats.totalGames = (stats.totalGames || 0) + 1

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}
