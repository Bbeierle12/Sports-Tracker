import { Router } from 'express';
import gamesRouter from './games';
import standingsRouter from './standings';
import teamsRouter from './teams';
import playersRouter from './players';
import sportsRouter from './sports';

const router: Router = Router();

// NHL-specific routes (primary)
router.use('/games', gamesRouter);
router.use('/standings', standingsRouter);
router.use('/teams', teamsRouter);
router.use('/players', playersRouter);

// Multi-sport routes (ESPN API)
router.use('/sports', sportsRouter);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sports Stats API',
  });
});

export default router;
