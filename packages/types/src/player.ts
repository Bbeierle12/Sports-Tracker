export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jerseyNumber: number;
  position: PlayerPosition;
  teamId: string;
  birthDate: string;
  nationality: string;
  height?: string;
  weight?: number;
  shoots?: 'L' | 'R';
  photo?: string;
}

export type PlayerPosition = 'C' | 'LW' | 'RW' | 'D' | 'G';

export interface PlayerStats {
  playerId: string;
  season: string;
  teamId: string;
  gamesPlayed: number;
  goals?: number;
  assists?: number;
  points?: number;
  plusMinus?: number;
  penaltyMinutes?: number;
  powerPlayGoals?: number;
  shots?: number;
  shootingPercentage?: number;
  // Goalie stats
  wins?: number;
  losses?: number;
  savePercentage?: number;
  goalsAgainstAverage?: number;
  shutouts?: number;
}
