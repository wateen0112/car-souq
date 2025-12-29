import { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { Car } from '../types/index.ts';

export function useCars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCars = useCallback(async () => {
        try {
            setError(null);
            const carsRef = collection(db, 'cars');
            const q = query(carsRef, orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);

            const carsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Car[];

            setCars(carsData);
        } catch (err: any) {
            console.error('Error fetching cars:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async () => {
        setLoading(true);
        await fetchCars();
    }, [fetchCars]);

    useEffect(() => {
        fetchCars();
    }, [fetchCars]);

    return { cars, loading, error, refetch };
}
