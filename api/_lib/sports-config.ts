// Local copy of sports config for Vercel serverless functions
// This avoids ESM/CommonJS module resolution issues with the shared types package

export interface SportConfig {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  category: 'pro' | 'college' | 'soccer' | 'individual';
  type: 'team' | 'individual';
  apiPath: {
    sport: string;
    league: string;
  };
  hasTeams: boolean;
}

export const SPORTS_CONFIG: Record<string, SportConfig> = {
  nfl: { id: 'nfl', name: 'NFL Football', shortName: 'NFL', icon: '🏈', category: 'pro', type: 'team', apiPath: { sport: 'football', league: 'nfl' }, hasTeams: true },
  nba: { id: 'nba', name: 'NBA Basketball', shortName: 'NBA', icon: '🏀', category: 'pro', type: 'team', apiPath: { sport: 'basketball', league: 'nba' }, hasTeams: true },
  wnba: { id: 'wnba', name: 'WNBA Basketball', shortName: 'WNBA', icon: '🏀', category: 'pro', type: 'team', apiPath: { sport: 'basketball', league: 'wnba' }, hasTeams: true },
  mlb: { id: 'mlb', name: 'MLB Baseball', shortName: 'MLB', icon: '⚾', category: 'pro', type: 'team', apiPath: { sport: 'baseball', league: 'mlb' }, hasTeams: true },
  nhl: { id: 'nhl', name: 'NHL Hockey', shortName: 'NHL', icon: '🏒', category: 'pro', type: 'team', apiPath: { sport: 'hockey', league: 'nhl' }, hasTeams: true },
  mls: { id: 'mls', name: 'MLS Soccer', shortName: 'MLS', icon: '⚽', category: 'pro', type: 'team', apiPath: { sport: 'soccer', league: 'usa.1' }, hasTeams: true },
  nwsl: { id: 'nwsl', name: 'NWSL Soccer', shortName: 'NWSL', icon: '⚽', category: 'pro', type: 'team', apiPath: { sport: 'soccer', league: 'usa.nwsl' }, hasTeams: true },
  cfb: { id: 'cfb', name: 'College Football', shortName: 'CFB', icon: '🏈', category: 'college', type: 'team', apiPath: { sport: 'football', league: 'college-football' }, hasTeams: true },
  mcbb: { id: 'mcbb', name: "Men's College Basketball", shortName: 'MCBB', icon: '🏀', category: 'college', type: 'team', apiPath: { sport: 'basketball', league: 'mens-college-basketball' }, hasTeams: true },
  wcbb: { id: 'wcbb', name: "Women's College Basketball", shortName: 'WCBB', icon: '🏀', category: 'college', type: 'team', apiPath: { sport: 'basketball', league: 'womens-college-basketball' }, hasTeams: true },
  epl: { id: 'epl', name: 'English Premier League', shortName: 'EPL', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'eng.1' }, hasTeams: true },
  laliga: { id: 'laliga', name: 'La Liga', shortName: 'La Liga', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'esp.1' }, hasTeams: true },
  bundesliga: { id: 'bundesliga', name: 'Bundesliga', shortName: 'Bundesliga', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'ger.1' }, hasTeams: true },
  seriea: { id: 'seriea', name: 'Serie A', shortName: 'Serie A', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'ita.1' }, hasTeams: true },
  ligue1: { id: 'ligue1', name: 'Ligue 1', shortName: 'Ligue 1', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'fra.1' }, hasTeams: true },
  ucl: { id: 'ucl', name: 'UEFA Champions League', shortName: 'UCL', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'uefa.champions' }, hasTeams: true },
  ligamx: { id: 'ligamx', name: 'Liga MX', shortName: 'Liga MX', icon: '⚽', category: 'soccer', type: 'team', apiPath: { sport: 'soccer', league: 'mex.1' }, hasTeams: true },
  pga: { id: 'pga', name: 'PGA Golf', shortName: 'PGA', icon: '⛳', category: 'individual', type: 'individual', apiPath: { sport: 'golf', league: 'pga' }, hasTeams: false },
  lpga: { id: 'lpga', name: 'LPGA Golf', shortName: 'LPGA', icon: '⛳', category: 'individual', type: 'individual', apiPath: { sport: 'golf', league: 'lpga' }, hasTeams: false },
  atp: { id: 'atp', name: 'ATP Tennis', shortName: 'ATP', icon: '🎾', category: 'individual', type: 'individual', apiPath: { sport: 'tennis', league: 'atp' }, hasTeams: false },
  wta: { id: 'wta', name: 'WTA Tennis', shortName: 'WTA', icon: '🎾', category: 'individual', type: 'individual', apiPath: { sport: 'tennis', league: 'wta' }, hasTeams: false },
  f1: { id: 'f1', name: 'Formula 1', shortName: 'F1', icon: '🏎️', category: 'individual', type: 'individual', apiPath: { sport: 'racing', league: 'f1' }, hasTeams: false },
  nascar: { id: 'nascar', name: 'NASCAR', shortName: 'NASCAR', icon: '🏁', category: 'individual', type: 'individual', apiPath: { sport: 'racing', league: 'nascar-cup' }, hasTeams: false },
  indycar: { id: 'indycar', name: 'IndyCar', shortName: 'IndyCar', icon: '🏎️', category: 'individual', type: 'individual', apiPath: { sport: 'racing', league: 'irl' }, hasTeams: false },
  ufc: { id: 'ufc', name: 'UFC', shortName: 'UFC', icon: '🥊', category: 'individual', type: 'individual', apiPath: { sport: 'mma', league: 'ufc' }, hasTeams: false },
  boxing: { id: 'boxing', name: 'Boxing', shortName: 'Boxing', icon: '🥊', category: 'individual', type: 'individual', apiPath: { sport: 'boxing', league: 'boxing' }, hasTeams: false },
};

export type SportCategory = 'pro' | 'college' | 'soccer' | 'individual';

export function getSportConfig(sportId: string): SportConfig | undefined {
  return SPORTS_CONFIG[sportId];
}

export function getAllSports(): SportConfig[] {
  return Object.values(SPORTS_CONFIG);
}

export function getSportsByCategory(category: SportCategory): SportConfig[] {
  return Object.values(SPORTS_CONFIG).filter(sport => sport.category === category);
}

export function getTeamSports(): SportConfig[] {
  return Object.values(SPORTS_CONFIG).filter(sport => sport.type === 'team');
}

export function getIndividualSports(): SportConfig[] {
  return Object.values(SPORTS_CONFIG).filter(sport => sport.type === 'individual');
}
