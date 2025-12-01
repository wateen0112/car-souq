import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
    isPulling: boolean;
    isRefreshing: boolean;
    pullDistance: number;
    threshold?: number;
}

const PullToRefreshIndicator = ({
    isPulling,
    isRefreshing,
    pullDistance,
    threshold = 80,
}: PullToRefreshIndicatorProps) => {
    const opacity = Math.min(pullDistance / threshold, 1);
    const rotation = (pullDistance / threshold) * 360;
    const scale = Math.min(pullDistance / threshold, 1);

    if (!isPulling && !isRefreshing) return null;

    return (
        <div
            className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-all duration-200"
            style={{
                transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`,
                opacity: isPulling ? opacity : isRefreshing ? 1 : 0,
            }}
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''
                    }`}
                style={{
                    transform: isRefreshing ? 'scale(1)' : `scale(${scale}) rotate(${rotation}deg)`,
                    transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
                }}
            >
                <RefreshCw
                    className={`text-blue-500 ${pullDistance >= threshold ? 'text-green-500' : ''
                        }`}
                    size={24}
                />
            </div>
        </div>
    );
};

export default PullToRefreshIndicator;
