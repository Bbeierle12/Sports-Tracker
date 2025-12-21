export interface Standings {
  season: string;
  conferences: Conference[];
  lastUpdated: string;
}

export interface Conference {
  name: 'Eastern' | 'Western';
  divisions: Division[];
}

export interface Division {
  name: 'Atlantic' | 'Metropolitan' | 'Central' | 'Pacific';
  teams: StandingsTeam[];
}

export interface StandingsTeam {
  teamId: string;
  teamName: string;
  abbreviation: string;
  divisionRank: number;
  conferenceRank: number;
  leagueRank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  pointPercentage: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  homeRecord: string;
  awayRecord: string;
  last10: string;
  streak: string;
}
