import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTeams } from '../_lib/espn';

/**
 * @deprecated Use /api/sports/[sportId]/teams instead for multi-sport support.
 * This endpoint defaults to NHL for backwards compatibility but accepts an optional sportId parameter.
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
    // Accept optional sportId, default to 'nhl' for backwards compatibility
    const sportId = (req.query.sportId as string) || 'nhl';

    // Use ESPN-backed teams for consistency with multi-sport endpoints
    const teams = await getTeams(sportId);

    // Add deprecation notice in response header
    res.setHeader('X-Deprecated', 'Use /api/sports/{sportId}/teams instead');

    return res.json({
      sportId,
      teams,
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch teams',
    });
  }
}
