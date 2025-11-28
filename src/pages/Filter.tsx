import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCars } from '../hooks/useCars';
import CarCard from '../components/CarCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Filter as FilterIcon, X } from 'lucide-react';

const FilterPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { cars, loading } = useCars();
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState<'rent' | 'sell' | 'both' | ''>('');
    const [color, setColor] = useState('');

    // Apply filters
    const filteredCars = cars.filter(car => {
        if (category && !car.category.includes(category)) return false;
        if (year && car.year !== parseInt(year)) return false;
        if (color && !car.color.includes(color)) return false;

        // Type filter
        if (type && type !== 'both') {
            if (type === 'rent' && car.renting_type === 'sell') return false;
            if (type === 'sell' && car.renting_type === 'rent') return false;
        }

        // Price filter (check sell price or rent price depending on type, or any if not specified)
        // This is a bit complex because a car can be both.
        // If user filters by price, we check if ANY of the prices match.
        const prices = [
            car.sell_price,
            car.rent_price_daily,
            car.rent_price_weekly,
            car.rent_price_monthly,
            car.rent_price_yearly
        ].filter(p => p !== undefined && p !== null) as number[];

        if (prices.length === 0) return true; // No price set, maybe show it?

        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;

        const hasMatchingPrice = prices.some(p => p >= min && p <= max);
        if (!hasMatchingPrice) return false;

        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">بحث متقدم</h1>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                    <FilterIcon className="w-4 h-4 ml-2" />
                    تصفية
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <aside className={`md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-card p-4 rounded-lg border space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">التصنيف</label>
                            <Input
                                placeholder="مثال: تويوتا، سيدان..."
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">السنة</label>
                            <Input
                                type="number"
                                placeholder="2024"
                                value={year}
                                onChange={e => setYear(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">نوع العرض</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={type}
                                onChange={(e) => setType(e.target.value as any)}
                            >
                                <option value="">الكل</option>
                                <option value="rent">إيجار</option>
                                <option value="sell">بيع</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">اللون</label>
                            <Input
                                placeholder="أحمر، أبيض..."
                                value={color}
                                onChange={e => setColor(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">أقل سعر</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">أعلى سعر</label>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                                setCategory('');
                                setYear('');
                                setType('');
                                setColor('');
                                setMinPrice('');
                                setMaxPrice('');
                            }}
                        >
                            إعادة تعيين
                        </Button>
                    </div>
                </aside>

                {/* Results Grid */}
                <div className="flex-1">
                    <div className="mb-4 text-muted-foreground">
                        تم العثور على {filteredCars.length} سيارة
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCars.map(car => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterPage;
