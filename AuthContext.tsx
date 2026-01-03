import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: { email: string; password: string }) => Promise<void>;
    register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await api.getProfile();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (data: { email: string; password: string }) => {
        const response = await api.login(data);
        if (response.user) {
            setUser(response.user);
        } else {
            // If login response doesn't include user, fetch it
            const userData = await api.getProfile();
            setUser(userData);
        }
    };

    const register = async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
        await api.register(data);
        // Optionally auto-login after register if the API supports it, 
        // otherwise the user will need to login manually.
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};