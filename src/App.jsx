import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import GitHub from './pages/GitHub'
import Tasks from './pages/Tasks'
import Activity from './pages/Activity'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Navbar />
        <main className="main-content" id="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/github" element={<GitHub />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
