import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SportDashboard from './pages/SportDashboard'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            {/* NHL Dashboard (primary) */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/standings" element={<div className="text-white text-xl">Standings - Coming Soon</div>} />
            <Route path="/teams" element={<div className="text-white text-xl">Teams - Coming Soon</div>} />
            <Route path="/players" element={<div className="text-white text-xl">Players - Coming Soon</div>} />

            {/* Multi-sport routes */}
            <Route path="/sports" element={<SportDashboard />} />
            <Route path="/sports/:sportId" element={<SportDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
