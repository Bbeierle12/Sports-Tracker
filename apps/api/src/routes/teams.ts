import { Router, Request, Response } from 'express';
import { getStandings, getTeamStats } from '../services/nhl';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const standings = await getStandings();
    const teams = standings.standings.map((team) => ({
      id: team.teamAbbrev.default,
      name: `${team.placeName.default} ${team.teamName.default}`,
      abbreviation: team.teamAbbrev.default,
      conference: team.conferenceName,
      division: team.divisionName,
      logo: team.teamLogo,
    }));
    return res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch teams',
    });
  }
});

router.get('/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const teamStats = await getTeamStats(teamId);

    if (!teamStats) {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.json(teamStats);
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch team',
    });
  }
});

export default router;
