import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GameDetailToast } from './GameDetailToast';

// Mock the useGameDetails hook
vi.mock('../../hooks/queries/useGameDetails', () => ({
  useGameDetails: vi.fn(),
}));

// Mock the useSettings hook
vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

import { useGameDetails } from '../../hooks/queries/useGameDetails';
import { useSettings } from '../../contexts/SettingsContext';

const mockUseGameDetails = vi.mocked(useGameDetails);
const mockUseSettings = vi.mocked(useSettings);

// Create a wrapper with QueryClientProvider
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock game event data
const mockEvent = {
  id: '401547417',
  date: '2024-12-25T17:00:00Z',
  name: 'Los Angeles Lakers at Golden State Warriors',
  shortName: 'LAL @ GSW',
  status: {
    type: {
      state: 'in' as const,
      completed: false,
      description: 'In Progress',
      shortDetail: 'Q3 5:24',
    },
    period: 3,
    displayClock: '5:24',
  },
  competitions: [
    {
      id: '401547417',
      competitors: [
        {
          id: '9',
          homeAway: 'home' as const,
          score: '78',
          team: {
            id: '9',
            abbreviation: 'GSW',
            displayName: 'Golden State Warriors',
            shortDisplayName: 'Warriors',
            logo: 'https://example.com/gsw-logo.png',
          },
        },
        {
          id: '13',
          homeAway: 'away' as const,
          score: '72',
          team: {
            id: '13',
            abbreviation: 'LAL',
            displayName: 'Los Angeles Lakers',
            shortDisplayName: 'Lakers',
            logo: 'https://example.com/lal-logo.png',
          },
        },
      ],
      venue: {
        fullName: 'Chase Center',
        address: {
          city: 'San Francisco',
          state: 'CA',
        },
      },
    },
  ],
};

// Mock game details response
const mockGameDetails = {
  boxscore: {
    teams: [
      {
        team: { id: '13', abbreviation: 'LAL', displayName: 'Los Angeles Lakers' },
        statistics: [
          { name: 'fieldGoalPct', displayValue: '45.2%', label: 'FG%' },
          { name: 'threePointFieldGoalPct', displayValue: '38.5%', label: '3P%' },
          { name: 'totalRebounds', displayValue: '32', label: 'REB' },
          { name: 'assists', displayValue: '18', label: 'AST' },
          { name: 'turnovers', displayValue: '8', label: 'TO' },
        ],
      },
      {
        team: { id: '9', abbreviation: 'GSW', displayName: 'Golden State Warriors' },
        statistics: [
          { name: 'fieldGoalPct', displayValue: '48.1%', label: 'FG%' },
          { name: 'threePointFieldGoalPct', displayValue: '42.3%', label: '3P%' },
          { name: 'totalRebounds', displayValue: '35', label: 'REB' },
          { name: 'assists', displayValue: '22', label: 'AST' },
          { name: 'turnovers', displayValue: '6', label: 'TO' },
        ],
      },
    ],
  },
  leaders: [
    {
      team: { id: '13', abbreviation: 'LAL' },
      leaders: [
        {
          name: 'points',
          displayName: 'Points',
          leaders: [
            {
              athlete: { displayName: 'LeBron James', headshot: { href: 'https://example.com/lebron.png' } },
              displayValue: '24 PTS',
            },
          ],
        },
      ],
    },
    {
      team: { id: '9', abbreviation: 'GSW' },
      leaders: [
        {
          name: 'points',
          displayName: 'Points',
          leaders: [
            {
              athlete: { displayName: 'Stephen Curry', headshot: { href: 'https://example.com/curry.png' } },
              displayValue: '28 PTS',
            },
          ],
        },
      ],
    },
  ],
  headToHead: [
    {
      date: '2024-11-15',
      homeTeam: { abbreviation: 'LAL', score: 118 },
      awayTeam: { abbreviation: 'GSW', score: 112 },
      winner: 'LAL',
    },
    {
      date: '2024-10-22',
      homeTeam: { abbreviation: 'GSW', score: 121 },
      awayTeam: { abbreviation: 'LAL', score: 114 },
      winner: 'GSW',
    },
  ],
};

describe('GameDetailToast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return value - loading state
    mockUseGameDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
    } as any);
    // Default mock for useSettings
    mockUseSettings.mockReturnValue({
      statComplexity: 'casual',
    } as any);
  });

  describe('Visibility', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <GameDetailToast
          isOpen={false}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render toast when isOpen is true', () => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Team Display', () => {
    beforeEach(() => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);
    });

    it('should display both team names', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Lakers/)).toBeInTheDocument();
      expect(screen.getByText(/Warriors/)).toBeInTheDocument();
    });

    it('should display team logos', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      const logos = screen.getAllByRole('img');
      expect(logos.length).toBeGreaterThanOrEqual(2);
    });

    it('should display current scores', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('78')).toBeInTheDocument();
      expect(screen.getByText('72')).toBeInTheDocument();
    });
  });

  describe('Team Statistics', () => {
    beforeEach(() => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);
    });

    it('should display team statistics section', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Team Stats/i)).toBeInTheDocument();
    });

    it('should display FG% for both teams', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('45.2%')).toBeInTheDocument();
      expect(screen.getByText('48.1%')).toBeInTheDocument();
    });

    it('should display 3P% for both teams', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('38.5%')).toBeInTheDocument();
      expect(screen.getByText('42.3%')).toBeInTheDocument();
    });
  });

  describe('Top Performers', () => {
    beforeEach(() => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);
    });

    it('should display top performers section', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Top Performers/i)).toBeInTheDocument();
    });

    it('should display leading scorers', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/LeBron James/)).toBeInTheDocument();
      expect(screen.getByText(/Stephen Curry/)).toBeInTheDocument();
    });
  });

  describe('Head-to-Head History', () => {
    beforeEach(() => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);
    });

    it('should display head-to-head section', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Head-to-Head/i)).toBeInTheDocument();
    });

    it('should display previous matchup results', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/118/)).toBeInTheDocument();
      expect(screen.getByText(/112/)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    beforeEach(() => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);
    });

    it('should close on backdrop click', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      const backdrop = screen.getByTestId('toast-backdrop');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close on close button click', () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close on ESC key press', async () => {
      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton while fetching data', () => {
      mockUseGameDetails.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message on API failure', () => {
      mockUseGameDetails.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        isSuccess: false,
        isError: true,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('Game Status Display', () => {
    it('should display live game status', () => {
      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Q3/)).toBeInTheDocument();
    });

    it('should display final status for completed games', () => {
      const finalEvent = {
        ...mockEvent,
        status: {
          type: {
            state: 'post' as const,
            completed: true,
            description: 'Final',
            shortDetail: 'Final',
          },
          period: 4,
          displayClock: '0:00',
        },
      };

      mockUseGameDetails.mockReturnValue({
        data: mockGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={finalEvent}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Final/i)).toBeInTheDocument();
    });
  });

  describe('Sport-Specific Stats', () => {
    it('should display football stats for NFL games', () => {
      // Set to fan level to see all 5 stats (Total Yards, Turnovers, 1st Downs, Pass Yards, Rush Yards)
      mockUseSettings.mockReturnValue({
        statComplexity: 'fan',
      } as any);

      const nflEvent = {
        ...mockEvent,
        name: 'Arizona Cardinals at Cincinnati Bengals',
        shortName: 'ARI @ CIN',
        competitions: [
          {
            id: '401547418',
            competitors: [
              {
                id: '4',
                homeAway: 'home' as const,
                score: '13',
                team: {
                  id: '4',
                  abbreviation: 'CIN',
                  displayName: 'Cincinnati Bengals',
                  shortDisplayName: 'Bengals',
                  logo: 'https://example.com/cin-logo.png',
                },
              },
              {
                id: '22',
                homeAway: 'away' as const,
                score: '7',
                team: {
                  id: '22',
                  abbreviation: 'ARI',
                  displayName: 'Arizona Cardinals',
                  shortDisplayName: 'Cardinals',
                  logo: 'https://example.com/ari-logo.png',
                },
              },
            ],
            venue: {
              fullName: 'Paycor Stadium',
              address: {
                city: 'Cincinnati',
                state: 'OH',
              },
            },
          },
        ],
      };

      const nflGameDetails = {
        boxscore: {
          teams: [
            {
              team: { id: '22', abbreviation: 'ARI', displayName: 'Arizona Cardinals' },
              statistics: [
                { name: 'totalYards', displayValue: '245', label: 'Total Yards' },
                { name: 'passingYards', displayValue: '187', label: 'Pass Yards' },
                { name: 'rushingYards', displayValue: '58', label: 'Rush Yards' },
                { name: 'firstDowns', displayValue: '12', label: '1st Downs' },
                { name: 'turnovers', displayValue: '1', label: 'Turnovers' },
              ],
            },
            {
              team: { id: '4', abbreviation: 'CIN', displayName: 'Cincinnati Bengals' },
              statistics: [
                { name: 'totalYards', displayValue: '312', label: 'Total Yards' },
                { name: 'passingYards', displayValue: '253', label: 'Pass Yards' },
                { name: 'rushingYards', displayValue: '59', label: 'Rush Yards' },
                { name: 'firstDowns', displayValue: '18', label: '1st Downs' },
                { name: 'turnovers', displayValue: '0', label: 'Turnovers' },
              ],
            },
          ],
        },
        leaders: [],
        headToHead: [],
      };

      mockUseGameDetails.mockReturnValue({
        data: nflGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nfl"
          event={nflEvent}
        />,
        { wrapper: createWrapper() }
      );

      // Should show football-specific stat labels
      expect(screen.getByText('Total Yards')).toBeInTheDocument();
      expect(screen.getByText('Pass Yards')).toBeInTheDocument();
      expect(screen.getByText('Rush Yards')).toBeInTheDocument();
      expect(screen.getByText('1st Downs')).toBeInTheDocument();
      expect(screen.getByText('Turnovers')).toBeInTheDocument();

      // Should show football stat values
      expect(screen.getByText('245')).toBeInTheDocument();
      expect(screen.getByText('312')).toBeInTheDocument();
    });

    it('should display hockey stats for NHL games', () => {
      // Set to fan level to see all 5 stats (Shots, PP Goals, PIM, Faceoffs Won, Blocked Shots)
      mockUseSettings.mockReturnValue({
        statComplexity: 'fan',
      } as any);

      const nhlEvent = {
        ...mockEvent,
        name: 'New York Rangers at Boston Bruins',
        shortName: 'NYR @ BOS',
        competitions: [
          {
            id: '401547419',
            competitors: [
              {
                id: '6',
                homeAway: 'home' as const,
                score: '3',
                team: {
                  id: '6',
                  abbreviation: 'BOS',
                  displayName: 'Boston Bruins',
                  shortDisplayName: 'Bruins',
                  logo: 'https://example.com/bos-logo.png',
                },
              },
              {
                id: '3',
                homeAway: 'away' as const,
                score: '2',
                team: {
                  id: '3',
                  abbreviation: 'NYR',
                  displayName: 'New York Rangers',
                  shortDisplayName: 'Rangers',
                  logo: 'https://example.com/nyr-logo.png',
                },
              },
            ],
            venue: {
              fullName: 'TD Garden',
              address: {
                city: 'Boston',
                state: 'MA',
              },
            },
          },
        ],
      };

      const nhlGameDetails = {
        boxscore: {
          teams: [
            {
              team: { id: '3', abbreviation: 'NYR', displayName: 'New York Rangers' },
              statistics: [
                { name: 'shots', displayValue: '28', label: 'Shots' },
                { name: 'powerPlayGoals', displayValue: '1', label: 'PP Goals' },
                { name: 'penaltyMinutes', displayValue: '8', label: 'PIM' },
                { name: 'faceoffsWon', displayValue: '24', label: 'Faceoffs Won' },
                { name: 'blockedShots', displayValue: '12', label: 'Blocked Shots' },
              ],
            },
            {
              team: { id: '6', abbreviation: 'BOS', displayName: 'Boston Bruins' },
              statistics: [
                { name: 'shots', displayValue: '32', label: 'Shots' },
                { name: 'powerPlayGoals', displayValue: '2', label: 'PP Goals' },
                { name: 'penaltyMinutes', displayValue: '6', label: 'PIM' },
                { name: 'faceoffsWon', displayValue: '29', label: 'Faceoffs Won' },
                { name: 'blockedShots', displayValue: '15', label: 'Blocked Shots' },
              ],
            },
          ],
        },
        leaders: [],
        headToHead: [],
      };

      mockUseGameDetails.mockReturnValue({
        data: nhlGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nhl"
          event={nhlEvent}
        />,
        { wrapper: createWrapper() }
      );

      // Should show hockey-specific stat labels
      expect(screen.getByText('Shots')).toBeInTheDocument();
      expect(screen.getByText('PP Goals')).toBeInTheDocument();
      expect(screen.getByText('PIM')).toBeInTheDocument();
      expect(screen.getByText('Faceoffs Won')).toBeInTheDocument();
      expect(screen.getByText('Blocked Shots')).toBeInTheDocument();

      // Should show hockey stat values
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
    });
  });

  describe('Stat Complexity Filtering', () => {
    const basketballGameDetails = {
      boxscore: {
        teams: [
          {
            team: { id: '13', abbreviation: 'LAL', displayName: 'Los Angeles Lakers' },
            statistics: [
              { name: 'fieldGoalPct', displayValue: '45.2%', label: 'FG%' },
              { name: 'totalRebounds', displayValue: '32', label: 'REB' },
              { name: 'threePointFieldGoalPct', displayValue: '38.5%', label: '3P%' },
              { name: 'assists', displayValue: '18', label: 'AST' },
              { name: 'turnovers', displayValue: '8', label: 'TO' },
              { name: 'freeThrowPct', displayValue: '81.5%', label: 'FT%' },
              { name: 'steals', displayValue: '6', label: 'STL' },
              { name: 'blocks', displayValue: '4', label: 'BLK' },
            ],
          },
          {
            team: { id: '9', abbreviation: 'GSW', displayName: 'Golden State Warriors' },
            statistics: [
              { name: 'fieldGoalPct', displayValue: '48.1%', label: 'FG%' },
              { name: 'totalRebounds', displayValue: '35', label: 'REB' },
              { name: 'threePointFieldGoalPct', displayValue: '42.3%', label: '3P%' },
              { name: 'assists', displayValue: '22', label: 'AST' },
              { name: 'turnovers', displayValue: '6', label: 'TO' },
              { name: 'freeThrowPct', displayValue: '78.9%', label: 'FT%' },
              { name: 'steals', displayValue: '8', label: 'STL' },
              { name: 'blocks', displayValue: '5', label: 'BLK' },
            ],
          },
        ],
      },
      leaders: [],
      headToHead: [],
    };

    it('should show only 2 stats at novice level', () => {
      mockUseSettings.mockReturnValue({
        statComplexity: 'novice',
      } as any);

      mockUseGameDetails.mockReturnValue({
        data: basketballGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      // Novice should show FG% and REB only
      expect(screen.getByText('FG%')).toBeInTheDocument();
      expect(screen.getByText('REB')).toBeInTheDocument();
      // Should NOT show casual+ stats
      expect(screen.queryByText('3P%')).not.toBeInTheDocument();
      expect(screen.queryByText('AST')).not.toBeInTheDocument();
    });

    it('should show 3 stats at casual level', () => {
      mockUseSettings.mockReturnValue({
        statComplexity: 'casual',
      } as any);

      mockUseGameDetails.mockReturnValue({
        data: basketballGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      // Casual should show FG%, REB, 3P%
      expect(screen.getByText('FG%')).toBeInTheDocument();
      expect(screen.getByText('REB')).toBeInTheDocument();
      expect(screen.getByText('3P%')).toBeInTheDocument();
      // Should NOT show fan+ stats
      expect(screen.queryByText('AST')).not.toBeInTheDocument();
      expect(screen.queryByText('TO')).not.toBeInTheDocument();
    });

    it('should show 5 stats at fan level', () => {
      mockUseSettings.mockReturnValue({
        statComplexity: 'fan',
      } as any);

      mockUseGameDetails.mockReturnValue({
        data: basketballGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      // Fan should show FG%, REB, 3P%, AST, TO
      expect(screen.getByText('FG%')).toBeInTheDocument();
      expect(screen.getByText('REB')).toBeInTheDocument();
      expect(screen.getByText('3P%')).toBeInTheDocument();
      expect(screen.getByText('AST')).toBeInTheDocument();
      expect(screen.getByText('TO')).toBeInTheDocument();
      // Should NOT show nerd stats
      expect(screen.queryByText('FT%')).not.toBeInTheDocument();
      expect(screen.queryByText('STL')).not.toBeInTheDocument();
    });

    it('should show all 8 stats at nerd level', () => {
      mockUseSettings.mockReturnValue({
        statComplexity: 'nerd',
      } as any);

      mockUseGameDetails.mockReturnValue({
        data: basketballGameDetails,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as any);

      render(
        <GameDetailToast
          isOpen={true}
          onClose={mockOnClose}
          sportId="nba"
          event={mockEvent}
        />,
        { wrapper: createWrapper() }
      );

      // Nerd should show all 8 stats
      expect(screen.getByText('FG%')).toBeInTheDocument();
      expect(screen.getByText('REB')).toBeInTheDocument();
      expect(screen.getByText('3P%')).toBeInTheDocument();
      expect(screen.getByText('AST')).toBeInTheDocument();
      expect(screen.getByText('TO')).toBeInTheDocument();
      expect(screen.getByText('FT%')).toBeInTheDocument();
      expect(screen.getByText('STL')).toBeInTheDocument();
      expect(screen.getByText('BLK')).toBeInTheDocument();
    });
  });
});
