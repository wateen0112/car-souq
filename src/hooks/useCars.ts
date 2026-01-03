import { useEffect, useState, useCallback } from 'react';
import { api, type Car } from '../../api';

export function useCars(userId?: string) {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCars = useCallback(async () => {
        const effectiveUserId = userId || localStorage.getItem('user-id');
        console.log('useCars: Fetching for userId:', effectiveUserId);

        if (!effectiveUserId) {
            console.warn('useCars: No userId available, skipping fetch');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            setError(null);
            const response = await api.getCars(effectiveUserId);

            // Handle paginated response structure
            const rawCars = response.data || (Array.isArray(response) ? response : []);

            const normalizedCars = Array.isArray(rawCars) ? rawCars.map((car: any) => ({
                ...car,
                // Parse numbers from nested pricing or flatten
                sale_price: car.pricing?.sale_price ? Number(car.pricing.sale_price) : (car.sale_price ? Number(car.sale_price) : null),
                daily_rent_price: car.pricing?.daily_rent_price ? Number(car.pricing.daily_rent_price) : (car.daily_rent_price ? Number(car.daily_rent_price) : null),
                weekly_rent_price: car.pricing?.weekly_rent_price ? Number(car.pricing.weekly_rent_price) : (car.weekly_rent_price ? Number(car.weekly_rent_price) : null),
                monthly_rent_price: car.pricing?.monthly_rent_price ? Number(car.pricing.monthly_rent_price) : (car.monthly_rent_price ? Number(car.monthly_rent_price) : null),
            })) : [];

            setCars(normalizedCars);
        } catch (err: any) {
            console.error('Error fetching cars:', err);
            setError(err.message || 'Failed to fetch cars');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const refetch = useCallback(async () => {
        setLoading(true);
        await fetchCars();
    }, [fetchCars]);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    return { cars, loading, error, refetch };
}
