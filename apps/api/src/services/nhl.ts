import type {
  NHLScheduleResponse,
  NHLStandings,
  NHLPlayerStats,
  NHLGame,
} from '../types/nhl';

const NHL_API_BASE = 'https://api-web.nhle.com/v1';

async function fetchNHL<T>(endpoint: string): Promise<T> {
  const url = `${NHL_API_BASE}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NHL API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getLiveScores(): Promise<NHLScheduleResponse> {
  const today = new Date().toISOString().split('T')[0];
  return getSchedule(today);
}

export async function getSchedule(date: string): Promise<NHLScheduleResponse> {
  return fetchNHL<NHLScheduleResponse>(`/schedule/${date}`);
}

export async function getGameById(gameId: string): Promise<NHLGame> {
  return fetchNHL<NHLGame>(`/gamecenter/${gameId}/landing`);
}

export async function getStandings(): Promise<NHLStandings> {
  const currentDate = new Date().toISOString().split('T')[0];
  return fetchNHL<NHLStandings>(`/standings/${currentDate}`);
}

export async function getPlayerStats(playerId: string): Promise<NHLPlayerStats> {
  return fetchNHL<NHLPlayerStats>(`/player/${playerId}/landing`);
}

export async function getTeamStats(abbrev: string): Promise<any> {
  const standings = await getStandings();
  const team = standings.standings.find(
    (t) => t.teamAbbrev.default.toLowerCase() === abbrev.toLowerCase()
  );
  return team || null;
}
