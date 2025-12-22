// Batch API types for efficient multi-sport queries

// Request to check live status for multiple sports at once
export interface BatchLiveSportsRequest {
  sportIds: string[];
}

// Status of a single sport's live games
export interface LiveSportStatus {
  sportId: string;
  hasLiveGames: boolean;
  liveGameCount: number;
  gameIds?: string[];
}

// Response with live status for all requested sports
export interface BatchLiveSportsResponse {
  sports: LiveSportStatus[];
  timestamp: string;
}
