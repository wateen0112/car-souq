import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials as per requirement "custom username and password (no authentication provider)"
        if (username === 'admin' && password === 'password123') {
            localStorage.setItem('admin_session', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة');
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
                        <label className="text-sm font-medium">اسم المستخدم</label>
                        <Input
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">كلمة المرور</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className="text-destructive text-sm">{error}</div>}

                    <Button type="submit" className="w-full">دخول</Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
