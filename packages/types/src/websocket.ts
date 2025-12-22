// WebSocket message types for real-time updates

export type WebSocketMessageType =
  | 'connection'
  | 'subscribe'
  | 'unsubscribe'
  | 'score_update'
  | 'game_state_change'
  | 'live_sports_update'
  | 'error';

export interface BaseWebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
}

// Server -> Client: Connection established
export interface ConnectionMessage extends BaseWebSocketMessage {
  type: 'connection';
  clientId: string;
  message: string;
}

// Client -> Server: Subscribe to sports updates
export interface SubscribeMessage extends BaseWebSocketMessage {
  type: 'subscribe';
  sportIds: string[];
}

// Client -> Server: Unsubscribe from sports updates
export interface UnsubscribeMessage extends BaseWebSocketMessage {
  type: 'unsubscribe';
  sportIds: string[];
}

// Server -> Client: Score update for a game
export interface ScoreUpdateMessage extends BaseWebSocketMessage {
  type: 'score_update';
  sportId: string;
  gameId: string;
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  period?: string;
  clock?: string;
  previousHomeScore?: number;
  previousAwayScore?: number;
}

// Server -> Client: Game state changed (started, ended, etc.)
export interface GameStateChangeMessage extends BaseWebSocketMessage {
  type: 'game_state_change';
  sportId: string;
  gameId: string;
  previousState: 'pre' | 'in' | 'post';
  newState: 'pre' | 'in' | 'post';
  homeTeam: string;
  awayTeam: string;
}

// Server -> Client: Which sports have live games (broadcast periodically)
export interface LiveSportsUpdateMessage extends BaseWebSocketMessage {
  type: 'live_sports_update';
  liveSports: string[];
  gameCount: Record<string, number>;
}

// Server -> Client: Error message
export interface ErrorMessage extends BaseWebSocketMessage {
  type: 'error';
  code: string;
  message: string;
}

// Union type for all WebSocket messages
export type WebSocketMessage =
  | ConnectionMessage
  | SubscribeMessage
  | UnsubscribeMessage
  | ScoreUpdateMessage
  | GameStateChangeMessage
  | LiveSportsUpdateMessage
  | ErrorMessage;
