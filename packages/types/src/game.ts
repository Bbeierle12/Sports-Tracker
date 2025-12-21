export interface Game {
  id: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'final';
  period?: number | 'OT' | 'SO';
  timeRemaining?: string;
  startTime: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logo?: string;
}

export interface GameDetails extends Game {
  venue?: string;
  attendance?: number;
  periods: PeriodScore[];
  lastUpdated: string;
}

export interface PeriodScore {
  period: number;
  homeScore: number;
  awayScore: number;
}

export interface GameEvent {
  id: string;
  gameId: string;
  type: 'goal' | 'penalty' | 'period-start' | 'period-end';
  period: number;
  time: string;
  team: TeamInfo;
  description: string;
}
