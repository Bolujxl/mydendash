import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Sun, Moon, LayoutDashboard, GitBranch, ClipboardList, Activity, Menu, X } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import '../styles/Navbar.css'

function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <Menu size={20} />
      </button>

      {open && <div className="sidebar-overlay" onClick={close} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={close} aria-label="Close menu">
          <X size={18} />
        </button>

        <div className="sidebar-brand">
          <svg
            width="34"
            height="34"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="myDen logo"
            className="sidebar-logo-svg"
          >
            <rect x="2" y="2" width="36" height="36" rx="9" fill="#000d1a" />
            <line x1="4" y1="10" x2="36" y2="10" stroke="#4a5568" strokeWidth="1" strokeLinecap="round" />
            <line x1="7" y1="10" x2="7" y2="7.5" stroke="#4a5568" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="12" y1="10" x2="12" y2="8" stroke="#4a5568" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="17" y1="10" x2="17" y2="7.5" stroke="#4a5568" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="22" y1="10" x2="22" y2="8" stroke="#4a5568" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="27" y1="10" x2="27" y2="7.5" stroke="#4a5568" strokeWidth="0.8" strokeLinecap="round" />
            <line x1="32" y1="10" x2="32" y2="8" stroke="#4a5568" strokeWidth="0.8" strokeLinecap="round" />
            <rect x="5" y="10" width="30" height="24" rx="3" fill="#000912" stroke="#00a1e0" strokeWidth="1.2" />
            <circle cx="15" cy="19" r="3" fill="currentColor" />
            <rect x="13" y="22" width="4" height="6" rx="1.5" fill="currentColor" />
            <rect x="13" y="26" width="2" height="4" rx="1" fill="currentColor" />
            <rect x="15" y="26" width="2" height="4" rx="1" fill="currentColor" />
            <rect x="21" y="21" width="3" height="9" rx="1" fill="#00a1e0" />
            <rect x="23" y="23" width="3" height="7" rx="1" fill="#00a1e0" opacity="0.7" />
            <rect x="25" y="26" width="3" height="4" rx="1" fill="#00a1e0" opacity="0.5" />
            <polyline points="21,21 23,18 25,16" fill="none" stroke="#00a1e0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          </svg>
          <div>
            <div className="app-name">
              <span className="app-name-my">my</span>Den
            </div>
            
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-group-label">Workspace</p>
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
              onClick={close}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div className="nav-group">
            <p className="nav-group-label">Tools</p>
            <NavLink
              to="/github"
              className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
              onClick={close}
            >
              <GitBranch size={17} />
              <span>GitHub</span>
            </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            onClick={close}
          >
            <ClipboardList size={18} />
            <span>Tasks</span>
          </NavLink>
          <NavLink
            to="/activity"
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            onClick={close}
          >
            <Activity size={18} />
            <span>Activity</span>
          </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Navbar