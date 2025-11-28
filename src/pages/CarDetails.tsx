import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Car } from '../types/index.ts';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

const CarDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        async function fetchCar() {
            if (!id) return;
            const { data } = await supabase
                .from('cars')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setCar(data);
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                }
            }
            setLoading(false);
        }
        fetchCar();
    }, [id]);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!car) return <div className="text-center p-10">السيارة غير موجودة</div>;

    const formatPrice = (price?: number) => {
        if (!price) return 'غير محدد';
        return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(price);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
                <ArrowRight size={16} />
                عودة
            </Button>

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
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        </div>
    );
};

export default CarDetails;
