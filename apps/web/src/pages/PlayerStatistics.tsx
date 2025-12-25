import { useState, useEffect, useMemo } from 'react';
import { Users, ChevronDown, Search, ArrowUpDown, Filter } from 'lucide-react';
import { useTeamRoster, useTeamStatistics } from '../hooks/queries/useStatistics';
import { useSettings } from '../contexts/SettingsContext';
import { getTeamSports } from '@sports-tracker/types';
import { PlayerDetailModal } from '../components/players/PlayerDetailModal';

type SortField = 'name' | 'jersey' | 'position' | 'age' | 'experience';
type SortDirection = 'asc' | 'desc';

export default function PlayerStatistics() {
  const { enabledSports } = useSettings();
  const teamSports = getTeamSports();

  // Filter to only team sports that are enabled, or show all team sports if none enabled
  const availableSports = enabledSports.length > 0
    ? teamSports.filter(sport => enabledSports.includes(sport.id))
    : teamSports;

  const [selectedSport, setSelectedSport] = useState<string>(
    availableSports[0]?.id || 'nfl'
  );
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  // Fetch teams for the selected sport
  const {
    data: teamsData,
    isLoading: teamsLoading,
    error: teamsError,
  } = useTeamStatistics(selectedSport);

  const teams = teamsData?.teams || [];

  // Auto-select first team when sport changes
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam]);

  // Reset team when sport changes
  useEffect(() => {
    setSelectedTeam('');
  }, [selectedSport]);

  // Fetch roster for selected team
  const {
    data: rosterData,
    isLoading: rosterLoading,
    error: rosterError,
  } = useTeamRoster(selectedSport, selectedTeam);

  const athletes = rosterData?.athletes || [];

  // Get all unique positions for the filter dropdown
  const allPositions = useMemo(() => {
    const positions = new Set<string>();
    athletes.forEach((group: any) => {
      if (group.position) {
        positions.add(group.position);
      }
    });
    return Array.from(positions).sort();
  }, [athletes]);

  // Format position labels for display
  const formatPositionLabel = (position: string): string => {
    const labelMap: Record<string, string> = {
      // NFL position groups
      offense: 'Offense',
      defense: 'Defense',
      specialTeam: 'Special Teams',
      practiceSquad: 'Practice Squad',
      injuredReserveOrOut: 'Injured Reserve / Out',
      suspended: 'Suspended',
      // NHL position groups
      Centers: 'Centers',
      Wings: 'Wings',
      Defense: 'Defense',
      Goalies: 'Goalies',
      // NBA position groups
      Guards: 'Guards',
      Forwards: 'Forwards',
      // Generic fallback - capitalize and add spaces
    };
    return labelMap[position] || position
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Sort function for players
  const sortPlayers = (players: any[]) => {
    return [...players].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.displayName || '').localeCompare(b.displayName || '');
          break;
        case 'jersey':
          comparison = (parseInt(a.jersey) || 999) - (parseInt(b.jersey) || 999);
          break;
        case 'position':
          comparison = (a.position?.abbreviation || '').localeCompare(b.position?.abbreviation || '');
          break;
        case 'age':
          comparison = (a.age || 0) - (b.age || 0);
          break;
        case 'experience':
          comparison = (a.experience?.years || 0) - (b.experience?.years || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Filter and sort athletes
  const filteredAthletes = useMemo(() => {
    let result = athletes;

    // Filter by position
    if (positionFilter !== 'all') {
      result = result.filter((group: any) => group.position === positionFilter);
    }

    // Filter by search query
    if (searchQuery) {
      result = result
        .filter((group: any) => {
          const filteredItems = group.items?.filter((player: any) =>
            player.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.position?.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          return filteredItems?.length > 0;
        })
        .map((group: any) => ({
          ...group,
          items: group.items?.filter((player: any) =>
            player.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.position?.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }));
    }

    // Sort players within each group
    return result.map((group: any) => ({
      ...group,
      items: sortPlayers(group.items || []),
    }));
  }, [athletes, searchQuery, positionFilter, sortField, sortDirection]);

  const isLoading = teamsLoading || rosterLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-white">Player Statistics</h1>
            <p className="text-gray-400 text-sm">View stats for players across all teams</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Sport Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-400 text-sm">Sport:</label>
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              aria-label="Select sport"
              className="appearance-none bg-surface border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              {availableSports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.icon} {sport.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Team Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-400 text-sm">Team:</label>
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={teamsLoading || teams.length === 0}
              aria-label="Select team"
              className="appearance-none bg-surface border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-accent cursor-pointer disabled:opacity-50"
            >
              {teamsLoading ? (
                <option>Loading teams...</option>
              ) : teams.length === 0 ? (
                <option>No teams available</option>
              ) : (
                teams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.displayName}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Sorting and Filtering Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Position Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <label className="text-gray-400 text-sm">Position:</label>
          <div className="relative">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              aria-label="Filter by position"
              className="appearance-none bg-surface border border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-white text-sm focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Positions</option>
              {allPositions.map((position) => (
                <option key={position} value={position}>
                  {formatPositionLabel(position)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <label className="text-gray-400 text-sm">Sort:</label>
          <div className="relative">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              aria-label="Sort by field"
              className="appearance-none bg-surface border border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-white text-sm focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="jersey">Jersey #</option>
              <option value="position">Position</option>
              <option value="age">Age</option>
              <option value="experience">Experience</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort Direction */}
        <button
          type="button"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          className="flex items-center space-x-1 px-3 py-1.5 bg-surface border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-accent/50 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>{sortDirection === 'asc' ? 'A-Z' : 'Z-A'}</span>
        </button>
      </div>

      {/* Error State */}
      {teamsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">
            Error loading teams: {teamsError instanceof Error ? teamsError.message : 'Failed to fetch teams'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Please check your internet connection or try again later.
          </p>
        </div>
      )}
      {rosterError && !teamsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">
            Error loading player roster: {rosterError instanceof Error ? rosterError.message : 'Failed to fetch roster'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex}>
              <div className="h-6 bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-xl border border-gray-700 p-4 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Player Groups (by position) */}
      {!isLoading && !rosterError && filteredAthletes.length > 0 && (
        <div className="space-y-8">
          {filteredAthletes.map((group: any) => (
            <div key={group.position || 'unknown'}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <span>{formatPositionLabel(group.position) || 'Players'}</span>
                <span className="text-gray-500 text-sm font-normal">
                  ({group.items?.length || 0})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items?.map((player: any) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="bg-surface rounded-xl border border-gray-700 p-4 hover:border-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Player Photo */}
                      <div className="flex-shrink-0">
                        {player.headshot?.href ? (
                          <img
                            src={player.headshot.href}
                            alt={player.displayName}
                            className="w-16 h-16 rounded-full object-cover bg-gray-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {player.jersey && (
                            <span className="text-accent font-bold">#{player.jersey}</span>
                          )}
                          <h4 className="text-white font-semibold truncate">
                            {player.displayName}
                          </h4>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {player.position?.abbreviation || player.position?.name || 'N/A'}
                        </p>

                        {/* Player Details */}
                        <div className="mt-2 space-y-1 text-xs text-gray-500">
                          {player.displayHeight && player.displayWeight && (
                            <p>{player.displayHeight} / {player.displayWeight}</p>
                          )}
                          {player.age && (
                            <p>Age: {player.age}</p>
                          )}
                          {player.experience?.years !== undefined && (
                            <p>
                              {player.experience.years === 0
                                ? 'Rookie'
                                : `${player.experience.years} yr${player.experience.years !== 1 ? 's' : ''} exp`}
                            </p>
                          )}
                          {player.college?.name && (
                            <p className="truncate">{player.college.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Stats Prompt */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-center space-x-2 text-accent text-sm">
                        <span>Click to view stats</span>
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Players */}
      {!isLoading && !rosterError && filteredAthletes.length === 0 && selectedTeam && (
        <div className="text-center py-12 bg-surface rounded-xl border border-gray-700">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {searchQuery
              ? `No players found matching "${searchQuery}"`
              : 'No players found for this team'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {searchQuery ? 'Try a different search term' : 'Try selecting a different team'}
          </p>
        </div>
      )}

      {/* No Team Selected */}
      {!isLoading && !selectedTeam && !teamsLoading && (
        <div className="text-center py-12 bg-surface rounded-xl border border-gray-700">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Select a team to view player statistics</p>
        </div>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          sportId={selectedSport}
          player={selectedPlayer}
        />
      )}
    </div>
  );
}
