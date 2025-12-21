import { useMemo } from 'react';
import { useSportGames } from './queries/useSports';

interface UseLiveGamesOptions {
  sportIds: string[];
  enabled?: boolean;
}

interface UseLiveGamesReturn {
  liveSports: string[];
  hasAnyLive: boolean;
  isLoading: boolean;
}

/**
 * Hook to track which sports have live games
 * - Checks multiple sports for live games
 * - Returns array of sport IDs with live games
 * - Provides hasAnyLive flag for quick checks
 */
export function useLiveGames({
  sportIds,
  enabled = true,
}: UseLiveGamesOptions): UseLiveGamesReturn {
  // Fetch games for enabled sports (max 4 concurrent for performance)
  const sport1 = sportIds[0];
  const sport2 = sportIds[1];
  const sport3 = sportIds[2];
  const sport4 = sportIds[3];

  const query1 = useSportGames(enabled && sport1 ? sport1 : undefined);
  const query2 = useSportGames(enabled && sport2 ? sport2 : undefined);
  const query3 = useSportGames(enabled && sport3 ? sport3 : undefined);
  const query4 = useSportGames(enabled && sport4 ? sport4 : undefined);

  const result = useMemo(() => {
    const live: string[] = [];
    let anyLoading = false;

    const queries = [
      { id: sport1, query: query1 },
      { id: sport2, query: query2 },
      { id: sport3, query: query3 },
      { id: sport4, query: query4 },
    ];

    for (const { id, query } of queries) {
      if (!id) continue;

      if (query.isLoading) {
        anyLoading = true;
        continue;
      }

      if (query.data?.events) {
        const hasLive = query.data.events.some((event) => {
          const state = event.status?.type?.state;
          return state === 'in';
        });

        if (hasLive) {
          live.push(id);
        }
      }
    }

    return {
      liveSports: live,
      hasAnyLive: live.length > 0,
      isLoading: anyLoading,
    };
  }, [
    sport1, sport2, sport3, sport4,
    query1.data, query1.isLoading,
    query2.data, query2.isLoading,
    query3.data, query3.isLoading,
    query4.data, query4.isLoading,
  ]);

  return result;
}
