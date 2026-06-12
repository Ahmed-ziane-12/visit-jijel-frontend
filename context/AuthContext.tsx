'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import axios from '@/lib/axios';
import {
    AuthUser,
    LoginCredentials,
    LoginResponse,
    RegisterCredentials,
    RegisterResponse,
    AdminLoginResponse,
} from '@/types/auth';

interface AuthState {
    user: AuthUser | null;
    loading: boolean; // true while fetching /api/user on mount
    isAuthenticated: boolean;
}

interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    adminLogin: (credentials: LoginCredentials) => Promise<AdminLoginResponse>;
    register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch the current user from /api/user on every mount.
    // If the session cookie is valid, Laravel returns the user.
    // If not (401), we just set user to null silently.
    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const { data } = await axios.get<AuthUser>('/api/user');
            setUser(data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // ── Login ─────────────────────────────────────────────────
    const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
        await axios.get('/sanctum/csrf-cookie');
        const { data } = await axios.post<LoginResponse>('/login', credentials);
        setUser(data.user);
        return data; // caller decides where to redirect based on role
    }, []);

    // ── Admin Login ───────────────────────────────────────────
    const adminLogin = useCallback(async (credentials: LoginCredentials): Promise<AdminLoginResponse> => {
        await axios.get('/sanctum/csrf-cookie');
        const { data } = await axios.post<AdminLoginResponse>('/admin/v1/login', credentials);
        setUser(data.user);
        return data;
    }, []);

    // ── Register ──────────────────────────────────────────────
    const register = useCallback(
        async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
            await axios.get('/sanctum/csrf-cookie');
            const { data } = await axios.post<RegisterResponse>('/register', credentials);
            setUser(data.user);
            return data;
        },
        [],
    );

    // ── Logout ────────────────────────────────────────────────
    const logout = useCallback(async (): Promise<void> => {
        try {
            await axios.post('/logout');
        } finally {
            // Clear state regardless of whether the request succeeded
            setUser(null);
            router.push('/login');
        }
    }, [router]);

    const value: AuthContextValue = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return context;
}
