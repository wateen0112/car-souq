import React, { useMemo } from 'react';
import { useCars } from '../hooks/useCars';
import { useCarouselAds } from '../hooks/useCarouselAds';
import CarCard from '../components/CarCard';
import HeroCarousel from '../components/HeroCarousel';
import { Loader2 } from 'lucide-react';
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
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
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
                            <Link to={`/filter?category=${category}`} className="text-primary text-sm hover:underline">
                                عرض الكل
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 scrollbar-hide snap-x">
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
