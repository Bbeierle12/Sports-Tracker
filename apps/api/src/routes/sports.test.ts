import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { type Express } from 'express';
import request from 'supertest';
import sportsRouter from './sports';

// Mock the ESPN service
vi.mock('../services/espn', () => ({
  getScoreboard: vi.fn(),
  getTeams: vi.fn(),
  getTeamSchedule: vi.fn(),
  getLeaderboard: vi.fn(),
}));

import * as espnService from '../services/espn';

// Create test app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/sports', sportsRouter);
  return app;
}

describe('Sports Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /sports', () => {
    it('should return list of all available sports', async () => {
      const response = await request(app).get('/sports');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sports');
      expect(Array.isArray(response.body.sports)).toBe(true);
      expect(response.body.sports.length).toBeGreaterThan(0);

      // Check structure of a sport
      const sport = response.body.sports.find((s: { id: string }) => s.id === 'nfl');
      expect(sport).toBeDefined();
      expect(sport).toHaveProperty('id', 'nfl');
      expect(sport).toHaveProperty('name', 'NFL Football');
      expect(sport).toHaveProperty('shortName', 'NFL');
      expect(sport).toHaveProperty('category', 'pro');
      expect(sport).toHaveProperty('type', 'team');
    });

    it('should filter sports by category', async () => {
      const response = await request(app).get('/sports?category=pro');

      expect(response.status).toBe(200);
      expect(response.body.sports.every((s: { category: string }) => s.category === 'pro')).toBe(true);
    });

    it('should filter sports by type', async () => {
      const response = await request(app).get('/sports?type=individual');

      expect(response.status).toBe(200);
      expect(response.body.sports.every((s: { type: string }) => s.type === 'individual')).toBe(true);
    });
  });

  describe('GET /sports/:sportId', () => {
    it('should return sport configuration', async () => {
      const response = await request(app).get('/sports/nfl');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'nfl');
      expect(response.body).toHaveProperty('name', 'NFL Football');
      expect(response.body).toHaveProperty('apiPath');
    });

    it('should return 404 for unknown sport', async () => {
      const response = await request(app).get('/sports/unknown-sport');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Sport not found');
    });
  });

  describe('GET /sports/:sportId/games', () => {
    it('should return scoreboard data for a sport', async () => {
      const mockScoreboard = {
        events: [
          {
            id: '123',
            date: '2024-01-15T20:00:00Z',
            status: { type: { state: 'pre' } },
            competitions: [],
          },
        ],
      };

      vi.mocked(espnService.getScoreboard).mockResolvedValueOnce(mockScoreboard);

      const response = await request(app).get('/sports/nfl/games');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sportId', 'nfl');
      expect(response.body).toHaveProperty('events');
      expect(espnService.getScoreboard).toHaveBeenCalledWith('nfl');
    });

    it('should handle ESPN API errors gracefully', async () => {
      vi.mocked(espnService.getScoreboard).mockRejectedValueOnce(
        new Error('ESPN API error: 500')
      );

      const response = await request(app).get('/sports/nfl/games');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /sports/:sportId/teams', () => {
    it('should return list of teams for a sport', async () => {
      const mockTeams = [
        {
          id: '1',
          sportId: 'nfl',
          name: 'Dallas Cowboys',
          abbreviation: 'DAL',
          logo: 'https://example.com/logo.png',
          emoji: '🏈',
          primaryColor: '#002244',
        },
      ];

      vi.mocked(espnService.getTeams).mockResolvedValueOnce(mockTeams);

      const response = await request(app).get('/sports/nfl/teams');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sportId', 'nfl');
      expect(response.body).toHaveProperty('teams');
      expect(response.body.teams).toHaveLength(1);
      expect(espnService.getTeams).toHaveBeenCalledWith('nfl');
    });

    it('should return empty array for individual sports', async () => {
      vi.mocked(espnService.getTeams).mockResolvedValueOnce([]);

      const response = await request(app).get('/sports/pga/teams');

      expect(response.status).toBe(200);
      expect(response.body.teams).toEqual([]);
    });
  });

  describe('GET /sports/:sportId/teams/:teamId', () => {
    it('should return team schedule', async () => {
      const mockSchedule = {
        team: {
          id: '25',
          abbreviation: 'SF',
          displayName: 'San Francisco 49ers',
          recordSummary: '10-4',
        },
        events: [],
        requestedSeason: { year: 2024, type: 2 },
      };

      vi.mocked(espnService.getTeamSchedule).mockResolvedValueOnce(mockSchedule);

      const response = await request(app).get('/sports/nfl/teams/25');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('team');
      expect(response.body.team.abbreviation).toBe('SF');
      expect(espnService.getTeamSchedule).toHaveBeenCalledWith('nfl', '25');
    });
  });

  describe('GET /sports/:sportId/leaderboard', () => {
    it('should return leaderboard for individual sports', async () => {
      const mockLeaderboard = {
        events: [
          {
            id: '401580340',
            name: 'The Masters',
            status: { type: { state: 'in', completed: false } },
            competitions: [],
          },
        ],
      };

      vi.mocked(espnService.getLeaderboard).mockResolvedValueOnce(mockLeaderboard);

      const response = await request(app).get('/sports/pga/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sportId', 'pga');
      expect(response.body).toHaveProperty('events');
      expect(espnService.getLeaderboard).toHaveBeenCalledWith('pga');
    });

    it('should return 400 for team sports', async () => {
      vi.mocked(espnService.getLeaderboard).mockRejectedValueOnce(
        new Error('Leaderboard not available for team sport: nfl')
      );

      const response = await request(app).get('/sports/nfl/leaderboard');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
