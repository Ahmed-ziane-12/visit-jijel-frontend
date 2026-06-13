export type LocationCategory =
    | "beach"
    | "hotel"
    | "restaurant"
    | "museum"
    | "park"
    | "airport"
    | "shopping"
    | "attraction"
    | (string & {});

export interface MapProps {
    destinations: Destination[];
    center?: [number, number];
    zoom?: number;
    onDestinationClick?: (destination: Destination) => void;
    className?: string;
}

export interface Destination {
    id: number;
    name: string;
    description: string;
    category: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
    tags?: string[];
    media?: Media[];
    reviews?: Review[];
}

export interface Media {
    id: number;
    secure_url: string;
    is_cover: boolean;
    collection: string;
}

export interface Review {
    id: number;
    rating: number;
    body: string;
    user: { id: number; name: string };
    created_at: string;
}

export interface CategoryConfig {
    color: string;
    bg: string;
    border: string;
    emoji: string;
    label: string;
}

export interface Itenirary {
    id: number;
    user_id: number;
    title: string;
    notes: string;
    start_date: string;
    end_date: string;
    visibility: "private" | "public" | "shared";
    created_at: string;
    days?: IteneraryDay[];
}

export interface IteneraryDay {
    id: number;
    itinerary_id: number;
    day_date: string;
    day_number: number;
    items?: IteneraryItem[];
}

export interface IteneraryItem {
    id: number;
    itinerary_day_id: number;
    destination_id?: number;
    listing_id?: number;
    event_id?: number;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    item_type: "destination" | "listing" | "event" | (string & {});
    image_url?: string;
    latitude?: number;
    longitude?: number;
}
