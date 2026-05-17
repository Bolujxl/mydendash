const STORAGE_KEY = 'devdash_streak'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function loadStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* noop */ }
  return { current: 0, longest: 0, lastDate: null }
}

export function recalcStreak(completedCount, events) {
  const activeDates = new Set()
  const today = todayStr()

  // 1. Collect dates from GitHub events
  if (Array.isArray(events)) {
    events.forEach(e => {
      if (e.created_at) activeDates.add(e.created_at.slice(0, 10))
    })
  }

  // 2. Collect dates from Task completions
  try {
    const tasks = JSON.parse(localStorage.getItem('devdash_tasks')) || []
    tasks.forEach(t => {
      if (t.done && t.doneAt) activeDates.add(t.doneAt.slice(0, 10))
    })
  } catch { /* noop */ }

  // 3. Calculate consecutive days starting from today or yesterday
  let current = 0
  let checkDate = new Date()
  
  // If not active today, start checking from yesterday
  if (!activeDates.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Count backwards as long as we find consecutive active dates
  while (true) {
    const dStr = checkDate.toISOString().slice(0, 10)
    if (activeDates.has(dStr)) {
      current++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // 4. Update longest streak in storage
  const streak = loadStreak()
  streak.current = current
  if (current > streak.longest) {
    streak.longest = current
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streak))
  } catch { /* noop */ }

  return streak
}

export function getStreakCopy(current) {
  if (current === 0) return 'Start something today.'
  if (current === 1) return 'One step. Keep going.'
  if (current <= 4) return 'Building momentum →'
  if (current <= 9) return "You're in a rhythm now."
  if (current <= 19) return 'Two weeks of showing up. Rare.'
  if (current <= 29) return 'This is discipline, not motivation.'
  return "You've earned this. Don't stop."
}