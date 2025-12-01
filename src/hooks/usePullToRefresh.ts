import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

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
    containerRef: RefObject<HTMLDivElement | null>; // Non-nullable in usage context
}

export const usePullToRefresh = ({
    onRefresh,
    pullDownThreshold = 80,
    maxPullDown = 150,
    refreshTimeout = 30000, // Increased to avoid premature timeout
}: PullToRefreshOptions): PullToRefreshReturn => {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    // Fix: Use non-null assertion — safe because we check .current before use
    const containerRef = useRef<HTMLDivElement>(null!);

    const startY = useRef<number>(0);
    const currentY = useRef<number>(0);
    const isMouseDown = useRef<boolean>(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isAtTop = container.scrollTop === 0;

        const checkIfAtTop = () => {
            // Check both container scroll and window scroll to be safe
            isAtTop = container.scrollTop <= 0 && window.scrollY <= 0;
        };

        const handleTouchStart = (e: TouchEvent) => {
            checkIfAtTop();
            if (isAtTop && !isRefreshing) {
                startY.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isAtTop || isRefreshing || startY.current === 0) return;

            currentY.current = e.touches[0].clientY;
            const distance = currentY.current - startY.current;

            if (distance > 0) {
                e.preventDefault(); // Prevent scroll while pulling

                const resistedDistance = Math.min(distance / 2, maxPullDown); // 50% resistance
                setPullDistance(resistedDistance);
                setIsPulling(true);
            }
        };

        const handleTouchEnd = () => {
            if (!isPulling) return;

            if (pullDistance >= pullDownThreshold) {
                triggerRefresh();
            } else {
                resetPullState();
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            checkIfAtTop();
            if (isAtTop && !isRefreshing) {
                isMouseDown.current = true;
                startY.current = e.clientY;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isMouseDown.current || !isAtTop || isRefreshing) return;

            currentY.current = e.clientY;
            const distance = currentY.current - startY.current;

            if (distance > 0) {
                e.preventDefault();
                const resistedDistance = Math.min(distance / 2, maxPullDown);
                setPullDistance(resistedDistance);
                setIsPulling(true);
            }
        };

        const handleMouseUp = () => {
            if (!isMouseDown.current) return;
            isMouseDown.current = false;

            if (!isPulling) return;

            if (pullDistance >= pullDownThreshold) {
                triggerRefresh();
            } else {
                resetPullState();
            }
        };

        const triggerRefresh = async () => {
            setIsRefreshing(true);
            try {
                await Promise.race([
                    onRefresh(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Refresh timeout')), refreshTimeout)
                    ),
                ]);
            } catch (error) {
                console.error('Pull-to-refresh failed:', error);
            } finally {
                setIsRefreshing(false);
                resetPullState();
            }
        };

        const resetPullState = () => {
            setIsPulling(false);
            setPullDistance(0);
            startY.current = 0;
            currentY.current = 0;
        };

        // Initial check
        checkIfAtTop();

        // Touch events
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        // Mouse events (for desktop testing)
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseup', handleMouseUp); // Catch mouseup outside container

        // Track scroll position
        container.addEventListener('scroll', checkIfAtTop);
        // Also track window scroll as we depend on it now
        window.addEventListener('scroll', checkIfAtTop);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
            container.removeEventListener('scroll', checkIfAtTop);
            window.removeEventListener('scroll', checkIfAtTop);

            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [
        isRefreshing,
        isPulling,
        pullDistance,
        pullDownThreshold,
        maxPullDown,
        onRefresh,
        refreshTimeout,
    ]);

    return {
        isPulling,
        isRefreshing,
        pullDistance,
        containerRef,
    };
};