"use client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import styles from "./trip.module.css";
import type { Itenirary, IteneraryItem, IteneraryDay, Destination } from "@/types/map";
import { useEffect, useMemo, useState } from "react";
import {
    AlarmClock,
    CalendarDays,
    GripVertical,
    Lightbulb,
    Loader2,
    Map,
    Plus,
    Share2,
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

// ── Haversine distance (km) ───────────────────────────────────
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

// ── Sortable item component ───────────────────────────────────
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

const TripPage = () => {
    const t = useTranslations("trip");
    const params = useParams();
    const tripId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [itenirary, setItenirary] = useState<Itenirary | null>(null);

    // Generate itinerary on mount
    useEffect(() => {
        const raw = sessionStorage.getItem("plan");

        if (!raw) {
            // No plan — try to fetch existing itinerary from backend
            axios
                .get<Itenirary>(`/api/v1/itineraries/${tripId}`)
                .then((res) => {
                    setItenirary(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    setError("Itinerary not found");
                    setLoading(false);
                });
            return;
        }

        sessionStorage.removeItem("plan");

        const build = async () => {
            try {
                const plan = JSON.parse(raw);
                const from = new Date(plan.dates.from);
                const to = plan.dates.to ? new Date(plan.dates.to) : from;
                const numDays = differenceInDays(to, from) + 1;

                // Fetch all destinations
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
                    // Available destinations (not yet used)
                    const available = allDests.filter((d) => !used.has(d.id));
                    if (available.length < 3) break;

                    // Pick a random first destination
                    const firstIdx = Math.floor(Math.random() * available.length);
                    const first = available[firstIdx];
                    used.add(first.id);

                    // Find 2 closest to first
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
                    // Temporary IDs (negative) for drag-and-drop before server save
                    const dayId = -(i + 1);
                    const baseItemId = i * 3;

                    days.push({
                        id: dayId,
                        itinerary_id: 0,
                        day_date: dateStr,
                        day_number: i + 1,
                        items: [
                            {
                                id: -(baseItemId + 1),
                                itinerary_day_id: dayId,
                                destination_id: first.id,
                                title: first.name,
                                description: first.description,
                                start_time: "08:30",
                                end_time: "10:30",
                                item_type: "destination",
                                image_url: first.media?.[0]?.secure_url,
                            },
                            {
                                id: -(baseItemId + 2),
                                itinerary_day_id: dayId,
                                destination_id: second.id,
                                title: second.name,
                                description: second.description,
                                start_time: "11:00",
                                end_time: "13:00",
                                item_type: "destination",
                                image_url: second.media?.[0]?.secure_url,
                            },
                            {
                                id: -(baseItemId + 3),
                                itinerary_day_id: dayId,
                                destination_id: third.id,
                                title: third.name,
                                description: third.description,
                                start_time: "13:30",
                                end_time: "15:30",
                                item_type: "destination",
                                image_url: third.media?.[0]?.secure_url,
                            },
                        ],
                    });
                }

                // Save to backend
                const itinRes = await axios.post<Itenirary>("/api/v1/itineraries", {
                    title: plan.title || "My Trip",
                    start_date: format(from, "yyyy-MM-dd"),
                    end_date: format(to, "yyyy-MM-dd"),
                });

                const savedItin = itinRes.data;

                for (const day of days) {
                    const dayRes = await axios.post<IteneraryDay>(
                        `/api/v1/itineraries/${savedItin.id}/days`,
                        {
                            day_date: day.day_date,
                            day_number: day.day_number,
                        },
                    );
                    const savedDay = dayRes.data;

                    for (const item of day.items!) {
                        const itemRes = await axios.post<IteneraryItem>(
                            `/api/v1/itineraries/${savedItin.id}/days/${savedDay.id}/items`,
                            {
                                destination_id: item.destination_id,
                                title: item.title,
                                notes: item.description,
                                start_time: item.start_time,
                                end_time: item.end_time,
                                sort_order: day.items!.indexOf(item),
                                item_type: "destination",
                            },
                        );
                        // Update the item ID with the server-assigned one
                        item.id = itemRes.data.id;
                        item.itinerary_day_id = itemRes.data.itinerary_day_id;
                    }

                    // Update day ID with server-assigned one
                    day.id = savedDay.id;
                    day.itinerary_id = savedDay.itinerary_id;
                }

                setItenirary({
                    ...savedItin,
                    days,
                });
            } catch (err) {
                console.error("Failed to build itinerary:", err);
                setError("Failed to generate itinerary. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        build();
    }, [tripId]);

    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

    const selectedDay = useMemo(() => {
        if (!itenirary?.days) return null;
        return itenirary.days.find((day) => day.id === selectedDayId) ?? itenirary.days[0];
    }, [itenirary?.days, selectedDayId]);

    // Auto-select first day when data loads
    useEffect(() => {
        if (itenirary?.days?.length && selectedDayId === null) {
            setSelectedDayId(itenirary.days[0].id);
        }
    }, [itenirary, selectedDayId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const [activeItem, setActiveItem] = useState<IteneraryItem | null>(null);

    // ── Loading state ───────────────────────────────────────────
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
                    {t("building")}
                </p>
            </div>
        );
    }
    // ── Error state ─────────────────────────────────────────────
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
                return {
                    ...day,
                    items: arrayMove(day.items, oldIndex, newIndex),
                };
            });
            return { ...prev, days: updatedDays };
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
                    <button>
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
        </motion.div>
    );
};

export default TripPage;
