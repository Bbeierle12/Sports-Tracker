import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from './SettingsContext';

// Test component to access context
function TestConsumer() {
  const settings = useSettings();
  return (
    <div>
      <span data-testid="enabled-sports">{settings.enabledSports.join(',')}</span>
      <span data-testid="show-favorites">{settings.showOnlyFavorites.toString()}</span>
      <span data-testid="show-live-first">{settings.showLiveFirst.toString()}</span>
      <span data-testid="onboarding-complete">{settings.onboardingComplete.toString()}</span>
      <button onClick={() => settings.toggleSport('nba')}>Toggle NBA</button>
      <button onClick={() => settings.setShowOnlyFavorites(false)}>Show All</button>
      <button onClick={() => settings.addFavorite('nfl', '25')}>Add Favorite</button>
      <button onClick={() => settings.removeFavorite('nfl', '25')}>Remove Favorite</button>
      <button onClick={() => settings.completeOnboarding()}>Complete Onboarding</button>
      <button onClick={() => settings.resetSettings()}>Reset</button>
    </div>
  );
}

describe('SettingsContext', () => {
  describe('SettingsProvider', () => {
    it('should provide default settings', () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      // NHL should be enabled by default (primary sport)
      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl');
      expect(screen.getByTestId('show-favorites').textContent).toBe('true');
      expect(screen.getByTestId('show-live-first').textContent).toBe('true');
      expect(screen.getByTestId('onboarding-complete').textContent).toBe('false');
    });

    it('should load settings from localStorage', () => {
      const savedSettings = {
        enabledSports: ['nhl', 'nba'],
        sportOrder: ['nhl', 'nba'],
        favorites: { nfl: ['25'] },
        showOnlyFavorites: false,
        showLiveFirst: false,
        onboardingComplete: true,
        onboardingVersion: 1,
      };
      localStorage.setItem('sports_tracker_settings', JSON.stringify(savedSettings));

      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl,nba');
      expect(screen.getByTestId('show-favorites').textContent).toBe('false');
      expect(screen.getByTestId('onboarding-complete').textContent).toBe('true');
    });

    it('should toggle a sport on/off', () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      // Initially only NHL
      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl');

      // Toggle NBA on
      act(() => {
        screen.getByText('Toggle NBA').click();
      });

      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl,nba');

      // Toggle NBA off
      act(() => {
        screen.getByText('Toggle NBA').click();
      });

      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl');
    });

    it('should update showOnlyFavorites setting', () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      expect(screen.getByTestId('show-favorites').textContent).toBe('true');

      act(() => {
        screen.getByText('Show All').click();
      });

      expect(screen.getByTestId('show-favorites').textContent).toBe('false');
    });

    it('should add and remove favorites', () => {
      const TestFavorites = () => {
        const settings = useSettings();
        const nflFavorites = settings.favorites['nfl'] || [];
        return (
          <div>
            <span data-testid="nfl-favorites">{nflFavorites.join(',')}</span>
            <button onClick={() => settings.addFavorite('nfl', '25')}>Add</button>
            <button onClick={() => settings.removeFavorite('nfl', '25')}>Remove</button>
          </div>
        );
      };

      render(
        <SettingsProvider>
          <TestFavorites />
        </SettingsProvider>
      );

      expect(screen.getByTestId('nfl-favorites').textContent).toBe('');

      act(() => {
        screen.getByText('Add').click();
      });

      expect(screen.getByTestId('nfl-favorites').textContent).toBe('25');

      act(() => {
        screen.getByText('Remove').click();
      });

      expect(screen.getByTestId('nfl-favorites').textContent).toBe('');
    });

    it('should complete onboarding', () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      expect(screen.getByTestId('onboarding-complete').textContent).toBe('false');

      act(() => {
        screen.getByText('Complete Onboarding').click();
      });

      expect(screen.getByTestId('onboarding-complete').textContent).toBe('true');
    });

    it('should reset settings to defaults', () => {
      const savedSettings = {
        enabledSports: ['nhl', 'nba', 'mlb'],
        sportOrder: ['nhl', 'nba', 'mlb'],
        favorites: { nfl: ['25', '21'] },
        showOnlyFavorites: false,
        showLiveFirst: false,
        onboardingComplete: true,
        onboardingVersion: 1,
      };
      localStorage.setItem('sports_tracker_settings', JSON.stringify(savedSettings));

      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl,nba,mlb');

      act(() => {
        screen.getByText('Reset').click();
      });

      expect(screen.getByTestId('enabled-sports').textContent).toBe('nhl');
      expect(screen.getByTestId('onboarding-complete').textContent).toBe('false');
    });

    it('should persist settings to localStorage on change', () => {
      render(
        <SettingsProvider>
          <TestConsumer />
        </SettingsProvider>
      );

      act(() => {
        screen.getByText('Toggle NBA').click();
      });

      const saved = JSON.parse(localStorage.getItem('sports_tracker_settings') || '{}');
      expect(saved.enabledSports).toContain('nba');
    });
  });

  describe('useSettings outside provider', () => {
    it('should throw error when used outside SettingsProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useSettings must be used within a SettingsProvider');

      consoleSpy.mockRestore();
    });
  });
});
