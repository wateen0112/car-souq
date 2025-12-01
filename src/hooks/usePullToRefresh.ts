import { useEffect, useRef, useState, RefObject } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDown?: number;
  refreshTimeout?: number;
}

interface PullToRefreshReturn {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  containerRef: RefObject<HTMLDivElement>;
}

export const usePullToRefresh = ({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDown = 120,
  refreshTimeout = 2000,
}: PullToRefreshOptions): PullToRefreshReturn => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isAtTop = false;

    const checkIfAtTop = () => {
      isAtTop = container.scrollTop === 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      checkIfAtTop();
      if (isAtTop && !isRefreshing) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        
        // Apply resistance effect
        const resistanceDistance = Math.min(
          distance * 0.5, // 50% resistance
          maxPullDown
        );
        
        setPullDistance(resistanceDistance);
        setIsPulling(true);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= pullDownThreshold) {
        setIsRefreshing(true);
        try {
          await Promise.race([
            onRefresh(),
            new Promise((resolve) => setTimeout(resolve, refreshTimeout)),
          ]);
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
      currentY.current = 0;
    };

    // Mouse events for desktop testing
    let isMouseDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      checkIfAtTop();
      if (isAtTop && !isRefreshing) {
        isMouseDown = true;
        startY.current = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || !isAtTop || isRefreshing) return;

      currentY.current = e.clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0) {
        e.preventDefault();
        
        const resistanceDistance = Math.min(
          distance * 0.5,
          maxPullDown
        );
        
        setPullDistance(resistanceDistance);
        setIsPulling(true);
      }
    };

    const handleMouseUp = async () => {
      if (!isMouseDown) return;
      isMouseDown = false;

      if (!isPulling) return;

      if (pullDistance >= pullDownThreshold) {
        setIsRefreshing(true);
        try {
          await Promise.race([
            onRefresh(),
            new Promise((resolve) => setTimeout(resolve, refreshTimeout)),
          ]);
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
      currentY.current = 0;
    };

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('scroll', checkIfAtTop);

    // Desktop support
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('scroll', checkIfAtTop);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPulling, isRefreshing, pullDistance, pullDownThreshold, maxPullDown, onRefresh, refreshTimeout]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    containerRef,
  };
};
