import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import '../styles/ContributionChart.css'

function buildHeatmapData(events) {
  const days = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      short: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count: 0,
    })
  }

  if (!Array.isArray(events)) return days

  for (const e of events) {
    const dateStr = e.created_at?.slice(0, 10)
    const day = days.find((d) => d.date === dateStr)
    if (day) day.count++
  }

  return days
}

function getIntensity(count, max) {
  if (max === 0 || count === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

function ContributionChart({ events }) {
  const [hovered, setHovered] = useState(null)
  const data = useMemo(() => buildHeatmapData(events), [events])
  const total = data.reduce((s, d) => s + d.count, 0)
  const max = Math.max(...data.map((d) => d.count), 0)
  const hasData = data.some((d) => d.count > 0)

  return (
    <div className="chart-card chart-heatmap">
      <div className="chart-header">
        <h2 className="chart-title">
          <Activity size={16} /> Activity Pulse
        </h2>
        <span className="chart-subtitle">Last 30 days · {total} events</span>
      </div>

      {!hasData ? (
        <p className="chart-empty">No activity in the past 30 days.</p>
      ) : (
        <div className="heatmap-row">
          <div className="heatmap-cells">
            {data.map((day) => (
              <div
                key={day.date}
                className={`heatmap-cell heatmap-int-${getIntensity(day.count, max)} ${day.count > 0 ? 'has-data' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${day.label} — ${day.count} event${day.count !== 1 ? 's' : ''}`}
                onMouseEnter={() => setHovered(day)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(day)}
                onBlur={() => setHovered(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setHovered((h) => h?.date === day.date ? null : day)
                  }
                }}
              />
            ))}
          </div>
          <div className="heatmap-tooltip-area">
            <div className={`heatmap-tooltip ${hovered ? 'visible' : ''}`}>
              <span className="heatmap-tooltip-label">{hovered?.label || 'Hover a day to see activity'}</span>
              {hovered && (
                <span className="heatmap-tooltip-value">
                  {hovered.count} event{hovered.count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <span className="heatmap-cell heatmap-int-0" />
            <span className="heatmap-cell heatmap-int-1" />
            <span className="heatmap-cell heatmap-int-2" />
            <span className="heatmap-cell heatmap-int-3" />
            <span className="heatmap-cell heatmap-int-4" />
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContributionChart