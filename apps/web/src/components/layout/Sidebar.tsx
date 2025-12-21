import { NavLink, useLocation } from 'react-router-dom'
import { Home, Trophy, Users, User } from 'lucide-react'
import { useSettings } from '../../contexts/SettingsContext'
import { getSportConfig } from '@nhl-dashboard/types'

const Sidebar = () => {
  const location = useLocation()
  const { enabledSports } = useSettings()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/standings', label: 'Standings', icon: Trophy },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/players', label: 'Players', icon: User },
  ]

  // Filter out NHL from enabled sports since it's the primary dashboard
  const additionalSports = enabledSports.filter((id) => id !== 'nhl')

  return (
    <aside className="w-64 bg-surface min-h-[calc(100vh-73px)] border-r border-gray-700">
      {/* NHL Section */}
      <nav className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
          NHL
        </h3>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-gray-300 hover:bg-surface-light hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Other Sports Section */}
      {additionalSports.length > 0 && (
        <nav className="p-4 border-t border-gray-700">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
            Other Sports
          </h3>
          <ul className="space-y-1">
            {additionalSports.map((sportId) => {
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
    </aside>
  )
}

export default Sidebar
