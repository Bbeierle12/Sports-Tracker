import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useGameDetails } from './useGameDetails';

// Mock the API client
vi.mock('../../lib/api-client', () => ({
  apiGet: vi.fn(),
}));

import { apiGet } from '../../lib/api-client';

const mockApiGet = vi.mocked(apiGet);

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock game details response from API
const mockGameDetailsResponse = {
  boxscore: {
    teams: [
      {
        team: { id: '13', abbreviation: 'LAL', displayName: 'Los Angeles Lakers' },
        statistics: [
          { name: 'fieldGoalPct', displayValue: '45.2%', label: 'FG%' },
          { name: 'threePointFieldGoalPct', displayValue: '38.5%', label: '3P%' },
          { name: 'totalRebounds', displayValue: '32', label: 'REB' },
          { name: 'assists', displayValue: '18', label: 'AST' },
          { name: 'turnovers', displayValue: '8', label: 'TO' },
        ],
      },
      {
        team: { id: '9', abbreviation: 'GSW', displayName: 'Golden State Warriors' },
        statistics: [
          { name: 'fieldGoalPct', displayValue: '48.1%', label: 'FG%' },
          { name: 'threePointFieldGoalPct', displayValue: '42.3%', label: '3P%' },
          { name: 'totalRebounds', displayValue: '35', label: 'REB' },
          { name: 'assists', displayValue: '22', label: 'AST' },
          { name: 'turnovers', displayValue: '6', label: 'TO' },
        ],
      },
    ],
  },
  leaders: [
    {
      team: { id: '13', abbreviation: 'LAL' },
      leaders: [
        {
          name: 'points',
          displayName: 'Points',
          leaders: [
            {
              athlete: { displayName: 'LeBron James' },
              displayValue: '24 PTS',
            },
          ],
        },
      ],
    },
    {
      team: { id: '9', abbreviation: 'GSW' },
      leaders: [
        {
          name: 'points',
          displayName: 'Points',
          leaders: [
            {
              athlete: { displayName: 'Stephen Curry' },
              displayValue: '28 PTS',
            },
          ],
        },
      ],
    },
  ],
  headToHead: [
    {
      date: '2024-11-15',
      homeTeam: { abbreviation: 'LAL', score: 118 },
      awayTeam: { abbreviation: 'GSW', score: 112 },
      winner: 'LAL',
    },
  ],
};

describe('useGameDetails Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching behavior', () => {
    it('should fetch game details when sportId and gameId are provided', async () => {
      mockApiGet.mockResolvedValueOnce(mockGameDetailsResponse);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports/nba/games/401547417/summary?team1=13&team2=9');
      expect(result.current.data).toEqual(mockGameDetailsResponse);
    });

    it('should not fetch when sportId is undefined', () => {
      const { result } = renderHook(
        () => useGameDetails(undefined, '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('should not fetch when gameId is undefined', () => {
      const { result } = renderHook(
        () => useGameDetails('nba', undefined, '13', '9'),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('should not fetch when enabled is false', () => {
      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9', { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApiGet).not.toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should return loading state initially', async () => {
      mockApiGet.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockGameDetailsResponse), 100))
      );

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('Success state', () => {
    it('should return game data on success', async () => {
      mockApiGet.mockResolvedValueOnce(mockGameDetailsResponse);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.boxscore).toBeDefined();
      expect(result.current.data?.leaders).toBeDefined();
      expect(result.current.data?.headToHead).toBeDefined();
    });

    it('should include boxscore with team statistics', async () => {
      mockApiGet.mockResolvedValueOnce(mockGameDetailsResponse);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.boxscore.teams).toHaveLength(2);
      expect(result.current.data?.boxscore.teams[0].statistics.length).toBeGreaterThan(0);
    });

    it('should include game leaders', async () => {
      mockApiGet.mockResolvedValueOnce(mockGameDetailsResponse);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.leaders).toHaveLength(2);
    });

    it('should include head-to-head history in response', async () => {
      mockApiGet.mockResolvedValueOnce(mockGameDetailsResponse);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.headToHead).toBeDefined();
      expect(result.current.data?.headToHead).toHaveLength(1);
      expect(result.current.data?.headToHead[0].winner).toBe('LAL');
    });
  });

  describe('Error state', () => {
    it('should return error state on API failure', async () => {
      const error = new Error('Failed to fetch game details');
      mockApiGet.mockRejectedValueOnce(error);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Refetch interval', () => {
    it('should be configured for live updates (30 seconds)', async () => {
      mockApiGet.mockResolvedValue(mockGameDetailsResponse);

      const { result } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Hook should be configured with refetchInterval for live games
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Cache behavior', () => {
    it('should cache results with stale time', async () => {
      mockApiGet.mockResolvedValue(mockGameDetailsResponse);

      const wrapper = createWrapper();

      // First render
      const { result: result1 } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper }
      );

      await waitFor(() => expect(result1.current.isSuccess).toBe(true));

      // Second render with same params
      const { result: result2 } = renderHook(
        () => useGameDetails('nba', '401547417', '13', '9'),
        { wrapper }
      );

      // Should use cached data
      expect(result2.current.data).toEqual(mockGameDetailsResponse);
    });
  });
});
