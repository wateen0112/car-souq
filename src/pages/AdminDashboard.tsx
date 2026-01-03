import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type User } from '../../api';
import { useCars } from '../hooks/useCars';
import { useCarouselAds } from '../hooks/useCarouselAds';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Pencil, Trash2, ImageIcon, ArrowRight, Car, LayoutDashboard } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    // Pass user ID to hooks. They will re-fetch when user is set.
    const { cars, loading: carsLoading, refetch: refetchCars } = useCars(user?.id?.toString());
    const { ads, loading: adsLoading, refetch: refetchAds } = useCarouselAds(user?.id?.toString());
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            try {
                const response = await api.getUser();
                console.log('AdminDashboard: getUser response:', response);

                // Handle response unwrapping (some APIs return { data: User }, others return User directly)
                const userData = response.data || response;

                if (!userData || !userData.id) {
                    console.error('AdminDashboard: Invalid user data received', userData);
                    throw new Error('Invalid user data');
                }

                setUser(userData);

                // Store user-id for other API calls that depend on it
                localStorage.setItem('user-id', userData.id.toString());
            } catch (error) {
                console.error('Error fetching user data:', error);
                // If token is invalid, redirect to login
                localStorage.removeItem('token');
                navigate('/admin/login');
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);


    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه السيارة؟')) return;

        try {
            await api.deleteCar(id);
            refetchCars(); // Refetch list after deletion
        } catch (error) {
            console.error('Error deleting car:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    };

    if (userLoading || carsLoading || adsLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                {/* Desktop Skeleton */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                    <div className="p-4 bg-muted/50 border-b flex justify-between">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-6 w-24" />)}
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-4 border-b flex justify-between items-center">
                            <Skeleton className="h-12 w-16" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Skeleton */}
                <div className="md:hidden space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border rounded-lg p-4 flex gap-4">
                            <Skeleton className="h-24 w-24 rounded-lg" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-5 w-1/3" />
                                <div className="flex justify-end gap-2 pt-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowRight size={16} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link to="/admin/carousel" className="flex-1 md:flex-none">
                        <Button variant="outline" className="gap-2 w-full md:w-auto">
                            <ImageIcon size={16} />
                            إدارة الإعلانات
                        </Button>
                    </Link>
                    <Link to="/admin/cars/new" className="flex-1 md:flex-none">
                        <Button className="gap-2 w-full md:w-auto">
                            <Plus size={16} />
                            إضافة سيارة
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Car size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">إجمالي السيارات</p>
                        <p className="text-2xl font-bold">{cars.length}</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">إعلانات Carousel</p>
                        <p className="text-2xl font-bold">{ads.length}</p>
                    </div>
                </div>
                {user && (
                    <div className="bg-card p-6 rounded-xl border flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">أهلاً، {user.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">الصورة</th>
                            <th className="p-4 font-medium">العنوان</th>
                            <th className="p-4 font-medium">النوع</th>
                            <th className="p-4 font-medium">السعر</th>
                            <th className="p-4 font-medium">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-foreground">
                        {cars.map(car => (
                            <tr key={car.id} className="bg-card hover:bg-muted/50 transition-colors">
                                <td className="p-4">
                                    <div className="w-16 h-12 rounded bg-muted overflow-hidden">
                                        {car.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{car.title}</td>
                                <td className="p-4">{car.type}</td>
                                <td className="p-4">
                                    {car.listing_type === 'sale' && car.sale_price ? `${car.sale_price.toLocaleString()} $` :
                                        car.listing_type === 'rent' && car.daily_rent_price ? `${car.daily_rent_price.toLocaleString()} $/يوم` :
                                            'متعدد'}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/admin/cars/edit/${car.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil size={14} />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => car.id && handleDelete(car.id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {cars.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    لا توجد سيارات مضافة بعد.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {cars.map(car => (
                    <div key={car.id} className="bg-card border rounded-lg p-4 flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {car.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold truncate">{car.title}</h3>
                                <p className="text-sm text-muted-foreground">{car.type}</p>
                                <p className="text-sm font-medium text-primary mt-1">
                                    {car.listing_type === 'sale' && car.sale_price ? `${car.sale_price.toLocaleString()} $` :
                                        car.listing_type === 'rent' && car.daily_rent_price ? `${car.daily_rent_price.toLocaleString()} $/يوم` :
                                            'متعدد'}
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <Link to={`/admin/cars/edit/${car.id}`}>
                                    <Button variant="outline" size="sm" className="h-8 gap-1">
                                        <Pencil size={14} />
                                        تعديل
                                    </Button>
                                </Link>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={() => car.id && handleDelete(car.id)}
                                >
                                    <Trash2 size={14} />
                                    حذف
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                {cars.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border rounded-lg">
                        لا توجد سيارات مضافة بعد.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
