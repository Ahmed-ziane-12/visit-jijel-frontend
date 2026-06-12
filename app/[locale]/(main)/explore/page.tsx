"use client";
import { Destination } from "@/types/map";
import dynamic from "next/dynamic";
import styles from "./explore.module.css";
import { useEffect, useMemo, useState } from "react";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import FilterPanel, { FilterState } from "./FilterPanel/FilterPanel";

const Map = dynamic(() => import("@/app/[locale]/components/Map/Map"), {
    ssr: false,
});

function getAvgRating(dest: Destination): number {
    if (!dest.reviews || dest.reviews.length === 0) return 0;
    return (
        dest.reviews.reduce((sum, r) => sum + r.rating, 0) / dest.reviews.length
    );
}

const DEFAULT_FILTERS: FilterState = {
    search: "",
    types: [],
    ratings: [],
};

export default function ExplorePage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [activeFilters, setActiveFilters] =
        useState<FilterState>(DEFAULT_FILTERS);
    const router = useRouter();

    useEffect(() => {
        axios
            .get("/api/v1/destinations")
            .then((res) => setDestinations(res.data));
    }, []);

    const filteredDestinations = useMemo(() => {
        return destinations.filter((dest) => {
            // Real-time search filter
            if (activeFilters.search) {
                const q = activeFilters.search.toLowerCase();
                if (!dest.name.toLowerCase().includes(q)) return false;
            }

            // Type checkboxes (only applied after "Apply Filters")
            if (activeFilters.types.length > 0) {
                const t = (dest as any).type || "destination";
                if (!activeFilters.types.includes(t)) return false;
            }

            // Rating checkboxes (only applied after "Apply Filters")
            if (activeFilters.ratings.length > 0) {
                const avg = getAvgRating(dest);
                const minRating = Math.min(...activeFilters.ratings);
                if (avg < minRating) return false;
            }

            return true;
        });
    }, [destinations, activeFilters]);

    const handleSearch = (query: string) =>
        setActiveFilters((prev) => ({ ...prev, search: query }));

    const handleApply = (filters: FilterState) =>
        setActiveFilters((prev) => ({
            ...prev,
            types: filters.types,
            ratings: filters.ratings,
        }));

    return (
        <div className={styles.container}>
            <div className={styles.mapWrapper}>
                <div className={styles.mapArea}>
                    <Map
                        destinations={filteredDestinations}
                        zoom={10}
                        center={[36.8233, 5.7667]}
                        onDestinationClick={(dest) =>
                            router.push(`/explore/${dest.id}`)
                        }
                    />
                    <FilterPanel
                        onSearch={handleSearch}
                        onApply={handleApply}
                    />
                </div>
            </div>
        </div>
    );
}
