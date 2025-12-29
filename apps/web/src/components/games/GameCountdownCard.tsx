import { Clock } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

interface GameCountdownCardProps {
  event: any;
  onClick?: () => void;
}

export function GameCountdownCard({ event, onClick }: GameCountdownCardProps) {
  const countdown = useCountdown(event.date);
  const competition = event.competitions?.[0];
  const homeTeam = competition?.competitors?.find((c: any) => c.homeAway === 'home');
  const awayTeam = competition?.competitors?.find((c: any) => c.homeAway === 'away');

  if (!homeTeam || !awayTeam || countdown.isExpired) return null;

  // Determine urgency level for styling
  const isUrgent = countdown.minutes < 5;
  const isVerySoon = countdown.minutes < 10;

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-xl border p-4 hover:border-accent/50 transition-all cursor-pointer ${
        isUrgent
          ? 'border-orange-500 shadow-lg shadow-orange-500/20'
          : isVerySoon
          ? 'border-yellow-500/50'
          : 'border-gray-700'
      }`}
    >
      {/* Countdown Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock
            className={`w-4 h-4 ${
              isUrgent ? 'text-orange-500' : isVerySoon ? 'text-yellow-500' : 'text-accent'
            }`}
          />
          <span
            className={`text-sm font-semibold uppercase tracking-wide ${
              isUrgent ? 'text-orange-500' : isVerySoon ? 'text-yellow-500' : 'text-accent'
            }`}
          >
            Starting Soon
          </span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            isUrgent
              ? 'bg-orange-500/20 text-orange-400'
              : isVerySoon
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-accent/20 text-accent'
          }`}
        >
          {countdown.formatted}
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {/* Away Team */}
        <div className="flex items-center space-x-3">
          {awayTeam.team?.logo && (
            <img
              src={awayTeam.team.logo}
              alt={awayTeam.team?.abbreviation}
              className="w-6 h-6 object-contain"
            />
          )}
          <span className="text-white font-medium text-sm truncate">
            {awayTeam.team?.displayName || awayTeam.team?.abbreviation}
          </span>
        </div>

        {/* VS indicator */}
        <div className="text-gray-500 text-xs text-center">@</div>

        {/* Home Team */}
        <div className="flex items-center space-x-3">
          {homeTeam.team?.logo && (
            <img
              src={homeTeam.team.logo}
              alt={homeTeam.team?.abbreviation}
              className="w-6 h-6 object-contain"
            />
          )}
          <span className="text-white font-medium text-sm truncate">
            {homeTeam.team?.displayName || homeTeam.team?.abbreviation}
          </span>
        </div>
      </div>

      {/* Venue */}
      {competition?.venue?.fullName && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <span className="text-gray-500 text-xs truncate block">
            {competition.venue.fullName}
          </span>
        </div>
      )}
    </div>
  );
}
