import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGameById } from '../_lib/nhl';

/**
 * @deprecated This endpoint is NHL-only. Use /api/sports/[sportId]/games for multi-sport support.
 * Note: Single game lookup is not yet available for other sports via ESPN API.
 */
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
    const { gameId } = req.query;

    if (typeof gameId !== 'string') {
      return res.status(400).json({ error: 'Invalid game ID' });
    }

    // Add deprecation notice in response header
    res.setHeader('X-Deprecated', 'This endpoint is NHL-only. Use /api/sports/{sportId}/games for multi-sport support.');

    const gameData = await getGameById(gameId);
    return res.json({
      sportId: 'nhl',
      ...gameData,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch game',
    });
  }
}
