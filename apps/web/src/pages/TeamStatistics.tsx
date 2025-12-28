import { useState } from 'react';
import { Trophy, ChevronDown } from 'lucide-react';
import { useTeamStatistics } from '../hooks/queries/useStatistics';
import { useSettings } from '../contexts/SettingsContext';
import { getSportConfig, getTeamSports } from '@sports-tracker/types';

export default function TeamStatistics() {
  const { enabledSports } = useSettings();
  const teamSports = getTeamSports();

  // Filter to only team sports that are enabled, or show all team sports if none enabled
  const availableSports = enabledSports.length > 0
    ? teamSports.filter(sport => enabledSports.includes(sport.id))
    : teamSports;

  const [selectedSport, setSelectedSport] = useState<string>(
    availableSports[0]?.id || 'nfl'
  );

  const sportConfig = getSportConfig(selectedSport);

  const {
    data: teamsData,
    isLoading,
    error,
  } = useTeamStatistics(selectedSport);

  const teams = teamsData?.teams || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-white">Team Statistics</h1>
            <p className="text-gray-400 text-sm">View stats for all teams across sports</p>
          </div>
        </div>
      </div>

      {/* Sport Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-gray-400 text-sm">Select Sport:</label>
        <div className="relative">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
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

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">
            Error loading team statistics. Please try again later.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-gray-700 p-5 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teams Grid */}
      {!isLoading && !error && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: any) => (
            <div
              key={team.id}
              className="bg-surface rounded-xl border border-gray-700 p-5 hover:border-accent/50 transition-colors"
            >
              {/* Team Header */}
              <div className="flex items-center space-x-3 mb-4">
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={team.abbreviation}
                    className="w-12 h-12 object-contain"
                  />
                )}
                <div>
                  <h3 className="text-white font-semibold">{team.displayName}</h3>
                  <p className="text-gray-400 text-sm">{team.abbreviation}</p>
                </div>
              </div>

              {/* Team Records */}
              {team.record && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Overall</span>
                    <span className="text-white font-bold">{team.record}</span>
                  </div>
                  {team.homeRecord && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Home</span>
                      <span className="text-gray-300">{team.homeRecord}</span>
                    </div>
                  )}
                  {team.awayRecord && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Away</span>
                      <span className="text-gray-300">{team.awayRecord}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Team Stats */}
              {team.statistics && team.statistics.length > 0 && (
                <div className="pt-3 border-t border-gray-700">
                  <div className="grid grid-cols-3 gap-2">
                    {/* Filter out duplicate abbreviations and limit to 6 unique stats */}
                    {team.statistics
                      .filter((stat: any, index: number, arr: any[]) =>
                        stat.abbreviation &&
                        arr.findIndex((s: any) => s.abbreviation === stat.abbreviation) === index
                      )
                      .slice(0, 6)
                      .map((stat: any) => (
                        <div key={stat.name} className="text-center">
                          <p className="text-white font-bold text-sm">{stat.displayValue}</p>
                          <p className="text-gray-500 text-xs uppercase">{stat.abbreviation}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Team Leaders */}
              {team.leaders && team.leaders.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-500 text-xs uppercase mb-2">Team Leaders</p>
                  <div className="space-y-1">
                    {team.leaders.slice(0, 2).map((leader: any) => (
                      <div key={leader.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{leader.displayName}:</span>
                        <span className="text-white">
                          {leader.leaders?.[0]?.athlete?.shortName} ({leader.leaders?.[0]?.displayValue})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No stats available indicator */}
              {!team.record && !team.statistics && (
                <div className="text-center py-2">
                  <span className="text-gray-500 text-xs">No stats available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Teams */}
      {!isLoading && !error && teams.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-xl border border-gray-700">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No teams found for {sportConfig?.name}</p>
          <p className="text-gray-500 text-sm mt-2">Try selecting a different sport</p>
        </div>
      )}
    </div>
  );
}
