import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { apiGet } from '../lib/api-client';

interface UseLiveGamesOptions {
  sportIds: string[];
  enabled?: boolean;
}

interface UseLiveGamesReturn {
  liveSports: string[];
  hasAnyLive: boolean;
  isLoading: boolean;
}

interface SportGamesResponse {
  sportId: string;
  events?: Array<{
    status?: {
      type?: {
        state?: 'pre' | 'in' | 'post';
      };
    };
  }>;
}

/**
 * Hook to track which sports have live games
 * - Dynamically checks ALL enabled sports (no hardcoded limit)
 * - Returns array of sport IDs with live games
 * - Provides hasAnyLive flag for quick checks
 * - Uses batched queries for better performance
 */
export function useLiveGames({
  sportIds,
  enabled = true,
}: UseLiveGamesOptions): UseLiveGamesReturn {
  // Use useQueries to dynamically fetch all sports at once
  const queries = useQueries({
    queries: sportIds.map((sportId) => ({
      queryKey: ['sport-games-live', sportId],
      queryFn: () => apiGet<SportGamesResponse>(`/sports/${sportId}/games`),
      enabled: enabled && !!sportId,
      refetchInterval: 30000, // 30 seconds for live updates
      staleTime: 10000, // 10 seconds
    })),
  });

  const result = useMemo(() => {
    const live: string[] = [];
    let anyLoading = false;

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const sportId = sportIds[i];

      if (!sportId) continue;

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
          live.push(sportId);
        }
      }
    }

    return {
      liveSports: live,
      hasAnyLive: live.length > 0,
      isLoading: anyLoading,
    };
  }, [queries, sportIds]);

  return result;
}
