import { Calendar, Clock, Settings, Menu } from 'lucide-react'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { SettingsModal } from '../settings'
import { useMobileMenu } from '../../contexts/MobileMenuContext'

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { toggleMenu } = useMobileMenu()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <header className="bg-surface border-b border-gray-700 sticky top-0 z-40">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={toggleMenu}
                className="md:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-white">Sports Tracker</h1>
              <div className="hidden sm:block px-3 py-1 bg-accent/20 rounded-full">
                <span className="text-accent font-semibold text-sm">LIVE</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              {/* Date - hidden on mobile, short format on tablet */}
              <div className="hidden md:flex items-center space-x-2 text-gray-300">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-sm hidden lg:inline">{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
                <span className="text-sm lg:hidden">{format(currentTime, 'MMM d')}</span>
              </div>
              {/* Time - always visible but condensed on mobile */}
              <div className="flex items-center space-x-1 sm:space-x-2 text-gray-300">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-xs sm:text-sm font-mono">{format(currentTime, 'HH:mm')}</span>
                <span className="hidden sm:inline text-xs sm:text-sm font-mono">:{format(currentTime, 'ss')}</span>
              </div>
              <button
                type="button"
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
