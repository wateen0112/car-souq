import React from 'react';
import { Link } from 'react-router-dom';
import type { Car } from '../types/index.ts';

interface CarCardProps {
    car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
    const mainImage = car.images && car.images.length > 0
        ? car.images[0]
        : 'https://placehold.co/600x400?text=No+Image';

    const formatPrice = (price?: number) => {
        if (!price) return 'غير محدد';
        return new Intl.NumberFormat('en', { style: 'currency', currency: 'usd' }).format(price);
    };

    return (
        <Link to={`/car/${car.id}`} className="block group">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                        src={mainImage}
                        alt={car.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        {car.renting_type === 'sell' ? 'بيع' : car.renting_type === 'rent' ? 'إيجار' : 'بيع وإيجار'}
                    </div>
                </div>
                <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg line-clamp-1">{car.title}</h3>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                            {car.year}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {/* <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: car.color }}></span>
                            <span>{car.color}</span>
                        </div> */}
                        <div className="flex items-center gap-1">
                            <span>{car.category}</span>
                        </div>
                    </div>

                    <div className="pt-2 border-t mt-2">
                        {car.renting_type === 'sell' || car.renting_type === 'both' ? (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">سعر البيع</span>
                                <span className="font-bold text-primary">{formatPrice(car.sell_price)}</span>
                            </div>
                        ) : null}

                        {car.renting_type === 'rent' || car.renting_type === 'both' ? (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-sm text-muted-foreground">الإيجار اليومي</span>
                                <span className="font-bold text-primary">{formatPrice(car.rent_price_daily)}</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CarCard;
