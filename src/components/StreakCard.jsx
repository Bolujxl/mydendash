import { useMemo } from 'react'
import { recalcStreak, getStreakCopy } from '../utils/streakUtils'

function FlameIcon({ glowing }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      className={`flame-icon ${glowing ? 'flame-glow' : ''}`}
    >
      <path
        d="M12 2C9.5 6 5 8.5 5 13C5 16.9 8.1 20 12 20C15.9 20 19 16.9 19 13C19 8.5 14.5 6 12 2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M12 20C13.4 18.5 14 16.5 13 14C11.8 11.2 12 9 12 7C12 9 12.2 11.2 11 14C10 16.5 10.6 18.5 12 20Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  )
}

function StreakCard({ events }) {
  const streak = useMemo(() => recalcStreak(events), [events])
  const copy = getStreakCopy(streak.currentStreak)
  const glowing = streak.current >= 7

  return (
    <div className="stat-card stat-card--streak">
      <div className="stat-card-icon-wrap">
        <FlameIcon glowing={glowing} />
      </div>
      <div className="stat-card-body">
        <div className="streak-main">
          <span className="stat-card-value">{streak.current}</span>
          <span className="stat-card-label">DAY STREAK</span>
        </div>
        <p className="streak-copy">{copy}</p>
      </div>
    </div>
  )
}

export default StreakCard