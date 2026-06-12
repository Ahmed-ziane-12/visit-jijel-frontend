"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import SearchCard from "../../components/SearchCard/SearchCard";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
    }>;
}

interface Destination {
    id: string;
    name: string;
    description?: string;
    image?: string;
    location?: string;
    rating?: number;
}

interface Business {
    id: string;
    name: string;
    description?: string;
    image?: string;
    address?: string;
    phone?: string;
    rating?: number;
}

interface Event {
    id: string;
    name: string;
    description?: string;
    image?: string;
    date?: string;
    location?: string;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
    const t = useTranslations("search");
    const [query, setQuery] = useState("");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const loadSearchParams = async () => {
            const params = await searchParams;
            setQuery(params.q || "");
        };
        loadSearchParams();
    }, [searchParams]);

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query, filters]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/v1/search`, {
                params: {
                    q: query,
                    types: ["destinations", "events", "businesses"],
                    wilaya: "Jijel",
                    ...(filters && {
                        // Add filters to API call
                        types_filter: Object.entries(filters.types)
                            .filter(([_, value]) => value)
                            .map(([key]) => key)
                            .join(","),
                        rating: filters.rating.join(","),
                        location: filters.location,
                        date_from: filters.dateRange?.from?.toISOString(),
                        date_to: filters.dateRange?.to?.toISOString(),
                    }),
                },
            });
            setDestinations(data.destinations || []);
            setBusinesses(data.businesses || []);
            setEvents(data.events || []);
            setError(false);
        } catch (error) {
            console.error("Search error:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleCardClick = (id: string | number) => {
        router.push(`/explore/${id}`);
    };

    if (!query) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("no_query")}
                    </h1>
                    <p className="text-gray-600">
                        {t("no_query_desc")}
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t("loading")}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {t("error")}
                    </h1>
                    <p className="text-gray-600">
                        {t("error_desc")}
                    </p>
                </div>
            </div>
        );
    }

    // Apply local filtering if API doesn't support it
    const filteredDestinations = destinations.filter((item) => {
        if (!filters) return true;
        if (
            filters.rating.length > 0 &&
            item.rating &&
            !filters.rating.includes(Math.floor(item.rating))
        )
            return false;
        if (
            filters.location &&
            item.location &&
            !item.location
                .toLowerCase()
                .includes(filters.location.toLowerCase())
        )
            return false;
        return true;
    });

    const filteredBusinesses = businesses.filter((item) => {
        if (!filters) return true;
        if (
            filters.rating.length > 0 &&
            item.rating &&
            !filters.rating.includes(Math.floor(item.rating))
        )
            return false;
        if (
            filters.location &&
            item.address &&
            !item.address.toLowerCase().includes(filters.location.toLowerCase())
        )
            return false;
        return true;
    });

    const filteredEvents = events.filter((item) => {
        if (!filters) return true;
        if (
            filters.location &&
            item.location &&
            !item.location
                .toLowerCase()
                .includes(filters.location.toLowerCase())
        )
            return false;
        if (filters.dateRange?.from && item.date) {
            const eventDate = new Date(item.date);
            if (eventDate < filters.dateRange.from) return false;
            if (filters.dateRange.to && eventDate > filters.dateRange.to)
                return false;
        }
        return true;
    });

    const showDestinations = !filters || filters.types?.destinations !== false;
    const showBusinesses = !filters || filters.types?.businesses !== false;
    const showEvents = !filters || filters.types?.events !== false;

    const totalResults =
        (showDestinations ? filteredDestinations.length : 0) +
        (showBusinesses ? filteredBusinesses.length : 0) +
        (showEvents ? filteredEvents.length : 0);

    return (
        <div
            className="flex min-h-screen bg-gray-50"
            style={{ marginTop: "clamp(56px, 6vh, 72px)" }}
        >
            <FilterSidebar onApplyFilters={handleApplyFilters} />

            <main className="flex-1 p-8">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t("results_for", { query })}
                    </h1>
                    <p className="text-gray-600">
                        {t("results_count", { count: totalResults })}
                    </p>
                </div>

                {/* Destinations Section */}
                {showDestinations && filteredDestinations.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 mr-4">
                                    {t("destinations")}
                                </h2>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                            <button className="cursor-pointer text-orange-600 hover:text-orange-700 text-sm font-medium ml-4 whitespace-nowrap">
                                View All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDestinations.slice(0, 6).map((item) => (
                                <SearchCard
                                    key={item.id}
                                    id={item.id}
                                    name={item.name}
                                    description={item.description}
                                    image={item.image}
                                    badge={t("badge_destination")}
                                    type="destination"
                                    onButtonClick={handleCardClick}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Businesses Section */}
                {showBusinesses && filteredBusinesses.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center flex-1">
                                <h2 className="text-2xl font-semibold text-gray-900 mr-4">
                                    {t("businesses")}
                                </h2>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                            <button className="cursor-pointer text-orange-600 hover:text-orange-700 text-sm font-medium ml-4 whitespace-nowrap">
                                View All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBusinesses.slice(0, 6).map((item) => (
                                <SearchCard
                                    key={item.id}
                                    id={item.id}
                                    name={item.name}
                                    description={item.description}
                                    image={item.image}
                                    badge={t("badge_business")}
                                    type="business"
                                    onButtonClick={handleCardClick}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Events Section */}
                {showEvents && filteredEvents.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center flex-1">
                                <h2 className="text-2xl font-semibold text-gray-900 mr-4">
                                    {t("events")}
                                </h2>
                                <div className="flex-1 h-px bg-gray-300"></div>
                            </div>
                            <button className="cursor-pointer text-orange-600 hover:text-orange-700 text-sm font-medium ml-4 whitespace-nowrap">
                                {t("view_all")}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.slice(0, 6).map((item) => (
                                <SearchCard
                                    key={item.id}
                                    id={item.id}
                                    name={item.name}
                                    description={item.description}
                                    image={item.image}
                                    badge={
                                        item.date
                                            ? new Date(
                                                  item.date,
                                              ).toLocaleDateString()
                                            : t("badge_event")
                                    }
                                    type="event"
                                    onButtonClick={handleCardClick}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results Message */}
                {totalResults === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {t("no_results")}
                        </h3>
                        <p className="text-gray-600">
                            {t("no_results_desc")}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
