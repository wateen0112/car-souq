import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Car } from '../types/index.ts';
import { ArrowRight, Check, Share2, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import PullToRefreshContainer from '../components/PullToRefreshContainer';
import CarCard from '../components/CarCard';

const CarDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [suggestedCars, setSuggestedCars] = useState<Car[]>([]);
    const [suggestedLoading, setSuggestedLoading] = useState(false);

    const fetchCar = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const carDoc = await getDoc(doc(db, 'cars', id));
            if (carDoc.exists()) {
                const data = carDoc.data() as Car;
                setCar({ ...data, id: carDoc.id });
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching car:', error);
        }
        setLoading(false);
    }, [id]);

    const fetchSuggestedCars = useCallback(async () => {
        if (!car) return;
        setSuggestedLoading(true);
        try {
            const carsRef = collection(db, 'cars');
            const q = query(
                carsRef,
                where('category', '==', car.category),
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            const suggestedData = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Car))
                .filter(c => c.id !== car.id)
                .slice(0, 4);

            setSuggestedCars(suggestedData);
        } catch (error) {
            console.error('Error fetching suggested cars:', error);
        }
        setSuggestedLoading(false);
    }, [car]);

    useEffect(() => {
        fetchCar();
    }, [fetchCar]);

    useEffect(() => {
        if (car) {
            fetchSuggestedCars();
        }
    }, [car, fetchSuggestedCars]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto pb-20 space-y-8 p-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-24" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-20 rounded-lg" />)}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!car) return <div className="text-center p-10">السيارة غير موجودة</div>;

    const formatPrice = (price?: number) => {
        if (!price) return 'غير محدد';
        return new Intl.NumberFormat('en', { style: 'currency', currency: 'usd' }).format(price);
    };

    return (
        <PullToRefreshContainer onRefresh={fetchCar} className="h-full">
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowRight size={16} />
                        عودة
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: car.title,
                                    text: `شاهد هذه السيارة: ${car.title}`,
                                    url: window.location.href
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('تم نسخ الرابط');
                            }
                        }} title="مشاركة">
                            <Share2 size={18} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => {
                            const text = encodeURIComponent(`شاهد هذه السيارة: ${car.title}\n${window.location.href}`);
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                        }} title="واتساب" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                            <MessageCircle size={18} />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => {
                            const text = encodeURIComponent(`شاهد هذه السيارة: ${car.title}`);
                            const url = encodeURIComponent(window.location.href);
                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                        }} title="X (تويتر)" className="text-black hover:bg-gray-50">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => {
                            const url = encodeURIComponent(window.location.href);
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                        }} title="فيسبوك" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Images Section */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden border bg-muted relative">
                            {selectedImage ? (
                                <img src={selectedImage} alt={car.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">لا توجد صور</div>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {car.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{car.title}</h1>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                    {car.category}
                                </span>
                                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                    {car.year}
                                </span>
                                <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: car.color }}></div>
                                    {car.color}
                                </span>
                            </div>
                        </div>

                        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
                            <h3 className="font-semibold text-lg">الأسعار</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {car.sell_price && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">سعر البيع</span>
                                        <div className="text-xl font-bold text-primary">{formatPrice(car.sell_price)}</div>
                                    </div>
                                )}
                                {car.rent_price_daily && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">إيجار يومي</span>
                                        <div className="text-xl font-bold text-primary">{formatPrice(car.rent_price_daily)}</div>
                                    </div>
                                )}
                                {car.rent_price_weekly && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">إيجار أسبوعي</span>
                                        <div className="text-xl font-bold text-primary">{formatPrice(car.rent_price_weekly)}</div>
                                    </div>
                                )}
                                {car.rent_price_monthly && (
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground">إيجار شهري</span>
                                        <div className="text-xl font-bold text-primary">{formatPrice(car.rent_price_monthly)}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">الوصف</h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {car.description || 'لا يوجد وصف متاح.'}
                            </p>
                        </div>

                        {car.extra_features && car.extra_features.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">المميزات الإضافية</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {car.extra_features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Check className="w-4 h-4 text-primary" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Suggested Cars Section */}
                {suggestedCars.length > 0 && (
                    <div className="mt-12 space-y-6">
                        <h2 className="text-2xl font-bold text-right">سيارات مقترحة</h2>
                        {suggestedLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {suggestedCars.map((suggestedCar) => (
                                    <CarCard key={suggestedCar.id} car={suggestedCar} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PullToRefreshContainer>
    );
};

export default CarDetails;
