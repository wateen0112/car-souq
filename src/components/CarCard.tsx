import React from 'react';
import { Link } from 'react-router-dom';
import type { Car } from '../../api';

interface CarCardProps {
    car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
    const mainImage = car.images && car.images.length > 0
        ? car.images[0]
        : null;

    const formatPrice = (price?: number | null) => {
        if (price === undefined || price === null) return 'غير محدد';
        return new Intl.NumberFormat('en', { style: 'currency', currency: 'usd' }).format(price);
    };

    return (
        <Link to={`/${localStorage.getItem('user-id')}/car/${car.id}`} className="block group">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-[4/3] relative overflow-hidden bg-muted flex items-center justify-center">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={car.title}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        {car.listing_type === 'sale' ? 'بيع' : car.listing_type === 'rent' ? 'إيجار' : 'بيع وإيجار'}
                    </div>
                </div>
                <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg line-clamp-1">{car.title}</h3>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                            {car.manufacture_year}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span>{car.type}</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t mt-2">
                        {car.listing_type === 'sale' || car.listing_type === 'both' ? (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">سعر البيع</span>
                                <span className="font-bold text-primary">{formatPrice(car.sale_price)}</span>
                            </div>
                        ) : null}

                        {car.listing_type === 'rent' || car.listing_type === 'both' ? (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-muted-foreground">الإيجار اليومي</span>
                                <span className="font-bold text-primary">{formatPrice(car.daily_rent_price)}</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CarCard;
