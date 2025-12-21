import { Router, type Request, type Response } from 'express';
import {
  getAllSports,
  getSportConfig,
  getSportsByCategory,
  getTeamSports,
  getIndividualSports,
  type SportCategory,
} from '@sports-stats-api/types';
import * as espnService from '../services/espn';

const router: Router = Router();

/**
 * GET /sports
 * Returns list of all available sports with optional filtering
 * Query params:
 *   - category: 'pro' | 'college' | 'soccer' | 'individual'
 *   - type: 'team' | 'individual'
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, type } = req.query;

    let sports = getAllSports();

    // Filter by category if provided
    if (category && typeof category === 'string') {
      sports = getSportsByCategory(category as SportCategory);
    }

    // Filter by type if provided
    if (type === 'team') {
      sports = getTeamSports();
    } else if (type === 'individual') {
      sports = getIndividualSports();
    }

    // Apply both filters if both provided
    if (category && type) {
      sports = getAllSports().filter(
        (s) => s.category === category && s.type === type
      );
    }

    return res.json({ sports });
  } catch (error) {
    console.error('Error fetching sports list:', error);
    return res.status(500).json({ error: 'Failed to fetch sports list' });
  }
});

/**
 * GET /sports/:sportId
 * Returns configuration for a specific sport
 */
router.get('/:sportId', (req: Request, res: Response) => {
  try {
    const { sportId } = req.params;
    const config = getSportConfig(sportId);

    if (!config) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    return res.json(config);
  } catch (error) {
    console.error('Error fetching sport config:', error);
    return res.status(500).json({ error: 'Failed to fetch sport configuration' });
  }
});

/**
 * GET /sports/:sportId/games
 * Returns scoreboard/games for a specific sport
 */
router.get('/:sportId/games', async (req: Request, res: Response) => {
  try {
    const { sportId } = req.params;
    const config = getSportConfig(sportId);

    if (!config) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    const scoreboard = await espnService.getScoreboard(sportId);

    return res.json({
      sportId,
      ...scoreboard,
    });
  } catch (error) {
    console.error(`Error fetching games for ${req.params.sportId}:`, error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch games',
    });
  }
});

/**
 * GET /sports/:sportId/teams
 * Returns list of all teams for a sport (for team selection)
 */
router.get('/:sportId/teams', async (req: Request, res: Response) => {
  try {
    const { sportId } = req.params;
    const config = getSportConfig(sportId);

    if (!config) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    const teams = await espnService.getTeams(sportId);

    return res.json({
      sportId,
      teams,
    });
  } catch (error) {
    console.error(`Error fetching teams for ${req.params.sportId}:`, error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch teams',
    });
  }
});

/**
 * GET /sports/:sportId/teams/:teamId
 * Returns schedule and details for a specific team
 */
router.get('/:sportId/teams/:teamId', async (req: Request, res: Response) => {
  try {
    const { sportId, teamId } = req.params;
    const config = getSportConfig(sportId);

    if (!config) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    const schedule = await espnService.getTeamSchedule(sportId, teamId);

    return res.json(schedule);
  } catch (error) {
    console.error(`Error fetching team schedule:`, error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch team schedule',
    });
  }
});

/**
 * GET /sports/:sportId/leaderboard
 * Returns leaderboard for individual sports (golf, racing, etc.)
 */
router.get('/:sportId/leaderboard', async (req: Request, res: Response) => {
  try {
    const { sportId } = req.params;
    const config = getSportConfig(sportId);

    if (!config) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    const leaderboard = await espnService.getLeaderboard(sportId);

    return res.json({
      sportId,
      ...leaderboard,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard';

    // Check if this is a "not available for team sport" error
    if (message.includes('not available for team sport')) {
      return res.status(400).json({ error: message });
    }

    console.error(`Error fetching leaderboard for ${req.params.sportId}:`, error);
    return res.status(500).json({ error: message });
  }
});

export default router;
