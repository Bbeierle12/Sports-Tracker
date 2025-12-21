import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../../lib/api-client'

interface TeamStanding {
  teamName: { default: string }
  teamAbbrev: { default: string }
  teamLogo: string
  conferenceName: string
  divisionName: string
  gamesPlayed: number
  wins: number
  losses: number
  otLosses: number
  points: number
  goalFor: number
  goalAgainst: number
  goalDifferential: number
  streakCode: string
  streakCount: number
}

interface StandingsResponse {
  standings: TeamStanding[]
}

export const useStandings = () => {
  return useQuery({
    queryKey: ['standings'],
    queryFn: () => apiGet<StandingsResponse>('/standings'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
