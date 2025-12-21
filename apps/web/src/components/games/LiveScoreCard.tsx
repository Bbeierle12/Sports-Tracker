import { Clock } from 'lucide-react'

interface Team {
  abbrev: string
  placeName?: { default: string }
  logo?: string
  score?: number
}

interface LiveScoreCardProps {
  game: {
    id: number
    gameState: string
    awayTeam: Team
    homeTeam: Team
    periodDescriptor?: {
      number: number
      periodType: string
    }
    clock?: {
      timeRemaining: string
      inIntermission: boolean
    }
  }
}

const LiveScoreCard = ({ game }: LiveScoreCardProps) => {
  if (!game?.awayTeam || !game?.homeTeam) return null

  const isLive = game.gameState === 'LIVE' || game.gameState === 'CRIT'
  const isFinal = game.gameState === 'FINAL' || game.gameState === 'OFF'

  const getTeamName = (team: Team) => team.placeName?.default || team.abbrev || 'TBD'
  const getTeamLogo = (team: Team) => team.logo || ''

  const getPeriodText = () => {
    if (!game.periodDescriptor) return ''
    const num = game.periodDescriptor.number
    if (num === 1) return '1st'
    if (num === 2) return '2nd'
    if (num === 3) return '3rd'
    if (num === 4) return 'OT'
    return `${num - 3}OT`
  }

  return (
    <div className={`bg-surface rounded-xl border ${isLive ? 'border-live' : 'border-gray-700'} p-5 relative overflow-hidden hover:border-accent transition-colors`}>
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <div className="w-2 h-2 bg-live rounded-full animate-pulse-glow"></div>
          <span className="text-live text-xs font-bold uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Teams */}
      <div className="space-y-4">
        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getTeamLogo(game.awayTeam) ? (
              <img
                src={getTeamLogo(game.awayTeam)}
                alt={game.awayTeam.abbrev}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs">
                {game.awayTeam.abbrev}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{getTeamName(game.awayTeam)}</p>
              <p className="text-gray-400 text-sm">{game.awayTeam.abbrev}</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-white">{game.awayTeam.score ?? 0}</span>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getTeamLogo(game.homeTeam) ? (
              <img
                src={getTeamLogo(game.homeTeam)}
                alt={game.homeTeam.abbrev}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-white font-bold text-xs">
                {game.homeTeam.abbrev}
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{getTeamName(game.homeTeam)}</p>
              <p className="text-gray-400 text-sm">{game.homeTeam.abbrev}</p>
            </div>
          </div>
          <span className="text-3xl font-bold text-white">{game.homeTeam.score ?? 0}</span>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {isFinal ? 'Final' : isLive ? getPeriodText() : 'Scheduled'}
          </span>
        </div>
        {isLive && game.clock && (
          <span className="text-accent text-sm font-semibold font-mono">
            {game.clock.inIntermission ? 'INT' : game.clock.timeRemaining}
          </span>
        )}
      </div>
    </div>
  )
}

export default LiveScoreCard
