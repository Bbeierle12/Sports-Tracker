import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getScoreboard } from '../_lib/espn';

/**
 * @deprecated Use /api/sports/[sportId]/games instead for multi-sport support.
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
    const date = req.query.date as string;

    // Convert YYYY-MM-DD to YYYYMMDD format for ESPN API
    let espnDate: string | undefined;
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Date must be in YYYY-MM-DD format',
        });
      }
      espnDate = date.replace(/-/g, '');
    }

    // Use ESPN-backed scoreboard for consistency with multi-sport endpoints
    const scoreboard = await getScoreboard(sportId, espnDate);

    // Add deprecation notice in response header
    res.setHeader('X-Deprecated', 'Use /api/sports/{sportId}/games instead');

    return res.json({
      sportId,
      ...scoreboard,
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch games',
    });
  }
}
