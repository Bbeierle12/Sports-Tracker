// ESPN API types for multi-sport support

// ===== TEAM DATA MODELS =====

export interface TeamRecord {
  wins: number;
  losses: number;
  ties?: number;           // NFL, MLS, soccer
  otl?: number;            // NHL overtime losses
  points?: number;         // Soccer league points
}

export interface LastGame {
  opponent: string;        // "ARI" or "@ ARI"
  score: string;           // "31-17"
  won: boolean;
  date: string;            // "Dec 15"
}

export interface NextGame {
  opponent: string;        // "@ MIA" or "vs MIA"
  date: string;            // "Sun Dec 22"
  time: string;            // "1:05 PM EST"
  isHome: boolean;
}

export interface LiveGame {
  opponent: string;
  period: string;          // "Q1", "2nd", "Top 5th", "1st Half"
  clock: string;           // "4:32" or ""
  teamScore: number;
  opponentScore: number;
  isHome: boolean;
}

export interface ESPNTeam {
  id: string;
  sportId: string;
  name: string;
  abbreviation: string;
  logo?: string;
  emoji: string;
  primaryColor: string;
  record: TeamRecord;
  lastGame: LastGame | null;
  nextGame: NextGame | null;
  liveGame: LiveGame | null;
  bye: boolean;
}

export interface FavoriteTeam {
  id: string;
  sportId: string;
  name: string;
  abbreviation: string;
  logo?: string;
  emoji: string;
  primaryColor: string;
}

// ===== ESPN API RESPONSE TYPES =====

export interface ESPNScoreboardResponse {
  events: ESPNEvent[];
}

export interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  status: ESPNEventStatus;
  competitions: ESPNCompetition[];
}

export interface ESPNEventStatus {
  type: {
    state: 'pre' | 'in' | 'post';
    completed: boolean;
    description: string;
    shortDetail: string;
  };
  period: number;
  displayClock: string;
}

export interface ESPNCompetition {
  id: string;
  competitors: ESPNCompetitor[];
  venue?: ESPNVenue;
  status: {
    type: {
      state: 'pre' | 'in' | 'post';
      completed: boolean;
    };
    period?: number;
    totalLaps?: number;
  };
}

export interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score: string;
  winner?: boolean;
  order?: number;
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    color?: string;
    logos?: Array<{ href: string }>;
  };
  records?: Array<{
    summary: string;
    type: string;
  }>;
  athlete?: {
    id: string;
    displayName: string;
    flag?: { alt: string; href: string };
    team?: { displayName: string; color?: string };
  };
  status?: {
    position?: { id: string; displayName: string };
    thru?: number;
    displayValue?: string;
    behind?: string;
  };
  linescores?: Array<{ value: number }>;
  vehicle?: { number?: string };
}

export interface ESPNVenue {
  fullName?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface ESPNTeamScheduleResponse {
  events: ESPNScheduleEvent[];
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    recordSummary?: string;
  };
  requestedSeason: {
    year: number;
    type: number;
  };
}

export interface ESPNScheduleEvent {
  id: string;
  date: string;
  name: string;
  week?: {
    number: number;
    text: string;
  };
  competitions: Array<{
    competitors: Array<{
      id: string;
      homeAway: 'home' | 'away';
      score?: { displayValue: string };
      winner?: boolean;
      team: {
        id: string;
        abbreviation: string;
        displayName: string;
      };
    }>;
    status: {
      type: {
        state: 'pre' | 'in' | 'post';
        completed: boolean;
      };
    };
  }>;
}

export interface ESPNTeamsResponse {
  sports: Array<{
    leagues: Array<{
      teams: Array<{
        team: {
          id: string;
          displayName: string;
          abbreviation: string;
          color?: string;
          logos?: Array<{ href: string }>;
        };
      }>;
    }>;
  }>;
}

// ===== SPORT DATA RESULT =====

export interface SportData {
  sportId: string;
  teams: ESPNTeam[];
  hasLiveGames: boolean;
  lastUpdated: Date;
}

// ===== INDIVIDUAL SPORTS TYPES =====

export type EventStatus = 'upcoming' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';

export interface SportEvent {
  id: string;
  sportId: string;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  venue?: string;
  location?: string;
  status: EventStatus;
  season?: string;
}

// Golf types
export interface GolfLeaderboardEntry {
  position: number | string;
  positionChange?: number;
  playerId: string;
  playerName: string;
  country?: string;
  countryFlag?: string;
  totalScore: number | string;
  today: number | string;
  thru: string;
  rounds: number[];
  status: 'active' | 'cut' | 'wd' | 'dq';
  isFavorite?: boolean;
}

export interface GolfTournament extends SportEvent {
  purse?: string;
  defendingChampion?: string;
  currentRound: number;
  leaderboard: GolfLeaderboardEntry[];
}

// Racing types
export interface RacingEntry {
  position: number;
  positionChange?: number;
  driverId: string;
  driverName: string;
  team: string;
  teamColor?: string;
  carNumber: string | number;
  time?: string;
  laps?: number;
  points?: number;
  status: 'racing' | 'finished' | 'dnf' | 'dns' | 'dsq';
  isFavorite?: boolean;
}

export interface RaceEvent extends SportEvent {
  circuitName?: string;
  circuitLength?: string;
  totalLaps?: number;
  currentLap?: number;
  weather?: string;
  standings: RacingEntry[];
}

// Tennis types
export interface TennisPlayer {
  id: string;
  name: string;
  country?: string;
  countryFlag?: string;
  seed?: number;
  ranking?: number;
  isFavorite?: boolean;
}

export interface TennisSet {
  player1Games: number;
  player2Games: number;
  tiebreak?: {
    player1Points: number;
    player2Points: number;
  };
}

export interface TennisMatch {
  matchId: string;
  round: string;
  court?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  player1: TennisPlayer;
  player2: TennisPlayer;
  winner?: 'player1' | 'player2';
  sets: TennisSet[];
  currentSet?: number;
  startTime?: string;
}

export interface TennisTournament extends SportEvent {
  surface?: string;
  category?: string;
  draw?: 'Singles' | 'Doubles' | 'Mixed';
  matches: TennisMatch[];
  featuredMatches?: TennisMatch[];
}

// MMA/Boxing types
export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  country?: string;
  countryFlag?: string;
  record: string;
  ranking?: number;
  isChampion?: boolean;
  isFavorite?: boolean;
}

export interface Fight {
  fightId: string;
  order: number;
  isMainEvent: boolean;
  isTitleFight: boolean;
  weightClass: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  fighter1: Fighter;
  fighter2: Fighter;
  winner?: 'fighter1' | 'fighter2' | 'draw' | 'nc';
  method?: string;
  round?: number;
  time?: string;
  scheduledRounds: number;
}

export interface FightCard extends SportEvent {
  mainEvent?: Fight;
  mainCard: Fight[];
  prelims?: Fight[];
  earlyPrelims?: Fight[];
}

// Individual sport data result
export interface IndividualSportData {
  sportId: string;
  event: GolfTournament | RaceEvent | TennisTournament | FightCard | null;
  hasLiveAction: boolean;
  lastUpdated: Date;
}

// ===== USER SETTINGS =====

export type StatComplexity = 'novice' | 'casual' | 'fan' | 'nerd';

export interface UserSettings {
  enabledSports: string[];
  sportOrder: string[];
  favorites: Record<string, string[]>;
  showOnlyFavorites: boolean;
  showLiveFirst: boolean;
  onboardingComplete: boolean;
  onboardingVersion: number;
  statComplexity: StatComplexity;
}
