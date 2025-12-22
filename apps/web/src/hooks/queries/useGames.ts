import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../../lib/api-client'

// NHL Team type for games
export interface NHLTeam {
  abbrev: string
  placeName?: { default: string }
  logo?: string
  score?: number
}

// Period descriptor for game status
export interface PeriodDescriptor {
  number: number
  periodType: string
}

// Game clock information
export interface GameClock {
  timeRemaining: string
  inIntermission: boolean
}

// NHL Game type
export interface NHLGame {
  id: number
  gameDate: string
  gameState: string
  awayTeam: NHLTeam
  homeTeam: NHLTeam
  periodDescriptor?: PeriodDescriptor
  clock?: GameClock
}

interface ScheduleResponse {
  gameWeek: Array<{
    date: string
    games: NHLGame[]
  }>
}

export const useGames = (date?: string) => {
  return useQuery({
    queryKey: ['games', date],
    queryFn: async () => {
      const endpoint = date ? `/games?date=${date}` : '/games'
      return apiGet<ScheduleResponse>(endpoint)
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  })
}
