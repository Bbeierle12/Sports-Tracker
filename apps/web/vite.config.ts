import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

// Sport ID to ESPN API path mapping
const SPORT_API_PATHS: Record<string, { sport: string; league: string }> = {
  nfl: { sport: 'football', league: 'nfl' },
  nba: { sport: 'basketball', league: 'nba' },
  wnba: { sport: 'basketball', league: 'wnba' },
  mlb: { sport: 'baseball', league: 'mlb' },
  nhl: { sport: 'hockey', league: 'nhl' },
  mls: { sport: 'soccer', league: 'usa.1' },
  nwsl: { sport: 'soccer', league: 'usa.nwsl' },
  cfb: { sport: 'football', league: 'college-football' },
  mcbb: { sport: 'basketball', league: 'mens-college-basketball' },
  wcbb: { sport: 'basketball', league: 'womens-college-basketball' },
  epl: { sport: 'soccer', league: 'eng.1' },
  laliga: { sport: 'soccer', league: 'esp.1' },
  bundesliga: { sport: 'soccer', league: 'ger.1' },
  seriea: { sport: 'soccer', league: 'ita.1' },
  ligue1: { sport: 'soccer', league: 'fra.1' },
  ucl: { sport: 'soccer', league: 'uefa.champions' },
  ligamx: { sport: 'soccer', league: 'mex.1' },
  pga: { sport: 'golf', league: 'pga' },
  lpga: { sport: 'golf', league: 'lpga' },
  atp: { sport: 'tennis', league: 'atp' },
  wta: { sport: 'tennis', league: 'wta' },
  f1: { sport: 'racing', league: 'f1' },
  nascar: { sport: 'racing', league: 'nascar-cup' },
  indycar: { sport: 'racing', league: 'irl' },
  ufc: { sport: 'mma', league: 'ufc' },
  boxing: { sport: 'boxing', league: 'boxing' },
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-proxy',
      configureServer(server) {
        // Proxy /api requests to ESPN API during development
        server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url || ''

          // Handle /api/sports/:sportId/games
          const gamesMatch = url.match(/^\/api\/sports\/([^/]+)\/games(\?.*)?$/)
          if (gamesMatch) {
            const sportId = gamesMatch[1]
            const queryString = gamesMatch[2] || ''
            const apiPath = SPORT_API_PATHS[sportId]

            if (!apiPath) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Sport not found' }))
              return
            }

            try {
              // Parse date from query string
              const params = new URLSearchParams(queryString.replace('?', ''))
              const date = params.get('date')

              let espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/scoreboard`
              if (date) {
                espnUrl += `?dates=${date}`
              }

              console.log(`[API Proxy] Fetching: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ sportId, ...data }))
            } catch (error) {
              console.error('[API Proxy] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch from ESPN API' }))
            }
            return
          }

          // Handle /api/sports/:sportId/teams
          const teamsMatch = url.match(/^\/api\/sports\/([^/]+)\/teams$/)
          if (teamsMatch) {
            const sportId = teamsMatch[1]
            const apiPath = SPORT_API_PATHS[sportId]

            if (!apiPath) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Sport not found' }))
              return
            }

            try {
              const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/teams`
              console.log(`[API Proxy] Fetching: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              // ESPN returns teams nested in sports[0].leagues[0].teams
              const teamsData = data.sports?.[0]?.leagues?.[0]?.teams || []
              const teams = teamsData.map((teamWrapper: any) => ({
                id: teamWrapper.team.id,
                sportId,
                name: teamWrapper.team.displayName,
                abbreviation: teamWrapper.team.abbreviation,
                logo: teamWrapper.team.logos?.[0]?.href,
              }))

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ sportId, teams }))
            } catch (error) {
              console.error('[API Proxy] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch from ESPN API' }))
            }
            return
          }

          // Handle /api/sports/:sportId/leaderboard
          const leaderboardMatch = url.match(/^\/api\/sports\/([^/]+)\/leaderboard$/)
          if (leaderboardMatch) {
            const sportId = leaderboardMatch[1]
            const apiPath = SPORT_API_PATHS[sportId]

            if (!apiPath) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Sport not found' }))
              return
            }

            try {
              const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/scoreboard`
              console.log(`[API Proxy] Fetching: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ sportId, ...data }))
            } catch (error) {
              console.error('[API Proxy] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch from ESPN API' }))
            }
            return
          }

          // Handle /api/sports/:sportId/statistics (team statistics)
          const statisticsMatch = url.match(/^\/api\/sports\/([^/]+)\/statistics$/)
          if (statisticsMatch) {
            const sportId = statisticsMatch[1]
            const apiPath = SPORT_API_PATHS[sportId]

            if (!apiPath) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Sport not found' }))
              return
            }

            try {
              const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/teams`
              console.log(`[API Proxy] Fetching statistics: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              const teamsData = data.sports?.[0]?.leagues?.[0]?.teams || []
              const teams = teamsData.map((teamWrapper: any) => ({
                id: teamWrapper.team.id,
                displayName: teamWrapper.team.displayName,
                abbreviation: teamWrapper.team.abbreviation,
                logo: teamWrapper.team.logos?.[0]?.href,
                color: teamWrapper.team.color,
                record: teamWrapper.team.record,
                standingSummary: teamWrapper.team.standingSummary,
                location: teamWrapper.team.location,
                nickname: teamWrapper.team.nickname,
              }))

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ sportId, teams }))
            } catch (error) {
              console.error('[API Proxy] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch from ESPN API' }))
            }
            return
          }

          // Handle /api/sports/:sportId/teams/:teamId/roster
          const rosterMatch = url.match(/^\/api\/sports\/([^/]+)\/teams\/([^/]+)\/roster$/)
          if (rosterMatch) {
            const sportId = rosterMatch[1]
            const teamId = rosterMatch[2]
            const apiPath = SPORT_API_PATHS[sportId]

            if (!apiPath) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Sport not found' }))
              return
            }

            try {
              const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/teams/${teamId}/roster`
              console.log(`[API Proxy] Fetching roster: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({
                team: data.team,
                athletes: data.athletes || [],
              }))
            } catch (error) {
              console.error('[API Proxy] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch from ESPN API' }))
            }
            return
          }

          // Handle /api/sports/:sportId/athletes/:athleteId/statistics
          const athleteMatch = url.match(/^\/api\/sports\/([^/]+)\/athletes\/([^/]+)\/statistics$/)
          if (athleteMatch) {
            const sportId = athleteMatch[1]
            const athleteId = athleteMatch[2]
            const apiPath = SPORT_API_PATHS[sportId]

            if (!apiPath) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Sport not found' }))
              return
            }

            try {
              const espnUrl = `https://site.web.api.espn.com/apis/common/v3/sports/${apiPath.sport}/${apiPath.league}/athletes/${athleteId}/overview`
              console.log(`[API Proxy] Fetching athlete stats: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({
                athlete: data.athlete,
                statistics: data.statistics,
                splits: data.splits,
                bio: data.bio,
                nextEvent: data.nextEvent,
              }))
            } catch (error) {
              console.error('[API Proxy] Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to fetch from ESPN API' }))
            }
            return
          }

          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@sports-tracker/types': path.resolve(__dirname, '../../packages/types/dist'),
    },
  },
  server: {
    port: 5173,
  },
})
