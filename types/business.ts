export type BusinessType = "restaurant" | "touristic_agency" | "real_estate_agency" | "hotel";

export interface BusinessMedia {
    id: number;
    secure_url: string;
    is_cover: boolean;
    collection: string;
    resource_type?: "image" | "video" | "raw";
    format?: string | null;
    width?: number | null;
    height?: number | null;
    sort_order?: number;
}

export interface BusinessOwner {
    id: number;
    name: string;
}

export interface BusinessReviewUser {
    id: number;
    name: string;
    profile?: {
        media?: BusinessMedia[];
    } | null;
}

export interface BusinessReview {
    id: number;
    listing_id: number | null;
    rating: number;
    body: string | null;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    user?: BusinessReviewUser | null;
}

export interface Business {
    id: number;
    owner_id: number;
    type: BusinessType;
    name: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    wilaya: string | null;
    commune: string | null;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    media: BusinessMedia[];
    listings_count?: number;
    owner?: BusinessOwner | null;
    listings?: Listing[];
}

export interface Listing {
    id: number;
    business_id: number;
    title: string;
    description: string | null;
    price: string | null;
    currency: string;
    amenities: string[] | null;
    capacity: number | null;
    status: "draft" | "published" | "archived";
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    media: BusinessMedia[];
}
