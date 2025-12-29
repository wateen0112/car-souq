import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { CarouselAd } from '../types/index.ts';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Save, X, Trash2, Loader2, MoveUp, MoveDown, ArrowRight } from 'lucide-react';

const AdminCarouselAds: React.FC = () => {
    const [ads, setAds] = useState<CarouselAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAd, setNewAd] = useState({ title: '', image_url: '', link_url: '' });
    const navigate = useNavigate();

    const [uploading, setUploading] = useState(false);

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
            const adsRef = collection(db, 'carousel_ads');
            const q = query(adsRef, orderBy('order_position', 'asc'));
            const querySnapshot = await getDocs(q);
            const adsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CarouselAd[];
            setAds(adsData);
        } catch (error) {
            console.error('Error fetching ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `ads/${fileName}`);

        setUploading(true);

        try {
            await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(storageRef);
            setNewAd({ ...newAd, image_url: publicUrl });
        } catch (error) {
            alert('حدث خطأ أثناء رفع الصورة');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = async () => {
        if (!newAd.title || !newAd.image_url) {
            alert('يرجى إدخال العنوان واختيار الصورة');
            return;
        }

        const maxOrder = ads.length > 0 ? Math.max(...ads.map(a => a.order_position)) : 0;

        try {
            const adData = {
                title: newAd.title,
                image_url: newAd.image_url,
                link_url: newAd.link_url || null,
                order_position: maxOrder + 1,
                is_active: true,
                created_at: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'carousel_ads'), adData);
            setAds([...ads, { id: docRef.id, ...adData } as any]);
            setNewAd({ title: '', image_url: '', link_url: '' });
            setIsAdding(false);
        } catch (error) {
            console.error('Error adding ad:', error);
            alert('حدث خطأ أثناء الإضافة');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

        try {
            await deleteDoc(doc(db, 'carousel_ads', id));
            setAds(ads.filter(ad => ad.id !== id));
        } catch (error) {
            console.error('Error deleting ad:', error);
            alert('حدث خطأ أثناء الحذف');
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, 'carousel_ads', id), { is_active: !currentStatus });
            setAds(ads.map(ad => ad.id === id ? { ...ad, is_active: !currentStatus } : ad));
        } catch (error) {
            console.error('Error toggling ad status:', error);
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;

        const newAds = [...ads];
        const temp = newAds[index];
        newAds[index] = newAds[index - 1];
        newAds[index - 1] = temp;

        try {
            await Promise.all([
                updateDoc(doc(db, 'carousel_ads', newAds[index].id), { order_position: index }),
                updateDoc(doc(db, 'carousel_ads', newAds[index - 1].id), { order_position: index - 1 }),
            ]);
            setAds(newAds);
        } catch (error) {
            console.error('Error moving ad up:', error);
        }
    };

    const handleMoveDown = async (index: number) => {
        if (index === ads.length - 1) return;

        const newAds = [...ads];
        const temp = newAds[index];
        newAds[index] = newAds[index + 1];
        newAds[index + 1] = temp;

        try {
            await Promise.all([
                updateDoc(doc(db, 'carousel_ads', newAds[index + 1].id), { order_position: index + 1 }),
                updateDoc(doc(db, 'carousel_ads', newAds[index].id), { order_position: index }),
            ]);
            setAds(newAds);
        } catch (error) {
            console.error('Error moving ad down:', error);
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
                                    disabled={uploading}
                                    className="cursor-pointer"
                                />
                                {uploading && <Loader2 className="animate-spin text-primary" />}
                            </div>
                            {newAd.image_url && (
                                <div className="mt-2 relative w-full h-40 bg-muted rounded-lg overflow-hidden border">
                                    <img
                                        src={newAd.image_url}
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
                                value={newAd.link_url}
                                onChange={e => setNewAd({ ...newAd, link_url: e.target.value })}
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
                            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{ad.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                                {ad.link_url ? `الرابط: ${ad.link_url}` : 'بدون رابط'}
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
                                onClick={() => handleToggleActive(ad.id, ad.is_active)}
                            >
                                {ad.is_active ? '👁️' : '🙈'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(ad.id)}
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
