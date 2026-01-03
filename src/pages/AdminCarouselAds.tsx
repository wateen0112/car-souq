import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type CarouselItem } from '../../api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Save, X, Trash2, Loader2, MoveUp, MoveDown, ArrowRight } from 'lucide-react';

const AdminCarouselAds: React.FC = () => {
    const [ads, setAds] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAd, setNewAd] = useState<{
        title: string;
        image: string;
        link: string;
        imageFile: File | null;
    }>({ title: '', image: '', link: '', imageFile: null });

    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = localStorage.getItem('admin_session') === 'true';
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        fetchAds();
    }, [navigate]);

    const fetchAds = async () => {
        try {
            const response = await api.getCarouselItems();
            const adsData = response.data || response;
            // Ensure order_position sort
            const sortedAds = Array.isArray(adsData) ? adsData.sort((a: CarouselItem, b: CarouselItem) =>
                (a.order_position || 0) - (b.order_position || 0)
            ) : [];
            setAds(sortedAds);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);

        setNewAd(prev => ({
            ...prev,
            imageFile: file,
            image: previewUrl
        }));
    };

    const handleAdd = async () => {
        if (!newAd.title || !newAd.imageFile) {
            alert('يرجى إدخال العنوان واختيار الصورة');
            return;
        }

        const maxOrder = ads.length > 0 ? Math.max(...ads.map(a => a.order_position || 0)) : 0;

        try {
            const formData = new FormData();
            formData.append('title', newAd.title);
            formData.append('image', newAd.imageFile);
            if (newAd.link) formData.append('link', newAd.link);
            formData.append('order_position', (maxOrder + 1).toString());
            // is_active defaults to true usually, or send it
            formData.append('is_active', '1');

            await api.createCarouselItem(formData);

            // Refresh list
            fetchAds();

            setNewAd({ title: '', image: '', link: '', imageFile: null });
            setIsAdding(false);
        } catch (error) {
            console.error('Error adding ad:', error);
            alert('حدث خطأ أثناء الإضافة');
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id || !window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

        try {
            await api.deleteCarouselItem(id);
            setAds(ads.filter(ad => ad.id !== id));
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    };

    const handleToggleActive = async (id: string, currentStatus?: boolean) => {
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('is_active', (!currentStatus ? '1' : '0'));

            await api.updateCarouselItem(id, formData);

            setAds(ads.map(ad => ad.id === id ? { ...ad, is_active: !currentStatus } : ad));
        } catch (error) {
            console.error('Error toggling ad status:', error);
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;

        const currentAd = ads[index];
        const prevAd = ads[index - 1];
        if (!currentAd.id || !prevAd.id) return;

        // Swap order in UI instantly
        const newAds = [...ads];
        newAds[index] = prevAd;
        newAds[index - 1] = currentAd;

        // Update order values locally
        const currentOrder = currentAd.order_position;
        const prevOrder = prevAd.order_position;
        newAds[index].order_position = currentOrder;
        newAds[index - 1].order_position = prevOrder; // swap values implies logical swap?
        // Actually, we want to swap their order_positions.
        // Let's assume order_position creates the sort.

        // Better implementation: Just swap items in array AND swap their order_position properties then save.
        const tempOrder = newAds[index].order_position;
        newAds[index].order_position = newAds[index - 1].order_position;
        newAds[index - 1].order_position = tempOrder;

        setAds([...newAds]);

        try {
            // Update backend
            const form1 = new FormData();
            form1.append('_method', 'PUT');
            form1.append('order_position', newAds[index].order_position!.toString());

            const form2 = new FormData();
            form2.append('_method', 'PUT');
            form2.append('order_position', newAds[index - 1].order_position!.toString());

            await Promise.all([
                api.updateCarouselItem(newAds[index].id!, form1),
                api.updateCarouselItem(newAds[index - 1].id!, form2),
            ]);
        } catch (error) {
            console.error('Error moving ad up:', error);
            fetchAds(); // Revert on error
        }
    };

    const handleMoveDown = async (index: number) => {
        if (index === ads.length - 1) return;

        const currentAd = ads[index];
        const nextAd = ads[index + 1];
        if (!currentAd.id || !nextAd.id) return;

        const newAds = [...ads];
        newAds[index] = nextAd;
        newAds[index + 1] = currentAd;

        const tempOrder = newAds[index].order_position;
        newAds[index].order_position = newAds[index + 1].order_position;
        newAds[index + 1].order_position = tempOrder;

        setAds([...newAds]);

        try {
            const form1 = new FormData();
            form1.append('_method', 'PUT');
            form1.append('order_position', newAds[index].order_position!.toString());

            const form2 = new FormData();
            form2.append('_method', 'PUT');
            form2.append('order_position', newAds[index + 1].order_position!.toString());

            await Promise.all([
                api.updateCarouselItem(newAds[index].id!, form1),
                api.updateCarouselItem(newAds[index + 1].id!, form2),
            ]);
        } catch (error) {
            console.error('Error moving ad down:', error);
            fetchAds();
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="border rounded-lg p-4 flex items-center gap-4">
                            <Skeleton className="w-32 h-20 rounded" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <div className="flex gap-1">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
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
                    <Link to="/admin/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowRight size={16} />

                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">إدارة الإعلانات</h1>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="gap-2 w-full md:w-auto">
                        <Plus size={16} />
                        إضافة إعلان
                    </Button>
                )}
            </div>

            {/* Add New Ad Form */}
            {isAdding && (
                <div className="bg-card border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">إضافة إعلان جديد</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                            <X size={20} />
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">عنوان الإعلان *</label>
                            <Input
                                placeholder="مثال: عرض خاص على السيارات الجديدة"
                                value={newAd.title}
                                onChange={e => setNewAd({ ...newAd, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">صورة الإعلان *</label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="cursor-pointer"
                                />
                            </div>
                            {newAd.image && (
                                <div className="mt-2 relative w-full h-40 bg-muted rounded-lg overflow-hidden border">
                                    <img
                                        src={newAd.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">رابط التوجيه (اختياري)</label>
                            <Input
                                placeholder="/filter أو https://example.com"
                                value={newAd.link}
                                onChange={e => setNewAd({ ...newAd, link: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                الرابط الذي سيتم فتحه عند النقر على الإعلان
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleAdd} className="gap-2">
                                <Save size={16} />
                                حفظ الإعلان
                            </Button>
                            <Button variant="outline" onClick={() => setIsAdding(false)}>
                                إلغاء
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ads List */}
            <div className="space-y-4">
                {ads.map((ad, index) => (
                    <div key={ad.id} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                        {/* Preview Image */}
                        <div className="w-32 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{ad.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                                {ad.link ? `الرابط: ${ad.link}` : 'بدون رابط'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {ad.is_active ? 'نشط' : 'معطل'}
                                </span>
                                <span className="text-xs text-muted-foreground">الترتيب: {index + 1}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                            >
                                <MoveUp size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === ads.length - 1}
                            >
                                <MoveDown size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => ad.id && handleToggleActive(ad.id, ad.is_active)}
                            >
                                {ad.is_active ? '👁️' : '🙈'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => ad.id && handleDelete(ad.id)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}

                {ads.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border rounded-lg">
                        لا توجد إعلانات. انقر على "إضافة إعلان" للبدء.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCarouselAds;
