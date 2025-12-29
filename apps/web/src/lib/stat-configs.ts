import type { StatComplexity } from '@sports-tracker/types';

// Stat types for visual variants
export type StatType = 'positive' | 'negative' | 'neutral' | 'percentage';

export interface PlayerStatConfig {
  label: string;
  complexity: StatComplexity;
  type?: StatType; // For visual styling variants
  fullName?: string; // Full stat name for accessibility
}

export const COMPLEXITY_ORDER: StatComplexity[] = ['novice', 'casual', 'fan', 'nerd'];

export const SPORT_TO_CATEGORY: Record<string, string> = {
  nba: 'basketball',
  wnba: 'basketball',
  mcbb: 'basketball',
  wcbb: 'basketball',
  nfl: 'football',
  cfb: 'football',
  nhl: 'hockey',
  mlb: 'baseball',
  mls: 'soccer',
  nwsl: 'soccer',
  epl: 'soccer',
  laliga: 'soccer',
  bundesliga: 'soccer',
  seriea: 'soccer',
  ligue1: 'soccer',
  ucl: 'soccer',
  ligamx: 'soccer',
};

export const PLAYER_STAT_CONFIGS: Record<string, PlayerStatConfig[]> = {
  basketball: [
    // Novice - basic counting stats
    { label: 'GP', complexity: 'novice', type: 'neutral', fullName: 'Games Played' },
    { label: 'PTS', complexity: 'novice', type: 'positive', fullName: 'Points' },
    { label: 'REB', complexity: 'novice', type: 'positive', fullName: 'Rebounds' },
    // Casual - shooting and assists
    { label: 'AST', complexity: 'casual', type: 'positive', fullName: 'Assists' },
    { label: 'FG%', complexity: 'casual', type: 'percentage', fullName: 'Field Goal Percentage' },
    { label: '3P%', complexity: 'casual', type: 'percentage', fullName: '3-Point Percentage' },
    // Fan - defensive stats
    { label: 'STL', complexity: 'fan', type: 'positive', fullName: 'Steals' },
    { label: 'BLK', complexity: 'fan', type: 'positive', fullName: 'Blocks' },
    { label: 'TO', complexity: 'fan', type: 'negative', fullName: 'Turnovers' },
    // Nerd - advanced/detail stats
    { label: 'MIN', complexity: 'nerd', type: 'neutral', fullName: 'Minutes' },
    { label: 'FT%', complexity: 'nerd', type: 'percentage', fullName: 'Free Throw Percentage' },
    { label: 'OR', complexity: 'nerd', type: 'positive', fullName: 'Offensive Rebounds' },
    { label: 'DR', complexity: 'nerd', type: 'positive', fullName: 'Defensive Rebounds' },
    { label: 'GS', complexity: 'nerd', type: 'neutral', fullName: 'Games Started' },
  ],

  football: [
    // Novice - key totals
    { label: 'GP', complexity: 'novice', type: 'neutral', fullName: 'Games Played' },
    { label: 'YDS', complexity: 'novice', type: 'positive', fullName: 'Yards' },
    { label: 'TD', complexity: 'novice', type: 'positive', fullName: 'Touchdowns' },
    // Casual - efficiency
    { label: 'CMP', complexity: 'casual', type: 'positive', fullName: 'Completions' },
    { label: 'ATT', complexity: 'casual', type: 'neutral', fullName: 'Attempts' },
    { label: 'QBR', complexity: 'casual', type: 'positive', fullName: 'Quarterback Rating' },
    // Fan - turnovers and receiving
    { label: 'INT', complexity: 'fan', type: 'negative', fullName: 'Interceptions' },
    { label: 'REC', complexity: 'fan', type: 'positive', fullName: 'Receptions' },
    { label: 'RUSH', complexity: 'fan', type: 'positive', fullName: 'Rushing Yards' },
    // Nerd - advanced metrics
    { label: 'Y/A', complexity: 'nerd', type: 'positive', fullName: 'Yards per Attempt' },
    { label: 'LNG', complexity: 'nerd', type: 'positive', fullName: 'Longest' },
    { label: 'RTG', complexity: 'nerd', type: 'positive', fullName: 'Passer Rating' },
    { label: 'SACK', complexity: 'nerd', type: 'negative', fullName: 'Sacks' },
  ],

  hockey: [
    // Novice - goals and assists
    { label: 'GP', complexity: 'novice', type: 'neutral', fullName: 'Games Played' },
    { label: 'G', complexity: 'novice', type: 'positive', fullName: 'Goals' },
    { label: 'A', complexity: 'novice', type: 'positive', fullName: 'Assists' },
    // Casual - points and plus/minus
    { label: 'P', complexity: 'casual', type: 'positive', fullName: 'Points' },
    { label: '+/-', complexity: 'casual', type: 'positive', fullName: 'Plus/Minus' },
    // Fan - penalties and power play
    { label: 'PIM', complexity: 'fan', type: 'negative', fullName: 'Penalty Minutes' },
    { label: 'PPG', complexity: 'fan', type: 'positive', fullName: 'Power Play Goals' },
    { label: 'PPP', complexity: 'fan', type: 'positive', fullName: 'Power Play Points' },
    // Nerd - shooting and ice time
    { label: 'SH%', complexity: 'nerd', type: 'percentage', fullName: 'Shooting Percentage' },
    { label: 'TOI', complexity: 'nerd', type: 'neutral', fullName: 'Time on Ice' },
    { label: 'HITS', complexity: 'nerd', type: 'positive', fullName: 'Hits' },
    { label: 'S', complexity: 'nerd', type: 'neutral', fullName: 'Shots' },
  ],

  baseball: [
    // Novice - basic stats
    { label: 'G', complexity: 'novice', type: 'neutral', fullName: 'Games' },
    { label: 'H', complexity: 'novice', type: 'positive', fullName: 'Hits' },
    { label: 'HR', complexity: 'novice', type: 'positive', fullName: 'Home Runs' },
    // Casual - batting average and RBI
    { label: 'AVG', complexity: 'casual', type: 'percentage', fullName: 'Batting Average' },
    { label: 'RBI', complexity: 'casual', type: 'positive', fullName: 'Runs Batted In' },
    { label: 'R', complexity: 'casual', type: 'positive', fullName: 'Runs' },
    // Fan - base running and discipline
    { label: 'SB', complexity: 'fan', type: 'positive', fullName: 'Stolen Bases' },
    { label: 'BB', complexity: 'fan', type: 'positive', fullName: 'Walks' },
    { label: 'SO', complexity: 'fan', type: 'negative', fullName: 'Strikeouts' },
    // Nerd - advanced metrics
    { label: 'OBP', complexity: 'nerd', type: 'percentage', fullName: 'On-Base Percentage' },
    { label: 'SLG', complexity: 'nerd', type: 'percentage', fullName: 'Slugging Percentage' },
    { label: 'OPS', complexity: 'nerd', type: 'percentage', fullName: 'On-Base Plus Slugging' },
    { label: 'AB', complexity: 'nerd', type: 'neutral', fullName: 'At Bats' },
  ],

  soccer: [
    // Novice - goals and assists
    { label: 'GP', complexity: 'novice', type: 'neutral', fullName: 'Games Played' },
    { label: 'G', complexity: 'novice', type: 'positive', fullName: 'Goals' },
    { label: 'A', complexity: 'novice', type: 'positive', fullName: 'Assists' },
    // Casual - shots
    { label: 'SH', complexity: 'casual', type: 'neutral', fullName: 'Shots' },
    { label: 'SOT', complexity: 'casual', type: 'positive', fullName: 'Shots on Target' },
    // Fan - discipline
    { label: 'YC', complexity: 'fan', type: 'negative', fullName: 'Yellow Cards' },
    { label: 'RC', complexity: 'fan', type: 'negative', fullName: 'Red Cards' },
    // Nerd - fouls and goalkeeper stats
    { label: 'FC', complexity: 'nerd', type: 'negative', fullName: 'Fouls Committed' },
    { label: 'CS', complexity: 'nerd', type: 'positive', fullName: 'Clean Sheets' },
    { label: 'SV', complexity: 'nerd', type: 'positive', fullName: 'Saves' },
    { label: 'MIN', complexity: 'nerd', type: 'neutral', fullName: 'Minutes' },
  ],
};

export function getPlayerStatsForComplexity(
  statConfigs: PlayerStatConfig[],
  userComplexity: StatComplexity
): PlayerStatConfig[] {
  const userLevel = COMPLEXITY_ORDER.indexOf(userComplexity);
  return statConfigs.filter((stat) => {
    const statLevel = COMPLEXITY_ORDER.indexOf(stat.complexity);
    return statLevel <= userLevel;
  });
}

export interface FilteredStat {
  label: string;
  value: string;
  displayName?: string;
  type: StatType;
  fullName: string;
}

export function filterStatsByComplexity(
  labels: string[],
  stats: string[],
  displayNames: string[] | undefined,
  sportId: string,
  userComplexity: StatComplexity
): FilteredStat[] {
  const sportCategory = SPORT_TO_CATEGORY[sportId] || 'basketball';
  const allConfigs = PLAYER_STAT_CONFIGS[sportCategory] || PLAYER_STAT_CONFIGS.basketball;
  const filteredConfigs = getPlayerStatsForComplexity(allConfigs, userComplexity);

  // Create a map for quick lookup of config by label
  const configMap = new Map(filteredConfigs.map((c) => [c.label, c]));

  const result: FilteredStat[] = [];

  for (let index = 0; index < labels.length; index++) {
    const label = labels[index];
    const config = configMap.get(label);
    if (config) {
      result.push({
        label,
        value: stats[index] || '-',
        displayName: displayNames?.[index],
        type: config.type || 'neutral',
        fullName: config.fullName || displayNames?.[index] || label,
      });
    }
  }

  return result;
}
