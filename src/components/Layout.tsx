import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Filter, User, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import WhatsAppButton from './WhatsAppButton';
import { WHATSAPP_CONFIG } from '../lib/whatsappConfig';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const isAdmin = localStorage.getItem('admin_session') === 'true';

    const navItems = [
        { icon: Home, label: 'الرئيسية', path: '/' },
        { icon: Filter, label: 'بحث', path: '/filter' },
        // Only show Admin Login if not logged in, or Dashboard if logged in
        isAdmin
            ? { icon: PlusCircle, label: 'لوحة التحكم', path: '/admin/dashboard' }
            : { icon: User, label: 'دخول المشرف', path: '/admin/login' },
    ];

    return (
        <div dir="rtl" className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-16 md:pb-0">
            {/* Top Header for Mobile/Desktop */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className=" z-50 bg-white container flex h-14 items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <span>سوق السيارات</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden z-50 bg-white md:flex items-center gap-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    location.pathname === item.path ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    localStorage.removeItem('admin_session');
                                    window.location.href = '/';
                                }}
                                className="text-destructive hover:text-destructive/80"
                            >
                                تسجيل خروج
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container py-6 px-4 md:px-8">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden bg-white z-50 fixed bottom-0 left-0 right-0 border-t bg-background z-50 flex justify-around items-center h-16 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon size={24} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* WhatsApp Floating Button */}
            <WhatsAppButton
                phoneNumber={WHATSAPP_CONFIG.phoneNumber}
                message={WHATSAPP_CONFIG.defaultMessage}
            />
        </div>
    );
};

export default Layout;
