"use client";

import {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
    type CSSProperties,
} from "react";
import styles from "./Map.module.css";
import { CategoryConfig, Destination, Media } from "@/types/map";
import { Business, BusinessMedia } from "@/types/business";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { localizeDestination } from "@/lib/localize";

// ─── Category configuration ───────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    beach: {
        color: "#0284c7",
        bg: "#e0f2fe",
        border: "#bae6fd",
        emoji: "🏖️",
        label: "",
    },
    hotel: {
        color: "#7c3aed",
        bg: "#ede9fe",
        border: "#ddd6fe",
        emoji: "🏨",
        label: "",
    },
    restaurant: {
        color: "#ea580c",
        bg: "#ffedd5",
        border: "#fed7aa",
        emoji: "🍽️",
        label: "",
    },
    historical: {
        color: "#76350f",
        bg: "#ccfbf1",
        border: "#99f6e4",
        emoji: "🏛️",
        label: "",
    },
    nature: {
        color: "#16a34a",
        bg: "#dcfce7",
        border: "#bbf7d0",
        emoji: "🌿",
        label: "",
    },
    airport: {
        color: "#475569",
        bg: "#f1f5f9",
        border: "#e2e8f0",
        emoji: "✈️",
        label: "",
    },
    shopping: {
        color: "#db2777",
        bg: "#fce7f3",
        border: "#fbcfe8",
        emoji: "🛍️",
        label: "",
    },
    attraction: {
        color: "#b45309",
        bg: "#fef3c7",
        border: "#fde68a",
        emoji: "⭐",
        label: "",
    },
    touristic_agency: {
        color: "#0891b2",
        bg: "#cffafe",
        border: "#a5f3fc",
        emoji: "🧭",
        label: "",
    },
    real_estate_agency: {
        color: "#334155",
        bg: "#f1f5f9",
        border: "#e2e8f0",
        emoji: "🏠",
        label: "",
    },
};

const DEFAULT_CATEGORY: CategoryConfig = {
    color: "#4f46e5",
    bg: "#eef2ff",
    border: "#c7d2fe",
    emoji: "📍",
    label: "",
};

function getCategoryConfig(category: string): CategoryConfig {
    return CATEGORY_CONFIG[category?.toLowerCase()] ?? DEFAULT_CATEGORY;
}

// ─── Unified pin model (destinations + businesses) ───────────────────────────

interface Pin {
    /** Namespaced key ("d:1" / "b:2") so destination & business ids never collide */
    key: string;
    kind: "destination" | "business";
    category: string;
    /** Normalized view — for destinations it's the original, for businesses a synthetic Destination */
    destination: Destination;
    business?: Business;
    latitude: number;
    longitude: number;
}

// Adapt a Business into a Destination-shaped record (usable by HoverPreview/Legend)
function businessToDestination(business: Business): Destination {
    return {
        id: business.id,
        name: business.name,
        description: business.description ?? "",
        category: business.type,
        address: business.address ?? "",
        latitude: business.latitude ?? undefined,
        longitude: business.longitude ?? undefined,
        media: (business.media ?? []).map((m) => ({
            id: m.id,
            secure_url: m.secure_url,
            is_cover: m.is_cover,
            collection: m.collection,
        })),
        images: (business.media ?? [])
            .filter((m) => m.is_cover)
            .map((m) => m.secure_url),
        tags: [],
        reviews: [],
    };
}

// ─── SVG Marker factory ───────────────────────────────────────────────────────

function buildMarkerSvg(category: string): string {
    const { color, emoji } = getCategoryConfig(category);
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
      <defs>
        <filter id="ds" x="-30%" y="-10%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.28)"/>
        </filter>
      </defs>
      <path
        d="M19 2C9.61 2 2 9.61 2 19C2 30.25 19 44 19 44C19 44 36 30.25 36 19C36 9.61 28.39 2 19 2Z"
        fill="${color}"
        filter="url(#ds)"
      />
      <circle cx="19" cy="19" r="12" fill="white" opacity="0.92"/>
      <text x="19" y="24" text-anchor="middle" font-size="14" font-family="system-ui">${emoji}</text>
    </svg>`;
}

// ─── Hover Preview ────────────────────────────────────────────────────────────

interface PreviewState {
    destination: Destination;
    x: number;
    y: number;
}

function HoverPreview({ destination, x, y }: PreviewState) {
    const t = useTranslations("map");
    const locale = useLocale();
    const localized = localizeDestination(destination, locale);
    const { color, bg, border, emoji } = getCategoryConfig(
        destination.category,
    );
    const label = t(destination.category?.toLowerCase() || "location");
    const [imgIdx, setImgIdx] = useState(0);

    // Get images from media array or images array
    const images =
        destination.media
            ?.filter((media) => media.collection === "gallery")
            .map((media) => media.secure_url) ??
        destination.images ??
        [];

    const hasImages = images.length > 0;

    // cycle images every 1.8 s when multiple exist
    useEffect(() => {
        if (images.length <= 1) return;
        const id = setInterval(
            () => setImgIdx((i) => (i + 1) % images.length),
            1800,
        );
        return () => clearInterval(id);
    }, [images.length]);

    // Ensure preview doesn't overflow right edge
    const previewWidth = 230;
    const offset = 18;
    const adjustedX =
        typeof window !== "undefined" &&
        x + offset + previewWidth > window.innerWidth
            ? x - previewWidth - offset
            : x + offset;

    const style: CSSProperties = {
        left: adjustedX,
        top: y,
    };

    const badgeStyle: CSSProperties = {
        backgroundColor: bg,
        color,
        borderColor: border,
    };

    // Calculate average rating
    const averageRating =
        destination.reviews && destination.reviews.length > 0
            ? destination.reviews.reduce(
                  (sum, review) => sum + review.rating,
                  0,
              ) / destination.reviews.length
            : null;

    return (
        <div className={styles.preview} style={style} role="tooltip">
            {hasImages && destination.media && (
                <div className={styles.imageStrip}>
                    <img
                        key={imgIdx}
                        src={destination.media[0].secure_url}
                        alt={`${localized.name} image ${imgIdx + 1}`}
                        className={styles.image}
                    />
                    {images.length > 1 && (
                        <div className={styles.imageDots} aria-hidden>
                            {images.map((_, i) => (
                                <span
                                    key={i}
                                    className={`${styles.dot} ${i === imgIdx ? styles.dotActive : ""}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            <motion.div
                role="tooltip"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                    duration: 0.4,
                }}
                className={styles.previewBody}
            >
                <span className={styles.categoryBadge} style={badgeStyle}>
                    {emoji}&nbsp;{label}
                </span>
                <p className={styles.previewTitle}>{localized.name}</p>
                {averageRating && (
                    <div className={styles.rating}>
                        {"★".repeat(Math.floor(averageRating))}
                        {"☆".repeat(5 - Math.floor(averageRating))}
                        <span className={styles.ratingValue}>
                            {" "}
                            ({averageRating.toFixed(1)})
                        </span>
                    </div>
                )}
                {localized.description && (
                    <p className={styles.previewDescription}>
                        {localized.description.substring(0, 100)}
                        {localized.description.length > 100 ? "..." : ""}
                    </p>
                )}
                {destination.tags && destination.tags.length > 0 && (
                    <div className={styles.tags}>
                        {destination.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className={styles.tag}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend({ categories }: { categories: string[] }) {
    const t = useTranslations("map");
    if (categories.length === 0) return null;
    return (
        <div className={styles.legend} aria-label={t("legend")}>
            <p className={styles.legendTitle}>{t("legend")}</p>
            {categories.map((cat) => {
                const { color, emoji } = getCategoryConfig(cat);
                return (
                    <div key={cat} className={styles.legendItem}>
                        <span
                            className={styles.legendDot}
                            style={{ backgroundColor: color }}
                        />
                        <span>
                            {emoji} {t(cat)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Map Component ───────────────────────────────────────────────────────

interface MapComponentProps {
    destinations: Destination[];
    businesses?: Business[];
    center?: [number, number];
    zoom?: number;
    onDestinationClick?: (destination: Destination) => void;
    onBusinessClick?: (business: Business) => void;
    className?: string;
}

export default function Map({
    destinations = [],
    businesses = [],
    center,
    zoom = 12,
    onDestinationClick,
    onBusinessClick,
    className,
}: MapComponentProps) {
    const t = useTranslations("map");
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    // Fix: Initialize Map with empty array
    const markersRef = useRef<globalThis.Map<string | number, any>>(
        new globalThis.Map(),
    );
    const [preview, setPreview] = useState<PreviewState | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Filter destinations that have coordinates
    const validDestinations = useMemo(
        () => destinations.filter((dest) => dest.latitude && dest.longitude),
        [destinations],
    );

    // Filter businesses that have coordinates
    const validBusinesses = useMemo(
        () =>
            businesses.filter(
                (biz) => biz.latitude && biz.longitude && biz.is_verified,
            ),
        [businesses],
    );

    // Unify destinations + businesses into a single pin collection.
    // Keys are namespaced ("d:1" / "b:2") so ids never collide across kinds.
    const pins = useMemo<Pin[]>(
        () => [
            ...validDestinations.map((dest): Pin => ({
                key: `d:${dest.id}`,
                kind: "destination",
                category: dest.category?.toLowerCase() || "attraction",
                destination: dest,
                latitude: dest.latitude!,
                longitude: dest.longitude!,
            })),
            ...validBusinesses.map((biz): Pin => ({
                key: `b:${biz.id}`,
                kind: "business",
                category: biz.type?.toLowerCase() || "touristic_agency",
                destination: businessToDestination(biz),
                business: biz,
                latitude: biz.latitude!,
                longitude: biz.longitude!,
            })),
        ],
        [validDestinations, validBusinesses],
    );

    // Derive unique categories present across all pins (destinations + businesses)
    const categories = useMemo(
        () => [...new Set(pins.map((pin) => pin.category))],
        [pins],
    );

    // Compute centroid as fallback center
    const derivedCenter = useMemo<[number, number]>(() => {
        if (center) return center;
        if (pins.length === 0) return [36.8233, 5.7667]; // Jijel default center
        const avgLat =
            pins.reduce((s, pin) => s + (pin.latitude || 0), 0) /
            pins.length;
        const avgLng =
            pins.reduce((s, pin) => s + (pin.longitude || 0), 0) /
            pins.length;
        return [avgLat, avgLng];
    }, [center, pins]);

    const showPreview = useCallback(
        (destination: Destination, mapPixelPoint: { x: number; y: number }) => {
            setPreview({
                destination,
                x: mapPixelPoint.x,
                y: mapPixelPoint.y,
            });
        },
        [],
    );

    const hidePreview = useCallback(() => setPreview(null), []);

    // Load Leaflet dynamically (avoids SSR issues in Next.js)
    useEffect(() => {
        if (typeof window === "undefined" || mapRef.current) return;
        if (!containerRef.current) return;

        let cancelled = false;

        async function initMap() {
            // Inject Leaflet CSS if not already present
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link");
                link.id = "leaflet-css";
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            const L = (await import("leaflet")).default;
            if (cancelled || !containerRef.current) return;

            // Fix default icon paths broken by webpack
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(containerRef.current, {
                center: derivedCenter,
                zoom,
                zoomControl: true,
                attributionControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            mapRef.current = map;
            setIsLoaded(true);
        }

        initMap();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync markers whenever destinations change
    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        let L: any;

        async function syncMarkers() {
            L = (await import("leaflet")).default;
            const map = mapRef.current;
            const existingIds = new Set(markersRef.current.keys());

            for (const pin of pins) {
                if (!pin.latitude || !pin.longitude) continue;

                existingIds.delete(pin.key);

                if (markersRef.current.has(pin.key)) continue; // already on map

                const icon = L.divIcon({
                    html: buildMarkerSvg(pin.category),
                    className: "",
                    iconSize: [38, 46],
                    iconAnchor: [19, 46],
                    popupAnchor: [0, -48],
                });

                const marker = L.marker([pin.latitude, pin.longitude], {
                    icon,
                }).addTo(map);

                marker.on("mouseover", (e: any) => {
                    const point = map.latLngToContainerPoint(e.latlng);
                    showPreview(pin.destination, point);
                });
                marker.on("mouseout", hidePreview);
                marker.on("click", () => {
                    if (pin.kind === "business" && pin.business) {
                        onBusinessClick?.(pin.business);
                    } else {
                        onDestinationClick?.(
                            pin.destination as Destination,
                        );
                    }
                    hidePreview();
                });

                markersRef.current.set(pin.key, marker);
            }

            // Remove stale markers
            for (const staleId of existingIds) {
                markersRef.current.get(staleId)?.remove();
                markersRef.current.delete(staleId);
            }
        }

        syncMarkers();
    }, [
        isLoaded,
        pins,
        showPreview,
        hidePreview,
        onDestinationClick,
        onBusinessClick,
    ]);

    // Recenter map when center prop changes
    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;
        mapRef.current.setView(derivedCenter, zoom);
    }, [isLoaded, derivedCenter, zoom]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div className={`${styles.wrapper} ${className ?? ""}`}>
            {!isLoaded && (
                <div className={styles.loading} aria-label={t("loading_aria")}>
                    <div className={styles.spinner} />
                </div>
            )}
            <div ref={containerRef} className={styles.map} />
            <Legend categories={categories} />
            {preview && <HoverPreview {...preview} />}
        </div>
    );
}
