"use client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import styles from "./trip.module.css";
import type {
    Itenirary,
    IteneraryItem,
    IteneraryDay,
    TripCandidate,
} from "@/types/map";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlarmClock,
    CalendarDays,
    Check,
    GripVertical,
    Lightbulb,
    Loader2,
    Map,
    Plus,
    Save,
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
import { addDays, format } from "date-fns";
import { AxiosError } from "axios";
import {
    SLOTS as TIME_SLOTS,
    TripItemPayload,
    addTripDay,
    addTripItem,
    deleteTripDay,
    deleteTripItem,
    fetchRecommendations,
    fetchTrip,
    saveTrip,
    updateTripItem,
} from "@/lib/itinerary";
import ConfirmDialog from "@/app/[locale]/components/ConfirmDialog/ConfirmDialog";

const MotionLoader = motion(Loader2);

type ConfirmTarget =
    | { kind: "day"; dayId: number }
    | { kind: "item"; dayId: number; itemId: number };

function SortableItem({
    item,
    onRemove,
}: {
    item: IteneraryItem;
    onRemove: () => void;
}) {
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

            <button
                className={styles.itemRemove}
                aria-label="Remove activity"
                onClick={onRemove}
            >
                <X size={16} />
            </button>
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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [itenirary, setItenirary] = useState<Itenirary | null>(null);
    const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const [savingDraft, setSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [addingDay, setAddingDay] = useState(false);
    const [addingItemId, setAddingItemId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);

    const [candidates, setCandidates] = useState<TripCandidate[]>([]);
    const [recsLoading, setRecsLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const data = await fetchTrip(tripId);
                if (cancelled) return;
                setItenirary(data);
                setLoading(false);
            } catch (err) {
                if (cancelled) return;
                const status = (err as AxiosError).response?.status;
                setError(status === 401 || status === 403 ? "login_required" : "not_found");
                setLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [tripId]);

    const selectedDay = itenirary?.days
        ? (itenirary.days.find((day) => day.id === selectedDayId) ??
          itenirary.days[0])
        : null;

    const loadRecommendations = useCallback(async () => {
        try {
            const data = await fetchRecommendations(tripId, 10);
            setCandidates(data);
        } catch {
            setCandidates([]);
        } finally {
            setRecsLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        // Deferred so the effect itself does not trigger a cascading render.
        const timer = window.setTimeout(() => {
            void loadRecommendations();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [loadRecommendations]);

    const [activeItem, setActiveItem] = useState<IteneraryItem | null>(null);

    if (loading) {
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
                    {t("loading")}
                </p>
            </div>
        );
    }

    if (error || !itenirary) {
        return (
            <div className={styles.fullLoader}>
                <p className="text-(--light-fg)">
                    {error ? t(error) : t("not_found")}
                </p>
            </div>
        );
    }

    const persistOrder = async (dayId: number, items: IteneraryItem[]) => {
        try {
            await Promise.all(
                items.map((item, idx) =>
                    updateTripItem(tripId, dayId, item.id, {
                        sort_order: idx,
                        start_time: TIME_SLOTS[idx].start,
                        end_time: TIME_SLOTS[idx].end,
                    }),
                ),
            );
        } catch {
            setActionError(t("action_failed"));
            try {
                const fresh = await fetchTrip(tripId);
                setItenirary(fresh);
            } catch {
                /* ignore */
            }
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const item = selectedDay?.items?.find((i) => i.id === event.active.id);
        if (item) setActiveItem(item);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveItem(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (!selectedDay?.items) return;

        const oldIndex = selectedDay.items.findIndex((i) => i.id === active.id);
        const newIndex = selectedDay.items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(selectedDay.items, oldIndex, newIndex).map(
            (item, idx) => ({
                ...item,
                start_time: TIME_SLOTS[idx].start,
                end_time: TIME_SLOTS[idx].end,
                sort_order: idx,
            }),
        );

        setItenirary((prev) =>
            prev
                ? {
                      ...prev,
                      days: (prev.days ?? []).map((d) =>
                          d.id === selectedDay.id
                              ? { ...d, items: reordered }
                              : d,
                      ),
                  }
                : prev,
        );

        void persistOrder(selectedDay.id, reordered);
    };

    const handleAddDay = async () => {
        if (!itenirary) return;
        setAddingDay(true);
        setActionError(null);
        try {
            const days = itenirary.days ?? [];
            const last = days[days.length - 1];
            const nextDate = last
                ? addDays(new Date(last.day_date + "T00:00:00"), 1)
                : new Date();
            const dateStr = format(nextDate, "yyyy-MM-dd");
            const nextNumber =
                days.reduce((max, d) => Math.max(max, d.day_number), 0) + 1;

            const day = await addTripDay(tripId, {
                day_date: dateStr,
                day_number: nextNumber,
            });

            setItenirary((prev) => {
                if (!prev) return prev;
                const extended = dateStr > prev.end_date;
                if (extended) {
                    void saveTrip(tripId, {
                        start_date: prev.start_date,
                        end_date: dateStr,
                    });
                }
                return {
                    ...prev,
                    end_date: extended ? dateStr : prev.end_date,
                    days: [...(prev.days ?? []), { ...day, items: [] }],
                };
            });
            setSelectedDayId(day.id);
        } catch {
            setActionError(t("action_failed"));
        } finally {
            setAddingDay(false);
        }
    };

    const handleAddActivity = async (candidate: TripCandidate) => {
        if (!selectedDay) return;
        const items = selectedDay.items ?? [];
        if (items.length >= TIME_SLOTS.length) {
            setActionError(t("day_full"));
            return;
        }

        setActionError(null);
        setAddingItemId(candidate.id);
        try {
            const slot = items.length;
            const payload: TripItemPayload = {
                item_type: candidate.item_type,
                destination_id:
                    candidate.item_type === "destination"
                        ? candidate.id
                        : undefined,
                listing_id:
                    candidate.item_type === "listing" ? candidate.id : undefined,
                event_id:
                    candidate.item_type === "event" ? candidate.id : undefined,
                title: candidate.title,
                notes: candidate.description ?? undefined,
                start_time: TIME_SLOTS[slot].start,
                end_time: TIME_SLOTS[slot].end,
                sort_order: slot,
            };

            const created = await addTripItem(tripId, selectedDay.id, payload);

            setItenirary((prev) =>
                prev
                    ? {
                          ...prev,
                          days: (prev.days ?? []).map((d) =>
                              d.id === selectedDay.id
                                  ? { ...d, items: [...(d.items ?? []), created] }
                                  : d,
                          ),
                      }
                    : prev,
            );
            setCandidates((prev) =>
                prev.filter(
                    (c) =>
                        !(
                            c.item_type === candidate.item_type &&
                            c.id === candidate.id
                        ),
                ),
            );
        } catch {
            setActionError(t("action_failed"));
        } finally {
            setAddingItemId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!confirm) return;
        setDeleting(true);
        setActionError(null);
        try {
            if (confirm.kind === "day") {
                await deleteTripDay(tripId, confirm.dayId);
                setItenirary((prev) =>
                    prev
                        ? {
                              ...prev,
                              days: (prev.days ?? [])
                                  .filter((d) => d.id !== confirm.dayId)
                                  .map((d, i) => ({ ...d, day_number: i + 1 })),
                          }
                        : prev,
                );
            } else {
                await deleteTripItem(tripId, confirm.dayId, confirm.itemId);
                setItenirary((prev) =>
                    prev
                        ? {
                              ...prev,
                              days: (prev.days ?? []).map((d) =>
                                  d.id === confirm.dayId
                                      ? {
                                            ...d,
                                            items: (d.items ?? []).filter(
                                                (i) => i.id !== confirm.itemId,
                                            ),
                                        }
                                      : d,
                              ),
                          }
                        : prev,
                );
                void loadRecommendations();
            }
        } catch {
            setActionError(t("action_failed"));
        } finally {
            setDeleting(false);
            setConfirm(null);
        }
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        setActionError(null);
        try {
            await saveTrip(tripId, { status: "draft" });
            setDraftSaved(true);
            window.setTimeout(() => setDraftSaved(false), 2500);
        } catch {
            setActionError(t("action_failed"));
        } finally {
            setSavingDraft(false);
        }
    };

    const selectedItems = selectedDay?.items ?? [];
    const dayFull = selectedItems.length >= TIME_SLOTS.length;

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

                    <button onClick={handleSaveDraft} disabled={savingDraft}>
                        {draftSaved ? <Check size={16} /> : <Save size={16} />}
                        {draftSaved ? t("saved") : t("save_draft")}
                    </button>
                </div>
            </div>

            {actionError && (
                <p className={styles.actionError} role="alert">
                    {actionError}
                </p>
            )}

            <div className={styles.main}>
                <div className={styles.start}>
                    <div className={styles.days}>
                        {itenirary.days?.map((day) => (
                            <div
                                key={day.id}
                                onClick={() => setSelectedDayId(day.id)}
                                className={`${styles.day} ${
                                    selectedDay?.id === day.id ? styles.active : ""
                                }`}
                            >
                                <h3>
                                    {day.day_number
                                        .toString()
                                        .padStart(2, "0")}
                                </h3>

                                <p>{t("day_label")}</p>

                                {selectedDay?.id === day.id && (
                                    <button
                                        className={styles.dayDelete}
                                        aria-label={t("delete_day_title")}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirm({
                                                kind: "day",
                                                dayId: day.id,
                                            });
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            className={styles.day}
                            aria-label={t("add_day")}
                            onClick={handleAddDay}
                            disabled={addingDay}
                        >
                            {addingDay ? (
                                <Loader2
                                    size={20}
                                    className="animate-spin text-(--light-fg)"
                                />
                            ) : (
                                <Plus />
                            )}
                        </button>
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
                                                onRemove={() =>
                                                    setConfirm({
                                                        kind: "item",
                                                        dayId: selectedDay.id,
                                                        itemId: item.id,
                                                    })
                                                }
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
                                                        src={
                                                            activeItem.image_url ||
                                                            "/p2.jpg"
                                                        }
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
                                                        <AlarmClock
                                                            size={16}
                                                        />
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
                        {recsLoading ? (
                            <Loader2
                                size={28}
                                className="mx-auto animate-spin text-(--light-fg)"
                            />
                        ) : candidates.length === 0 ? (
                            <p className={styles.recomEmpty}>
                                {t("no_recommendations")}
                            </p>
                        ) : (
                            candidates.map((c) => {
                                const busy = addingItemId !== null;
                                return (
                                    <div
                                        key={`${c.item_type}-${c.id}`}
                                        className={styles.recomCard}
                                    >
                                        <div className={styles.recomThumb}>
                                            {c.image_url ? (
                                                <Image
                                                    src={c.image_url}
                                                    alt={c.title}
                                                    fill
                                                    sizes="56px"
                                                    style={{
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className={
                                                        styles.recomThumbFallback
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div className={styles.recomInfo}>
                                            <h4>{c.title}</h4>
                                            {c.description ? (
                                                <p>{c.description}</p>
                                            ) : null}
                                            {c.rating !== undefined && (
                                                <span
                                                    className={styles.recomMeta}
                                                >
                                                    ★ {c.rating.toFixed(1)}
                                                    {c.price !== null &&
                                                        c.price !== undefined &&
                                                        ` · ${c.price.toLocaleString()} DZD`}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className={styles.recomAdd}
                                            aria-label={t("add_activity")}
                                            title={
                                                dayFull
                                                    ? t("day_full")
                                                    : t("add_activity")
                                            }
                                            disabled={dayFull || busy}
                                            onClick={() =>
                                                void handleAddActivity(c)
                                            }
                                        >
                                            {addingItemId === c.id ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Plus size={16} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {showMap && itenirary.days && (
                <MapViewPopup
                    days={itenirary.days}
                    onClose={() => setShowMap(false)}
                />
            )}

            {confirm && (
                <ConfirmDialog
                    open
                    theme="danger"
                    title={
                        confirm.kind === "day"
                            ? t("delete_day_title")
                            : t("delete_item_title")
                    }
                    message={
                        confirm.kind === "day"
                            ? t("delete_day_message")
                            : t("delete_item_message")
                    }
                    confirmLabel={t("delete_confirm")}
                    loading={deleting}
                    onConfirm={() => void handleConfirmDelete()}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </motion.div>
    );
};

export default TripPage;