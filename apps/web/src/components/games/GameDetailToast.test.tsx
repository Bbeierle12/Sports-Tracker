import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GameDetailToast } from './GameDetailToast';

// Mock the useGameDetails hook
vi.mock('../../hooks/queries/useGameDetails', () => ({
  useGameDetails: vi.fn(),
}));

import { useGameDetails } from '../../hooks/queries/useGameDetails';

const mockUseGameDetails = vi.mocked(useGameDetails);

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
});
