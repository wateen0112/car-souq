import React, { useMemo } from 'react';
import { useCars } from '../hooks/useCars';
import { useCarouselAds } from '../hooks/useCarouselAds';
import CarCard from '../components/CarCard';
import HeroCarousel from '../components/HeroCarousel';
import { Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import PullToRefreshContainer from '../components/PullToRefreshContainer';

const Home: React.FC = () => {
    const { cars, loading, error, refetch } = useCars();
    const { ads } = useCarouselAds();

    const carsByCategory = useMemo(() => {
        const grouped: Record<string, typeof cars> = {};
        cars.forEach(car => {
            if (!grouped[car.category]) {
                grouped[car.category] = [];
            }
            grouped[car.category].push(car);
        });
        return grouped;
    }, [cars]);

    const handleRefresh = async () => {
        await refetch();
    };

    if (loading) {
        return (
            <div className="space-y-8 p-4">
                {/* Hero Skeleton */}
                <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
                    <Skeleton className="w-full h-full" />
                </div>

                {/* Categories Skeleton */}
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
                {/* Hero Carousel - Shows ads if available, otherwise shows default hero */}
                {ads.length > 0 ? (
                    <HeroCarousel ads={ads} />
                ) : (
                    <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8 bg-primary/10">
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 bg-gradient-to-r from-primary/80 to-primary/40 text-white">
                            <h1 className="text-3xl md:text-5xl text-black font-bold mb-2">سوق السيارات</h1>
                            <p className="text-lg text-black">اعثر على سيارة أحلامك بأفضل الأسعار</p>
                        </div>
                    </div>
                )}

                {Object.keys(carsByCategory).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        لا توجد سيارات معروضة حالياً.
                    </div>
                )}

                {Object.entries(carsByCategory).map(([category, categoryCars]) => (
                    <section key={category} className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-2xl font-bold">{category}</h2>
                            <Link to={`/filter?category=${category}`} className="text-primary  text-sm hover:underline">
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
