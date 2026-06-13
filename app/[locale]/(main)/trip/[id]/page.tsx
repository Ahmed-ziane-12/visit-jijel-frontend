"use client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import styles from "./trip.module.css";
import type { Itenirary, IteneraryItem, IteneraryDay, Destination } from "@/types/map";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlarmClock,
    CalendarDays,
    GripVertical,
    Lightbulb,
    Loader2,
    Map,
    Plus,
    Share2,
    X,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addDays, differenceInDays, format } from "date-fns";
import axios from "@/lib/axios";

const STORAGE_PREFIX = "trip_";

const TIME_SLOTS = [
    { start: "08:30", end: "10:30" },
    { start: "11:00", end: "13:00" },
    { start: "13:30", end: "15:30" },
];

function haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function SortableItem({ item }: { item: IteneraryItem }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.iteneraryItem} ${isDragging ? styles.dragging : ""}`}
        >
            <div className={styles.dragHandle} {...attributes} {...listeners}>
                <GripVertical size={18} />
            </div>

            <div className={styles.imageContainer}>
                <Image
                    src={item.image_url || "/p2.jpg"}
                    alt={item.title}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: "100%", height: "auto" }}
                />
            </div>

            <div className={styles.details}>
                <p className="flex items-center justify-start gap-2">
                    <AlarmClock size={16} className="text-(--light-fg)" />
                    {item.start_time} - {item.end_time}
                </p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
            </div>
        </div>
    );
}

function MapViewPopup({
    days,
    onClose,
}: {
    days: IteneraryDay[];
    onClose: () => void;
}) {
    const [activeDayId, setActiveDayId] = useState(days[0]?.id);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    const activeDay = days.find((d) => d.id === activeDayId);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        let cancelled = false;

        (async () => {
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link");
                link.id = "leaflet-css";
                link.rel = "stylesheet";
                link.href =
                    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            const L = (await import("leaflet")).default;
            if (cancelled || !containerRef.current) return;

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(containerRef.current, {
                center: [36.8233, 5.7667],
                zoom: 12,
                zoomControl: true,
            });

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                },
            ).addTo(map);

            mapRef.current = map;

            // Fix tile positioning for maps rendered in a popup
            requestAnimationFrame(() => map.invalidateSize());
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const items = activeDay?.items;
        if (!map || !items) return;

        (async () => {
            const L = (await import("leaflet")).default;
            if (!mapRef.current) return;

            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            polylineRef.current?.remove();

            const coords: [number, number][] = [];

            for (const item of items) {
                if (item.latitude && item.longitude) {
                    coords.push([item.latitude, item.longitude]);

                    const marker = L.marker([item.latitude, item.longitude])
                        .addTo(map)
                        .bindPopup(
                            `<b>${item.title}</b><br/>${item.start_time} - ${item.end_time}`,
                        );

                    markersRef.current.push(marker);
                }
            }

            if (coords.length >= 2) {
                polylineRef.current = L.polyline(coords, {
                    color: "#4f46e5",
                    weight: 3,
                    opacity: 0.7,
                }).addTo(map);
            }

            if (coords.length > 0) {
                map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
            }
        })();
    }, [activeDay]);

    return (
        <div className={styles.mapPopup}>
            <div className={styles.mapPopupContent}>
                <button
                    className={styles.mapPopupClose}
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                <div className={styles.mapPopupTabs}>
                    {days.map((day) => (
                        <button
                            key={day.id}
                            className={`${styles.mapPopupTab} ${activeDayId === day.id ? styles.mapPopupTabActive : ""}`}
                            onClick={() => setActiveDayId(day.id)}
                        >
                            Day {day.day_number}
                            <span>{day.day_date}</span>
                        </button>
                    ))}
                </div>

                <div ref={containerRef} className={styles.mapPopupMap} />
            </div>
        </div>
    );
}

const TripPage = () => {
    const t = useTranslations("trip");
    const params = useParams();
    const tripId = params.id as string;
    const storageKey = STORAGE_PREFIX + tripId;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itenirary, setItenirary] = useState<Itenirary | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        // 1. Try localStorage first
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed: Itenirary = JSON.parse(stored);
                setItenirary(parsed);
                setLoading(false);
                return;
            } catch {
                localStorage.removeItem(storageKey);
            }
        }

        // 2. Try sessionStorage (fresh from plan page)
        const raw = sessionStorage.getItem("plan");
        if (!raw) {
            setError("Trip not found");
            setLoading(false);
            return;
        }

        sessionStorage.removeItem("plan");
        setSaving(true);

        const build = async () => {
            try {
                const plan = JSON.parse(raw);
                const from = new Date(plan.dates.from);
                const to = plan.dates.to ? new Date(plan.dates.to) : from;
                const numDays = differenceInDays(to, from) + 1;

                const destRes = await axios.get<Destination[]>("/api/v1/destinations");
                const allDests = destRes.data.filter(
                    (d) => d.latitude != null && d.longitude != null,
                );

                if (allDests.length < 3) {
                    setError("Not enough destinations with coordinates.");
                    setLoading(false);
                    return;
                }

                const used = new Set<number>();
                const days: IteneraryDay[] = [];

                for (let i = 0; i < numDays; i++) {
                    const available = allDests.filter((d) => !used.has(d.id));
                    if (available.length < 3) break;

                    const firstIdx = Math.floor(Math.random() * available.length);
                    const first = available[firstIdx];
                    used.add(first.id);

                    const sorted = available
                        .filter((d) => d.id !== first.id)
                        .map((d) => ({
                            dest: d,
                            dist: haversineKm(
                                first.latitude!,
                                first.longitude!,
                                d.latitude!,
                                d.longitude!,
                            ),
                        }))
                        .sort((a, b) => a.dist - b.dist);

                    const second = sorted[0].dest;
                    const third = sorted[1].dest;
                    used.add(second.id);
                    used.add(third.id);

                    const dateStr = format(addDays(from, i), "yyyy-MM-dd");
                    const dayId = -(i + 1);
                    const baseItemId = i * 3;

                    const dests = [first, second, third];
                    days.push({
                        id: dayId,
                        itinerary_id: Number(tripId),
                        day_date: dateStr,
                        day_number: i + 1,
                        items: dests.map((d, idx) => ({
                            id: -(baseItemId + idx + 1),
                            itinerary_day_id: dayId,
                            destination_id: d.id,
                            title: d.name,
                            description: d.description,
                            start_time: TIME_SLOTS[idx].start,
                            end_time: TIME_SLOTS[idx].end,
                            item_type: "destination",
                            image_url: d.media?.[0]?.secure_url,
                            latitude: d.latitude,
                            longitude: d.longitude,
                        })),
                    });
                }

                const itinerary: Itenirary = {
                    id: Number(tripId),
                    user_id: 0,
                    title: plan.title || "My Trip",
                    notes: "",
                    start_date: format(from, "yyyy-MM-dd"),
                    end_date: format(to, "yyyy-MM-dd"),
                    visibility: "private",
                    created_at: new Date().toISOString(),
                    days,
                };

                localStorage.setItem(storageKey, JSON.stringify(itinerary));
                setItenirary(itinerary);
            } catch (err) {
                console.error("Failed to build itinerary:", err);
                setError("Failed to generate itinerary. Please try again.");
            } finally {
                setLoading(false);
                setSaving(false);
            }
        };

        build();
    }, [tripId, storageKey]);

    const selectedDay = useMemo(() => {
        if (!itenirary?.days) return null;
        return itenirary.days.find((day) => day.id === selectedDayId) ?? itenirary.days[0];
    }, [itenirary?.days, selectedDayId]);

    useEffect(() => {
        if (itenirary?.days?.length && selectedDayId === null) {
            setSelectedDayId(itenirary.days[0].id);
        }
    }, [itenirary, selectedDayId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const [activeItem, setActiveItem] = useState<IteneraryItem | null>(null);

    if (loading) {
        const MotionLoader = motion(Loader2);
        return (
            <div className={styles.fullLoader}>
                <MotionLoader
                    size={60}
                    className="text-(--primary-clr)"
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        ease: "linear",
                    }}
                />
                <p className="mt-4 text-(--light-fg) font-medium">
                    {saving ? t("building") : "Loading..."}
                </p>
            </div>
        );
    }

    if (error || !itenirary) {
        return (
            <div className={styles.fullLoader}>
                <p className="text-(--light-fg)">{error || "Trip not found"}</p>
            </div>
        );
    }

    const handleDragStart = (event: DragStartEvent) => {
        const item = selectedDay?.items?.find((i) => i.id === event.active.id);
        if (item) setActiveItem(item);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveItem(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItenirary((prev) => {
            if (!prev?.days) return prev;
            const updatedDays = prev.days.map((day) => {
                if (day.id !== selectedDayId || !day.items) return day;
                const oldIndex = day.items.findIndex((i) => i.id === active.id);
                const newIndex = day.items.findIndex((i) => i.id === over.id);
                if (oldIndex === -1 || newIndex === -1) return day;
                const reordered = arrayMove(day.items, oldIndex, newIndex);
                return {
                    ...day,
                    items: reordered.map((item, idx) => ({
                        ...item,
                        start_time: TIME_SLOTS[idx].start,
                        end_time: TIME_SLOTS[idx].end,
                    })),
                };
            });
            const updated = { ...prev, days: updatedDays };
            localStorage.setItem(storageKey, JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={styles.container}
        >
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>{itenirary.title}</h1>

                    <p>
                        <CalendarDays size={16} />
                        {itenirary.start_date} — {itenirary.end_date}
                    </p>
                </div>

                <div className={styles.actions}>
                    <button onClick={() => setShowMap(true)}>
                        <Map />
                        {t("map_view")}
                    </button>

                    <button>
                        <Share2 />
                        {t("share_trip")}
                    </button>
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.start}>
                    <div className={styles.days}>
                        {itenirary.days?.map((day) => (
                            <div
                                key={day.id}
                                onClick={() => setSelectedDayId(day.id)}
                                className={`${styles.day} ${
                                    selectedDayId === day.id ? styles.active : ""
                                }`}
                            >
                                <h3>
                                    {day.day_number
                                        .toString()
                                        .padStart(2, "0")}
                                </h3>

                                <p>{t("day_label")}</p>
                            </div>
                        ))}

                        <div className={styles.day}>
                            <Plus />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.3 }}
                            key={selectedDay?.id}
                            className={styles.itenerary}
                        >
                            {!selectedDay ||
                            !selectedDay.items ||
                            selectedDay.items.length === 0 ? (
                                <h1>{t("empty_day")}</h1>
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={selectedDay.items.map(
                                            (i) => i.id,
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {selectedDay.items.map((item) => (
                                            <SortableItem
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </SortableContext>

                                    <DragOverlay>
                                        {activeItem ? (
                                            <div
                                                className={styles.iteneraryItem}
                                            >
                                                <div
                                                    className={
                                                        styles.imageContainer
                                                    }
                                                >
                                                    <Image
                                                        src={"/p2.jpg"}
                                                        alt={activeItem.title}
                                                        width={0}
                                                        height={0}
                                                        sizes="100vw"
                                                        style={{
                                                            width: "100%",
                                                            height: "auto",
                                                        }}
                                                    />
                                                </div>
                                                <div className={styles.details}>
                                                    <p className="flex items-center justify-start gap-2">
                                                        <AlarmClock size={16} />
                                                        {
                                                            activeItem.start_time
                                                        }{" "}
                                                        - {activeItem.end_time}
                                                    </p>
                                                    <h3>
                                                        {activeItem.title}
                                                    </h3>
                                                    <p>
                                                        {activeItem.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </DragOverlay>
                                </DndContext>
                            )}

                            <div className={styles.addOne}>
                                <Plus />
                                <p>{t("drag_hint")}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className={styles.end}>
                    <h1 className="flex gap-2 text-[1.1rem] font-bold">
                        <Lightbulb className="text-(--primary-clr)" />
                        {t("recommendations")}
                    </h1>

                    <div className={styles.recoms}>
                        <p className="text-center">
                            {t("no_recommendations")}
                        </p>
                    </div>
                </div>
            </div>

            {showMap && itenirary.days && (
                <MapViewPopup
                    days={itenirary.days}
                    onClose={() => setShowMap(false)}
                />
            )}
        </motion.div>
    );
};

export default TripPage;
