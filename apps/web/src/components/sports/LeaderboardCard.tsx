import { MapPin, Calendar, Trophy } from 'lucide-react';
import type {
  GolfTournament,
  RaceEvent,
  GolfLeaderboardEntry,
  RacingEntry,
  EventStatus,
} from '@nhl-dashboard/types';

interface LeaderboardCardProps {
  event: GolfTournament | RaceEvent;
}

function StatusBadge({ status }: { status: EventStatus }) {
  const statusConfig = {
    upcoming: { label: 'Upcoming', className: 'bg-gray-600 text-gray-200' },
    in_progress: { label: 'Live', className: 'bg-live text-white' },
    completed: { label: 'Final', className: 'bg-surface-light text-gray-300' },
    postponed: { label: 'Postponed', className: 'bg-yellow-600 text-white' },
    cancelled: { label: 'Cancelled', className: 'bg-red-600 text-white' },
  };

  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function GolfLeaderboard({ entries }: { entries: GolfLeaderboardEntry[] }) {
  const topEntries = entries.slice(0, 10);

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wider px-2 py-1">
        <div className="col-span-1">Pos</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-2 text-center">Today</div>
        <div className="col-span-2 text-center">Thru</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Entries */}
      {topEntries.map((entry, index) => (
        <div
          key={entry.playerId}
          className={`
            grid grid-cols-12 gap-2 text-sm px-2 py-2 rounded
            ${index === 0 ? 'bg-surface-light' : 'hover:bg-surface-light/50'}
            transition-colors
          `}
        >
          <div className="col-span-1 font-medium text-gray-400">
            {entry.position}
          </div>
          <div className="col-span-5 text-white font-medium truncate">
            {entry.playerName}
            {entry.country && (
              <span className="text-gray-500 text-xs ml-1">{entry.country}</span>
            )}
          </div>
          <div className={`col-span-2 text-center ${
            typeof entry.today === 'number' && entry.today < 0 ? 'text-live' :
            typeof entry.today === 'number' && entry.today > 0 ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {entry.today}
          </div>
          <div className="col-span-2 text-center text-gray-400">
            {entry.thru}
          </div>
          <div className={`col-span-2 text-right font-bold ${
            typeof entry.totalScore === 'number' && entry.totalScore < 0 ? 'text-live' :
            typeof entry.totalScore === 'number' && entry.totalScore > 0 ? 'text-red-400' :
            'text-white'
          }`}>
            {entry.totalScore}
          </div>
        </div>
      ))}
    </div>
  );
}

function RacingStandings({ entries }: { entries: RacingEntry[] }) {
  const topEntries = entries.slice(0, 10);

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase tracking-wider px-2 py-1">
        <div className="col-span-1">Pos</div>
        <div className="col-span-1">#</div>
        <div className="col-span-5">Driver</div>
        <div className="col-span-3">Team</div>
        <div className="col-span-2 text-right">Gap</div>
      </div>

      {/* Entries */}
      {topEntries.map((entry, index) => (
        <div
          key={entry.driverId}
          className={`
            grid grid-cols-12 gap-2 text-sm px-2 py-2 rounded items-center
            ${index === 0 ? 'bg-surface-light' : 'hover:bg-surface-light/50'}
            transition-colors
          `}
        >
          <div className="col-span-1 font-medium text-gray-400">
            {entry.position}
          </div>
          <div
            className="col-span-1 text-xs font-bold px-1 rounded text-center"
            style={{
              backgroundColor: entry.teamColor || '#374151',
              color: '#fff',
            }}
          >
            {entry.carNumber}
          </div>
          <div className="col-span-5 text-white font-medium truncate">
            {entry.driverName}
          </div>
          <div className="col-span-3 text-gray-400 text-xs truncate">
            {entry.team}
          </div>
          <div className="col-span-2 text-right text-gray-400 font-mono text-xs">
            {index === 0 ? 'Leader' : entry.time || '-'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardCard({ event }: LeaderboardCardProps) {
  const isLive = event.status === 'in_progress';
  const isGolf = 'leaderboard' in event;
  const isRacing = 'standings' in event;

  return (
    <article
      className={`
        bg-surface rounded-xl border p-5 relative overflow-hidden
        transition-all duration-200
        ${isLive ? 'border-live shadow-lg shadow-live/10' : 'border-gray-700'}
      `}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
          </span>
          <span className="text-live text-xs font-bold uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Event header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-white font-semibold text-lg">{event.name}</h3>
            {event.venue && (
              <div className="flex items-center space-x-1 text-gray-400 text-sm mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{event.venue}</span>
              </div>
            )}
            {event.location && (
              <p className="text-gray-500 text-xs mt-0.5">{event.location}</p>
            )}
          </div>
          <StatusBadge status={event.status} />
        </div>

        {/* Event info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          {isGolf && (event as GolfTournament).currentRound && (
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4" />
              <span>Round {(event as GolfTournament).currentRound}</span>
            </div>
          )}
          {isRacing && (event as RaceEvent).currentLap && (
            <div className="flex items-center space-x-1">
              <span>Lap {(event as RaceEvent).currentLap}/{(event as RaceEvent).totalLaps}</span>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard/Standings */}
      <div className="border-t border-gray-700 pt-4">
        {isGolf && (
          <GolfLeaderboard entries={(event as GolfTournament).leaderboard} />
        )}
        {isRacing && (
          <RacingStandings entries={(event as RaceEvent).standings} />
        )}
      </div>
    </article>
  );
}

export default LeaderboardCard;
