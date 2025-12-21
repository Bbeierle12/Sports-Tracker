import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getScoreboard,
  getTeams,
  getTeamSchedule,
  getLeaderboard,
  ESPN_API_BASE,
} from './espn';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ESPN Service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ESPN_API_BASE', () => {
    it('should export the correct base URL', () => {
      expect(ESPN_API_BASE).toBe('https://site.api.espn.com/apis/site/v2/sports');
    });
  });

  describe('getScoreboard', () => {
    it('should fetch scoreboard for NFL', async () => {
      const mockResponse = {
        events: [
          {
            id: '123',
            date: '2024-01-15T20:00:00Z',
            status: { type: { state: 'pre' } },
            competitions: [],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getScoreboard('nfl');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/football/nfl/scoreboard`,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch scoreboard for NBA', async () => {
      const mockResponse = { events: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getScoreboard('nba');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/basketball/nba/scoreboard`,
        expect.any(Object)
      );
    });

    it('should fetch scoreboard for EPL soccer', async () => {
      const mockResponse = { events: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getScoreboard('epl');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/soccer/eng.1/scoreboard`,
        expect.any(Object)
      );
    });

    it('should throw error for unknown sport', async () => {
      await expect(getScoreboard('unknown-sport')).rejects.toThrow(
        'Unknown sport: unknown-sport'
      );
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getScoreboard('nfl')).rejects.toThrow('ESPN API error: 500');
    });

    it('should handle fetch timeout', async () => {
      mockFetch.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Aborted')), 100))
      );

      await expect(getScoreboard('nfl')).rejects.toThrow();
    });
  });

  describe('getTeams', () => {
    it('should fetch all teams for a sport', async () => {
      const mockResponse = {
        sports: [
          {
            leagues: [
              {
                teams: [
                  {
                    team: {
                      id: '1',
                      displayName: 'Dallas Cowboys',
                      abbreviation: 'DAL',
                      color: '002244',
                      logos: [{ href: 'https://example.com/logo.png' }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getTeams('nfl');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/football/nfl/teams`,
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        sportId: 'nfl',
        name: 'Dallas Cowboys',
        abbreviation: 'DAL',
        logo: 'https://example.com/logo.png',
        emoji: '🏈',
        primaryColor: '#002244',
      });
    });

    it('should return empty array for individual sports without teams', async () => {
      const result = await getTeams('pga');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw error for unknown sport', async () => {
      await expect(getTeams('unknown-sport')).rejects.toThrow(
        'Unknown sport: unknown-sport'
      );
    });

    it('should handle missing logos gracefully', async () => {
      const mockResponse = {
        sports: [
          {
            leagues: [
              {
                teams: [
                  {
                    team: {
                      id: '1',
                      displayName: 'Test Team',
                      abbreviation: 'TST',
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getTeams('nfl');

      expect(result[0].logo).toBeUndefined();
      expect(result[0].primaryColor).toBe('🏈'); // Falls back to icon
    });
  });

  describe('getTeamSchedule', () => {
    it('should fetch schedule for a specific team', async () => {
      const mockResponse = {
        team: {
          id: '25',
          abbreviation: 'SF',
          displayName: 'San Francisco 49ers',
          recordSummary: '10-4',
        },
        events: [],
        requestedSeason: { year: 2024, type: 2 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getTeamSchedule('nfl', '25');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/football/nfl/teams/25/schedule`,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error for unknown sport', async () => {
      await expect(getTeamSchedule('unknown-sport', '1')).rejects.toThrow(
        'Unknown sport: unknown-sport'
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard for golf', async () => {
      const mockResponse = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getLeaderboard('pga');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/golf/pga/scoreboard`,
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch leaderboard for F1 racing', async () => {
      const mockResponse = { events: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getLeaderboard('f1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${ESPN_API_BASE}/racing/f1/scoreboard`,
        expect.any(Object)
      );
    });

    it('should throw error for team sports', async () => {
      await expect(getLeaderboard('nfl')).rejects.toThrow(
        'Leaderboard not available for team sport: nfl'
      );
    });
  });
});
