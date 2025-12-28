import { useEffect } from 'react';
import { X, Trophy, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import type { StatComplexity } from '@sports-tracker/types';

// Team stat configurations by sport category
interface TeamStatConfig {
  name: string;
  label: string;
  complexity: StatComplexity;
  type: 'positive' | 'negative' | 'neutral' | 'percentage';
}

const COMPLEXITY_ORDER: StatComplexity[] = ['novice', 'casual', 'fan', 'nerd'];

const TEAM_STAT_CONFIGS: Record<string, TeamStatConfig[]> = {
  basketball: [
    { name: 'wins', label: 'Wins', complexity: 'novice', type: 'positive' },
    { name: 'losses', label: 'Losses', complexity: 'novice', type: 'negative' },
    { name: 'winPercent', label: 'Win %', complexity: 'novice', type: 'percentage' },
    { name: 'pointsFor', label: 'PPG', complexity: 'casual', type: 'positive' },
    { name: 'pointsAgainst', label: 'OPP PPG', complexity: 'casual', type: 'negative' },
    { name: 'differential', label: 'Diff', complexity: 'casual', type: 'neutral' },
    { name: 'streak', label: 'Streak', complexity: 'fan', type: 'neutral' },
    { name: 'gamesBehind', label: 'GB', complexity: 'fan', type: 'neutral' },
    { name: 'Last_Ten', label: 'L10', complexity: 'fan', type: 'neutral' },
    { name: 'avgPointsFor', label: 'PPG', complexity: 'nerd', type: 'positive' },
    { name: 'avgPointsAgainst', label: 'OPP PPG', complexity: 'nerd', type: 'negative' },
  ],
  football: [
    { name: 'wins', label: 'Wins', complexity: 'novice', type: 'positive' },
    { name: 'losses', label: 'Losses', complexity: 'novice', type: 'negative' },
    { name: 'winPercent', label: 'Win %', complexity: 'novice', type: 'percentage' },
    { name: 'pointsFor', label: 'PF', complexity: 'casual', type: 'positive' },
    { name: 'pointsAgainst', label: 'PA', complexity: 'casual', type: 'negative' },
    { name: 'differential', label: 'Diff', complexity: 'casual', type: 'neutral' },
    { name: 'streak', label: 'Streak', complexity: 'fan', type: 'neutral' },
    { name: 'playoffSeed', label: 'Seed', complexity: 'fan', type: 'neutral' },
  ],
  hockey: [
    { name: 'wins', label: 'W', complexity: 'novice', type: 'positive' },
    { name: 'losses', label: 'L', complexity: 'novice', type: 'negative' },
    { name: 'otLosses', label: 'OTL', complexity: 'novice', type: 'neutral' },
    { name: 'points', label: 'PTS', complexity: 'novice', type: 'positive' },
    { name: 'goalsFor', label: 'GF', complexity: 'casual', type: 'positive' },
    { name: 'goalsAgainst', label: 'GA', complexity: 'casual', type: 'negative' },
    { name: 'differential', label: 'Diff', complexity: 'casual', type: 'neutral' },
    { name: 'streak', label: 'Streak', complexity: 'fan', type: 'neutral' },
  ],
  baseball: [
    { name: 'wins', label: 'W', complexity: 'novice', type: 'positive' },
    { name: 'losses', label: 'L', complexity: 'novice', type: 'negative' },
    { name: 'winPercent', label: 'PCT', complexity: 'novice', type: 'percentage' },
    { name: 'gamesBehind', label: 'GB', complexity: 'casual', type: 'neutral' },
    { name: 'runsFor', label: 'RS', complexity: 'casual', type: 'positive' },
    { name: 'runsAgainst', label: 'RA', complexity: 'casual', type: 'negative' },
    { name: 'runDifferential', label: 'Diff', complexity: 'casual', type: 'neutral' },
    { name: 'streak', label: 'Streak', complexity: 'fan', type: 'neutral' },
    { name: 'Last_Ten', label: 'L10', complexity: 'fan', type: 'neutral' },
  ],
  soccer: [
    { name: 'wins', label: 'W', complexity: 'novice', type: 'positive' },
    { name: 'losses', label: 'L', complexity: 'novice', type: 'negative' },
    { name: 'ties', label: 'D', complexity: 'novice', type: 'neutral' },
    { name: 'points', label: 'PTS', complexity: 'novice', type: 'positive' },
    { name: 'pointsFor', label: 'GF', complexity: 'casual', type: 'positive' },
    { name: 'pointsAgainst', label: 'GA', complexity: 'casual', type: 'negative' },
    { name: 'differential', label: 'GD', complexity: 'casual', type: 'neutral' },
  ],
};

const SPORT_TO_CATEGORY: Record<string, string> = {
  nba: 'basketball',
  wnba: 'basketball',
  mcbb: 'basketball',
  wcbb: 'basketball',
  nfl: 'football',
  cfb: 'football',
  nhl: 'hockey',
  mlb: 'baseball',
  mls: 'soccer',
  nwsl: 'soccer',
  epl: 'soccer',
  laliga: 'soccer',
  bundesliga: 'soccer',
  seriea: 'soccer',
  ligue1: 'soccer',
  ucl: 'soccer',
  ligamx: 'soccer',
};

function getStatValueClasses(type: TeamStatConfig['type']): string {
  const baseClasses = 'font-bold text-lg';
  switch (type) {
    case 'positive':
      return `${baseClasses} text-green-400`;
    case 'negative':
      return `${baseClasses} text-red-400`;
    case 'percentage':
      return `${baseClasses} text-accent`;
    case 'neutral':
    default:
      return `${baseClasses} text-white`;
  }
}

function getStatCardClasses(type: TeamStatConfig['type']): string {
  const baseClasses = 'bg-surface-light rounded-lg p-3 text-center transition-colors';
  switch (type) {
    case 'positive':
      return `${baseClasses} border-l-2 border-l-green-500/50`;
    case 'negative':
      return `${baseClasses} border-l-2 border-l-red-500/50`;
    case 'percentage':
      return `${baseClasses} border-l-2 border-l-accent/50`;
    case 'neutral':
    default:
      return baseClasses;
  }
}

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportId: string;
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
    color?: string;
    location?: string;
    nickname?: string;
    record?: string;
    homeRecord?: string;
    awayRecord?: string;
    winPercent?: string;
    gamesBack?: string;
    streak?: string;
    pointsFor?: number;
    pointsAgainst?: number;
    differential?: string;
    divisionRecord?: string;
    conferenceRecord?: string;
    last10?: string;
    statistics?: Array<{
      name: string;
      displayName: string;
      abbreviation: string;
      value: number;
      displayValue: string;
    }>;
    leaders?: Array<{
      name: string;
      displayName: string;
      leaders?: Array<{
        athlete?: {
          shortName?: string;
          displayName?: string;
          headshot?: { href?: string };
        };
        displayValue?: string;
      }>;
    }>;
  };
}

export function TeamDetailModal({ isOpen, onClose, sportId, team }: TeamDetailModalProps) {
  const { statComplexity } = useSettings();

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

  // Filter stats by complexity
  const sportCategory = SPORT_TO_CATEGORY[sportId] || 'basketball';
  const statConfigs = TEAM_STAT_CONFIGS[sportCategory] || TEAM_STAT_CONFIGS.basketball;
  const userLevel = COMPLEXITY_ORDER.indexOf(statComplexity);
  const filteredConfigs = statConfigs.filter((stat) => {
    const statLevel = COMPLEXITY_ORDER.indexOf(stat.complexity);
    return statLevel <= userLevel;
  });

  // Build stats to display from the statistics array
  const statsMap = new Map<string, { displayValue: string; value: number }>();
  team.statistics?.forEach((stat) => {
    statsMap.set(stat.name, { displayValue: stat.displayValue, value: stat.value });
  });

  // Get filtered stats with values
  const displayStats = filteredConfigs
    .map((config) => {
      const stat = statsMap.get(config.name);
      if (!stat) return null;
      return {
        ...config,
        displayValue: stat.displayValue,
        value: stat.value,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-surface border border-gray-700 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Team Logo */}
            <div className="flex-shrink-0">
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={`${team.displayName} logo`}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center" aria-hidden="true">
                  <Trophy className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* Team Info */}
            <div>
              <h2 id="team-modal-title" className="text-xl font-bold text-white">
                {team.displayName}
              </h2>
              <p className="text-gray-400">{team.abbreviation}</p>
              {team.record && (
                <p className="text-accent font-semibold mt-1">{team.record}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
            aria-label="Close team details"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="space-y-6">
            {/* Records Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {team.record && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Overall</p>
                  <p className="text-white font-bold text-lg">{team.record}</p>
                </div>
              )}
              {team.homeRecord && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Home</p>
                  <p className="text-white font-medium">{team.homeRecord}</p>
                </div>
              )}
              {team.awayRecord && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Away</p>
                  <p className="text-white font-medium">{team.awayRecord}</p>
                </div>
              )}
              {team.divisionRecord && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Division</p>
                  <p className="text-white font-medium">{team.divisionRecord}</p>
                </div>
              )}
              {team.conferenceRecord && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Conference</p>
                  <p className="text-white font-medium">{team.conferenceRecord}</p>
                </div>
              )}
              {team.last10 && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Last 10</p>
                  <p className="text-white font-medium">{team.last10}</p>
                </div>
              )}
              {team.streak && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Streak</p>
                  <p className={`font-medium ${team.streak.startsWith('W') ? 'text-green-400' : team.streak.startsWith('L') ? 'text-red-400' : 'text-white'}`}>
                    {team.streak}
                  </p>
                </div>
              )}
              {team.gamesBack && (
                <div className="bg-surface-light rounded-lg p-3">
                  <p className="text-gray-500 text-xs uppercase">Games Back</p>
                  <p className="text-white font-medium">{team.gamesBack}</p>
                </div>
              )}
            </div>

            {/* Scoring Section */}
            {(team.pointsFor || team.pointsAgainst || team.differential) && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Scoring</span>
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {team.pointsFor !== undefined && (
                    <div className="bg-surface-light rounded-lg p-3 text-center border-l-2 border-l-green-500/50">
                      <p className="text-green-400 font-bold text-lg">{team.pointsFor}</p>
                      <p className="text-gray-500 text-xs uppercase">Points For</p>
                    </div>
                  )}
                  {team.pointsAgainst !== undefined && (
                    <div className="bg-surface-light rounded-lg p-3 text-center border-l-2 border-l-red-500/50">
                      <p className="text-red-400 font-bold text-lg">{team.pointsAgainst}</p>
                      <p className="text-gray-500 text-xs uppercase">Points Against</p>
                    </div>
                  )}
                  {team.differential && (
                    <div className="bg-surface-light rounded-lg p-3 text-center">
                      <p className={`font-bold text-lg ${team.differential.startsWith('+') ? 'text-green-400' : team.differential.startsWith('-') ? 'text-red-400' : 'text-white'}`}>
                        {team.differential}
                      </p>
                      <p className="text-gray-500 text-xs uppercase">Differential</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Statistics Section */}
            {team.statistics && team.statistics.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Statistics</span>
                </h3>

                {displayStats.length > 0 ? (
                  <div
                    className="grid grid-cols-3 md:grid-cols-5 gap-2"
                    role="list"
                    aria-label="Team statistics"
                  >
                    {displayStats.map((stat) => (
                      <div
                        key={stat.name}
                        className={getStatCardClasses(stat.type)}
                        role="listitem"
                        aria-label={`${stat.label}: ${stat.displayValue}`}
                      >
                        <p className={getStatValueClasses(stat.type)}>
                          {stat.displayValue}
                        </p>
                        <p className="text-gray-500 text-xs uppercase" aria-hidden="true">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Show all stats if none match config */
                  <div
                    className="grid grid-cols-3 md:grid-cols-5 gap-2"
                    role="list"
                    aria-label="Team statistics"
                  >
                    {team.statistics.map((stat) => (
                      <div
                        key={stat.name}
                        className="bg-surface-light rounded-lg p-3 text-center"
                        role="listitem"
                        aria-label={`${stat.displayName}: ${stat.displayValue}`}
                      >
                        <p className="text-white font-bold text-lg">
                          {stat.displayValue}
                        </p>
                        <p className="text-gray-500 text-xs uppercase" title={stat.displayName} aria-hidden="true">
                          {stat.abbreviation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Team Leaders Section */}
            {team.leaders && team.leaders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Team Leaders</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.leaders.map((category) => (
                    <div key={category.name} className="bg-surface-light rounded-lg p-3">
                      <p className="text-gray-500 text-xs uppercase mb-2">{category.displayName}</p>
                      {category.leaders?.slice(0, 3).map((leader, idx) => (
                        <div key={idx} className="flex items-center space-x-2 mb-1 last:mb-0">
                          {leader.athlete?.headshot?.href && (
                            <img
                              src={leader.athlete.headshot.href}
                              alt={leader.athlete.displayName || ''}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-white text-sm">
                            {leader.athlete?.shortName || leader.athlete?.displayName}
                          </span>
                          <span className="text-accent text-sm font-medium ml-auto">
                            {leader.displayValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Stats Available */}
            {!team.statistics && !team.record && (
              <div className="text-center py-8 bg-surface-light rounded-lg" role="status">
                <TrendingDown className="w-12 h-12 text-gray-600 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-400">No statistics available for this team</p>
                <p className="text-gray-500 text-sm mt-1">
                  Stats may not be available for all teams
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamDetailModal;
