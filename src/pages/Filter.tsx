import React, { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useCars } from '../hooks/useCars';
import CarCard from '../components/CarCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Filter as FilterIcon } from 'lucide-react';
import PullToRefreshContainer from '../components/PullToRefreshContainer';

const FilterPage: React.FC = () => {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const { cars, loading, refetch } = useCars(userId);
    const [showFilters, setShowFilters] = useState(false);
    localStorage.setItem('user-id', userId ?? '')
    // Filter states
    const [searchName, setSearchName] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState<'rent' | 'sale' | 'both' | ''>('');

    // Apply filters
    const filteredCars = cars.filter(car => {
        // Search by name/title
        if (searchName && !car.title.toLowerCase().includes(searchName.toLowerCase())) return false;

        // Search by category (type or model)
        if (category) {
            const catLower = category.toLowerCase();
            const matchesType = car.type && car.type.toLowerCase().includes(catLower);
            const matchesModel = car.model && car.model.toLowerCase().includes(catLower);
            if (!matchesType && !matchesModel) return false;
        }

        if (year && car.manufacture_year !== parseInt(year)) return false;

        // Type filter: 'sale', 'rent', or 'both'
        if (type && type !== 'both') {
            if (type === 'sale' && car.listing_type === 'rent') return false;
            // If user wants rent, excludes 'sale' only cars
            if (type === 'rent' && car.listing_type === 'sale') return false;
        }

        // Price filter
        const prices = [
            car.sale_price,
            car.daily_rent_price,
            car.weekly_rent_price,
            car.monthly_rent_price
        ].filter(p => p !== undefined && p !== null) as number[];

        if (prices.length === 0) return true;

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
                            <label className="text-sm font-medium mb-1.5 block">البحث بالاسم</label>
                            <Input
                                placeholder="ابحث عن سيارة..."
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                            />
                        </div>

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
                                <option value="sale">بيع</option>
                            </select>
                        </div>

                        {/* Color filter removed as it's not in API response */}

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
                                setSearchName('');
                                setCategory('');
                                setYear('');
                                setType('');
                                setMinPrice('');
                                setMaxPrice('');
                            }}
                        >
                            إعادة تعيين
                        </Button>
                    </div>
                </aside>


                {/* Results Grid */}
                <PullToRefreshContainer onRefresh={refetch} className="flex-1">
                    <div className="mb-4 text-muted-foreground">
                        تم العثور على {filteredCars.length} سيارة
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex flex-col space-y-3">
                                    <Skeleton className="h-48 w-full rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCars.map(car => (
                                <CarCard key={car.id} car={car} />
                            ))}
                        </div>
                    )}
                </PullToRefreshContainer>
            </div>
        </div>
    );
};

export default FilterPage;
