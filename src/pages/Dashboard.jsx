import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FolderGit2, Users, Star, CheckCircle2, GitFork,
  ChevronRight
} from 'lucide-react'
import useFetch from '../hooks/useFetch'
import WeatherWidget from '../components/WeatherWidget'
import ActivityFeed from '../components/ActivityFeed'
import ContributionChart from '../components/ContributionChart'
import StreakCard from '../components/StreakCard'
import Silk from '../components/Silk'
import { getLangColor } from '../utils/langColors'
import '../styles/Dashboard.css'

const GH_USER_KEY = 'devdash_github_user'

function getSavedUsername() {
  try {
    return localStorage.getItem(GH_USER_KEY) || 'bolujxl'
  } catch {
    return 'bolujxl'
  }
}

function Dashboard() {
  const [completedCount] = useState(() => {
    try {
      const tasks = JSON.parse(localStorage.getItem('devdash_tasks')) || []
      return tasks.filter((t) => t.done).length
    } catch {
      return 0
    }
  })
  const [usernameInput, setUsernameInput] = useState('')
  const [savedUsername, setSavedUsername] = useState(getSavedUsername)
  const [editing, setEditing] = useState(false)
  const [pillInput, setPillInput] = useState('')

  const profileUrl = savedUsername
    ? `https://api.github.com/users/${savedUsername}`
    : null
  const reposUrl = savedUsername
    ? `https://api.github.com/users/${savedUsername}/repos?per_page=100&sort=updated`
    : null
  const eventsUrl = savedUsername
    ? `https://api.github.com/users/${savedUsername}/events?per_page=30`
    : null

  const token = import.meta.env.VITE_GITHUB_TOKEN

  const { data: profile, isLoading: profileLoading, error: profileErr } = useQuery({
    queryKey: ['profile', savedUsername],
    queryFn: async ({ signal }) => {
      const res = await fetch(profileUrl, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      return res.json()
    },
    enabled: !!savedUsername,
    staleTime: 5 * 60 * 1000,
  })

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ['repos', savedUsername],
    queryFn: async ({ signal }) => {
      const res = await fetch(reposUrl, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      return res.json()
    },
    enabled: !!savedUsername,
    staleTime: 5 * 60 * 1000,
  })

  const { data: events } = useQuery({
    queryKey: ['events', savedUsername],
    queryFn: async ({ signal }) => {
      const res = await fetch(eventsUrl, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      return res.json()
    },
    enabled: !!savedUsername,
    staleTime: 2 * 60 * 1000,
  })

  const profileError = profileErr?.message || null

  const totalStars = Array.isArray(repos)
    ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    : 0

  const uniqueLanguages = useMemo(() => {
    if (!Array.isArray(repos)) return 0
    const langs = new Set(repos.map((r) => r.language).filter(Boolean))
    return langs.size
  }, [repos])
  const recentRepos = useMemo(() => {
    if (!Array.isArray(repos)) return []
    return repos.slice(0, 4)
  }, [repos])

  const [timeRange, setTimeRange] = useState('30d')

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return []
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - ({ '7d': 7, '30d': 30, '3mo': 90 }[timeRange]))
    return events.filter((e) => new Date(e.created_at) > cutoff)
  }, [events, timeRange])

  const contributionStats = useMemo(() => {
    if (!Array.isArray(filteredEvents)) return null
    let pushes = 0
    let prs = 0
    let issues = 0
    for (const e of filteredEvents) {
      if (e.type === 'PushEvent') pushes++
      if (e.type === 'PullRequestEvent' && e.payload?.action === 'opened') prs++
      if (e.type === 'IssuesEvent' && e.payload?.action === 'opened') issues++
    }
    const parts = []
    if (pushes) parts.push(`${pushes} pushes`)
    if (prs) parts.push(`${prs} PRs`)
    if (issues) parts.push(`${issues} issues`)
    const rangeLabel = { '7d': 'last 7 days', '30d': 'last 30 days', '3mo': 'last 3 months' }
    return parts.length ? `Recent activity: ${parts.join(' · ')} in ${rangeLabel[timeRange]}` : `No activity in ${rangeLabel[timeRange]}`
  }, [filteredEvents, timeRange])

  const handleSetUsername = (e) => {
    e.preventDefault()
    const trimmed = usernameInput.trim()
    if (!trimmed) return
    setSavedUsername(trimmed)
    setUsernameInput('')
    try {
      localStorage.setItem(GH_USER_KEY, trimmed)
    } catch { /* noop */ }
  }

  const handleChangeUsername = () => {
    setSavedUsername('')
    try {
      localStorage.removeItem(GH_USER_KEY)
    } catch { /* noop */ }
  }

  const handlePillKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = pillInput.trim()
      if (trimmed && trimmed !== savedUsername) {
        try { localStorage.setItem(GH_USER_KEY, trimmed) } catch { /* noop */ }
        window.location.reload()
      }
      setEditing(false)
      setPillInput('')
    }
    if (e.key === 'Escape') {
      setEditing(false)
      setPillInput('')
    }
  }

  const handlePillBlur = () => {
    setEditing(false)
    setPillInput('')
  }

  const openPillEditor = () => {
    setPillInput(savedUsername)
    setEditing(true)
  }

  const loading = profileLoading || reposLoading

  return (
    <div className="dashboard">
      <div className="silk-bg">
        <Silk
          speed={5}
          scale={1}
          color="#00a1e0"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {!savedUsername ? (
        <form className="gh-username-form" onSubmit={handleSetUsername}>
          <label className="gh-username-label" htmlFor="gh-username">
            Enter your GitHub username to populate your dashboard
          </label>
          <div className="gh-username-row">
            <input
              id="gh-username"
              type="text"
              className="gh-username-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. bolujxl"
              autoFocus
            />
            <button type="submit" className="gh-username-btn">
              Save
            </button>
          </div>
        </form>
      ) : null}

      {loading && !profile ? (
        <div className="dash-loading">
          <div className="spinner" />
          <span>Loading your dashboard...</span>
        </div>
      ) : null}

      {!loading && savedUsername && !profile ? (
        <div className="dash-error">
          <div className="dash-error-card">
            {profileError && profileError.includes('404') ? (
              <>
                <p className="dash-error-text">
                  User <strong>@{savedUsername}</strong> not found.
                </p>
                <button className="dash-error-btn" onClick={handleChangeUsername}>
                  Try a different username
                </button>
              </>
            ) : (
              <>
                <p className="dash-error-text">
                  {profileError
                    ? `Could not load dashboard. ${profileError}`
                    : 'No data available for this user.'}
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}

      {profile ? (
        <>
          <div className="bento-dashboard">
            <div className="hero-card bento-hero">
              <div className="hero-avatar-wrapper">
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  className="hero-avatar"
                />
                <div className="status-dot">
                  <div className="status-dot-ping"></div>
                </div>
              </div>
              <div className="hero-body">
                <div className="hero-top">
                  <div className="cli-header">
                    <div className="cli-dots">
                      <span className="cli-dot red"></span>
                      <span className="cli-dot yellow"></span>
                      <span className="cli-dot green"></span>
                    </div>
                    <span className="cli-path">~/{profile.login.toLowerCase()}</span>
                  </div>
                  <div>
                    <h1 className="hero-greeting">
                      Hi, <span className="highlight-name">{profile.name || profile.login}</span>
                    </h1>
                    <p className="hero-login">@{profile.login}</p>
                  </div>
                  <div className="hero-actions">
                    {editing ? (
                      <div className="hero-username-input-wrap">
                        <input
                          className="hero-username-input"
                          type="text"
                          value={pillInput}
                          onChange={(e) => setPillInput(e.target.value)}
                          onKeyDown={handlePillKeyDown}
                          onBlur={handlePillBlur}
                          autoFocus
                          placeholder="github username"
                          spellCheck={false}
                        />
                      </div>
                    ) : (
                      <button className="hero-username-pill" onClick={openPillEditor}>
                        <span className="pill-edit-icon">✎</span>
                        {savedUsername}
                      </button>
                    )}
                    <a
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-github-btn"
                    >
                      GitHub <ChevronRight size={14} />
                    </a>
                  </div>
                  
                  <div className="hero-inline-stats">
                    <div className="inline-stat">
                      <span className="stat-val">{profile.public_repos}</span> Repos
                    </div>
                    <span className="stat-divider"></span>
                    <div className="inline-stat">
                      <span className="stat-val">{profile.followers}</span> Followers
                    </div>
                    <span className="stat-divider"></span>
                    <div className="inline-stat">
                      <span className="stat-val">{profile.following}</span> Following
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-weather">
              <WeatherWidget />
            </div>

            <div className="stat-cards-row bento-stats">
              <StreakCard completedCount={completedCount} events={events} />
              <div className="stat-card stat-card--green">
                <div className="stat-card-icon-wrap">
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-card-body">
                  <div className="streak-main">
                    <span className="stat-card-value">{completedCount}</span>
                    <span className="stat-card-label">Tasks done</span>
                  </div>
                  <p className="stat-copy">{completedCount > 0 ? 'Keep the momentum.' : 'Ready to begin?'}</p>
                </div>
              </div>
              <div className="stat-card stat-card--blue">
                <div className="stat-card-icon-wrap">
                  <Star size={20} />
                </div>
                <div className="stat-card-body">
                  <div className="streak-main">
                    <span className="stat-card-value">{totalStars.toLocaleString()}</span>
                    <span className="stat-card-label">Total stars</span>
                  </div>
                  <p className="stat-copy">{totalStars > 0 ? 'Your work is valued.' : 'Ship something great.'}</p>
                </div>
              </div>
              <div className="stat-card stat-card--purple">
                <div className="stat-card-icon-wrap">
                  <FolderGit2 size={20} />
                </div>
                <div className="stat-card-body">
                  <div className="streak-main">
                    <span className="stat-card-value">
                      {reposLoading ? '...' : uniqueLanguages}
                    </span>
                    <span className="stat-card-label">Languages used</span>
                  </div>
                  <p className="stat-copy">{uniqueLanguages > 1 ? 'A versatile stack.' : 'Specialize and grow.'}</p>
                </div>
              </div>
            </div>

            <div className="dash-section bento-repos">
              <div className="dash-section-header">
                <h2 className="widget-title">
                  <Star size={16} /> Recent Repositories
                </h2>
              </div>
              <div className="top-repos-grid">
                {recentRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="top-repo-card"
                  >
                    <div className="top-repo-name">{repo.name}</div>
                    {repo.description && (
                      <p className="top-repo-desc">{repo.description}</p>
                    )}
                    <div className="top-repo-meta">
                      {repo.language && (
                        <span className="top-repo-lang">
                          <span className="lang-dot" style={{ background: getLangColor(repo.language) }} /> {repo.language}
                        </span>
                      )}
                      <span className="top-repo-stat">
                        <Star size={12} /> {repo.stargazers_count}
                      </span>
                      <span className="top-repo-stat">
                        <GitFork size={12} /> {repo.forks_count}
                      </span>
                    </div>
                  </a>
                ))}
                {recentRepos.length === 0 && !reposLoading && (
                  <p className="top-repos-empty">No repositories found.</p>
                )}
              </div>
            </div>

            <div className="dash-section bento-activity">
              <ActivityFeed events={filteredEvents} summary={contributionStats} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
            </div>

            <ContributionChart events={events} />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Dashboard