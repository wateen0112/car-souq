import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../../api';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        if (userId) {
            localStorage.setItem('user-id', userId);
        }
    }, [userId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login({ email, password });

            // Token and user data are already stored in localStorage by api.login()
            if (response.access_token) {
                // Set admin session flag
                localStorage.setItem('admin_session', 'true');
                navigate(`/${userId}/admin/dashboard`);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-sm">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">تسجيل دخول المشرف</h1>
                    <p className="text-muted-foreground">أدخل بيانات الدخول للمتابعة</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">البريد الإلكتروني</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="example@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">كلمة المرور</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="text-destructive text-sm">{error}</div>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

