import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type {
  WebSocketMessage,
  ScoreUpdateMessage,
  GameStateChangeMessage,
  LiveSportsUpdateMessage,
  ConnectionMessage,
  ESPNScoreboardResponse,
} from '@nhl-dashboard/types';
import { getScoreboard } from './espn';
import { getSportIds } from '@nhl-dashboard/types';

interface ClientState {
  id: string;
  subscribedSports: Set<string>;
  ws: WebSocket;
}

interface GameState {
  gameId: string;
  sportId: string;
  state: 'pre' | 'in' | 'post';
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  period?: string;
  clock?: string;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientState> = new Map();
  private gameStates: Map<string, GameState> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private liveSports: Set<string> = new Set();

  // Poll interval in ms (10 seconds for live updates)
  private readonly POLL_INTERVAL = 10000;

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      const clientId = this.generateClientId();
      const client: ClientState = {
        id: clientId,
        subscribedSports: new Set(),
        ws,
      };

      this.clients.set(clientId, client);
      console.log(`[WebSocket] Client connected: ${clientId}`);

      // Send connection acknowledgment
      const connectionMsg: ConnectionMessage = {
        type: 'connection',
        clientId,
        message: 'Connected to Sports Tracker real-time updates',
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(connectionMsg));

      // Send current live sports status
      this.sendLiveSportsUpdate(client);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleMessage(client, message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocket] Client error (${clientId}):`, error);
        this.clients.delete(clientId);
      });
    });

    // Start polling for live updates
    this.startPolling();

    console.log('[WebSocket] Server initialized on /ws');
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleMessage(client: ClientState, message: WebSocketMessage): void {
    switch (message.type) {
      case 'subscribe':
        if ('sportIds' in message) {
          message.sportIds.forEach((id) => client.subscribedSports.add(id));
          console.log(`[WebSocket] Client ${client.id} subscribed to:`, message.sportIds);
        }
        break;

      case 'unsubscribe':
        if ('sportIds' in message) {
          message.sportIds.forEach((id) => client.subscribedSports.delete(id));
          console.log(`[WebSocket] Client ${client.id} unsubscribed from:`, message.sportIds);
        }
        break;

      default:
        console.log(`[WebSocket] Unknown message type from ${client.id}`);
    }
  }

  private startPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    // Initial poll
    this.pollLiveGames();

    // Set up recurring poll
    this.pollInterval = setInterval(() => {
      this.pollLiveGames();
    }, this.POLL_INTERVAL);
  }

  private async pollLiveGames(): Promise<void> {
    // Get all sports that have subscribers or that we're tracking
    const sportsToCheck = new Set<string>();

    // Add sports from subscribed clients
    this.clients.forEach((client) => {
      client.subscribedSports.forEach((sportId) => sportsToCheck.add(sportId));
    });

    // Also check team sports for live games (limit to common ones for efficiency)
    const commonTeamSports = ['nfl', 'nba', 'mlb', 'nhl', 'mls', 'epl'];
    commonTeamSports.forEach((s) => sportsToCheck.add(s));

    const newLiveSports = new Set<string>();
    const gameCount: Record<string, number> = {};

    // Fetch data for each sport
    for (const sportId of sportsToCheck) {
      try {
        const data = await getScoreboard(sportId);
        const liveGames = this.processScoreboardData(sportId, data);

        if (liveGames > 0) {
          newLiveSports.add(sportId);
          gameCount[sportId] = liveGames;
        }
      } catch (error) {
        // Silently continue on errors for individual sports
      }
    }

    // Check if live sports changed and broadcast
    const liveSportsChanged =
      newLiveSports.size !== this.liveSports.size ||
      [...newLiveSports].some((s) => !this.liveSports.has(s));

    if (liveSportsChanged) {
      this.liveSports = newLiveSports;
      this.broadcastLiveSportsUpdate(gameCount);
    }
  }

  private processScoreboardData(sportId: string, data: ESPNScoreboardResponse): number {
    let liveGameCount = 0;

    for (const event of data.events || []) {
      const state = event.status?.type?.state;
      if (!state) continue;

      const competition = event.competitions?.[0];
      if (!competition) continue;

      const homeTeam = competition.competitors?.find((c) => c.homeAway === 'home');
      const awayTeam = competition.competitors?.find((c) => c.homeAway === 'away');

      if (!homeTeam || !awayTeam) continue;

      const gameId = `${sportId}_${event.id}`;
      const homeScore = parseInt(homeTeam.score || '0', 10);
      const awayScore = parseInt(awayTeam.score || '0', 10);

      const newState: GameState = {
        gameId,
        sportId,
        state,
        homeScore,
        awayScore,
        homeTeam: homeTeam.team?.displayName || homeTeam.team?.abbreviation || 'Home',
        awayTeam: awayTeam.team?.displayName || awayTeam.team?.abbreviation || 'Away',
        period: event.status?.period?.toString(),
        clock: event.status?.displayClock,
      };

      const previousState = this.gameStates.get(gameId);

      // Check for state change
      if (previousState && previousState.state !== newState.state) {
        this.broadcastGameStateChange(previousState, newState);
      }

      // Check for score change
      if (
        previousState &&
        (previousState.homeScore !== newState.homeScore ||
          previousState.awayScore !== newState.awayScore)
      ) {
        this.broadcastScoreUpdate(newState, previousState.homeScore, previousState.awayScore);
      }

      // Update stored state
      this.gameStates.set(gameId, newState);

      if (state === 'in') {
        liveGameCount++;
      }
    }

    return liveGameCount;
  }

  private broadcastScoreUpdate(
    game: GameState,
    previousHomeScore: number,
    previousAwayScore: number
  ): void {
    const message: ScoreUpdateMessage = {
      type: 'score_update',
      sportId: game.sportId,
      gameId: game.gameId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      period: game.period,
      clock: game.clock,
      previousHomeScore,
      previousAwayScore,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToSubscribers(game.sportId, message);
    console.log(
      `[WebSocket] Score update: ${game.awayTeam} ${game.awayScore} @ ${game.homeTeam} ${game.homeScore}`
    );
  }

  private broadcastGameStateChange(previousState: GameState, newState: GameState): void {
    const message: GameStateChangeMessage = {
      type: 'game_state_change',
      sportId: newState.sportId,
      gameId: newState.gameId,
      previousState: previousState.state,
      newState: newState.state,
      homeTeam: newState.homeTeam,
      awayTeam: newState.awayTeam,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToSubscribers(newState.sportId, message);
    console.log(
      `[WebSocket] Game state change: ${newState.awayTeam} @ ${newState.homeTeam}: ${previousState.state} -> ${newState.state}`
    );
  }

  private broadcastLiveSportsUpdate(gameCount: Record<string, number>): void {
    const message: LiveSportsUpdateMessage = {
      type: 'live_sports_update',
      liveSports: [...this.liveSports],
      gameCount,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected clients
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private sendLiveSportsUpdate(client: ClientState): void {
    const gameCount: Record<string, number> = {};
    this.liveSports.forEach((sportId) => {
      // Count live games for each sport
      let count = 0;
      this.gameStates.forEach((state) => {
        if (state.sportId === sportId && state.state === 'in') {
          count++;
        }
      });
      gameCount[sportId] = count;
    });

    const message: LiveSportsUpdateMessage = {
      type: 'live_sports_update',
      liveSports: [...this.liveSports],
      gameCount,
      timestamp: new Date().toISOString(),
    };

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToSubscribers(sportId: string, message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.subscribedSports.has(sportId) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  // Get current live sports for the batch API
  getLiveSportsStatus(): { sportId: string; hasLiveGames: boolean; liveGameCount: number }[] {
    const result: { sportId: string; hasLiveGames: boolean; liveGameCount: number }[] = [];

    const sportGameCounts = new Map<string, number>();
    this.gameStates.forEach((state) => {
      if (state.state === 'in') {
        const count = sportGameCounts.get(state.sportId) || 0;
        sportGameCounts.set(state.sportId, count + 1);
      }
    });

    sportGameCounts.forEach((count, sportId) => {
      result.push({
        sportId,
        hasLiveGames: count > 0,
        liveGameCount: count,
      });
    });

    return result;
  }

  shutdown(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
