import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, X, Upload, Check } from 'lucide-react';

// Static categories
const CATEGORIES = [
    'سيدان',
    'دفع رباعي (SUV)',
    'هاتشباك',
    'كوبيه',
    'شاحنة (بيك آب)',
    'ميني فان',
    'رياضية',
    'كهربائية',
    'هجينة'
];

// Static features
const AVAILABLE_FEATURES = [
    'فتحة سقف',
    'مقاعد جلد',
    'نظام ملاحة GPS',
    'كاميرا خلفية',
    'حساسات ركن',
    'مثبت سرعة',
    'نظام صوتي متطور',
    'شاشة لمس',
    'مقاعد كهربائية',
    'تكييف أوتوماتيكي',
    'فتحات تهوية خلفية',
    'إضاءة LED',
    'نظام تحذير النقطة العمياء',
    'نظام الفرامل الذكي',
    'مفتاح ذكي',
    'تحكم صوتي',
    'Apple CarPlay',
    'Android Auto',
    'شحن لاسلكي',
    'عجلات رياضية'
];

const AdminCarForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        category: '',
        color: '',
        renting_type: 'sell',
        rent_price_daily: '',
        rent_price_weekly: '',
        rent_price_monthly: '',
        rent_price_yearly: '',
        sell_price: '',
        extra_features: [] as string[],
        images: [] as string[]
    });

    useEffect(() => {
        const checkAuth = () => {
            if (localStorage.getItem('admin_session') !== 'true') {
                navigate('/admin/login');
            }
        };
        checkAuth();

        if (isEdit) {
            fetchCar();
        }
    }, [id]);

    const fetchCar = async () => {
        setLoading(true);
        const { data } = await supabase.from('cars').select('*').eq('id', id).single();
        if (data) {
            setFormData({
                ...data,
                rent_price_daily: data.rent_price_daily || '',
                rent_price_weekly: data.rent_price_weekly || '',
                rent_price_monthly: data.rent_price_monthly || '',
                rent_price_yearly: data.rent_price_yearly || '',
                sell_price: data.sell_price || '',
            });
        }
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newImages: string[] = [];

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('car-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                continue;
            }

            const { data } = supabase.storage.from('car-images').getPublicUrl(filePath);
            if (data) {
                newImages.push(data.publicUrl);
            }
        }

        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            extra_features: prev.extra_features.includes(feature)
                ? prev.extra_features.filter(f => f !== feature)
                : [...prev.extra_features, feature]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            rent_price_daily: formData.rent_price_daily ? Number(formData.rent_price_daily) : null,
            rent_price_weekly: formData.rent_price_weekly ? Number(formData.rent_price_weekly) : null,
            rent_price_monthly: formData.rent_price_monthly ? Number(formData.rent_price_monthly) : null,
            rent_price_yearly: formData.rent_price_yearly ? Number(formData.rent_price_yearly) : null,
            sell_price: formData.sell_price ? Number(formData.sell_price) : null,
        };

        let error;
        if (isEdit) {
            const { error: err } = await supabase.from('cars').update(payload).eq('id', id);
            error = err;
        } else {
            const { error: err } = await supabase.from('cars').insert([payload]);
            error = err;
        }

        setLoading(false);
        if (!error) {
            navigate('/admin/dashboard');
        } else {
            alert('حدث خطأ: ' + error.message);
        }
    };

    if (loading && isEdit) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <h1 className="text-2xl font-bold mb-6">{isEdit ? 'تعديل سيارة' : 'إضافة سيارة جديدة'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <h2 className="font-semibold text-lg">المعلومات الأساسية</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">عنوان الإعلان</label>
                            <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        {/* Category Dropdown */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium">التصنيف</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <span className={formData.category ? '' : 'text-muted-foreground'}>
                                        {formData.category || 'اختر التصنيف'}
                                    </span>
                                    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showCategoryDropdown && (
                                    <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                                        <div className="bg-white  z-50 max-h-60 overflow-auto p-1">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, category: cat });
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                    className="w-full text-right px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">السنة</label>
                            <Input type="number" required value={formData.year} onChange={e => setFormData({ ...formData, year: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">اللون</label>
                            <Input required value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">الوصف</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <h2 className="font-semibold text-lg">الأسعار ونوع العرض</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">نوع العرض</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.renting_type}
                            onChange={(e) => setFormData({ ...formData, renting_type: e.target.value })}
                        >
                            <option value="sell">بيع فقط</option>
                            <option value="rent">إيجار فقط</option>
                            <option value="both">بيع وإيجار</option>
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {(formData.renting_type === 'sell' || formData.renting_type === 'both') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">سعر البيع</label>
                                <Input type="number" value={formData.sell_price} onChange={e => setFormData({ ...formData, sell_price: e.target.value })} />
                            </div>
                        )}

                        {(formData.renting_type === 'rent' || formData.renting_type === 'both') && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">إيجار يومي</label>
                                    <Input type="number" value={formData.rent_price_daily} onChange={e => setFormData({ ...formData, rent_price_daily: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">إيجار أسبوعي</label>
                                    <Input type="number" value={formData.rent_price_weekly} onChange={e => setFormData({ ...formData, rent_price_weekly: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">إيجار شهري</label>
                                    <Input type="number" value={formData.rent_price_monthly} onChange={e => setFormData({ ...formData, rent_price_monthly: e.target.value })} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <h2 className="font-semibold text-lg">الصور</h2>

                    <div className="grid grid-cols-3 gap-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer transition-colors bg-muted/50">
                            {uploading ? <Loader2 className="animate-spin" /> : <Upload className="text-muted-foreground" />}
                            <span className="text-xs text-muted-foreground mt-2">رفع صور</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                    </div>
                </div>

                {/* Features Multi-Select Dropdown */}
                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <h2 className="font-semibold text-lg">مميزات إضافية</h2>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowFeaturesDropdown(!showFeaturesDropdown)}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <span className="text-muted-foreground">
                                {formData.extra_features.length > 0
                                    ? `تم اختيار ${formData.extra_features.length} ميزة`
                                    : 'اختر المميزات'}
                            </span>
                            <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showFeaturesDropdown && (
                            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                                <div className=" bg-white  z-50 max-h-60 overflow-auto p-1">
                                    {AVAILABLE_FEATURES.map((feature) => (
                                        <button
                                            key={feature}
                                            type="button"
                                            onClick={() => toggleFeature(feature)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                                        >
                                            <span>{feature}</span>
                                            {formData.extra_features.includes(feature) && (
                                                <Check size={16} className="text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {formData.extra_features.map((feature, idx) => (
                            <div key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {feature}
                                <button type="button" onClick={() => toggleFeature(feature)} className="hover:text-destructive">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isEdit ? 'حفظ التغييرات' : 'إضافة السيارة'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>إلغاء</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminCarForm;
