import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { UserSettings, StatComplexity } from '@sports-tracker/types';
import { getSportIds } from '@sports-tracker/types';

const STORAGE_KEY = 'sports_tracker_settings';
const CURRENT_VERSION = 2; // Bumped to trigger migration for removed sports

// Default settings - NHL is primary
const DEFAULT_SETTINGS: UserSettings = {
  enabledSports: ['nhl'],
  sportOrder: ['nhl'],
  favorites: {},
  showOnlyFavorites: true,
  showLiveFirst: true,
  onboardingComplete: false,
  onboardingVersion: CURRENT_VERSION,
  statComplexity: 'fan',
};

interface SettingsContextValue extends UserSettings {
  // Sport management
  toggleSport: (sportId: string) => void;
  enableSport: (sportId: string) => void;
  disableSport: (sportId: string) => void;
  reorderSports: (sportOrder: string[]) => void;

  // Favorites management
  addFavorite: (sportId: string, teamId: string) => void;
  removeFavorite: (sportId: string, teamId: string) => void;
  setFavoritesForSport: (sportId: string, teamIds: string[]) => void;
  isFavorite: (sportId: string, teamId: string) => boolean;

  // Display settings
  setShowOnlyFavorites: (value: boolean) => void;
  setShowLiveFirst: (value: boolean) => void;
  setStatComplexity: (value: StatComplexity) => void;

  // Onboarding
  completeOnboarding: () => void;

  // Reset
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      const settings = { ...DEFAULT_SETTINGS, ...parsed };

      // Migration: Filter out sports that no longer exist in config
      const validSportIds = getSportIds();
      settings.enabledSports = settings.enabledSports.filter(
        (id: string) => validSportIds.includes(id)
      );
      settings.sportOrder = settings.sportOrder.filter(
        (id: string) => validSportIds.includes(id)
      );

      // Clean up favorites for removed sports
      const cleanedFavorites: Record<string, string[]> = {};
      for (const sportId of Object.keys(settings.favorites || {})) {
        if (validSportIds.includes(sportId)) {
          cleanedFavorites[sportId] = settings.favorites[sportId];
        }
      }
      settings.favorites = cleanedFavorites;

      return settings;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  // Persist settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const toggleSport = useCallback((sportId: string) => {
    setSettings((prev) => {
      const isEnabled = prev.enabledSports.includes(sportId);
      if (isEnabled) {
        return {
          ...prev,
          enabledSports: prev.enabledSports.filter((id) => id !== sportId),
          sportOrder: prev.sportOrder.filter((id) => id !== sportId),
        };
      } else {
        return {
          ...prev,
          enabledSports: [...prev.enabledSports, sportId],
          sportOrder: [...prev.sportOrder, sportId],
        };
      }
    });
  }, []);

  const enableSport = useCallback((sportId: string) => {
    setSettings((prev) => {
      if (prev.enabledSports.includes(sportId)) {
        return prev;
      }
      return {
        ...prev,
        enabledSports: [...prev.enabledSports, sportId],
        sportOrder: [...prev.sportOrder, sportId],
      };
    });
  }, []);

  const disableSport = useCallback((sportId: string) => {
    setSettings((prev) => ({
      ...prev,
      enabledSports: prev.enabledSports.filter((id) => id !== sportId),
      sportOrder: prev.sportOrder.filter((id) => id !== sportId),
    }));
  }, []);

  const reorderSports = useCallback((sportOrder: string[]) => {
    setSettings((prev) => ({
      ...prev,
      sportOrder,
    }));
  }, []);

  const addFavorite = useCallback((sportId: string, teamId: string) => {
    setSettings((prev) => {
      const currentFavorites = prev.favorites[sportId] || [];
      if (currentFavorites.includes(teamId)) {
        return prev;
      }
      return {
        ...prev,
        favorites: {
          ...prev.favorites,
          [sportId]: [...currentFavorites, teamId],
        },
      };
    });
  }, []);

  const removeFavorite = useCallback((sportId: string, teamId: string) => {
    setSettings((prev) => {
      const currentFavorites = prev.favorites[sportId] || [];
      return {
        ...prev,
        favorites: {
          ...prev.favorites,
          [sportId]: currentFavorites.filter((id) => id !== teamId),
        },
      };
    });
  }, []);

  const setFavoritesForSport = useCallback((sportId: string, teamIds: string[]) => {
    setSettings((prev) => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        [sportId]: teamIds,
      },
    }));
  }, []);

  const isFavorite = useCallback(
    (sportId: string, teamId: string) => {
      const sportFavorites = settings.favorites[sportId] || [];
      return sportFavorites.includes(teamId);
    },
    [settings.favorites]
  );

  const setShowOnlyFavorites = useCallback((value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      showOnlyFavorites: value,
    }));
  }, []);

  const setShowLiveFirst = useCallback((value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      showLiveFirst: value,
    }));
  }, []);

  const setStatComplexity = useCallback((value: StatComplexity) => {
    setSettings((prev) => ({
      ...prev,
      statComplexity: value,
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      onboardingComplete: true,
      onboardingVersion: CURRENT_VERSION,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: SettingsContextValue = {
    ...settings,
    toggleSport,
    enableSport,
    disableSport,
    reorderSports,
    addFavorite,
    removeFavorite,
    setFavoritesForSport,
    isFavorite,
    setShowOnlyFavorites,
    setShowLiveFirst,
    setStatComplexity,
    completeOnboarding,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
