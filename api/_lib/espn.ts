import { getSportConfig } from './sports-config';

// ESPN API response types (simplified for serverless)
interface ESPNScoreboardResponse {
  events?: any[];
  leagues?: any[];
}

interface ESPNTeamsResponse {
  sports?: Array<{
    leagues?: Array<{
      teams?: Array<{ team: any }>;
    }>;
  }>;
}

interface ESPNTeamScheduleResponse {
  events?: any[];
  team?: any;
}

interface FavoriteTeam {
  id: string;
  sportId: string;
  name: string;
  abbreviation: string;
  logo?: string;
  emoji?: string;
  primaryColor?: string;
}

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
 * @param sportId - The sport identifier
 * @param date - Optional date in YYYYMMDD format
 */
function buildScoreboardUrl(sportId: string, date?: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  const baseUrl = `${ESPN_API_BASE}/${config.apiPath.sport}/${config.apiPath.league}/scoreboard`;
  return date ? `${baseUrl}?dates=${date}` : baseUrl;
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
 * @param sportId - The sport identifier
 * @param date - Optional date in YYYYMMDD format
 */
export async function getScoreboard(sportId: string, date?: string): Promise<ESPNScoreboardResponse> {
  const url = buildScoreboardUrl(sportId, date);
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

/**
 * Build ESPN API URL for standings
 */
function buildStandingsUrl(sportId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `https://site.api.espn.com/apis/v2/sports/${config.apiPath.sport}/${config.apiPath.league}/standings`;
}

/**
 * Fetch all teams with their statistics/records from standings
 */
export async function getTeamsWithStats(sportId: string): Promise<any> {
  const config = getSportConfig(sportId);
  if (!config) {
    console.error(`[ESPN] Unknown sport: ${sportId}`);
    throw new Error(`Unknown sport: ${sportId}`);
  }

  // Individual sports don't have teams
  if (!config.hasTeams) {
    console.log(`[ESPN] Sport ${sportId} does not have teams`);
    return { teams: [] };
  }

  const teamsUrl = buildTeamsUrl(sportId);
  const standingsUrl = buildStandingsUrl(sportId);
  console.log(`[ESPN] Fetching teams from: ${teamsUrl}`);
  console.log(`[ESPN] Fetching standings from: ${standingsUrl}`);

  const [teamsResponse, standingsResponse] = await Promise.all([
    fetchWithTimeout(teamsUrl),
    fetchWithTimeout(standingsUrl),
  ]);

  if (!teamsResponse.ok) {
    console.error(`[ESPN] Teams API error ${teamsResponse.status}`);
    throw new Error(`ESPN API error: ${teamsResponse.status}`);
  }

  const teamsData = await teamsResponse.json() as ESPNTeamsResponse;
  const standingsData = await standingsResponse.json() as any;

  // Build a map of team stats from standings data
  const teamStatsMap: Record<string, any> = {};

  const processStandingsEntries = (entries: any[]) => {
    entries?.forEach((entry: any) => {
      const teamId = entry.team?.id;
      if (teamId) {
        const statsMap: Record<string, any> = {};
        entry.stats?.forEach((stat: any) => {
          statsMap[stat.name] = {
            name: stat.name,
            displayName: stat.displayName,
            abbreviation: stat.abbreviation,
            value: stat.value,
            displayValue: stat.displayValue,
          };
        });

        teamStatsMap[teamId] = {
          record: statsMap.overall?.displayValue || `${statsMap.wins?.value || 0}-${statsMap.losses?.value || 0}`,
          homeRecord: statsMap.Home?.displayValue || statsMap.homeRecord?.displayValue,
          awayRecord: statsMap.Road?.displayValue || statsMap.awayRecord?.displayValue,
          winPercent: statsMap.winPercent?.displayValue,
          gamesBack: statsMap.gamesBehind?.displayValue,
          streak: statsMap.streak?.displayValue,
          pointsFor: statsMap.pointsFor?.value || statsMap.avgPointsFor?.value,
          pointsAgainst: statsMap.pointsAgainst?.value || statsMap.avgPointsAgainst?.value,
          differential: statsMap.differential?.displayValue || statsMap.pointDifferential?.displayValue,
          divisionRecord: statsMap.Division?.displayValue,
          conferenceRecord: statsMap.vs_Conf?.displayValue,
          last10: statsMap.Last_Ten?.displayValue,
          stats: entry.stats,
        };
      }
    });
  };

  // Handle different standings structures
  if (standingsData.children) {
    standingsData.children.forEach((conference: any) => {
      if (conference.standings?.entries) {
        processStandingsEntries(conference.standings.entries);
      }
      conference.children?.forEach((division: any) => {
        if (division.standings?.entries) {
          processStandingsEntries(division.standings.entries);
        }
      });
    });
  } else if (standingsData.standings?.entries) {
    processStandingsEntries(standingsData.standings.entries);
  }

  const teamsArray = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];
  console.log(`[ESPN] Teams found: ${teamsArray.length}, Stats found for: ${Object.keys(teamStatsMap).length} teams`);

  return {
    teams: teamsArray.map((teamWrapper: any) => {
      const teamId = teamWrapper.team.id;
      const stats = teamStatsMap[teamId];

      return {
        id: teamId,
        displayName: teamWrapper.team.displayName,
        abbreviation: teamWrapper.team.abbreviation,
        logo: teamWrapper.team.logos?.[0]?.href,
        color: teamWrapper.team.color,
        location: teamWrapper.team.location,
        nickname: teamWrapper.team.nickname,
        record: stats?.record,
        homeRecord: stats?.homeRecord,
        awayRecord: stats?.awayRecord,
        winPercent: stats?.winPercent,
        gamesBack: stats?.gamesBack,
        streak: stats?.streak,
        pointsFor: stats?.pointsFor,
        pointsAgainst: stats?.pointsAgainst,
        differential: stats?.differential,
        divisionRecord: stats?.divisionRecord,
        conferenceRecord: stats?.conferenceRecord,
        last10: stats?.last10,
        statistics: stats?.stats,
      };
    }),
  };
}

/**
 * Build ESPN API URL for team roster
 */
function buildRosterUrl(sportId: string, teamId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `${ESPN_API_BASE}/${config.apiPath.sport}/${config.apiPath.league}/teams/${teamId}/roster`;
}

/**
 * Build ESPN API URL for athlete overview/statistics
 */
function buildAthleteOverviewUrl(sportId: string, athleteId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `https://site.web.api.espn.com/apis/common/v3/sports/${config.apiPath.sport}/${config.apiPath.league}/athletes/${athleteId}/overview`;
}

/**
 * Fetch statistics for a specific player/athlete
 */
export async function getPlayerStatistics(sportId: string, athleteId: string): Promise<any> {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }

  const url = buildAthleteOverviewUrl(sportId, athleteId);
  console.log(`[ESPN] Fetching player stats from: ${url}`);

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    console.error(`[ESPN] Player stats API error ${response.status} for ${url}`);
    throw new Error(`ESPN API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    athlete: data.athlete,
    statistics: data.statistics,
    splits: data.splits,
    bio: data.bio,
    nextEvent: data.nextEvent,
  };
}

/**
 * Fetch roster for a specific team
 */
export async function getTeamRoster(sportId: string, teamId: string): Promise<any> {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }

  if (!config.hasTeams) {
    return { athletes: [] };
  }

  const url = buildRosterUrl(sportId, teamId);
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`ESPN API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    team: data.team,
    athletes: data.athletes || [],
  };
}
