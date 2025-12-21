import { Router, Request, Response } from 'express';
import { getPlayerStats } from '../services/nhl';

const router: Router = Router();

router.get('/:playerId', async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    const playerStats = await getPlayerStats(playerId);
    return res.json(playerStats);
  } catch (error) {
    console.error('Error fetching player:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch player',
    });
  }
});

export default router;
