# Integration Plan: Sports-Stats-Board into NHL Dashboard

## Overview

This plan outlines how to incorporate the multi-sport features from **Sports-Stats-Board** into the **NHL Dashboard** while preserving the NHL Dashboard's theme, architecture, and design language.

---

## Architecture Comparison

| Aspect | NHL Dashboard | Sports-Stats-Board | Integration Approach |
|--------|---------------|-------------------|---------------------|
| Structure | Monorepo (web + api + types) | Frontend-only | Keep monorepo structure |
| Backend | Express server | None (direct API calls) | Route all APIs through Express |
| Data Source | NHL Official API | ESPN API | Add ESPN service to backend |
| State Mgmt | React Query (TanStack) | Custom hooks + localStorage | Migrate to React Query |
| Styling | Tailwind (navy theme) | Tailwind (different dark theme) | Apply NHL theme to new components |
| Auth | None | None | No changes needed |

---

## Phase 1: Backend Foundation

### 1.1 Add ESPN API Service
**Location:** `apps/api/src/services/espn.ts`

Create a new service module to interact with ESPN API:
- Port the fetch logic from Sports-Stats-Board's `services/espn.ts`
- Add server-side caching for better performance
- Handle rate limiting and errors gracefully

**Endpoints to support:**
```
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams
GET https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams/{teamId}/schedule
```

### 1.2 Create Multi-Sport Routes
**Location:** `apps/api/src/routes/sports.ts`

New API endpoints:
```
GET /api/sports                    - List available sports
GET /api/sports/:sportId/games     - Get games/scoreboard for a sport
GET /api/sports/:sportId/teams     - Get teams for a sport
GET /api/sports/:sportId/teams/:id - Get team schedule/details
GET /api/sports/:sportId/leaderboard - For individual sports (golf, racing)
```

### 1.3 Add Sport Configuration
**Location:** `packages/types/src/sports.ts`

Port and adapt the sports config from Sports-Stats-Board's `config/sports.ts`:
- Define TypeScript interfaces for sport configurations
- Include all 32+ sports categories
- Mark NHL as the "primary" sport for UI priority

---

## Phase 2: Shared Types Package

### 2.1 New Type Definitions
**Location:** `packages/types/src/`

Create new type files:
- `sports.ts` - Sport metadata, categories, configurations
- `espn.ts` - ESPN API response types
- `settings.ts` - User preferences and favorites
- `leaderboard.ts` - Individual sport leaderboard types

### 2.2 Update Index Exports
**Location:** `packages/types/src/index.ts`

Export all new types for consumption by web and api packages.

---

## Phase 3: Frontend - Core Infrastructure

### 3.1 Settings System
**Location:** `apps/web/src/contexts/SettingsContext.tsx`

Create a React context for user settings:
```typescript
interface Settings {
  enabledSports: string[];      // Which sports to show
  sportOrder: string[];         // Tab ordering
  favorites: Record<string, string[]>; // Favorites per sport
  showOnlyFavorites: boolean;
  showLiveFirst: boolean;
  primarySport: 'nhl';          // Always NHL for this dashboard
}
```

### 3.2 Settings Persistence Hook
**Location:** `apps/web/src/hooks/useSettings.ts`

- Load/save settings from localStorage
- Migrate existing NHL-only settings
- Default to NHL as primary with other sports disabled

### 3.3 Multi-Sport Query Hooks
**Location:** `apps/web/src/hooks/queries/`

New hooks following React Query patterns:
- `useSportGames(sportId, date)` - Games for any sport
- `useSportTeams(sportId)` - Teams list for settings
- `useLeaderboard(sportId)` - Individual sports data
- `useSportConfig()` - Available sports configuration

---

## Phase 4: Frontend - UI Components

### 4.1 Sport Navigation
**Location:** `apps/web/src/components/SportNav/`

Create new components:
- `SportTabs.tsx` - Horizontal tab bar for switching sports
- `SportTab.tsx` - Individual tab with live indicator

**Styling:** Match NHL Dashboard theme:
- Active tab: `bg-accent` (cyan #00A9E0)
- Inactive tab: `bg-surface` (navy #141B3D)
- Live indicator: `bg-live` (green #00D665) with `pulse-glow` animation

### 4.2 Adapted Card Components
**Location:** `apps/web/src/components/cards/`

Port and restyle from Sports-Stats-Board:
- `TeamCard.tsx` - Adapt for NHL theme colors
- `LeaderboardCard.tsx` - For golf/racing/combat sports
- `TeamCardSkeleton.tsx` - Loading state

**Theme adaptations:**
| Sports-Stats-Board | NHL Dashboard |
|--------------------|---------------|
| `#0a0a0f` background | `#0A0E27` background |
| `#10b981` win color | `#00D665` live/win color |
| `#ef4444` loss/live | `#ef4444` loss (keep) |
| `bg-blue-600` active | `#00A9E0` accent |

### 4.3 Settings Modal
**Location:** `apps/web/src/components/Settings/`

Create settings UI:
- `SettingsModal.tsx` - Modal container
- `SportToggle.tsx` - Enable/disable sports
- `TeamSelector.tsx` - Choose favorite teams
- `SportOrderer.tsx` - Drag to reorder sports tabs

### 4.4 Onboarding Wizard (Optional)
**Location:** `apps/web/src/components/Onboarding/`

Port the onboarding flow for new users:
- `OnboardingWizard.tsx` - Multi-step container
- `WelcomeStep.tsx` - Introduction
- `SportSelector.tsx` - Choose sports
- `TeamSelector.tsx` - Pick favorites

**Note:** Consider making onboarding optional since the NHL Dashboard focuses on NHL as primary.

---

## Phase 5: Page Integration

### 5.1 Update App Router
**Location:** `apps/web/src/App.tsx`

Add new routes:
```typescript
<Route path="/sports/:sportId" element={<SportDashboard />} />
<Route path="/settings" element={<SettingsPage />} />
```

### 5.2 Main Layout Updates
**Location:** `apps/web/src/components/Layout.tsx`

Add sport tabs to the layout:
- Sport tabs below header (or integrated into header)
- NHL highlighted/first as the primary sport
- Settings gear icon in header

### 5.3 Sport Dashboard Page
**Location:** `apps/web/src/pages/SportDashboard.tsx`

Generic dashboard that works for any sport:
- Reads `sportId` from route params
- Uses appropriate card component (TeamCard vs LeaderboardCard)
- Maintains NHL Dashboard's grid layout and styling

### 5.4 Update Sidebar Navigation
**Location:** `apps/web/src/components/Sidebar.tsx`

Add new navigation items:
- "All Sports" section with enabled sports list
- Settings link
- Visual indicator for sports with live games

---

## Phase 6: Feature Parity

### 6.1 Pull-to-Refresh (Mobile)
**Location:** `apps/web/src/hooks/usePullToRefresh.ts`

Port the pull-to-refresh functionality for mobile users.

### 6.2 Live Game Detection
**Location:** `apps/web/src/hooks/useAutoRefresh.ts`

Implement smart refresh intervals:
- 30 seconds when any game is live
- 5 minutes when no live games
- Pause when tab is hidden

### 6.3 Favorites Filtering
Add filter controls to show:
- All teams
- Favorites only
- Live games first

---

## Phase 7: Testing

### 7.1 Unit Tests
Port and adapt tests from Sports-Stats-Board:
- Service tests for ESPN API
- Component tests for new UI components
- Hook tests for data fetching

### 7.2 Integration Tests
- Test sport switching flows
- Test settings persistence
- Test data refresh mechanisms

---

## Implementation Order

### Sprint 1: Backend & Types (Foundation)
1. [ ] Create `packages/types/src/sports.ts` - Sport type definitions
2. [ ] Create `packages/types/src/espn.ts` - ESPN API types
3. [ ] Create `apps/api/src/services/espn.ts` - ESPN service
4. [ ] Create `apps/api/src/routes/sports.ts` - Multi-sport routes
5. [ ] Test backend endpoints with Postman/curl

### Sprint 2: Settings & State Management
6. [ ] Create `apps/web/src/contexts/SettingsContext.tsx`
7. [ ] Create `apps/web/src/hooks/useSettings.ts`
8. [ ] Create settings localStorage persistence
9. [ ] Create query hooks for multi-sport data

### Sprint 3: Core UI Components
10. [ ] Create `SportTabs` component with NHL theme
11. [ ] Adapt `TeamCard` component with NHL colors
12. [ ] Adapt `LeaderboardCard` for individual sports
13. [ ] Create `SettingsModal` component

### Sprint 4: Page Integration
14. [ ] Update `App.tsx` with new routes
15. [ ] Create `SportDashboard` page component
16. [ ] Update `Sidebar` with sport links
17. [ ] Update `Layout` with sport tabs

### Sprint 5: Polish & Features
18. [ ] Implement live game detection
19. [ ] Add pull-to-refresh for mobile
20. [ ] Add favorites filtering
21. [ ] Create onboarding flow (optional)

### Sprint 6: Testing & Refinement
22. [ ] Write unit tests
23. [ ] Write integration tests
24. [ ] Performance optimization
25. [ ] Documentation updates

---

## Theme Reference

### NHL Dashboard Colors (Use These)
```css
--background: #0A0E27;      /* Deep navy */
--surface: #141B3D;         /* Card backgrounds */
--surface-light: #1E2749;   /* Hover states */
--accent: #00A9E0;          /* Primary accent (cyan) */
--live: #00D665;            /* Live indicator (green) */
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--border: rgba(255, 255, 255, 0.1);
```

### Animation Reference
```css
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## File Structure After Integration

```
nhl-dashboard/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── cards/
│   │       │   │   ├── TeamCard.tsx         (NEW)
│   │       │   │   ├── LeaderboardCard.tsx  (NEW)
│   │       │   │   └── LiveScoreCard.tsx    (existing)
│   │       │   ├── SportNav/
│   │       │   │   ├── SportTabs.tsx        (NEW)
│   │       │   │   └── SportTab.tsx         (NEW)
│   │       │   ├── Settings/
│   │       │   │   ├── SettingsModal.tsx    (NEW)
│   │       │   │   ├── SportToggle.tsx      (NEW)
│   │       │   │   └── TeamSelector.tsx     (NEW)
│   │       │   ├── Onboarding/              (NEW - optional)
│   │       │   └── ... (existing)
│   │       ├── contexts/
│   │       │   └── SettingsContext.tsx      (NEW)
│   │       ├── hooks/
│   │       │   ├── queries/
│   │       │   │   ├── useSportGames.ts     (NEW)
│   │       │   │   ├── useSportTeams.ts     (NEW)
│   │       │   │   ├── useLeaderboard.ts    (NEW)
│   │       │   │   └── ... (existing)
│   │       │   ├── useSettings.ts           (NEW)
│   │       │   ├── usePullToRefresh.ts      (NEW)
│   │       │   └── useAutoRefresh.ts        (NEW)
│   │       ├── pages/
│   │       │   ├── SportDashboard.tsx       (NEW)
│   │       │   └── ... (existing)
│   │       └── config/
│   │           └── sports.ts                (NEW)
│   │
│   └── api/
│       └── src/
│           ├── services/
│           │   ├── espn.ts                  (NEW)
│           │   └── nhl.ts                   (existing)
│           └── routes/
│               ├── sports.ts                (NEW)
│               └── ... (existing)
│
└── packages/
    └── types/
        └── src/
            ├── sports.ts                    (NEW)
            ├── espn.ts                      (NEW)
            ├── settings.ts                  (NEW)
            └── ... (existing)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ESPN API rate limits | Server-side caching, smart refresh intervals |
| Breaking existing NHL features | Feature flag for multi-sport, preserve NHL routes |
| Theme inconsistency | Document color mappings, review all new components |
| Performance degradation | Lazy load non-NHL sports, code splitting |
| localStorage conflicts | Namespaced keys, migration logic |

---

## Success Criteria

1. NHL Dashboard functionality remains unchanged
2. Users can enable additional sports via settings
3. All sports use consistent NHL Dashboard theme
4. Live games detected and highlighted across all sports
5. Settings persist across sessions
6. Mobile experience with pull-to-refresh
7. No performance regression on initial load
