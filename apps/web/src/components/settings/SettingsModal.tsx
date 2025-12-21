import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useSportTeams } from '../../hooks/queries/useSports';
import {
  getAllSports,
  getSportsByCategory,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type SportConfig,
} from '@nhl-dashboard/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'sports' | 'favorites' | 'display';

function SportToggle({
  sport,
  isEnabled,
  onToggle,
}: {
  sport: SportConfig;
  isEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center space-x-3 w-full p-3 rounded-lg transition-all
        ${isEnabled
          ? 'bg-accent/20 border border-accent'
          : 'bg-surface-light border border-transparent hover:border-gray-600'
        }
      `}
    >
      <span className="text-xl">{sport.icon}</span>
      <span className="flex-1 text-left text-white font-medium">{sport.name}</span>
      <div
        className={`
          w-5 h-5 rounded flex items-center justify-center
          ${isEnabled ? 'bg-accent' : 'bg-gray-600'}
        `}
      >
        {isEnabled && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

function TeamSelector({ sportId }: { sportId: string }) {
  const { addFavorite, removeFavorite, isFavorite } = useSettings();
  const { data, isLoading } = useSportTeams(sportId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-surface-light rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.teams?.length) {
    return (
      <p className="text-gray-400 text-sm text-center py-4">
        No teams available for this sport
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
      {data.teams.map((team) => {
        const selected = isFavorite(sportId, team.id);
        return (
          <button
            key={team.id}
            onClick={() =>
              selected
                ? removeFavorite(sportId, team.id)
                : addFavorite(sportId, team.id)
            }
            className={`
              flex items-center space-x-2 p-2 rounded-lg transition-all text-sm
              ${selected
                ? 'bg-accent/20 border border-accent'
                : 'bg-surface-light border border-transparent hover:border-gray-600'
              }
            `}
          >
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.abbreviation}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <span>{team.emoji}</span>
            )}
            <span className="flex-1 text-left text-white truncate">
              {team.abbreviation}
            </span>
            {selected && <Check className="w-4 h-4 text-accent" />}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('sports');
  const [selectedSportForFavorites, setSelectedSportForFavorites] = useState<string | null>(null);

  const {
    enabledSports,
    toggleSport,
    showOnlyFavorites,
    setShowOnlyFavorites,
    showLiveFirst,
    setShowLiveFirst,
    resetSettings,
  } = useSettings();

  if (!isOpen) return null;

  const allSports = getAllSports();
  const teamSportsEnabled = enabledSports.filter((id) => {
    const sport = allSports.find((s) => s.id === id);
    return sport?.hasTeams;
  });

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'sports', label: 'Sports' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'display', label: 'Display' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-gray-700 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Sports Tab */}
          {activeTab === 'sports' && (
            <div className="space-y-6">
              {CATEGORY_ORDER.map((category) => {
                const sports = getSportsByCategory(category);
                return (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {sports.map((sport) => (
                        <SportToggle
                          key={sport.id}
                          sport={sport}
                          isEnabled={enabledSports.includes(sport.id)}
                          onToggle={() => toggleSport(sport.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {teamSportsEnabled.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Enable a team sport first to select favorites
                </p>
              ) : (
                <>
                  {/* Sport selector */}
                  <div className="flex flex-wrap gap-2">
                    {teamSportsEnabled.map((sportId) => {
                      const sport = allSports.find((s) => s.id === sportId);
                      if (!sport) return null;
                      return (
                        <button
                          key={sportId}
                          onClick={() => setSelectedSportForFavorites(sportId)}
                          className={`
                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                            ${selectedSportForFavorites === sportId
                              ? 'bg-accent text-white'
                              : 'bg-surface-light text-gray-300 hover:text-white'
                            }
                          `}
                        >
                          {sport.icon} {sport.shortName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Team grid */}
                  {selectedSportForFavorites ? (
                    <TeamSelector sportId={selectedSportForFavorites} />
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      Select a sport above to choose favorite teams
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              {/* Show only favorites */}
              <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                <div>
                  <p className="text-white font-medium">Show Only Favorites</p>
                  <p className="text-gray-400 text-sm">Only display your favorite teams</p>
                </div>
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${showOnlyFavorites ? 'bg-accent' : 'bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${showOnlyFavorites ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Show live first */}
              <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
                <div>
                  <p className="text-white font-medium">Show Live First</p>
                  <p className="text-gray-400 text-sm">Prioritize live games at the top</p>
                </div>
                <button
                  onClick={() => setShowLiveFirst(!showLiveFirst)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative
                    ${showLiveFirst ? 'bg-accent' : 'bg-gray-600'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${showLiveFirst ? 'translate-x-7' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Reset settings */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all settings?')) {
                      resetSettings();
                    }
                  }}
                  className="w-full py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
