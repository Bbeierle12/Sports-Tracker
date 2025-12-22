import { Router, type Router as RouterType } from 'express';
import gamesRouter from './games';
import standingsRouter from './standings';
import teamsRouter from './teams';
import playersRouter from './players';
import sportsRouter from './sports';

const router: RouterType = Router();

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
    service: 'NHL Dashboard API',
  });
});

export default router;
