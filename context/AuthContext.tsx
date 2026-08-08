'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios, { initCsrf, setUnauthorizedHandler } from '@/lib/axios';
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

    const userRef = useRef<AuthUser | null>(null);

    // Keep a ref of the current user so the 401 handler only redirects when a
    // previously valid session expires — not for anonymous visitors.
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Session expired → clear state and go back to the login page.
    useEffect(() => {
        setUnauthorizedHandler(() => {
            if (userRef.current) {
                setUser(null);
                router.push('/login');
            }
        });
        return () => setUnauthorizedHandler(null);
    }, [router]);

    // Fetch the current user — authenticated via Sanctum session cookies
    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const { data } = await axios.get<AuthUser>('/api/user');
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // On mount: bootstrap the CSRF session, then check the current user
    useEffect(() => {
        initCsrf()
            .catch(() => undefined)
            .then(refreshUser);
    }, [refreshUser]);

    // ── Login ─────────────────────────────────────────────────
    const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const { data } = await axios.post<LoginResponse>('/api/v1/login', credentials);

        setUser(data.user);

        return data;
    }, []);

    // ── Admin Login ───────────────────────────────────────────
    const adminLogin = useCallback(async (credentials: LoginCredentials): Promise<AdminLoginResponse> => {
        const { data } = await axios.post<AdminLoginResponse>('/admin/v1/login', credentials);

        setUser(data.user);

        return data;
    }, []);

    // ── Register ──────────────────────────────────────────────
    const register = useCallback(
        async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
            const { data } = await axios.post<RegisterResponse>('/api/v1/register', credentials);

            // Clients are auto-logged in by the backend via a session cookie.
            // Business owners must verify email first — no session yet.
            if (data.user?.profile?.role === 'client') {
                setUser(data.user);
            }

            return data;
        },
        [],
    );

    // ── Logout ────────────────────────────────────────────────
    const logout = useCallback(async (): Promise<void> => {
        try {
            await axios.post('/api/v1/logout');
        } catch {
            // Proceed with local cleanup even if the server call fails
        } finally {
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
