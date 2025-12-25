import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api-client';

// Response types
interface TeamWithStats {
  id: string;
  displayName: string;
  abbreviation: string;
  logo?: string;
  color?: string;
  record?: {
    items?: Array<{
      summary?: string;
      stats?: Array<{
        name: string;
        displayName?: string;
        value: number | string;
        displayValue?: string;
      }>;
    }>;
  };
  standingSummary?: string;
  location?: string;
  nickname?: string;
}

interface TeamStatisticsResponse {
  sportId: string;
  teams: TeamWithStats[];
}

interface Athlete {
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
  statistics?: Array<{
    stats?: Array<{
      name: string;
      abbreviation?: string;
      value: number | string;
      displayValue?: string;
    }>;
  }>;
}

interface AthleteGroup {
  position: string;
  items: Athlete[];
}

interface TeamRosterResponse {
  sportId: string;
  teamId: string;
  team?: {
    id: string;
    displayName: string;
    logo?: string;
  };
  athletes: AthleteGroup[];
}

interface PlayerStatisticsResponse {
  sportId: string;
  athleteId: string;
  athlete?: {
    id: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    jersey?: string;
    position?: {
      name?: string;
      abbreviation?: string;
    };
    headshot?: {
      href?: string;
    };
    team?: {
      id: string;
      displayName: string;
      logo?: string;
    };
    displayHeight?: string;
    displayWeight?: string;
    age?: number;
    birthDate?: string;
    birthPlace?: {
      city?: string;
      state?: string;
      country?: string;
    };
    experience?: {
      years?: number;
    };
    college?: {
      name?: string;
    };
    draft?: {
      year?: number;
      round?: number;
      selection?: number;
    };
  };
  statistics?: {
    displayName?: string;
    labels?: string[];
    names?: string[];
    displayNames?: string[];
    splits?: Array<{
      displayName: string;
      stats: string[];
    }>;
  };
  bio?: string;
}

/**
 * Fetch all teams with their statistics for a sport
 */
export function useTeamStatistics(sportId: string | undefined) {
  return useQuery({
    queryKey: ['team-statistics', sportId],
    queryFn: () => apiGet<TeamStatisticsResponse>(`/sports/${sportId}/statistics`),
    enabled: !!sportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch roster for a specific team
 */
export function useTeamRoster(sportId: string | undefined, teamId: string | undefined) {
  return useQuery({
    queryKey: ['team-roster', sportId, teamId],
    queryFn: () => apiGet<TeamRosterResponse>(`/sports/${sportId}/teams/${teamId}/roster`),
    enabled: !!sportId && !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch statistics for a specific player/athlete
 */
export function usePlayerStatistics(sportId: string | undefined, athleteId: string | undefined) {
  return useQuery({
    queryKey: ['player-statistics', sportId, athleteId],
    queryFn: () => apiGet<PlayerStatisticsResponse>(`/sports/${sportId}/athletes/${athleteId}/statistics`),
    enabled: !!sportId && !!athleteId,
    staleTime: 10 * 60 * 1000, // 10 minutes - stats don't change often
  });
}
