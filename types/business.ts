export type BusinessType = "restaurant" | "touristic_agency" | "real_estate_agency" | "hotel";

export interface BusinessMedia {
    id: number;
    secure_url: string;
    is_cover: boolean;
    collection: string;
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
    listings_count: number;
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
