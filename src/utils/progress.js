// src/utils/progress.js
const KEY = 'chef-progress'

const CUISINE_ORDER = ['asian', 'mexican', 'italian', 'american']

const DEFAULT_PROGRESS = {
  asian:   { unlocked: 1, stars: {}, completed: false },
  mexican: { unlocked: 0, stars: {}, completed: false },
  italian: { unlocked: 0, stars: {}, completed: false },
  american:{ unlocked: 0, stars: {}, completed: false }
}

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
    // fallback pre staré / chýbajúce dáta
    all[cuisine] = { unlocked: 0, stars: {}, completed: false }
    saveProgress(all)
  }

  return all[cuisine]
}

export const updateLevelResult = (cuisine, level, stars) => {
  const all = loadProgress()

  const prog = all[cuisine] || {
    unlocked: 1,
    stars: {},
    completed: false
  }

  // ulož najlepšie hviezdy
  prog.stars[level] = Math.max(prog.stars[level] || 0, stars)

  // POSUN ODOMKNUTIA
  if (stars > 0 && level === prog.unlocked) {
    prog.unlocked = level + 1
  }

  // DOKONČENÁ KRAJINA
  if (prog.unlocked > 4) {
    prog.completed = true
  }

  all[cuisine] = prog
  saveProgress(all)
}

/* =====================
   INTERNÉ
===================== */

const unlockNextCuisine = (all, cuisine) => {
  const idx = CUISINE_ORDER.indexOf(cuisine)
  const next = CUISINE_ORDER[idx + 1]

  if (next && all[next].unlocked === 0) {
    all[next].unlocked = 1
  }
}