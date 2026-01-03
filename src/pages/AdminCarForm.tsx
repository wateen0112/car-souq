import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Loader2, X, Upload, Check, ArrowRight } from 'lucide-react';

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

interface ImageItem {
    url: string;
    file?: File;
}

const AdminCarForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

    const [images, setImages] = useState<ImageItem[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        manufacture_year: new Date().getFullYear(),
        type: '',
        model: '',
        listing_type: 'sale' as 'sale' | 'rent' | 'both',
        daily_rent_price: '',
        weekly_rent_price: '',
        monthly_rent_price: '',
        sale_price: '',
        additional_features: [] as string[],
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
        if (!id) return;
        setLoading(true);
        try {
            const response = await api.getCar(id);
            const data = response.data || response;

            // Handle potentially nested pricing object or flat structure
            const salePrice = data.pricing?.sale_price ?? data.sale_price;
            const dailyPrice = data.pricing?.daily_rent_price ?? data.daily_rent_price;
            const weeklyPrice = data.pricing?.weekly_rent_price ?? data.weekly_rent_price;
            const monthlyPrice = data.pricing?.monthly_rent_price ?? data.monthly_rent_price;

            setFormData({
                title: data.title || '',
                description: data.description || '',
                manufacture_year: data.manufacture_year || new Date().getFullYear(),
                type: data.type || '',
                model: data.model || '',
                listing_type: data.listing_type || 'sale',
                sale_price: salePrice ? String(salePrice) : '',
                daily_rent_price: dailyPrice ? String(dailyPrice) : '',
                weekly_rent_price: weeklyPrice ? String(weeklyPrice) : '',
                monthly_rent_price: monthlyPrice ? String(monthlyPrice) : '',
                additional_features: data.additional_features || [],
            });

            if (data.images && Array.isArray(data.images)) {
                setImages(data.images.map((url: string) => ({ url })));
            }
        } catch (err) {
            console.error('Error fetching car:', err);
            alert('حدث خطأ في تحميل بيانات السيارة');
        }
        setLoading(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const newImages: ImageItem[] = files.map(file => ({
            url: URL.createObjectURL(file), // Create local preview URL
            file: file
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            additional_features: prev.additional_features.includes(feature)
                ? prev.additional_features.filter(f => f !== feature)
                : [...prev.additional_features, feature]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('type', formData.type);
            data.append('model', formData.model);
            data.append('manufacture_year', formData.manufacture_year.toString());
            data.append('listing_type', formData.listing_type);

            if (formData.sale_price) data.append('sale_price', formData.sale_price);
            if (formData.daily_rent_price) data.append('daily_rent_price', formData.daily_rent_price);
            if (formData.weekly_rent_price) data.append('weekly_rent_price', formData.weekly_rent_price);
            if (formData.monthly_rent_price) data.append('monthly_rent_price', formData.monthly_rent_price);

            // Append additional features as array
            formData.additional_features.forEach((feature) => {
                data.append('additional_features[]', feature);
            });

            // Append images
            // For new files
            images.forEach((img) => {
                if (img.file) {
                    data.append('images[]', img.file);
                } else {
                    // For existing images, we send them as 'keep_images'
                    data.append('keep_images[]', img.url);
                }
            });

            if (isEdit && id) {
                // For Laravel PUT requests with FormData, use POST and _method
                data.append('_method', 'PUT');
                await api.updateCar(id, data);
            } else {
                await api.createCar(data);
            }
            navigate('/admin/dashboard');
        } catch (error: any) {
            console.error('Error saving car:', error);
            alert('حدث خطأ: ' + (error.message || 'فشل في حفظ السيارة'));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="max-w-2xl mx-auto pb-20 space-y-6">
                <div className='flex items-center mb-6'>
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-8 w-48 mr-4" />
                </div>
                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-10 w-full" /></div>
                    </div>
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl  mx-auto pb-20">
            <div className='flex items-center mb-6' >
                <Link to="/admin/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowRight size={16} />

                    </Button>
                </Link>
                <h1 className="text-2xl font-bold ">{isEdit ? 'تعديل سيارة' : 'إضافة سيارة جديدة'}</h1>

            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <h2 className="font-semibold text-lg">المعلومات الأساسية</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">عنوان الإعلان</label>
                            <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        {/* Type Dropdown */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium">النوع</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <span className={formData.type ? '' : 'text-muted-foreground'}>
                                        {formData.type || 'اختر النوع'}
                                    </span>
                                    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showCategoryDropdown && (
                                    <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                                        <div className="bg-white z-50 max-h-60 overflow-auto p-1 no-scrollbar">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, type: cat });
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
                            <label className="text-sm font-medium">الموديل</label>
                            <Input required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">سنة الصنع</label>
                            <Input type="number" required value={formData.manufacture_year} onChange={e => setFormData({ ...formData, manufacture_year: Number(e.target.value) })} />
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
                            value={formData.listing_type}
                            onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as 'sale' | 'rent' | 'both' })}
                        >
                            <option value="sale">بيع فقط</option>
                            <option value="rent">إيجار فقط</option>
                            <option value="both">بيع وإيجار</option>
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {(formData.listing_type === 'sale' || formData.listing_type === 'both') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">سعر البيع</label>
                                <Input type="number" value={formData.sale_price} onChange={e => setFormData({ ...formData, sale_price: e.target.value })} />
                            </div>
                        )}

                        {(formData.listing_type === 'rent' || formData.listing_type === 'both') && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">إيجار يومي</label>
                                    <Input type="number" value={formData.daily_rent_price} onChange={e => setFormData({ ...formData, daily_rent_price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">إيجار أسبوعي</label>
                                    <Input type="number" value={formData.weekly_rent_price} onChange={e => setFormData({ ...formData, weekly_rent_price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">إيجار شهري</label>
                                    <Input type="number" value={formData.monthly_rent_price} onChange={e => setFormData({ ...formData, monthly_rent_price: e.target.value })} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4 bg-card p-6 rounded-xl border">
                    <h2 className="font-semibold text-lg">الصور</h2>

                    <div className="grid grid-cols-3 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border group">
                                <img src={img.url} alt="" className="w-full h-full object-cover" />
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
                            <Upload className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-2">رفع صور</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
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
                                {formData.additional_features.length > 0
                                    ? `تم اختيار ${formData.additional_features.length} ميزة`
                                    : 'اختر المميزات'}
                            </span>
                            <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showFeaturesDropdown && (
                            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                                <div className=" bg-white z-50 max-h-60 overflow-auto p-1 no-scrollbar">
                                    {AVAILABLE_FEATURES.map((feature) => (
                                        <button
                                            key={feature}
                                            type="button"
                                            onClick={() => toggleFeature(feature)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-foreground"
                                        >
                                            <span>{feature}</span>
                                            {formData.additional_features.includes(feature) && (
                                                <Check size={16} className="text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {formData.additional_features.map((feature, idx) => (
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
                    <Button type="submit" className="flex-1" disabled={loading}>
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
