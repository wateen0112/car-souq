import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CarouselAd } from '../types/index.ts';

export function useCarouselAds() {
    const [ads, setAds] = useState<CarouselAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAds = useCallback(async () => {
        try {
            setError(null);
            const { data, error } = await supabase
                .from('carousel_ads')
                .select('*')
                .order('order_position', { ascending: true });

            if (error) throw error;
            setAds(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async () => {
        setLoading(true);
        await fetchAds();
    }, [fetchAds]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    return { ads, loading, error, refetch };
}
