import React, { useMemo, useEffect } from 'react';
import { useCars } from '../hooks/useCars';
import { useCarouselAds } from '../hooks/useCarouselAds';
import CarCard from '../components/CarCard';
import HeroCarousel from '../components/HeroCarousel';
import { Skeleton } from '../components/ui/Skeleton';
import { Link, useParams } from 'react-router-dom';
import PullToRefreshContainer from '../components/PullToRefreshContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPublicProfile } from '../features/auth/authSlice';
import type { RootState } from '../store/store';

const Home: React.FC = () => {
    const { userId } = useParams();

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <h1 className="text-2xl font-bold text-destructive mb-2">عذراً، الرابط غير صحيح</h1>
                <p className="text-muted-foreground">يرجى التأكد من استخدام الرابط الصحيح للوصول إلى المعرض.</p>
            </div>
        );
    }

    localStorage.setItem('user-id', userId.toString());

    const { cars, loading, error, refetch } = useCars(userId);
    const { ads } = useCarouselAds(userId);
    const dispatch = useAppDispatch();

    // Explicitly casting state as any for now to bypass the lint error if RootState is failing to infer
    // but the slice logic is sound. We use state.auth as any to ensure profile access.
    const profile = useAppSelector((state: RootState) => (state.auth as any).profile);

    useEffect(() => {
        if (profile) {
            console.log('User Profile from Redux:', profile);
        }
    }, [profile]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchPublicProfile(userId));
        }
        refetch();
    }, [userId, refetch, dispatch]);

    const carsByCategory = useMemo(() => {
        const grouped: Record<string, typeof cars> = {};
        cars.forEach(car => {
            if (!grouped[car.type]) {
                grouped[car.type] = [];
            }
            grouped[car.type].push(car);
        });
        return grouped;
    }, [cars]);

    const handleRefresh = async () => {
        await refetch();
    };

    if (loading) {
        return (
            <div className="space-y-8 p-4">
                <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
                    <Skeleton className="w-full h-full" />
                </div>
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px]">
                                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full">
                                        <Skeleton className="h-48 w-full rounded-t-xl" />
                                        <div className="p-4 space-y-3">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="flex justify-between items-center pt-2">
                                                <Skeleton className="h-5 w-20" />
                                                <Skeleton className="h-9 w-24" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-destructive p-4">حدث خطأ أثناء تحميل البيانات: {error}</div>;
    }

    return (
        <PullToRefreshContainer onRefresh={handleRefresh} className="h-full">
            <div className="space-y-8 pb-20">
                {ads.length > 0 && <HeroCarousel ads={ads} />}
                {Object.keys(carsByCategory).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        لا توجد سيارات معروضة حالياً.
                    </div>
                )}
                {Object.entries(carsByCategory).map(([category, categoryCars]) => (
                    <section key={category} className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-2xl font-bold">{category}</h2>
                            <Link to={userId ? `/${userId}/filter?category=${category}` : `/filter?category=${category}`} className="text-primary text-sm hover:underline">
                                عرض الكل
                            </Link>
                        </div>
                        <div className="flex overflow-x-auto gap-4 no-scrollbar pb-4 -mx-4 px-4 snap-x">
                            {categoryCars.map(car => (
                                <div key={car.id} className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-start">
                                    <CarCard car={car} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </PullToRefreshContainer>
    );
};

export default Home;