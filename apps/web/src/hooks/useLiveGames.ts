import { useQuery } from '@tanstack/react-query';
import { apiPost } from '../lib/api-client';
import type { BatchLiveSportsResponse } from '@nhl-dashboard/types';

interface UseLiveGamesOptions {
  sportIds: string[];
  enabled?: boolean;
}

interface UseLiveGamesReturn {
  liveSports: string[];
  liveGameCounts: Record<string, number>;
  hasAnyLive: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
}

/**
 * Hook to track which sports have live games using the batch API.
 * - Uses a single batch request instead of multiple individual requests
 * - Supports unlimited sports (server limits to 10 per request)
 * - Returns array of sport IDs with live games
 * - Provides hasAnyLive flag for quick checks
 * - Includes live game counts per sport
 */
export function useLiveGames({
  sportIds,
  enabled = true,
}: UseLiveGamesOptions): UseLiveGamesReturn {
  const query = useQuery({
    queryKey: ['batch-live-sports', sportIds],
    queryFn: async () => {
      if (sportIds.length === 0) {
        return { sports: [], timestamp: new Date().toISOString() };
      }
      return apiPost<BatchLiveSportsResponse>('/sports/batch/live', { sportIds });
    },
    enabled: enabled && sportIds.length > 0,
    refetchInterval: 30000, // 30 seconds for live updates
    staleTime: 10000, // 10 seconds
  });

  const liveSports = query.data?.sports
    ?.filter((s) => s.hasLiveGames)
    .map((s) => s.sportId) || [];

  const liveGameCounts: Record<string, number> = {};
  query.data?.sports?.forEach((s) => {
    if (s.hasLiveGames) {
      liveGameCounts[s.sportId] = s.liveGameCount;
    }
  });

  return {
    liveSports,
    liveGameCounts,
    hasAnyLive: liveSports.length > 0,
    isLoading: query.isLoading,
    lastUpdated: query.data?.timestamp ? new Date(query.data.timestamp) : null,
  };
}
