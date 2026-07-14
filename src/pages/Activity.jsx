import { useMemo, useState, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, Calendar, Code, Star } from 'lucide-react'
import { GithubUserContext } from '../context/GithubUserContext'
import CommitHeatmap from '../components/CommitHeatmap'
import { getLangColor } from '../utils/langColors'
import { getRelativeTime } from '../utils/time'
import '../styles/Activity.css'

function getActivityBadge(repo) {
  if (!repo.pushed_at) return { label: 'Dormant', class: 'dormant' }
  const days = (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000
  if (days <= 14) return { label: 'Active', class: 'active' }
  if (days <= 60) return { label: 'Moderate', class: 'moderate' }
  return { label: 'Dormant', class: 'dormant' }
}

function ActivityPage() {
  // P2 fix: read username from shared context (reactive, no IIFE)
  const { username: ghUser } = useContext(GithubUserContext)

  const eventsUrl = `https://api.github.com/users/${ghUser}/events?per_page=100`
  const reposUrl = `https://api.github.com/users/${ghUser}/repos?per_page=100`

  const { data: events, isLoading: evLoading } = useQuery({
    queryKey: ['events', ghUser],
    queryFn: async ({ signal }) => {
      const res = await fetch(eventsUrl, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 2 * 60 * 1000,
  })

  const { data: repos } = useQuery({
    queryKey: ['repos', ghUser],
    queryFn: async ({ signal }) => {
      const res = await fetch(reposUrl, { signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const [sortKey, setSortKey] = useState('pushed')
  const [sortDir, setSortDir] = useState('desc')

  const sortedRepos = useMemo(() => {
    if (!Array.isArray(repos)) return []
    const list = [...repos]
    if (sortKey === 'stars') list.sort((a, b) => b.stargazers_count - a.stargazers_count)
    else if (sortKey === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => new Date(b.pushed_at || 0).getTime() - new Date(a.pushed_at || 0).getTime())
    if (sortDir === 'asc') list.reverse()
    return list
  }, [repos, sortKey, sortDir])

  // P5 fix: pushTotal respects the same 30-day cutoff as dayCount; avgCommits uses 4.3 weeks
  const codeStats = useMemo(() => {
    if (!Array.isArray(events)) return { topDay: '—', avgCommits: 0, topLang: '—' }

    const dayCount = [0, 0, 0, 0, 0, 0, 0]
    let pushTotal = 0
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    for (const e of events) {
      if (e.type === 'PushEvent') {
        const d = new Date(e.created_at)
        if (d > cutoff) {
          pushTotal++
          dayCount[d.getDay()]++
        }
      }
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const maxIdx = dayCount.indexOf(Math.max(...dayCount))
    const topDay = dayCount[maxIdx] > 0 ? days[maxIdx] : '—'
    const avgCommits = Math.round(pushTotal / 4.3)

    let topLang = '—'
    if (Array.isArray(repos)) {
      const langCount = {}
      for (const r of repos) {
        if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1
      }
      let max = 0
      for (const [lang, c] of Object.entries(langCount)) {
        if (c > max) { max = c; topLang = lang }
      }
    }

    return { topDay, avgCommits, topLang }
  }, [events, repos])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortArrow = (key) => sortKey === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''

  return (
    <div className="activity-page">
      <h1 className="page-title">
        <Activity size={22} className="page-title-icon" /> Activity
      </h1>

      {evLoading ? (
        <div className="activity-loading"><div className="spinner" /><span>Loading activity...</span></div>
      ) : (
        <CommitHeatmap events={events} />
      )}

      <div className="code-stats-row">
        <div className="code-stat-card">
          <Calendar size={16} />
          <div>
            <span className="code-stat-label">Most active day</span>
            <span className="code-stat-value">{codeStats.topDay}</span>
          </div>
        </div>
        <div className="code-stat-card">
          <Activity size={16} />
          <div>
            <span className="code-stat-label">Avg pushes / week</span>
            <span className="code-stat-value">{codeStats.avgCommits}</span>
          </div>
        </div>
        <div className="code-stat-card">
          <Code size={16} />
          <div>
            <span className="code-stat-label">Top language</span>
            <span className="code-stat-value">{codeStats.topLang}</span>
          </div>
        </div>
      </div>

      <div className="repo-table-section">
        <h2 className="section-title">Repo Deep Dive</h2>
        <div className="repo-table-wrap">
          <table className="repo-table">
            <thead>
              <tr>
                <th
                  className="sortable"
                  onClick={() => toggleSort('name')}
                  aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSort('name')}
                >
                  Repository{sortArrow('name')}
                </th>
                <th>Language</th>
                <th
                  className="sortable num"
                  onClick={() => toggleSort('stars')}
                  aria-sort={sortKey === 'stars' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSort('stars')}
                >
                  Stars{sortArrow('stars')}
                </th>
                <th
                  className="sortable"
                  onClick={() => toggleSort('pushed')}
                  aria-sort={sortKey === 'pushed' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSort('pushed')}
                >
                  Last pushed{sortArrow('pushed')}
                </th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedRepos.map((repo) => {
                const badge = getActivityBadge(repo)
                return (
                  <tr key={repo.id}>
                    <td data-label="Repository">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-table-name">
                        {repo.name}
                      </a>
                    </td>
                    <td data-label="Language">
                      {repo.language ? (
                        <span className="repo-table-lang">
                          <span className="lang-dot" style={{ background: getLangColor(repo.language) }} />
                          {repo.language}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="num" data-label="Stars"><Star size={12} /> {repo.stargazers_count}</td>
                    <td data-label="Last pushed">{getRelativeTime(repo.pushed_at)}</td>
                    <td data-label="Status"><span className={`repo-badge ${badge.class}`}>{badge.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ActivityPage