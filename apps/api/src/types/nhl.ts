export interface NHLScheduleResponse {
  gameWeek: GameWeek[];
}

export interface GameWeek {
  date: string;
  dayAbbrev: string;
  numberOfGames: number;
  games: NHLGame[];
}

export interface NHLGame {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue: { default: string };
  startTimeUTC: string;
  gameState: string;
  gameScheduleState: string;
  awayTeam: NHLTeamInfo;
  homeTeam: NHLTeamInfo;
  periodDescriptor?: {
    number: number;
    periodType: string;
  };
  clock?: {
    timeRemaining: string;
    running: boolean;
    inIntermission: boolean;
  };
}

export interface NHLTeamInfo {
  id: number;
  placeName: { default: string };
  abbrev: string;
  logo: string;
  score?: number;
}

export interface NHLStandings {
  standings: NHLTeamStanding[];
}

export interface NHLTeamStanding {
  teamName: { default: string };
  teamCommonName: { default: string };
  teamAbbrev: { default: string };
  teamLogo: string;
  conferenceName: string;
  divisionName: string;
  divisionSequence: number;
  conferenceSequence: number;
  leagueSequence: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPctg: number;
  goalFor: number;
  goalAgainst: number;
  goalDifferential: number;
  homeWins: number;
  homeLosses: number;
  homeOtLosses: number;
  roadWins: number;
  roadLosses: number;
  roadOtLosses: number;
  l10Wins: number;
  l10Losses: number;
  l10OtLosses: number;
  streakCode: string;
  streakCount: number;
  seasonId: number;
  placeName: { default: string };
}

export interface NHLPlayerStats {
  playerId: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  positionCode: string;
  birthDate: string;
  birthCountry: string;
  currentTeamAbbrev?: string;
  featuredStats?: {
    season: number;
    regularSeason?: {
      subSeason?: {
        gamesPlayed: number;
        goals?: number;
        assists?: number;
        points?: number;
        plusMinus?: number;
        wins?: number;
        losses?: number;
        goalsAgainstAvg?: number;
        savePctg?: number;
      };
    };
  };
}
