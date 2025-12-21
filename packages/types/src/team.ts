export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  city: string;
  conference: 'Eastern' | 'Western';
  division: 'Atlantic' | 'Metropolitan' | 'Central' | 'Pacific';
  logo?: string;
  venue?: string;
}

export interface TeamStats {
  teamId: string;
  season: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  points: number;
  pointPercentage: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  powerPlayPercentage: number;
  penaltyKillPercentage: number;
  streak?: string;
}

export interface Record {
  wins: number;
  losses: number;
  overtimeLosses: number;
}
