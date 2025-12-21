import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  callback: () => void;
  hasLiveGames: boolean;
  enabled?: boolean;
}

/**
 * Hook for automatic data refreshing with smart intervals
 * - 30 seconds when games are live
 * - 5 minutes when no live games
 * - Pauses when tab is hidden
 * - Resumes when tab becomes visible
 */
export function useAutoRefresh({
  callback,
  hasLiveGames,
  enabled = true,
}: UseAutoRefreshOptions): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    clearCurrentInterval();

    if (!enabled) return;

    // 30 seconds for live games, 5 minutes otherwise
    const interval = hasLiveGames ? 30000 : 300000;

    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [hasLiveGames, enabled, clearCurrentInterval]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearCurrentInterval();
      } else {
        if (enabled) {
          callbackRef.current();
          startInterval();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, clearCurrentInterval, startInterval]);

  // Start/restart interval when dependencies change
  useEffect(() => {
    if (!enabled || document.hidden) {
      clearCurrentInterval();
      return;
    }

    startInterval();

    return () => {
      clearCurrentInterval();
    };
  }, [hasLiveGames, enabled, startInterval, clearCurrentInterval]);
}
