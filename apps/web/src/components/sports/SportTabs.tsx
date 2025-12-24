import { useSettings } from '../../contexts/SettingsContext';
import { getSportConfig } from '@sports-tracker/types';

interface SportTabsProps {
  activeSport: string;
  onSportChange: (sportId: string) => void;
  liveSports?: string[]; // Sports with live games
}

export function SportTabs({ activeSport, onSportChange, liveSports = [] }: SportTabsProps) {
  const { enabledSports, sportOrder } = useSettings();

  // Get ordered list of enabled sports
  const orderedSports = sportOrder.filter((id) => enabledSports.includes(id));

  // Add any enabled sports not in the order
  enabledSports.forEach((id) => {
    if (!orderedSports.includes(id)) {
      orderedSports.push(id);
    }
  });

  if (orderedSports.length <= 1) {
    return null; // Don't show tabs if only one sport
  }

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {orderedSports.map((sportId) => {
        const config = getSportConfig(sportId);
        if (!config) return null;

        const isActive = sportId === activeSport;
        const isLive = liveSports.includes(sportId);

        return (
          <button
            key={sportId}
            onClick={() => onSportChange(sportId)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-200 whitespace-nowrap
              ${isActive
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'bg-surface text-gray-300 hover:bg-surface-light hover:text-white'
              }
            `}
          >
            <span className="text-lg">{config.icon}</span>
            <span>{config.shortName}</span>
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SportTabs;
