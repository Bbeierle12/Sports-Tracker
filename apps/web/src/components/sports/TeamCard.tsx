import { Calendar, Clock, Trophy } from 'lucide-react';
import type { ESPNTeam } from '@sports-tracker/types';

interface TeamCardProps {
  team: ESPNTeam;
}

export function TeamCard({ team }: TeamCardProps) {
  const { record, lastGame, nextGame, liveGame, bye } = team;

  // Format record based on sport type
  const formatRecord = () => {
    const parts = [`${record.wins}-${record.losses}`];
    if (record.ties !== undefined && record.ties > 0) {
      parts[0] += `-${record.ties}`;
    }
    if (record.otl !== undefined && record.otl > 0) {
      parts[0] += `-${record.otl}`;
    }
    return parts.join(' ');
  };

  const isLive = !!liveGame;

  return (
    <article
      className={`
        bg-surface rounded-xl border p-5 relative overflow-hidden
        transition-all duration-200 hover:border-accent
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

      {/* Team header */}
      <div className="flex items-center space-x-3 mb-4">
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.abbreviation}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: team.primaryColor + '20' }}
          >
            {team.emoji}
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold text-lg">{team.name}</h3>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>{formatRecord()}</span>
          </div>
        </div>
      </div>

      {/* Live game */}
      {liveGame && (
        <div className="bg-surface-light rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                {liveGame.isHome ? 'vs' : '@'} {liveGame.opponent}
              </p>
              <p className="text-live text-sm font-medium">
                {liveGame.period} {liveGame.clock && `• ${liveGame.clock}`}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${liveGame.teamScore > liveGame.opponentScore ? 'text-live' : 'text-white'}`}>
                {liveGame.teamScore}
              </p>
              <p className={`text-2xl font-bold ${liveGame.opponentScore > liveGame.teamScore ? 'text-live' : 'text-gray-400'}`}>
                {liveGame.opponentScore}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bye week indicator */}
      {bye && !liveGame && (
        <div className="bg-surface-light rounded-lg p-4 mb-4 text-center">
          <p className="text-gray-400 text-sm">Bye Week</p>
        </div>
      )}

      {/* Last game and Next game */}
      {!liveGame && !bye && (
        <div className="space-y-3">
          {/* Last game */}
          {lastGame && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Last</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-300">{lastGame.opponent}</span>
                <span
                  className={`font-semibold ${lastGame.won ? 'text-live' : 'text-red-400'}`}
                >
                  {lastGame.won ? 'W' : 'L'} {lastGame.score}
                </span>
              </div>
            </div>
          )}

          {/* Next game */}
          {nextGame && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Next</span>
              </div>
              <div className="text-right">
                <p className="text-gray-300">{nextGame.opponent}</p>
                <p className="text-gray-500 text-xs">{nextGame.date} • {nextGame.time}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default TeamCard;
