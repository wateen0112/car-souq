import { useEffect, useState, useCallback } from 'react';
import { api, type CarouselItem } from '../../api';

export function useCarouselAds(userId?: string) {
    const [ads, setAds] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAds = useCallback(async () => {
        const effectiveUserId = userId || localStorage.getItem('user-id');
        console.log('useCarouselAds: Fetching for userId:', effectiveUserId);

        if (!effectiveUserId) {
            console.warn('useCarouselAds: No userId available, skipping fetch');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            setError(null);
            const response = await api.getCarouselItems(effectiveUserId);
            const adsData = response.data || response;
            setAds(Array.isArray(adsData) ? adsData : []);
        } catch (err: any) {
            console.error('Error fetching ads:', err);
            setError(err.message || 'Failed to fetch ads');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const refetch = useCallback(async () => {
        setLoading(true);
        await fetchAds();
    }, [fetchAds]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    return { ads, loading, error, refetch };
}
