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
        <Navbar />
        <main className="main-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/github" element={<GitHub />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
