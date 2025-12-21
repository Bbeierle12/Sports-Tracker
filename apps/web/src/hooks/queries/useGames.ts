import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../../lib/api-client'

interface NHLGame {
  id: number
  gameDate: string
  gameState: string
  awayTeam: {
    abbrev: string
    placeName: { default: string }
    logo: string
    score?: number
  }
  homeTeam: {
    abbrev: string
    placeName: { default: string }
    logo: string
    score?: number
  }
  periodDescriptor?: {
    number: number
    periodType: string
  }
  clock?: {
    timeRemaining: string
    inIntermission: boolean
  }
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
