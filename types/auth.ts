import { Media } from "./map";

export type Role = "client" | "business_owner" | "admin";

export interface Profile {
    id: number;
    user_id: number;
    role: Role;
    avatar: string | null;
    phone: string | null;
    bio: string | null;
    wilaya: string | null;
    commune: string | null;
    media: Media[];
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    profile: Profile;
    is_admin?: boolean;
    is_super_admin?: boolean;
    must_reset_password?: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
    remember: boolean;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: "client" | "business_owner";
}

export interface LoginResponse {
    user: AuthUser;
    role: Role;
    email_verified: boolean;
    token: string;
}

export interface RegisterResponse {
    message: string;
    user: AuthUser;
    token: string | null; // non-null for clients (auto-logged in), null for owners
}

export interface AdminLoginResponse {
    user: AuthUser;
    is_super_admin: boolean;
    must_reset_password: boolean;
    token: string;
}
