import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Car } from '../types/index.ts';

export function useCars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCars() {
            try {
                const { data, error } = await supabase
                    .from('cars')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCars(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCars();
    }, []);

    return { cars, loading, error };
}
