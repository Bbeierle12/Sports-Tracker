import { NavLink, useLocation } from 'react-router-dom'
import { Home, Settings, Users, Trophy, X } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { useMobileMenu } from '../../contexts/MobileMenuContext'
import { getSportConfig } from '@sports-tracker/types'

const Sidebar = () => {
  const location = useLocation()
  const { enabledSports } = useSettings()
  const { isOpen, closeMenu } = useMobileMenu()

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-surface border-r border-gray-700
          transform transition-transform duration-300 ease-in-out
          md:transform-none md:min-h-[calc(100vh-73px)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-white font-semibold">Menu</span>
          <button
            type="button"
            onClick={closeMenu}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            Navigation
          </h3>
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive && location.pathname === '/'
                      ? 'bg-accent text-white'
                      : 'text-gray-300 hover:bg-surface-light hover:text-white'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/team-statistics"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-300 hover:bg-surface-light hover:text-white'
                  }`
                }
              >
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Team Statistics</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/player-statistics"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-300 hover:bg-surface-light hover:text-white'
                  }`
                }
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Player Statistics</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Sports Section */}
        {enabledSports.length > 0 && (
          <nav className="p-4 border-t border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              My Sports
            </h3>
            <ul className="space-y-1">
              {enabledSports.map((sportId) => {
                const config = getSportConfig(sportId)
                if (!config) return null

                const isActive = location.pathname === `/sports/${sportId}`

                return (
                  <li key={sportId}>
                    <NavLink
                      to={`/sports/${sportId}`}
                      className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'text-gray-300 hover:bg-surface-light hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-medium">{config.shortName}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}

        {/* Settings hint when no sports enabled */}
        {enabledSports.length === 0 && (
          <div className="p-4 border-t border-gray-700">
            <div className="text-center py-4">
              <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No sports enabled</p>
              <p className="text-gray-600 text-xs mt-1">Use settings to add sports</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

export default Sidebar
