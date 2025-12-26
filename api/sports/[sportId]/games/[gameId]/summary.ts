import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSportConfig } from '../../../../_lib/sports-config';
import * as espnService from '../../../../_lib/espn';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sportId, gameId, team1, team2 } = req.query;

    if (typeof sportId !== 'string') {
      return res.status(400).json({ error: 'Invalid sport ID' });
    }

    if (typeof gameId !== 'string') {
      return res.status(400).json({ error: 'Invalid game ID' });
    }

    const config = getSportConfig(sportId);

    if (!config) {
      return res.status(404).json({ error: 'Sport not found' });
    }

    const team1Id = typeof team1 === 'string' ? team1 : undefined;
    const team2Id = typeof team2 === 'string' ? team2 : undefined;

    const summary = await espnService.getGameSummary(sportId, gameId, team1Id, team2Id);

    return res.json(summary);
  } catch (error) {
    console.error(`Error fetching game summary:`, error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch game summary',
    });
  }
}
