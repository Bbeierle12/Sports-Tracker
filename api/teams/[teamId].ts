import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTeamsWithStats } from '../_lib/espn';

/**
 * @deprecated Use /api/sports/[sportId]/statistics instead for multi-sport support.
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
    const { teamId } = req.query;
    // Accept optional sportId, default to 'nhl' for backwards compatibility
    const sportId = (req.query.sportId as string) || 'nhl';

    if (typeof teamId !== 'string') {
      return res.status(400).json({ error: 'Invalid team ID' });
    }

    // Use ESPN-backed teams with stats for consistency with multi-sport endpoints
    const { teams } = await getTeamsWithStats(sportId);

    // Find the specific team by ID or abbreviation
    const teamStats = teams.find(
      (t: any) =>
        t.id === teamId ||
        t.abbreviation?.toLowerCase() === teamId.toLowerCase()
    );

    if (!teamStats) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Add deprecation notice in response header
    res.setHeader('X-Deprecated', 'Use /api/sports/{sportId}/statistics instead');

    return res.json({
      sportId,
      ...teamStats,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to fetch team',
    });
  }
}
