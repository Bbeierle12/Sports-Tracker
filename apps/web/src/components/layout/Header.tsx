import { Calendar, Clock, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { SettingsModal } from '../settings'

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <header className="bg-surface border-b border-gray-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Sports Tracker</h1>
              <div className="px-3 py-1 bg-accent/20 rounded-full">
                <span className="text-accent font-semibold text-sm">LIVE</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-sm">{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-sm font-mono">{format(currentTime, 'HH:mm:ss')}</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}

export default Header
