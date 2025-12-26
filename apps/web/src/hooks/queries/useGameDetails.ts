import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api-client';

// Types for game details response
interface TeamStatistic {
  name: string;
  displayValue: string;
  label: string;
}

interface BoxscoreTeam {
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    logo?: string;
  };
  statistics: TeamStatistic[];
}

interface Boxscore {
  teams: BoxscoreTeam[];
}

interface LeaderAthlete {
  athlete: {
    displayName: string;
    headshot?: {
      href?: string;
    };
  };
  displayValue: string;
}

interface LeaderCategory {
  name: string;
  displayName: string;
  leaders: LeaderAthlete[];
}

interface TeamLeaders {
  team: {
    id: string;
    abbreviation: string;
  };
  leaders: LeaderCategory[];
}

interface HeadToHeadGame {
  date: string;
  homeTeam: {
    abbreviation: string;
    score: number;
  };
  awayTeam: {
    abbreviation: string;
    score: number;
  };
  winner: string;
}

export interface GameDetailsResponse {
  boxscore: Boxscore;
  leaders: TeamLeaders[];
  headToHead: HeadToHeadGame[];
}

interface UseGameDetailsOptions {
  enabled?: boolean;
}

/**
 * Fetch detailed game statistics including boxscore, leaders, and head-to-head history
 * @param sportId - The sport identifier (e.g., 'nba', 'nfl')
 * @param gameId - The game/event ID
 * @param team1Id - First team ID (for H2H history)
 * @param team2Id - Second team ID (for H2H history)
 * @param options - Additional options
 */
export function useGameDetails(
  sportId: string | undefined,
  gameId: string | undefined,
  team1Id?: string,
  team2Id?: string,
  options?: UseGameDetailsOptions
) {
  const endpoint = `/sports/${sportId}/games/${gameId}/summary?team1=${team1Id}&team2=${team2Id}`;

  return useQuery({
    queryKey: ['game-details', sportId, gameId, team1Id, team2Id],
    queryFn: () => apiGet<GameDetailsResponse>(endpoint),
    enabled: !!sportId && !!gameId && (options?.enabled !== false),
    refetchInterval: 30000, // 30 seconds for live updates
    staleTime: 10000, // 10 seconds
  });
}
