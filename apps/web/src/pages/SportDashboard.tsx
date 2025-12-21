import { useParams, useNavigate } from 'react-router-dom';
import { useSportGames, useLeaderboard } from '../hooks/queries/useSports';
import { useSettings } from '../contexts/SettingsContext';
import {
  SportTabs,
  TeamCard,
  LeaderboardCard,
  TeamCardSkeleton,
  LeaderboardCardSkeleton,
} from '../components/sports';
import { getSportConfig } from '@nhl-dashboard/types';
import type { ESPNTeam, GolfTournament, RaceEvent } from '@nhl-dashboard/types';

export default function SportDashboard() {
  const { sportId } = useParams<{ sportId: string }>();
  const navigate = useNavigate();
  const { enabledSports } = useSettings();

  // Default to first enabled sport if none specified
  const activeSport = sportId || enabledSports[0] || 'nhl';
  const sportConfig = getSportConfig(activeSport);

  const isTeamSport = sportConfig?.type === 'team';
  const isIndividualSport = sportConfig?.type === 'individual';

  // Fetch data based on sport type
  const {
    data: gamesData,
    isLoading: gamesLoading,
    error: gamesError,
  } = useSportGames(isTeamSport ? activeSport : undefined);

  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useLeaderboard(isIndividualSport ? activeSport : undefined);

  const isLoading = isTeamSport ? gamesLoading : leaderboardLoading;
  const error = isTeamSport ? gamesError : leaderboardError;

  // Handle sport change
  const handleSportChange = (newSportId: string) => {
    navigate(`/sports/${newSportId}`);
  };

  // Determine which sports have live games (simplified for now)
  const liveSports: string[] = [];
  if (gamesData?.events?.some((e) => e.status?.type?.state === 'in')) {
    liveSports.push(activeSport);
  }

  if (!sportConfig) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-400 text-lg">Sport not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Mock team data from games - in real implementation, this would parse ESPN data
  const teams: ESPNTeam[] = [];

  return (
    <div className="space-y-6">
      {/* Sport Tabs */}
      <SportTabs
        activeSport={activeSport}
        onSportChange={handleSportChange}
        liveSports={liveSports}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{sportConfig.icon}</span>
          <h1 className="text-2xl font-bold text-white">{sportConfig.name}</h1>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">
            Error loading {sportConfig.name} data. Please try again later.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isTeamSport ? (
            [...Array(6)].map((_, i) => <TeamCardSkeleton key={i} />)
          ) : (
            <LeaderboardCardSkeleton />
          )}
        </div>
      )}

      {/* Team Sports - Show Games/Teams */}
      {isTeamSport && !isLoading && !error && (
        <div>
          {gamesData?.events && gamesData.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Display games as simplified cards */}
              {gamesData.events.map((event) => {
                const competition = event.competitions?.[0];
                const homeTeam = competition?.competitors?.find(
                  (c) => c.homeAway === 'home'
                );
                const awayTeam = competition?.competitors?.find(
                  (c) => c.homeAway === 'away'
                );

                if (!homeTeam || !awayTeam) return null;

                const isLive = event.status?.type?.state === 'in';
                const isFinal = event.status?.type?.state === 'post';

                return (
                  <div
                    key={event.id}
                    className={`bg-surface rounded-xl border p-5 ${
                      isLive ? 'border-live' : 'border-gray-700'
                    }`}
                  >
                    {isLive && (
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
                        </span>
                        <span className="text-live text-xs font-bold uppercase">
                          Live
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Away Team */}
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {awayTeam.team?.displayName || awayTeam.team?.abbreviation}
                        </span>
                        <span className="text-xl font-bold text-white">
                          {awayTeam.score || 0}
                        </span>
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {homeTeam.team?.displayName || homeTeam.team?.abbreviation}
                        </span>
                        <span className="text-xl font-bold text-white">
                          {homeTeam.score || 0}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="text-gray-400 text-sm">
                        {isFinal
                          ? 'Final'
                          : isLive
                          ? event.status?.displayClock || 'In Progress'
                          : new Date(event.date).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No games scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Individual Sports - Show Leaderboard */}
      {isIndividualSport && !isLoading && !error && leaderboardData && (
        <div className="max-w-4xl">
          {leaderboardData.events && leaderboardData.events.length > 0 ? (
            <LeaderboardCard
              event={leaderboardData.events[0] as unknown as GolfTournament | RaceEvent}
              sportId={activeSport}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No events scheduled</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
