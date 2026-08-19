import { AuthUser, Profile } from "./auth";
import { Media } from "./map";

// ── Like ───────────────────────────────────────────────────
export interface Like {
    id: number;
    user_id: number;
    likeable_type: string;
    likeable_id: number;
    type: "like" | "dislike";
}

// ── Comment ────────────────────────────────────────────────
export interface Comment {
    id: number;
    user_id: number;
    post_id: number;
    parent_comment_id: number | null;
    body: string;
    created_at: string;
    updated_at: string;
    user: AuthUser;
    likes: Like[];
    replies?: Comment[];
}

// ── Post ───────────────────────────────────────────────────
export interface Post {
    id: number;
    user_id: number;
    body: string | null;
    shareable_type: string | null;
    shareable_id: number | null;
    parent_post_id: number | null;
    created_at: string;
    updated_at: string;
    user: AuthUser;
    media: Media[];
    likes: Like[];
    comments: Comment[];
    parentPost?: Post;
    shareable?: {
        id: number;
        name?: string;
        description?: string;
        secure_url?: string;
        [key: string]: unknown;
    };
}

// ── Paginated response ─────────────────────────────────────
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// ── Public profile (from GET /api/v1/users/{id}) ───────────
export interface PublicProfile extends AuthUser {
    profile: Profile & {
        media: Media[];
    };
}
