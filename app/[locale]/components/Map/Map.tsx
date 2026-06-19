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
import { CategoryConfig, Destination } from "@/types/map";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

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
                        alt={`${destination.name} image ${imgIdx + 1}`}
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
                <p className={styles.previewTitle}>{destination.name}</p>
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
                {destination.description && (
                    <p className={styles.previewDescription}>
                        {destination.description.substring(0, 100)}
                        {destination.description.length > 100 ? "..." : ""}
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
    center?: [number, number];
    zoom?: number;
    onDestinationClick?: (destination: Destination) => void;
    className?: string;
}

export default function Map({
    destinations = [],
    center,
    zoom = 12,
    onDestinationClick,
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

    // Derive unique categories present in destinations
    const categories = useMemo(
        () => [
            ...new Set(
                validDestinations.map(
                    (d) => d.category?.toLowerCase() || "attraction",
                ),
            ),
        ],
        [validDestinations],
    );

    // Compute centroid as fallback center
    const derivedCenter = useMemo<[number, number]>(() => {
        if (center) return center;
        if (validDestinations.length === 0) return [36.8233, 5.7667]; // Jijel default center
        const avgLat =
            validDestinations.reduce((s, d) => s + (d.latitude || 0), 0) /
            validDestinations.length;
        const avgLng =
            validDestinations.reduce((s, d) => s + (d.longitude || 0), 0) /
            validDestinations.length;
        return [avgLat, avgLng];
    }, [center, validDestinations]);

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

            for (const dest of validDestinations) {
                if (!dest.latitude || !dest.longitude) continue;

                existingIds.delete(dest.id);

                if (markersRef.current.has(dest.id)) continue; // already on map

                const icon = L.divIcon({
                    html: buildMarkerSvg(dest.category),
                    className: "",
                    iconSize: [38, 46],
                    iconAnchor: [19, 46],
                    popupAnchor: [0, -48],
                });

                const marker = L.marker([dest.latitude, dest.longitude], {
                    icon,
                }).addTo(map);

                marker.on("mouseover", (e: any) => {
                    const point = map.latLngToContainerPoint(e.latlng);
                    showPreview(dest, point);
                });
                marker.on("mouseout", hidePreview);
                marker.on("click", () => {
                    onDestinationClick?.(dest);
                    hidePreview();
                });

                markersRef.current.set(dest.id, marker);
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
        validDestinations,
        showPreview,
        hidePreview,
        onDestinationClick,
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
