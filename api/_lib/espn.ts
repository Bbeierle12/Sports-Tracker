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
      // Use team color if available, otherwise fall back to sport's brand color (not emoji!)
      primaryColor: team.color ? `#${team.color}` : config.brandColor,
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

// Normalized event types for individual sports
interface NormalizedEventStatus {
  status: 'upcoming' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
}

interface GolfLeaderboardEntry {
  position: number | string;
  playerId: string;
  playerName: string;
  country?: string;
  countryFlag?: string;
  totalScore: number | string;
  today: number | string;
  thru: string;
  rounds: number[];
  status: 'active' | 'cut' | 'wd' | 'dq';
}

interface RacingEntry {
  position: number;
  driverId: string;
  driverName: string;
  team: string;
  teamColor?: string;
  carNumber: string | number;
  time?: string;
  laps?: number;
  status: 'racing' | 'finished' | 'dnf' | 'dns' | 'dsq';
}

interface NormalizedGolfTournament {
  id: string;
  sportId: string;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  venue?: string;
  location?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  currentRound: number;
  leaderboard: GolfLeaderboardEntry[];
}

interface NormalizedRaceEvent {
  id: string;
  sportId: string;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  venue?: string;
  location?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  circuitName?: string;
  currentLap?: number;
  totalLaps?: number;
  standings: RacingEntry[];
}

type NormalizedEvent = NormalizedGolfTournament | NormalizedRaceEvent;

interface NormalizedLeaderboardResponse {
  sportId: string;
  events: NormalizedEvent[];
}

/**
 * Map ESPN event status to normalized status
 */
function mapEventStatus(espnStatus: any): 'upcoming' | 'in_progress' | 'completed' | 'postponed' | 'cancelled' {
  const state = espnStatus?.type?.state;
  const description = espnStatus?.type?.description?.toLowerCase() || '';

  if (description.includes('postponed')) return 'postponed';
  if (description.includes('cancelled') || description.includes('canceled')) return 'cancelled';

  switch (state) {
    case 'pre': return 'upcoming';
    case 'in': return 'in_progress';
    case 'post': return 'completed';
    default: return 'upcoming';
  }
}

/**
 * Transform ESPN golf event to normalized GolfTournament
 */
function transformGolfEvent(event: any, sportId: string): NormalizedGolfTournament {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];

  const leaderboard: GolfLeaderboardEntry[] = competitors.map((comp: any) => {
    const athlete = comp.athlete || {};
    const status = comp.status || {};

    // Parse score - ESPN uses various formats
    let totalScore: number | string = status.displayValue || 'E';
    let today: number | string = '-';
    let thru = status.thru?.toString() || '-';

    // Try to parse numeric scores
    if (typeof totalScore === 'string') {
      if (totalScore === 'E') {
        totalScore = 0;
      } else if (totalScore.startsWith('+')) {
        totalScore = parseInt(totalScore.slice(1), 10);
      } else if (totalScore.startsWith('-')) {
        totalScore = parseInt(totalScore, 10);
      }
    }

    // Determine player status
    let playerStatus: 'active' | 'cut' | 'wd' | 'dq' = 'active';
    const statusText = (status.displayValue || '').toString().toUpperCase();
    if (statusText === 'CUT') playerStatus = 'cut';
    else if (statusText === 'WD') playerStatus = 'wd';
    else if (statusText === 'DQ') playerStatus = 'dq';

    return {
      position: status.position?.displayName || comp.order || '-',
      playerId: athlete.id || comp.id,
      playerName: athlete.displayName || 'Unknown',
      country: athlete.flag?.alt,
      countryFlag: athlete.flag?.href,
      totalScore,
      today,
      thru,
      rounds: (comp.linescores || []).map((s: any) => s.value),
      status: playerStatus,
    };
  });

  // Sort by position
  leaderboard.sort((a, b) => {
    const posA = typeof a.position === 'number' ? a.position : parseInt(a.position as string, 10) || 999;
    const posB = typeof b.position === 'number' ? b.position : parseInt(b.position as string, 10) || 999;
    return posA - posB;
  });

  const venue = competition?.venue;

  return {
    id: event.id,
    sportId,
    name: event.name || 'Unknown Tournament',
    shortName: event.shortName || event.name,
    startDate: event.date,
    endDate: event.endDate || event.date,
    venue: venue?.fullName,
    location: venue?.address ? `${venue.address.city || ''}, ${venue.address.state || venue.address.country || ''}`.trim() : undefined,
    status: mapEventStatus(event.status),
    currentRound: event.status?.period || 1,
    leaderboard,
  };
}

/**
 * Transform ESPN racing event to normalized RaceEvent
 */
function transformRacingEvent(event: any, sportId: string): NormalizedRaceEvent {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];

  const standings: RacingEntry[] = competitors.map((comp: any) => {
    const athlete = comp.athlete || {};
    const team = athlete.team || {};

    // Determine driver status
    let driverStatus: 'racing' | 'finished' | 'dnf' | 'dns' | 'dsq' = 'racing';
    const statusText = (comp.status?.displayValue || '').toString().toUpperCase();
    if (statusText.includes('DNF')) driverStatus = 'dnf';
    else if (statusText.includes('DNS')) driverStatus = 'dns';
    else if (statusText.includes('DSQ')) driverStatus = 'dsq';
    else if (event.status?.type?.state === 'post') driverStatus = 'finished';

    return {
      position: comp.order || 0,
      driverId: athlete.id || comp.id,
      driverName: athlete.displayName || 'Unknown',
      team: team.displayName || '',
      teamColor: team.color ? `#${team.color}` : undefined,
      carNumber: comp.vehicle?.number || '-',
      time: comp.status?.behind || undefined,
      laps: comp.status?.thru,
      status: driverStatus,
    };
  });

  // Sort by position
  standings.sort((a, b) => a.position - b.position);

  const venue = competition?.venue;

  return {
    id: event.id,
    sportId,
    name: event.name || 'Unknown Race',
    shortName: event.shortName || event.name,
    startDate: event.date,
    endDate: event.endDate || event.date,
    venue: venue?.fullName,
    location: venue?.address ? `${venue.address.city || ''}, ${venue.address.state || venue.address.country || ''}`.trim() : undefined,
    status: mapEventStatus(event.status),
    circuitName: venue?.fullName,
    currentLap: competition?.status?.period,
    totalLaps: competition?.status?.totalLaps,
    standings,
  };
}

/**
 * Fetch leaderboard data for individual sports (golf, racing, etc.)
 * Returns normalized data that matches the UI's expected shape
 */
export async function getLeaderboard(sportId: string): Promise<NormalizedLeaderboardResponse> {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }

  // Team sports don't have leaderboards
  if (config.type === 'team') {
    throw new Error(`Leaderboard not available for team sport: ${sportId}`);
  }

  // Fetch raw ESPN data
  const rawData = await getScoreboard(sportId);
  const rawEvents = rawData.events || [];

  // Transform based on sport type
  const isGolf = ['pga', 'lpga'].includes(sportId);
  const isRacing = ['f1', 'nascar', 'indycar'].includes(sportId);

  const normalizedEvents: NormalizedEvent[] = rawEvents.map((event: any) => {
    if (isGolf) {
      return transformGolfEvent(event, sportId);
    } else if (isRacing) {
      return transformRacingEvent(event, sportId);
    } else {
      // Default to golf-like transformation for other individual sports
      return transformGolfEvent(event, sportId);
    }
  });

  return {
    sportId,
    events: normalizedEvents,
  };
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

/**
 * Build ESPN API URL for game summary
 */
function buildGameSummaryUrl(sportId: string, gameId: string): string {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }
  return `${ESPN_API_BASE}/${config.apiPath.sport}/${config.apiPath.league}/summary?event=${gameId}`;
}

/**
 * Fetch game summary with boxscore, leaders, and head-to-head history
 */
export async function getGameSummary(
  sportId: string,
  gameId: string,
  team1Id?: string,
  team2Id?: string
): Promise<any> {
  const config = getSportConfig(sportId);
  if (!config) {
    throw new Error(`Unknown sport: ${sportId}`);
  }

  const summaryUrl = buildGameSummaryUrl(sportId, gameId);
  console.log(`[ESPN] Fetching game summary from: ${summaryUrl}`);

  const summaryResponse = await fetchWithTimeout(summaryUrl);

  if (!summaryResponse.ok) {
    console.error(`[ESPN] Game summary API error ${summaryResponse.status}`);
    throw new Error(`ESPN API error: ${summaryResponse.status}`);
  }

  const summaryData = await summaryResponse.json();

  // Extract boxscore data
  const boxscore = {
    teams: summaryData.boxscore?.teams?.map((team: any) => ({
      team: {
        id: team.team?.id,
        abbreviation: team.team?.abbreviation,
        displayName: team.team?.displayName,
        logo: team.team?.logo,
      },
      statistics: team.statistics?.map((stat: any) => ({
        name: stat.name,
        displayValue: stat.displayValue,
        label: stat.label || stat.abbreviation || stat.name,
      })) || [],
    })) || [],
  };

  // Extract game leaders
  const leaders = summaryData.leaders?.map((teamLeaders: any) => ({
    team: {
      id: teamLeaders.team?.id,
      abbreviation: teamLeaders.team?.abbreviation,
    },
    leaders: teamLeaders.leaders?.map((category: any) => ({
      name: category.name,
      displayName: category.displayName,
      leaders: category.leaders?.map((leader: any) => ({
        athlete: {
          displayName: leader.athlete?.displayName,
          headshot: leader.athlete?.headshot,
        },
        displayValue: leader.displayValue,
      })) || [],
    })) || [],
  })) || [];

  // Fetch head-to-head history if team IDs are provided
  let headToHead: any[] = [];
  if (team1Id && team2Id) {
    try {
      // Get schedule for team1 and filter for games against team2
      const scheduleUrl = buildTeamScheduleUrl(sportId, team1Id);
      const scheduleResponse = await fetchWithTimeout(scheduleUrl);

      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json() as ESPNTeamScheduleResponse;
        const events = scheduleData.events || [];

        // Filter for completed games against the other team
        headToHead = events
          .filter((event: any) => {
            const competition = event.competitions?.[0];
            const competitors = competition?.competitors || [];
            const hasOpponent = competitors.some((c: any) => c.team?.id === team2Id);
            const isCompleted = event.status?.type?.state === 'post';
            return hasOpponent && isCompleted;
          })
          .slice(0, 10) // Last 10 meetings
          .map((event: any) => {
            const competition = event.competitions?.[0];
            const competitors = competition?.competitors || [];
            const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
            const awayTeam = competitors.find((c: any) => c.homeAway === 'away');

            const homeScore = parseInt(homeTeam?.score || '0', 10);
            const awayScore = parseInt(awayTeam?.score || '0', 10);

            return {
              date: event.date,
              homeTeam: {
                abbreviation: homeTeam?.team?.abbreviation,
                score: homeScore,
              },
              awayTeam: {
                abbreviation: awayTeam?.team?.abbreviation,
                score: awayScore,
              },
              winner: homeScore > awayScore
                ? homeTeam?.team?.abbreviation
                : awayTeam?.team?.abbreviation,
            };
          });
      }
    } catch (error) {
      console.error('[ESPN] Failed to fetch head-to-head history:', error);
      // Continue without H2H data
    }
  }

  return {
    boxscore,
    leaders,
    headToHead,
    header: summaryData.header,
    predictor: summaryData.predictor,
  };
}
