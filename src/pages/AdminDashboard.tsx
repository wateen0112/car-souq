import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Car } from '../types/index.ts';
import { Button } from '../components/ui/Button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = localStorage.getItem('admin_session') === 'true';
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        fetchCars();
    }, [navigate]);

    const fetchCars = async () => {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        if (data) setCars(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه السيارة؟')) return;

        const { error } = await supabase.from('cars').delete().eq('id', id);
        if (!error) {
            setCars(cars.filter(c => c.id !== id));
        } else {
            alert('حدث خطأ أثناء الحذف');
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">لوحة التحكم</h1>
                <Link to="/admin/cars/new">
                    <Button className="gap-2">
                        <Plus size={16} />
                        إضافة سيارة
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">الصورة</th>
                            <th className="p-4 font-medium">العنوان</th>
                            <th className="p-4 font-medium">التصنيف</th>
                            <th className="p-4 font-medium">السعر (بيع)</th>
                            <th className="p-4 font-medium">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {cars.map(car => (
                            <tr key={car.id} className="bg-card hover:bg-muted/50 transition-colors">
                                <td className="p-4">
                                    <div className="w-16 h-12 rounded bg-muted overflow-hidden">
                                        {car.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{car.title}</td>
                                <td className="p-4">{car.category}</td>
                                <td className="p-4">{car.sell_price ? car.sell_price.toLocaleString() : '-'}</td>
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
                                            onClick={() => handleDelete(car.id)}
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
        </div>
    );
};

export default AdminDashboard;
