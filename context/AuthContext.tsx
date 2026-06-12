'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import axios, { setupToken } from '@/lib/axios';
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
//  Token persistence (localStorage)
// -------------------------------------------------------------
//  Keeps the user logged in across page refreshes.
//  Switch to sessionStorage for tab-scoped auth, or remove
//  persistence entirely if you prefer an in-memory-only flow.
// -------------------------------------------------------------
const STORAGE_KEY = 'auth_token';

function loadToken(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function persistToken(token: string | null): void {
    try {
        if (token) {
            localStorage.setItem(STORAGE_KEY, token);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // storage unavailable — auth still works in-memory for the tab lifetime
    }
}

// ─────────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch the current user — works with both token and cookie auth
    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const { data } = await axios.get<AuthUser>('/api/user');
            setUser(data);
        } catch {
            setUser(null);
            persistToken(null);
            setupToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // On mount: restore token from localStorage, then fetch user
    useEffect(() => {
        const token = loadToken();
        if (token) {
            setupToken(token);
            refreshUser();
        } else {
            setLoading(false);
        }
    }, [refreshUser]);

    // ── Login ─────────────────────────────────────────────────
    const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const { data } = await axios.post<LoginResponse>('/api/v1/login', credentials);

        persistToken(data.token);
        setupToken(data.token);
        setUser(data.user);

        return data;
    }, []);

    // ── Admin Login ───────────────────────────────────────────
    const adminLogin = useCallback(async (credentials: LoginCredentials): Promise<AdminLoginResponse> => {
        const { data } = await axios.post<AdminLoginResponse>('/admin/v1/login', credentials);

        if ('token' in data && data.token) {
            persistToken(data.token);
            setupToken(data.token);
        }
        setUser(data.user);

        return data;
    }, []);

    // ── Register ──────────────────────────────────────────────
    const register = useCallback(
        async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
            const { data } = await axios.post<RegisterResponse>('/api/v1/register', credentials);

            // Clients are auto-logged in by the backend — a token is returned.
            // Business owners must verify email first; no token yet.
            if ('token' in data && data.token) {
                persistToken(data.token);
                setupToken(data.token);
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
            persistToken(null);
            setupToken(null);
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
