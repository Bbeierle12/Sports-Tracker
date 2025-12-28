import { useEffect } from 'react';
import { X, Users, Trophy, Calendar, MapPin, BarChart3 } from 'lucide-react';
import { usePlayerStatistics } from '../../hooks/queries/useStatistics';
import { useSettings } from '../../contexts/SettingsContext';
import { filterStatsByComplexity, type StatType } from '../../lib/stat-configs';

// Get CSS classes for stat value based on stat type
function getStatValueClasses(type: StatType): string {
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

// Get border accent for stat card based on type
function getStatCardClasses(type: StatType): string {
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

interface PlayerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportId: string;
  player: {
    id: string;
    displayName: string;
    jersey?: string;
    position?: {
      name?: string;
      abbreviation?: string;
    };
    headshot?: {
      href?: string;
    };
    displayHeight?: string;
    displayWeight?: string;
    age?: number;
    experience?: {
      years?: number;
    };
    college?: {
      name?: string;
    };
  };
}

export function PlayerDetailModal({ isOpen, onClose, sportId, player }: PlayerDetailModalProps) {
  const { data, isLoading, error } = usePlayerStatistics(sportId, player.id);
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

  const athlete = data?.athlete || player;
  const statistics = data?.statistics;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
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
            {/* Player Photo */}
            <div className="flex-shrink-0">
              {athlete.headshot?.href ? (
                <img
                  src={athlete.headshot.href}
                  alt={`${athlete.displayName} headshot`}
                  className="w-20 h-20 rounded-full object-cover bg-gray-800"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center" aria-hidden="true">
                  <Users className="w-10 h-10 text-gray-500" />
                </div>
              )}
            </div>

            {/* Player Basic Info */}
            <div>
              <div className="flex items-center space-x-2">
                {athlete.jersey && (
                  <span className="text-accent font-bold text-lg" aria-label={`Jersey number ${athlete.jersey}`}>#{athlete.jersey}</span>
                )}
                <h2 id="player-modal-title" className="text-xl font-bold text-white">{athlete.displayName}</h2>
              </div>
              <p className="text-gray-400">
                {athlete.position?.name || athlete.position?.abbreviation || 'N/A'}
              </p>
              {data?.athlete?.team && (
                <div className="flex items-center space-x-2 mt-1">
                  {data.athlete.team.logo && (
                    <img
                      src={data.athlete.team.logo}
                      alt={`${data.athlete.team.displayName} logo`}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span className="text-gray-300 text-sm">{data.athlete.team.displayName}</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
            aria-label="Close player details"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="h-8 bg-gray-700 rounded w-48 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
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
                Error loading player statistics. Please try again later.
              </p>
            </div>
          )}

          {/* Player Details */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {/* Bio Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {athlete.displayHeight && (
                  <div className="bg-surface-light rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Height</p>
                    <p className="text-white font-medium">{athlete.displayHeight}</p>
                  </div>
                )}
                {athlete.displayWeight && (
                  <div className="bg-surface-light rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Weight</p>
                    <p className="text-white font-medium">{athlete.displayWeight}</p>
                  </div>
                )}
                {athlete.age && (
                  <div className="bg-surface-light rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Age</p>
                    <p className="text-white font-medium">{athlete.age}</p>
                  </div>
                )}
                {athlete.experience?.years !== undefined && (
                  <div className="bg-surface-light rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Experience</p>
                    <p className="text-white font-medium">
                      {athlete.experience.years === 0
                        ? 'Rookie'
                        : `${athlete.experience.years} yr${athlete.experience.years !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {athlete.college?.name && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">College:</span>
                    <span className="text-white">{athlete.college.name}</span>
                  </div>
                )}
                {data?.athlete?.birthDate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Born:</span>
                    <span className="text-white">
                      {new Date(data.athlete.birthDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {data?.athlete?.birthPlace && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">From:</span>
                    <span className="text-white">
                      {[
                        data.athlete.birthPlace.city,
                        data.athlete.birthPlace.state,
                        data.athlete.birthPlace.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {data?.athlete?.draft && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Draft:</span>
                    <span className="text-white">
                      {data.athlete.draft.year} Round {data.athlete.draft.round}, Pick{' '}
                      {data.athlete.draft.selection}
                    </span>
                  </div>
                )}
              </div>

              {/* Statistics Section - ESPN format with labels array and splits */}
              {statistics?.labels && statistics?.splits && statistics.splits.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-accent" aria-hidden="true" />
                    <span>Statistics</span>
                    {statistics.displayName && (
                      <span className="text-gray-400 text-sm font-normal">({statistics.displayName})</span>
                    )}
                  </h3>

                  {statistics.splits.map((split: any, splitIndex: number) => {
                    const filteredStats = filterStatsByComplexity(
                      statistics.labels || [],
                      split.stats || [],
                      statistics.displayNames,
                      sportId,
                      statComplexity
                    );

                    // Show empty state if no stats match the complexity filter
                    if (filteredStats.length === 0) {
                      return (
                        <div key={split.displayName || splitIndex} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-400 uppercase">
                            {split.displayName}
                          </h4>
                          <div className="text-center py-6 bg-surface-light rounded-lg">
                            <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" aria-hidden="true" />
                            <p className="text-gray-500 text-sm">
                              No stats match your complexity level
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              Try increasing stat complexity in settings
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={split.displayName || splitIndex} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400 uppercase">
                          {split.displayName}
                        </h4>
                        <div
                          className="grid grid-cols-3 md:grid-cols-5 gap-2"
                          role="list"
                          aria-label={`${split.displayName} statistics`}
                        >
                          {filteredStats.map((stat) => (
                            <div
                              key={stat.label}
                              className={getStatCardClasses(stat.type)}
                              role="listitem"
                              aria-label={`${stat.fullName}: ${stat.value}`}
                            >
                              <p className={getStatValueClasses(stat.type)}>
                                {stat.value}
                              </p>
                              <p
                                className="text-gray-500 text-xs uppercase"
                                title={stat.fullName}
                                aria-hidden="true"
                              >
                                {stat.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Stats Available */}
              {(!statistics?.labels || !statistics?.splits || statistics.splits.length === 0) &&
                !isLoading && (
                  <div className="text-center py-8 bg-surface-light rounded-lg" role="status">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-gray-400">No statistics available for this player</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Stats may not be available for all players
                    </p>
                  </div>
                )}

              {/* Bio Text */}
              {data?.bio && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Bio</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{data.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerDetailModal;
