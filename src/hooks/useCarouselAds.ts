import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { CarouselAd } from '../types/index.ts';

export function useCarouselAds() {
    const [ads, setAds] = useState<CarouselAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAds = useCallback(async () => {
        try {
            setError(null);
            const adsRef = collection(db, 'carousel_ads');
            const q = query(adsRef, orderBy('order_position', 'asc'));
            const querySnapshot = await getDocs(q);

            const adsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CarouselAd[];

            setAds(adsData || []);
        } catch (err: any) {
            console.error('Error fetching ads:', err);
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
