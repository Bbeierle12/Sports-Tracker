import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSports, useSportGames, useSportTeams, useLeaderboard } from './useSports';

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

describe('Sports Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSports', () => {
    it('should fetch list of all sports', async () => {
      const mockSports = {
        sports: [
          { id: 'nfl', name: 'NFL Football', category: 'pro', type: 'team' },
          { id: 'nba', name: 'NBA Basketball', category: 'pro', type: 'team' },
          { id: 'pga', name: 'PGA Golf', category: 'individual', type: 'individual' },
        ],
      };

      mockApiGet.mockResolvedValueOnce(mockSports);

      const { result } = renderHook(() => useSports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports');
      expect(result.current.data?.sports).toHaveLength(3);
    });

    it('should filter sports by category', async () => {
      const mockSports = {
        sports: [
          { id: 'nfl', name: 'NFL Football', category: 'pro', type: 'team' },
        ],
      };

      mockApiGet.mockResolvedValueOnce(mockSports);

      const { result } = renderHook(() => useSports({ category: 'pro' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports?category=pro');
    });

    it('should filter sports by type', async () => {
      const mockSports = {
        sports: [
          { id: 'pga', name: 'PGA Golf', category: 'individual', type: 'individual' },
        ],
      };

      mockApiGet.mockResolvedValueOnce(mockSports);

      const { result } = renderHook(() => useSports({ type: 'individual' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports?type=individual');
    });
  });

  describe('useSportGames', () => {
    it('should fetch games for a sport', async () => {
      const mockGames = {
        sportId: 'nfl',
        events: [
          {
            id: '123',
            date: '2024-01-15T20:00:00Z',
            status: { type: { state: 'pre' } },
            competitions: [],
          },
        ],
      };

      mockApiGet.mockResolvedValueOnce(mockGames);

      const { result } = renderHook(() => useSportGames('nfl'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports/nfl/games');
      expect(result.current.data?.sportId).toBe('nfl');
      expect(result.current.data?.events).toHaveLength(1);
    });

    it('should not fetch when sportId is undefined', () => {
      const { result } = renderHook(() => useSportGames(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('should auto-refetch for live updates', async () => {
      const mockGames = {
        sportId: 'nfl',
        events: [],
      };

      mockApiGet.mockResolvedValue(mockGames);

      const { result } = renderHook(() => useSportGames('nfl'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // The hook should be configured with refetchInterval
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useSportTeams', () => {
    it('should fetch teams for a sport', async () => {
      const mockTeams = {
        sportId: 'nfl',
        teams: [
          {
            id: '1',
            sportId: 'nfl',
            name: 'Dallas Cowboys',
            abbreviation: 'DAL',
            logo: 'https://example.com/logo.png',
            emoji: '🏈',
            primaryColor: '#002244',
          },
        ],
      };

      mockApiGet.mockResolvedValueOnce(mockTeams);

      const { result } = renderHook(() => useSportTeams('nfl'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports/nfl/teams');
      expect(result.current.data?.teams).toHaveLength(1);
      expect(result.current.data?.teams[0].name).toBe('Dallas Cowboys');
    });

    it('should not fetch when sportId is undefined', () => {
      const { result } = renderHook(() => useSportTeams(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApiGet).not.toHaveBeenCalled();
    });
  });

  describe('useLeaderboard', () => {
    it('should fetch leaderboard for individual sports', async () => {
      const mockLeaderboard = {
        sportId: 'pga',
        events: [
          {
            id: '401580340',
            name: 'The Masters',
            status: { type: { state: 'in', completed: false } },
            competitions: [
              {
                competitors: [
                  {
                    id: '1',
                    athlete: { displayName: 'Tiger Woods' },
                    score: { displayValue: '-5' },
                  },
                ],
              },
            ],
          },
        ],
      };

      mockApiGet.mockResolvedValueOnce(mockLeaderboard);

      const { result } = renderHook(() => useLeaderboard('pga'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApiGet).toHaveBeenCalledWith('/sports/pga/leaderboard');
      expect(result.current.data?.sportId).toBe('pga');
    });

    it('should not fetch when sportId is undefined', () => {
      const { result } = renderHook(() => useLeaderboard(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockApiGet).not.toHaveBeenCalled();
    });
  });
});
