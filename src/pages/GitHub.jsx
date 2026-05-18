import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Loader2, MapPin, Users, FolderGit2, Globe,
  ChevronRight, X
} from 'lucide-react'
import RepoCard from '../components/RepoCard'
import '../styles/GitHub.css'

const GHOST_PROFILES = [
  { name: 'Linus Torvalds', login: 'torvalds', repos: 42, followers: '180k' },
  { name: 'Dan Abramov',    login: 'gaearon',  repos: 67, followers: '89k'  },
  { name: 'Sindre Sorhus',  login: 'sindresorhus', repos: 1200, followers: '45k' },
  { name: 'Addy Osmani',    login: 'addyosmani', repos: 88, followers: '30k' },
]

function GitHub() {
  const [username, setUsername] = useState('')
  const [searchedUser, setSearchedUser] = useState('')
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [selectedLangs, setSelectedLangs] = useState([])

  const profileUrl = searchedUser
    ? `https://api.github.com/users/${searchedUser}`
    : null
  const reposUrl = searchedUser
    ? `https://api.github.com/users/${searchedUser}/repos?per_page=100&sort=updated`
    : null
  const token = import.meta.env.VITE_GITHUB_TOKEN

  const { data: profile, isLoading: profileLoading, error: profileErr } = useQuery({
    queryKey: ['gh-profile', searchedUser],
    queryFn: async ({ signal }) => {
      const res = await fetch(profileUrl, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!searchedUser,
    staleTime: 5 * 60 * 1000,
  })

  const { data: repos, isLoading: reposLoading, error: reposErr } = useQuery({
    queryKey: ['gh-repos', searchedUser],
    queryFn: async ({ signal }) => {
      const res = await fetch(reposUrl, {
        signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    enabled: !!searchedUser,
    staleTime: 5 * 60 * 1000,
  })

  const profileError = profileErr?.message || null
  const reposError = reposErr?.message || null

  const handleSearch = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setSearchedUser(username.trim())
      setFilter('')
      setSortBy('updated')
      setSelectedLangs([])
    }
  }

  const availableLangs = useMemo(() => {
    if (!Array.isArray(repos)) return []
    const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))]
    return langs.sort()
  }, [repos])

  const filteredRepos = useMemo(() => {
    if (!repos || !Array.isArray(repos)) return []
    let list = [...repos]
      .filter((r) => selectedLangs.length === 0 || selectedLangs.includes(r.language))
      .filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()))
    if (sortBy === 'stars') {
      list.sort((a, b) => b.stargazers_count - a.stargazers_count)
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [repos, filter, sortBy, selectedLangs])

  const toggleLang = (lang) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const loading = profileLoading || reposLoading
  const error = profileError || reposError

  return (
    <div className="github-page">
      <h1 className="page-title">
        <Globe size={22} className="page-title-icon" />
        GitHub Explorer
      </h1>

      {!searchedUser ? (
        <div className="gh-hero-wrapper">
          <div className="gh-ghost-cards">
            {GHOST_PROFILES.map((p, i) => (
              <div key={p.login} className={`gh-ghost-card gh-ghost-${i}`}>
                <div className="gh-ghost-avatar" />
                <div className="gh-ghost-name">{p.name}</div>
                <div className="gh-ghost-login">@{p.login}</div>
                <div className="gh-ghost-stats">
                  <span>{p.repos} repos</span>
                  <span>{p.followers} followers</span>
                </div>
              </div>
            ))}
          </div>

          <div className="gh-hero-search">
            <h2 className="gh-hero-heading">Who are you looking for?</h2>
            <p className="gh-hero-subtext">Search any GitHub profile to explore their work</p>
            <form className="gh-hero-form" onSubmit={handleSearch}>
              <div className="gh-hero-input-wrap">
                <Search size={18} className="gh-hero-search-icon" />
                <input
                  type="text"
                  className="gh-hero-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
                <span className="gh-hero-kbd">⏎</span>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {loading && (
        <div className="github-loading">
          <Loader2 size={20} className="spin-icon" />
          <span>Loading profile...</span>
        </div>
      )}

      {error && !loading && !profile && (
        <div className="gh-error-state">
          <Search size={40} className="gh-error-icon" />
          <p className="gh-error-text">No developer found for &apos;<strong>{searchedUser}</strong>&apos;</p>
          <p className="gh-error-sub">Double-check the username and try again</p>
          <button className="gh-error-back" onClick={() => setSearchedUser('')}>
            Try another search
          </button>
        </div>
      )}

      {!loading && !error && profile && (
        <>
          <form className="gh-re-search" onSubmit={handleSearch}>
            <Search size={16} />
            <input
              type="text"
              className="gh-re-search-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Search another user..."
            />
          </form>

          <div className="gh-profile-hero">
            <img
              src={profile.avatar_url}
              alt={profile.name || searchedUser}
              className="gh-avatar"
            />
            <div className="gh-profile-body">
              <div className="gh-profile-top">
                <div>
                  <h2 className="gh-profile-name">{profile.name || searchedUser}</h2>
                  <p className="gh-profile-login">@{profile.login}</p>
                </div>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gh-view-link"
                >
                  View on GitHub <ChevronRight size={14} />
                </a>
              </div>
              {profile.bio && <p className="gh-profile-bio">{profile.bio}</p>}
              <div className="gh-profile-meta">
                {profile.location && (
                  <span><MapPin size={13} /> {profile.location}</span>
                )}
                <span><Users size={13} /> {profile.followers} followers</span>
                <span><Users size={13} /> {profile.following} following</span>
                <span><FolderGit2 size={13} /> {profile.public_repos} repos</span>
              </div>
            </div>
          </div>

          {repos && Array.isArray(repos) && (
            <div className="repos-section">
              <div className="repos-header">
                <h2 className="section-title">
                  {searchedUser}&apos;s repositories ({filteredRepos.length})
                </h2>
                <div className="repos-controls">
                  <input
                    type="text"
                    className="repo-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter repos by name..."
                  />
                  <select
                    className="repo-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="updated">Recent</option>
                    <option value="stars">Stars</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              {availableLangs.length > 0 && (
                <div className="lang-pills">
                  {availableLangs.map((lang) => (
                    <button
                      key={lang}
                      className={`lang-pill ${selectedLangs.includes(lang) ? 'active' : ''}`}
                      onClick={() => toggleLang(lang)}
                    >
                      {selectedLangs.includes(lang) && <X size={10} />}
                      {lang}
                    </button>
                  ))}
                </div>
              )}

              {filteredRepos.length === 0 ? (
                <p className="repos-empty">No repositories match your filters.</p>
              ) : (
                <div className="repos-grid">
                  {filteredRepos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GitHub