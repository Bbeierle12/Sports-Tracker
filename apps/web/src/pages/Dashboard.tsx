import { useState, useMemo } from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { Loader2, AlertCircle, RefreshCw, Calendar, Wifi, WifiOff } from 'lucide-react'
import LiveScoreCard from '../components/games/LiveScoreCard'
import DateRangePicker from '../components/DateRangePicker'
import { useGames, type NHLGame } from '../hooks/queries/useGames'
import { useWebSocket } from '../hooks/useWebSocket'

interface GamesByDate {
  [date: string]: NHLGame[]
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useGames(dateStr)

  // WebSocket connection for real-time updates
  const { isConnected, lastUpdate: wsLastUpdate } = useWebSocket({
    sportIds: ['nhl'],
    enabled: true,
  })

  // Determine last updated time (prefer WebSocket update, fallback to query update)
  const lastUpdated = wsLastUpdate || (dataUpdatedAt ? new Date(dataUpdatedAt) : null)

  // Extract games from response
  const games = data?.gameWeek?.flatMap(week => week.games) || []
  const liveGames = games.filter(g => g.gameState === 'LIVE' || g.gameState === 'CRIT')
  const otherGames = games.filter(g => g.gameState !== 'LIVE' && g.gameState !== 'CRIT')

  // Group non-live games by date
  const gamesByDate = useMemo(() => {
    const grouped: GamesByDate = {}

    otherGames.forEach(game => {
      if (!game.gameDate) return // Skip if no date
      const gameDate = game.gameDate.split('T')[0] // Extract YYYY-MM-DD
      if (!grouped[gameDate]) {
        grouped[gameDate] = []
      }
      grouped[gameDate].push(game)
    })

    // Sort dates
    const sortedDates = Object.keys(grouped).sort()
    const sorted: GamesByDate = {}
    sortedDates.forEach(date => {
      sorted[date] = grouped[date]
    })

    return sorted
  }, [otherGames])

  const formatDateHeading = (dateStr: string) => {
    const date = parseISO(dateStr)
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')

    if (dateStr === todayStr) {
      return 'Today'
    }

    return format(date, 'EEEE, MMMM d')
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return null
    return formatDistanceToNow(lastUpdated, { addSuffix: true })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Live scores and game updates</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Connection status indicator */}
          <div className="flex items-center space-x-1 text-xs">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-gray-500" />
                <span className="text-gray-500">Polling</span>
              </>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-400 hover:text-accent transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <DateRangePicker value={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-semibold">Failed to load games</p>
            <p className="text-red-300 text-sm mt-1">Make sure the backend API is running on port 3001</p>
          </div>
        </div>
      )}

      {/* Live Games */}
      {!isLoading && liveGames.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-live rounded-full animate-pulse-glow"></div>
            <h3 className="text-xl font-semibold text-white">Live Games ({liveGames.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveGames.map((game) => (
              <LiveScoreCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Games by Date */}
      {!isLoading && Object.keys(gamesByDate).length > 0 && (
        <div className="space-y-8">
          {Object.entries(gamesByDate).map(([date, dateGames]) => (
            <div key={date}>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-semibold text-white">
                  {formatDateHeading(date)}
                </h3>
                <span className="text-gray-500 text-sm">({dateGames.length} games)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateGames.map((game) => (
                  <LiveScoreCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Games */}
      {!isLoading && !error && games.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-xl border border-gray-700">
          <p className="text-gray-400 text-lg">No games scheduled for this date</p>
          <p className="text-gray-500 text-sm mt-2">Try selecting a different date</p>
        </div>
      )}

      {/* Last updated timestamp */}
      {!error && games.length > 0 && (
        <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
          <span>
            {isConnected
              ? 'Real-time updates enabled'
              : 'Auto-refreshing every 30 seconds'}
          </span>
          {lastUpdated && (
            <>
              <span className="text-gray-600">|</span>
              <span>Updated {formatLastUpdated()}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
