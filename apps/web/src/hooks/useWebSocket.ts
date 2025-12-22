import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  WebSocketMessage,
  ScoreUpdateMessage,
  GameStateChangeMessage,
  LiveSportsUpdateMessage,
} from '@nhl-dashboard/types';

interface UseWebSocketOptions {
  sportIds?: string[];
  enabled?: boolean;
  onScoreUpdate?: (message: ScoreUpdateMessage) => void;
  onGameStateChange?: (message: GameStateChangeMessage) => void;
  onLiveSportsUpdate?: (message: LiveSportsUpdateMessage) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  liveSports: string[];
  lastUpdate: Date | null;
  subscribe: (sportIds: string[]) => void;
  unsubscribe: (sportIds: string[]) => void;
}

const WS_URL = `ws://${window.location.hostname}:3001/ws`;

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    sportIds = [],
    enabled = true,
    onScoreUpdate,
    onGameStateChange,
    onLiveSportsUpdate,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveSports, setLiveSports] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);

        // Subscribe to initial sports
        if (sportIds.length > 0) {
          ws.send(
            JSON.stringify({
              type: 'subscribe',
              sportIds,
              timestamp: new Date().toISOString(),
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          setLastUpdate(new Date());

          switch (message.type) {
            case 'score_update':
              handleScoreUpdate(message as ScoreUpdateMessage);
              break;
            case 'game_state_change':
              handleGameStateChange(message as GameStateChangeMessage);
              break;
            case 'live_sports_update':
              handleLiveSportsUpdate(message as LiveSportsUpdateMessage);
              break;
            case 'connection':
              console.log('[WebSocket] Connection acknowledged:', message);
              break;
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 5 seconds
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...');
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error);
    }
  }, [enabled, sportIds]);

  const handleScoreUpdate = useCallback(
    (message: ScoreUpdateMessage) => {
      // Invalidate queries for this sport to refresh data
      queryClient.invalidateQueries({ queryKey: ['sport-games', message.sportId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });

      // Call custom handler if provided
      onScoreUpdate?.(message);
    },
    [queryClient, onScoreUpdate]
  );

  const handleGameStateChange = useCallback(
    (message: GameStateChangeMessage) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sport-games', message.sportId] });
      queryClient.invalidateQueries({ queryKey: ['games'] });

      // Call custom handler if provided
      onGameStateChange?.(message);
    },
    [queryClient, onGameStateChange]
  );

  const handleLiveSportsUpdate = useCallback(
    (message: LiveSportsUpdateMessage) => {
      setLiveSports(message.liveSports);

      // Call custom handler if provided
      onLiveSportsUpdate?.(message);
    },
    [onLiveSportsUpdate]
  );

  const subscribe = useCallback((newSportIds: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          sportIds: newSportIds,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, []);

  const unsubscribe = useCallback((sportIdsToRemove: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          sportIds: sportIdsToRemove,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, connect]);

  // Update subscriptions when sportIds change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && sportIds.length > 0) {
      subscribe(sportIds);
    }
  }, [sportIds, subscribe]);

  return {
    isConnected,
    liveSports,
    lastUpdate,
    subscribe,
    unsubscribe,
  };
}
