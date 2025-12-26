import { useEffect } from 'react';
import { X, Trophy, TrendingUp, Users, Clock } from 'lucide-react';
import { useGameDetails } from '../../hooks/queries/useGameDetails';

// ESPN Event types
interface ESPNTeam {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  logo?: string;
}

interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score: string;
  team: ESPNTeam;
}

interface ESPNVenue {
  fullName?: string;
  address?: {
    city?: string;
    state?: string;
  };
}

interface ESPNCompetition {
  id: string;
  competitors: ESPNCompetitor[];
  venue?: ESPNVenue;
}

interface ESPNEventStatus {
  type: {
    state: 'pre' | 'in' | 'post';
    completed: boolean;
    description: string;
    shortDetail: string;
  };
  period: number;
  displayClock: string;
}

interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  status: ESPNEventStatus;
  competitions: ESPNCompetition[];
}

interface GameDetailToastProps {
  isOpen: boolean;
  onClose: () => void;
  sportId: string;
  event: ESPNEvent;
}

export function GameDetailToast({ isOpen, onClose, sportId, event }: GameDetailToastProps) {
  const competition = event.competitions?.[0];
  const homeTeam = competition?.competitors?.find((c) => c.homeAway === 'home');
  const awayTeam = competition?.competitors?.find((c) => c.homeAway === 'away');

  const { data, isLoading, error } = useGameDetails(
    sportId,
    event.id,
    homeTeam?.team.id,
    awayTeam?.team.id
  );

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLive = event.status?.type?.state === 'in';
  const isFinal = event.status?.type?.state === 'post';

  // Find team stats from boxscore
  const getTeamStats = (teamId: string) => {
    return data?.boxscore?.teams?.find((t) => t.team.id === teamId)?.statistics || [];
  };

  // Find team leaders
  const getTeamLeaders = (teamId: string) => {
    return data?.leaders?.find((l) => l.team.id === teamId)?.leaders || [];
  };

  // Get stat by name
  const getStatValue = (stats: { name: string; displayValue: string }[], statName: string) => {
    return stats.find((s) => s.name === statName)?.displayValue || '-';
  };

  const homeStats = homeTeam ? getTeamStats(homeTeam.team.id) : [];
  const awayStats = awayTeam ? getTeamStats(awayTeam.team.id) : [];
  const homeLeaders = homeTeam ? getTeamLeaders(homeTeam.team.id) : [];
  const awayLeaders = awayTeam ? getTeamLeaders(awayTeam.team.id) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        data-testid="toast-backdrop"
      />

      {/* Modal */}
      <div className="relative bg-surface border border-gray-700 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4 flex-1">
            {/* Away Team */}
            <div className="flex items-center space-x-2">
              {awayTeam?.team.logo && (
                <img
                  src={awayTeam.team.logo}
                  alt={awayTeam.team.abbreviation}
                  className="w-10 h-10 object-contain"
                />
              )}
              <div className="text-center">
                <p className="text-white font-semibold">{awayTeam?.team.shortDisplayName || 'Away'}</p>
                <p className="text-2xl font-bold text-white">{awayTeam?.score || 0}</p>
              </div>
            </div>

            {/* VS / Status */}
            <div className="flex-1 text-center">
              {isLive && (
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                  </span>
                  <span className="text-live text-xs font-bold uppercase">Live</span>
                </div>
              )}
              <p className="text-gray-400 text-sm">
                {isFinal ? 'Final' : event.status?.type?.shortDetail || 'vs'}
              </p>
            </div>

            {/* Home Team */}
            <div className="flex items-center space-x-2">
              <div className="text-center">
                <p className="text-white font-semibold">{homeTeam?.team.shortDisplayName || 'Home'}</p>
                <p className="text-2xl font-bold text-white">{homeTeam?.score || 0}</p>
              </div>
              {homeTeam?.team.logo && (
                <img
                  src={homeTeam.team.logo}
                  alt={homeTeam.team.abbreviation}
                  className="w-10 h-10 object-contain"
                />
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors ml-4"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Loading State */}
          {isLoading && (
            <div data-testid="loading-skeleton" className="space-y-4">
              <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface-light rounded-lg p-4 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded mb-2" />
                    <div className="h-4 bg-gray-700 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400">
                Error loading game details. Please try again later.
              </p>
            </div>
          )}

          {/* Game Details */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {/* Team Stats Section */}
              {data?.boxscore?.teams && data.boxscore.teams.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>Team Stats</span>
                  </h3>

                  <div className="bg-surface-light rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-2 px-3 text-left text-gray-400 text-sm font-medium">
                            {awayTeam?.team.abbreviation || 'AWAY'}
                          </th>
                          <th className="py-2 px-3 text-center text-gray-400 text-sm font-medium">
                            Stat
                          </th>
                          <th className="py-2 px-3 text-right text-gray-400 text-sm font-medium">
                            {homeTeam?.team.abbreviation || 'HOME'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-700/50">
                          <td className="py-2 px-3 text-white font-medium">
                            {getStatValue(awayStats, 'fieldGoalPct')}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-400 text-sm">FG%</td>
                          <td className="py-2 px-3 text-right text-white font-medium">
                            {getStatValue(homeStats, 'fieldGoalPct')}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-700/50">
                          <td className="py-2 px-3 text-white font-medium">
                            {getStatValue(awayStats, 'threePointFieldGoalPct')}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-400 text-sm">3P%</td>
                          <td className="py-2 px-3 text-right text-white font-medium">
                            {getStatValue(homeStats, 'threePointFieldGoalPct')}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-700/50">
                          <td className="py-2 px-3 text-white font-medium">
                            {getStatValue(awayStats, 'totalRebounds')}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-400 text-sm">REB</td>
                          <td className="py-2 px-3 text-right text-white font-medium">
                            {getStatValue(homeStats, 'totalRebounds')}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-700/50">
                          <td className="py-2 px-3 text-white font-medium">
                            {getStatValue(awayStats, 'assists')}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-400 text-sm">AST</td>
                          <td className="py-2 px-3 text-right text-white font-medium">
                            {getStatValue(homeStats, 'assists')}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-white font-medium">
                            {getStatValue(awayStats, 'turnovers')}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-400 text-sm">TO</td>
                          <td className="py-2 px-3 text-right text-white font-medium">
                            {getStatValue(homeStats, 'turnovers')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Performers Section */}
              {data?.leaders && data.leaders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <span>Top Performers</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Away Team Leaders */}
                    <div className="bg-surface-light rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase mb-2">
                        {awayTeam?.team.abbreviation || 'AWAY'}
                      </p>
                      {awayLeaders.slice(0, 3).map((category) => (
                        <div key={category.name} className="mb-2 last:mb-0">
                          {category.leaders[0] && (
                            <div className="flex items-center space-x-2">
                              {category.leaders[0].athlete.headshot?.href && (
                                <img
                                  src={category.leaders[0].athlete.headshot.href}
                                  alt={category.leaders[0].athlete.displayName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {category.leaders[0].athlete.displayName}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {category.leaders[0].displayValue}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Home Team Leaders */}
                    <div className="bg-surface-light rounded-lg p-3">
                      <p className="text-gray-400 text-xs uppercase mb-2">
                        {homeTeam?.team.abbreviation || 'HOME'}
                      </p>
                      {homeLeaders.slice(0, 3).map((category) => (
                        <div key={category.name} className="mb-2 last:mb-0">
                          {category.leaders[0] && (
                            <div className="flex items-center space-x-2">
                              {category.leaders[0].athlete.headshot?.href && (
                                <img
                                  src={category.leaders[0].athlete.headshot.href}
                                  alt={category.leaders[0].athlete.displayName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-white text-sm font-medium">
                                  {category.leaders[0].athlete.displayName}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {category.leaders[0].displayValue}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Head-to-Head Section */}
              {data?.headToHead && data.headToHead.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-accent" />
                    <span>Head-to-Head</span>
                  </h3>

                  <div className="bg-surface-light rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-700/50">
                      {data.headToHead.slice(0, 5).map((game, index) => (
                        <div key={index} className="flex items-center justify-between p-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400 text-sm">
                              {new Date(game.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`font-medium ${
                                game.winner === game.awayTeam.abbreviation
                                  ? 'text-live'
                                  : 'text-gray-400'
                              }`}
                            >
                              {game.awayTeam.abbreviation} {game.awayTeam.score}
                            </span>
                            <span className="text-gray-500">@</span>
                            <span
                              className={`font-medium ${
                                game.winner === game.homeTeam.abbreviation
                                  ? 'text-live'
                                  : 'text-gray-400'
                              }`}
                            >
                              {game.homeTeam.abbreviation} {game.homeTeam.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Venue Info */}
              {competition?.venue?.fullName && (
                <div className="text-center text-gray-500 text-sm">
                  {competition.venue.fullName}
                  {competition.venue.address?.city && (
                    <span>
                      {' '}
                      - {competition.venue.address.city}
                      {competition.venue.address.state && `, ${competition.venue.address.state}`}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetailToast;
