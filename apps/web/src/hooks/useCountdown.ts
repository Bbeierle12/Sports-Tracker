import { useState, useEffect, useMemo } from 'react';

interface CountdownResult {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formatted: string;
}

/**
 * Hook that returns a countdown timer to a target date
 * Updates every second while the countdown is active
 */
export function useCountdown(targetDate: Date | string): CountdownResult {
  const target = useMemo(() => new Date(targetDate), [targetDate]);

  const calculateTimeLeft = (): CountdownResult => {
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isExpired: true,
        formatted: '0:00',
      };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      minutes,
      seconds,
      totalSeconds,
      isExpired: false,
      formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft);

  useEffect(() => {
    // Don't set up interval if already expired
    if (timeLeft.isExpired) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Clear interval when expired
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, timeLeft.isExpired]);

  return timeLeft;
}

/**
 * Helper function to check if a game starts within a specified number of minutes
 */
export function startsWithinMinutes(gameDate: Date | string, minutes: number): boolean {
  const now = new Date();
  const gameTime = new Date(gameDate);
  const diffMs = gameTime.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes > 0 && diffMinutes <= minutes;
}

/**
 * Hook to filter and track games starting soon
 */
export function useGamesStartingSoon<T extends { date: string }>(
  games: T[],
  withinMinutes: number = 20
): T[] {
  const [startingSoon, setStartingSoon] = useState<T[]>([]);

  useEffect(() => {
    const updateStartingSoon = () => {
      const filtered = games.filter((game) => startsWithinMinutes(game.date, withinMinutes));
      setStartingSoon(filtered);
    };

    // Initial check
    updateStartingSoon();

    // Check every 30 seconds to add newly qualifying games
    const interval = setInterval(updateStartingSoon, 30000);

    return () => clearInterval(interval);
  }, [games, withinMinutes]);

  return startingSoon;
}
