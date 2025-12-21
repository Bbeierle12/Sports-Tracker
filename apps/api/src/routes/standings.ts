import { Router, Request, Response } from 'express';
import { getStandings } from '../services/nhl';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const standings = await getStandings();
    return res.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch standings',
    });
  }
});

export default router;
