import { useRef, useState, useCallback, useEffect, type RefObject } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

interface UsePullToRefreshReturn {
  isPulling: boolean;
  pullDistance: number;
  containerRef: RefObject<HTMLDivElement>;
  isRefreshing: boolean;
}

/**
 * Hook for pull-to-refresh functionality on mobile devices
 * - Tracks touch events
 * - Calculates pull distance with resistance
 * - Triggers refresh when pulled past threshold
 * - Provides visual feedback state
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const scrollTop = useRef(0);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      scrollTop.current = container.scrollTop;
      if (scrollTop.current > 0) return;

      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
    },
    [enabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing || startY.current === 0) return;

      const container = containerRef.current;
      if (!container) return;

      currentY.current = e.touches[0].clientY;
      const pullLength = currentY.current - startY.current;

      if (pullLength > 0 && scrollTop.current === 0) {
        setIsPulling(true);
        const distance = Math.min(pullLength / resistance, threshold * 1.5);
        setPullDistance(distance);

        if (distance > 10) {
          e.preventDefault();
        }
      }
    },
    [enabled, isRefreshing, resistance, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing) return;

    const shouldRefresh = pullDistance >= threshold;

    if (shouldRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
    scrollTop.current = 0;
  }, [enabled, isRefreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    containerRef,
    isRefreshing,
  };
}
