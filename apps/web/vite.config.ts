import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

// Sport ID to ESPN API path mapping (must match production sports-config.ts)
const SPORT_API_PATHS: Record<string, { sport: string; league: string; icon: string; type: 'team' | 'individual'; brandColor: string }> = {
  nfl: { sport: 'football', league: 'nfl', icon: '🏈', type: 'team', brandColor: '#013369' },
  nba: { sport: 'basketball', league: 'nba', icon: '🏀', type: 'team', brandColor: '#1D428A' },
  wnba: { sport: 'basketball', league: 'wnba', icon: '🏀', type: 'team', brandColor: '#FF6900' },
  mlb: { sport: 'baseball', league: 'mlb', icon: '⚾', type: 'team', brandColor: '#002D72' },
  nhl: { sport: 'hockey', league: 'nhl', icon: '🏒', type: 'team', brandColor: '#000000' },
  mls: { sport: 'soccer', league: 'usa.1', icon: '⚽', type: 'team', brandColor: '#003087' },
  nwsl: { sport: 'soccer', league: 'usa.nwsl', icon: '⚽', type: 'team', brandColor: '#6B3FA0' },
  cfb: { sport: 'football', league: 'college-football', icon: '🏈', type: 'team', brandColor: '#333333' },
  mcbb: { sport: 'basketball', league: 'mens-college-basketball', icon: '🏀', type: 'team', brandColor: '#333333' },
  wcbb: { sport: 'basketball', league: 'womens-college-basketball', icon: '🏀', type: 'team', brandColor: '#333333' },
  epl: { sport: 'soccer', league: 'eng.1', icon: '⚽', type: 'team', brandColor: '#3D195B' },
  laliga: { sport: 'soccer', league: 'esp.1', icon: '⚽', type: 'team', brandColor: '#EE8707' },
  bundesliga: { sport: 'soccer', league: 'ger.1', icon: '⚽', type: 'team', brandColor: '#D20515' },
  seriea: { sport: 'soccer', league: 'ita.1', icon: '⚽', type: 'team', brandColor: '#024494' },
  ligue1: { sport: 'soccer', league: 'fra.1', icon: '⚽', type: 'team', brandColor: '#091C3E' },
  ucl: { sport: 'soccer', league: 'uefa.champions', icon: '⚽', type: 'team', brandColor: '#1E3E7B' },
  ligamx: { sport: 'soccer', league: 'mex.1', icon: '⚽', type: 'team', brandColor: '#005C35' },
  pga: { sport: 'golf', league: 'pga', icon: '⛳', type: 'individual', brandColor: '#00205B' },
  lpga: { sport: 'golf', league: 'lpga', icon: '⛳', type: 'individual', brandColor: '#003087' },
  atp: { sport: 'tennis', league: 'atp', icon: '🎾', type: 'individual', brandColor: '#0A3161' },
  wta: { sport: 'tennis', league: 'wta', icon: '🎾', type: 'individual', brandColor: '#5D2A8C' },
  f1: { sport: 'racing', league: 'f1', icon: '🏎️', type: 'individual', brandColor: '#E10600' },
  nascar: { sport: 'racing', league: 'nascar-cup', icon: '🏁', type: 'individual', brandColor: '#FFCE00' },
  indycar: { sport: 'racing', league: 'irl', icon: '🏎️', type: 'individual', brandColor: '#003399' },
  ufc: { sport: 'mma', league: 'ufc', icon: '🥊', type: 'individual', brandColor: '#D20A0A' },
  boxing: { sport: 'boxing', league: 'boxing', icon: '🥊', type: 'individual', brandColor: '#8B0000' },
}

// Helper functions for leaderboard transformation (match production espn.ts)
function mapEventStatus(espnStatus: any): 'upcoming' | 'in_progress' | 'completed' | 'postponed' | 'cancelled' {
  const state = espnStatus?.type?.state
  const description = espnStatus?.type?.description?.toLowerCase() || ''

  if (description.includes('postponed')) return 'postponed'
  if (description.includes('cancelled') || description.includes('canceled')) return 'cancelled'

  switch (state) {
    case 'pre': return 'upcoming'
    case 'in': return 'in_progress'
    case 'post': return 'completed'
    default: return 'upcoming'
  }
}

function transformGolfEvent(event: any, sportId: string) {
  const competition = event.competitions?.[0]
  const competitors = competition?.competitors || []

  const leaderboard = competitors.map((comp: any) => {
    const athlete = comp.athlete || {}
    const status = comp.status || {}

    let totalScore: number | string = status.displayValue || 'E'
    const today: number | string = '-'
    const thru = status.thru?.toString() || '-'

    if (typeof totalScore === 'string') {
      if (totalScore === 'E') {
        totalScore = 0
      } else if (totalScore.startsWith('+')) {
        totalScore = parseInt(totalScore.slice(1), 10)
      } else if (totalScore.startsWith('-')) {
        totalScore = parseInt(totalScore, 10)
      }
    }

    let playerStatus: 'active' | 'cut' | 'wd' | 'dq' = 'active'
    const statusText = (status.displayValue || '').toString().toUpperCase()
    if (statusText === 'CUT') playerStatus = 'cut'
    else if (statusText === 'WD') playerStatus = 'wd'
    else if (statusText === 'DQ') playerStatus = 'dq'

    return {
      position: status.position?.displayName || comp.order || '-',
      playerId: athlete.id || comp.id,
      playerName: athlete.displayName || 'Unknown',
      country: athlete.flag?.alt,
      countryFlag: athlete.flag?.href,
      totalScore,
      today,
      thru,
      rounds: (comp.linescores || []).map((s: any) => s.value),
      status: playerStatus,
    }
  })

  leaderboard.sort((a: any, b: any) => {
    const posA = typeof a.position === 'number' ? a.position : parseInt(a.position as string, 10) || 999
    const posB = typeof b.position === 'number' ? b.position : parseInt(b.position as string, 10) || 999
    return posA - posB
  })

  const venue = competition?.venue

  return {
    id: event.id,
    sportId,
    name: event.name || 'Unknown Tournament',
    shortName: event.shortName || event.name,
    startDate: event.date,
    endDate: event.endDate || event.date,
    venue: venue?.fullName,
    location: venue?.address ? `${venue.address.city || ''}, ${venue.address.state || venue.address.country || ''}`.trim() : undefined,
    status: mapEventStatus(event.status),
    currentRound: event.status?.period || 1,
    leaderboard,
  }
}

function transformRacingEvent(event: any, sportId: string) {
  const competition = event.competitions?.[0]
  const competitors = competition?.competitors || []

  const standings = competitors.map((comp: any) => {
    const athlete = comp.athlete || {}
    const team = athlete.team || {}

    let driverStatus: 'racing' | 'finished' | 'dnf' | 'dns' | 'dsq' = 'racing'
    const statusText = (comp.status?.displayValue || '').toString().toUpperCase()
    if (statusText.includes('DNF')) driverStatus = 'dnf'
    else if (statusText.includes('DNS')) driverStatus = 'dns'
    else if (statusText.includes('DSQ')) driverStatus = 'dsq'
    else if (event.status?.type?.state === 'post') driverStatus = 'finished'

    return {
      position: comp.order || 0,
      driverId: athlete.id || comp.id,
      driverName: athlete.displayName || 'Unknown',
      team: team.displayName || '',
      teamColor: team.color ? `#${team.color}` : undefined,
      carNumber: comp.vehicle?.number || '-',
      time: comp.status?.behind || undefined,
      laps: comp.status?.thru,
      status: driverStatus,
    }
  })

  standings.sort((a: any, b: any) => a.position - b.position)

  const venue = competition?.venue

  return {
    id: event.id,
    sportId,
    name: event.name || 'Unknown Race',
    shortName: event.shortName || event.name,
    startDate: event.date,
    endDate: event.endDate || event.date,
    venue: venue?.fullName,
    location: venue?.address ? `${venue.address.city || ''}, ${venue.address.state || venue.address.country || ''}`.trim() : undefined,
    status: mapEventStatus(event.status),
    circuitName: venue?.fullName,
    currentLap: competition?.status?.period,
    totalLaps: competition?.status?.totalLaps,
    standings,
  }
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
              const teams = teamsData.map((teamWrapper: any) => {
                const team = teamWrapper.team
                // Use team color if available, otherwise fall back to sport's brand color
                const primaryColor = team.color ? `#${team.color}` : apiPath.brandColor
                return {
                  id: team.id,
                  sportId,
                  name: team.displayName,
                  abbreviation: team.abbreviation,
                  logo: team.logos?.[0]?.href,
                  emoji: apiPath.icon,
                  primaryColor,
                }
              })

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

            // Leaderboard is only for individual sports
            if (apiPath.type === 'team') {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `Leaderboard not available for team sport: ${sportId}` }))
              return
            }

            try {
              const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/scoreboard`
              console.log(`[API Proxy] Fetching: ${espnUrl}`)

              const response = await fetch(espnUrl)
              const data = await response.json()

              // Transform ESPN data to normalized shape (match production API)
              const rawEvents = data.events || []
              const isGolf = ['pga', 'lpga'].includes(sportId)
              const isRacing = ['f1', 'nascar', 'indycar'].includes(sportId)

              const events = rawEvents.map((event: any) => {
                if (isGolf) {
                  return transformGolfEvent(event, sportId)
                } else if (isRacing) {
                  return transformRacingEvent(event, sportId)
                } else {
                  // Default to golf-like transformation for other individual sports
                  return transformGolfEvent(event, sportId)
                }
              })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ sportId, events }))
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
              // Fetch teams list and standings to get stats for ALL teams
              const teamsUrl = `https://site.api.espn.com/apis/site/v2/sports/${apiPath.sport}/${apiPath.league}/teams`
              const standingsUrl = `https://site.api.espn.com/apis/v2/sports/${apiPath.sport}/${apiPath.league}/standings`
              console.log(`[API Proxy] Fetching team statistics from: ${teamsUrl} and ${standingsUrl}`)

              const [teamsResponse, standingsResponse] = await Promise.all([
                fetch(teamsUrl),
                fetch(standingsUrl)
              ])
              const teamsData = await teamsResponse.json()
              const standingsData = await standingsResponse.json()

              // Build a map of team stats from standings data
              const teamStatsMap: Record<string, any> = {}

              // Standings can be organized by conference/division
              const processStandingsEntries = (entries: any[]) => {
                entries?.forEach((entry: any) => {
                  const teamId = entry.team?.id
                  if (teamId) {
                    // Extract stats from the entry
                    const statsMap: Record<string, any> = {}
                    entry.stats?.forEach((stat: any) => {
                      statsMap[stat.name] = {
                        name: stat.name,
                        displayName: stat.displayName,
                        abbreviation: stat.abbreviation,
                        value: stat.value,
                        displayValue: stat.displayValue,
                      }
                    })

                    teamStatsMap[teamId] = {
                      record: statsMap.overall?.displayValue || `${statsMap.wins?.value || 0}-${statsMap.losses?.value || 0}`,
                      homeRecord: statsMap.Home?.displayValue || statsMap.homeRecord?.displayValue,
                      awayRecord: statsMap.Road?.displayValue || statsMap.awayRecord?.displayValue,
                      winPercent: statsMap.winPercent?.displayValue,
                      gamesBack: statsMap.gamesBehind?.displayValue,
                      streak: statsMap.streak?.displayValue,
                      pointsFor: statsMap.pointsFor?.value || statsMap.avgPointsFor?.value,
                      pointsAgainst: statsMap.pointsAgainst?.value || statsMap.avgPointsAgainst?.value,
                      differential: statsMap.differential?.displayValue || statsMap.pointDifferential?.displayValue,
                      divisionRecord: statsMap.Division?.displayValue,
                      conferenceRecord: statsMap.vs_Conf?.displayValue,
                      last10: statsMap.Last_Ten?.displayValue,
                      stats: entry.stats,
                    }
                  }
                })
              }

              // Handle different standings structures
              if (standingsData.children) {
                // Conference/division structure
                standingsData.children.forEach((conference: any) => {
                  if (conference.standings?.entries) {
                    processStandingsEntries(conference.standings.entries)
                  }
                  conference.children?.forEach((division: any) => {
                    if (division.standings?.entries) {
                      processStandingsEntries(division.standings.entries)
                    }
                  })
                })
              } else if (standingsData.standings?.entries) {
                // Flat structure
                processStandingsEntries(standingsData.standings.entries)
              }

              const teamsArray = teamsData.sports?.[0]?.leagues?.[0]?.teams || []
              const teams = teamsArray.map((teamWrapper: any) => {
                const teamId = teamWrapper.team.id
                const stats = teamStatsMap[teamId]

                return {
                  id: teamId,
                  displayName: teamWrapper.team.displayName,
                  abbreviation: teamWrapper.team.abbreviation,
                  logo: teamWrapper.team.logos?.[0]?.href,
                  color: teamWrapper.team.color,
                  location: teamWrapper.team.location,
                  nickname: teamWrapper.team.nickname,
                  record: stats?.record,
                  homeRecord: stats?.homeRecord,
                  awayRecord: stats?.awayRecord,
                  winPercent: stats?.winPercent,
                  gamesBack: stats?.gamesBack,
                  streak: stats?.streak,
                  pointsFor: stats?.pointsFor,
                  pointsAgainst: stats?.pointsAgainst,
                  differential: stats?.differential,
                  divisionRecord: stats?.divisionRecord,
                  conferenceRecord: stats?.conferenceRecord,
                  last10: stats?.last10,
                  statistics: stats?.stats,
                }
              })

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
