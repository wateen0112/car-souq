import type { ReactNode } from 'react';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import PullToRefreshIndicator from './PullToRefreshIndicator';

interface PullToRefreshContainerProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    className?: string;
    pullDownThreshold?: number;
    maxPullDown?: number;
}

const PullToRefreshContainer = ({
    onRefresh,
    children,
    className = '',
    pullDownThreshold = 80,
    maxPullDown = 120,
}: PullToRefreshContainerProps) => {
    const { isPulling, isRefreshing, pullDistance, containerRef } = usePullToRefresh({
        onRefresh,
        pullDownThreshold,
        maxPullDown,
    });

    return (
        <div
            ref={containerRef}
            className={`relative overflow-y-auto overflow-x-hidden no-scrollbar ${className}`}
            style={{
                height: '100%',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <PullToRefreshIndicator
                isPulling={isPulling}
                isRefreshing={isRefreshing}
                pullDistance={pullDistance}
                threshold={pullDownThreshold}
            />

            <div
                className="transition-transform duration-200"
                style={{
                    transform: isPulling ? `translateY(${Math.min(pullDistance * 0.3, 40)}px)` : 'translateY(0)',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefreshContainer;
