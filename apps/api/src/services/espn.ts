import {
  getSportConfig,
  type ESPNScoreboardResponse,
  type ESPNTeamScheduleResponse,
  type ESPNTeamsResponse,
  type FavoriteTeam,
} from '@nhl-dashboard/types';

export const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const FETCH_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(url: string, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Build ESPN API URL for scoreboard
 */
function buildScoreboardUrl(sportId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `${ESPN_API_BASE}/${config.apiPath.sport}/${config.apiPath.league}/scoreboard`;
}

/**
 * Build ESPN API URL for teams list
 */
function buildTeamsUrl(sportId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `${ESPN_API_BASE}/${config.apiPath.sport}/${config.apiPath.league}/teams`;
}

/**
 * Build ESPN API URL for team schedule
 */
function buildTeamScheduleUrl(sportId: string, teamId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `${ESPN_API_BASE}/${config.apiPath.sport}/${config.apiPath.league}/teams/${teamId}/schedule`;
}

/**
 * Fetch scoreboard data for a sport
 */
export async function getScoreboard(sportId: string): Promise<ESPNScoreboardResponse> {
  const url = buildScoreboardUrl(sportId);
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }

  return response.json() as Promise<ESPNScoreboardResponse>;
}

/**
 * Fetch all teams for a sport (for team selection)
 */
export async function getTeams(sportId: string): Promise<FavoriteTeam[]> {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }

  // Individual sports don't have teams
  if (!config.hasTeams) {
    return [];
  }

  const url = buildTeamsUrl(sportId);
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }

  const data = await response.json() as ESPNTeamsResponse;

  // ESPN returns teams nested in sports[0].leagues[0].teams
  const teamsData = data.sports?.[0]?.leagues?.[0]?.teams || [];

  return teamsData.map((teamWrapper) => {
    const team = teamWrapper.team;
    return {
      id: team.id,
      sportId,
      name: team.displayName,
      abbreviation: team.abbreviation,
      logo: team.logos?.[0]?.href,
      emoji: config.icon,
      primaryColor: team.color ? `#${team.color}` : config.icon,
    };
  });
}

/**
 * Fetch schedule for a specific team
 */
export async function getTeamSchedule(
  sportId: string,
  teamId: string
): Promise<ESPNTeamScheduleResponse> {
  const url = buildTeamScheduleUrl(sportId, teamId);
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }

  return response.json() as Promise<ESPNTeamScheduleResponse>;
}

/**
 * Fetch leaderboard data for individual sports (golf, racing, etc.)
 */
export async function getLeaderboard(sportId: string): Promise<ESPNScoreboardResponse> {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }

  // Team sports don't have leaderboards
  if (config.type === 'team') {
    throw new Error(`Leaderboard not available for team sport: ${sportId}`);
  }

  // Individual sports use the scoreboard endpoint for event data
  return getScoreboard(sportId);
}
