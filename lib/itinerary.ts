import axios from "@/lib/axios";
import type {
    Itenirary,
    IteneraryDay,
    IteneraryItem,
    TripCandidate,
} from "@/types/map";

/** Fixed daily slots — mirrored from the backend generator. */
export const SLOTS = [
    { start: "08:30", end: "10:30" },
    { start: "11:00", end: "13:00" },
    { start: "13:30", end: "15:30" },
    { start: "16:00", end: "18:00" },
];

export interface TripPayload {
    title?: string;
    start_date: string;
    end_date: string;
    adults: number;
    children?: number;
    vibes?: string[];
    preferences?: string[];
    accommodation?: "booked" | "notBooked";
    budget?: {
        budgetType: string;
        customBudget?: number;
        customBudgetType?: "daily" | "overall";
    };
    status?: "draft" | "published";
}

export interface TripItemPayload {
    item_type: "destination" | "listing" | "event" | "custom";
    destination_id?: number;
    listing_id?: number;
    event_id?: number;
    title: string;
    notes?: string;
    start_time?: string;
    end_time?: string;
    sort_order?: number;
}

export async function createTrip(payload: TripPayload): Promise<Itenirary> {
    const { data } = await axios.post<Itenirary>("/api/v1/trips", payload);
    return data;
}

export async function fetchTrip(id: string | number): Promise<Itenirary> {
    const { data } = await axios.get<Itenirary>(`/api/v1/trips/${id}`);
    return data;
}

/** The authenticated client's itineraries (paginated response unwrapped). */
export async function fetchMyTrips(): Promise<Itenirary[]> {
    const { data } = await axios.get<
        { data: Itenirary[] } | Itenirary[]
    >("/api/v1/itineraries");
    return Array.isArray(data) ? data : (data.data ?? []);
}

export async function fetchRecommendations(
    id: string | number,
    limit = 12,
): Promise<TripCandidate[]> {
    const { data } = await axios.get<{ data: TripCandidate[] }>(
        `/api/v1/trips/${id}/recommendations`,
        { params: { limit } },
    );
    return data.data;
}

export async function saveTrip(
    id: string | number,
    patch: Partial<
        Pick<
            Itenirary,
            "title" | "notes" | "status" | "visibility" | "start_date" | "end_date"
        >
    >,
): Promise<Itenirary> {
    const { data } = await axios.put<Itenirary>(
        `/api/v1/itineraries/${id}`,
        patch,
    );
    return data;
}

export async function addTripDay(
    id: string | number,
    day: { day_date: string; day_number: number; notes?: string },
): Promise<IteneraryDay> {
    const { data } = await axios.post<IteneraryDay>(
        `/api/v1/itineraries/${id}/days`,
        day,
    );
    return data;
}

export async function deleteTripDay(
    id: string | number,
    dayId: number,
): Promise<void> {
    await axios.delete(`/api/v1/itineraries/${id}/days/${dayId}`);
}

export async function addTripItem(
    id: string | number,
    dayId: number,
    payload: TripItemPayload,
): Promise<IteneraryItem> {
    const { data } = await axios.post<IteneraryItem>(
        `/api/v1/itineraries/${id}/days/${dayId}/items`,
        payload,
    );
    return data;
}

export async function updateTripItem(
    id: string | number,
    dayId: number,
    itemId: number,
    payload: Partial<TripItemPayload>,
): Promise<IteneraryItem> {
    const { data } = await axios.put<IteneraryItem>(
        `/api/v1/itineraries/${id}/days/${dayId}/items/${itemId}`,
        payload,
    );
    return data;
}

export async function deleteTripItem(
    id: string | number,
    dayId: number,
    itemId: number,
): Promise<void> {
    await axios.delete(`/api/v1/itineraries/${id}/days/${dayId}/items/${itemId}`);
}
