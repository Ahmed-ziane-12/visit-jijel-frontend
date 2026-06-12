"use client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import styles from "./trip.module.css";
import { Itenirary, IteneraryItem } from "@/types/map";
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

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const [itenirary, setItenirary] = useState<Itenirary>({
        id: 1,
        user_id: 3,
        title: "My First Jijel Trip",
        notes: "great",
        start_date: "12-04-2026",
        end_date: "17-04-2026",
        visibility: "private",
        created_at: "10-04-2026",
        days: [
            {
                id: 1,
                itinerary_id: 1,
                day_date: "12-04-2026",
                day_number: 1,
                items: [
                    {
                        id: 1,
                        itinerary_day_id: 1,
                        destination_id: 11,
                        title: "Black Rock Beach",
                        description:
                            "A great rocky beach with stunning coastal views and photo spots",
                        start_time: "08:00",
                        end_time: "10:00",
                        item_type: "destination",
                        image_url: "/phare.jpg",
                    },
                    {
                        id: 2,
                        itinerary_day_id: 1,
                        destination_id: 14,
                        title: "Old Town Market",
                        description:
                            "Traditional market filled with local crafts and street food",
                        start_time: "11:00",
                        end_time: "13:00",
                        item_type: "activity",
                        image_url: "/p2.jpg",
                    },
                    {
                        id: 3,
                        itinerary_day_id: 1,
                        destination_id: 18,
                        title: "Sunset Cliff Cafe",
                        description:
                            "Relaxing cafe overlooking the sea with a perfect sunset view",
                        start_time: "18:00",
                        end_time: "20:00",
                        item_type: "restaurant",
                        image_url: "/zoo.jpg",
                    },
                ],
            },
            {
                id: 2,
                itinerary_id: 1,
                day_date: "13-04-2026",
                day_number: 2,
                items: [
                    {
                        id: 4,
                        itinerary_day_id: 2,
                        destination_id: 21,
                        title: "Green Valley Hike",
                        description:
                            "A peaceful hiking trail through forests and waterfalls",
                        start_time: "07:30",
                        end_time: "10:30",
                        item_type: "activity",
                        image_url: "/p4.jpg",
                    },
                    {
                        id: 5,
                        itinerary_day_id: 2,
                        destination_id: 24,
                        title: "Mountain View Point",
                        description:
                            "Popular panoramic viewpoint for landscape photography",
                        start_time: "12:00",
                        end_time: "13:30",
                        item_type: "destination",
                        image_url: "/p5.jpg",
                    },
                    {
                        id: 6,
                        itinerary_day_id: 2,
                        destination_id: 27,
                        title: "Lakefront Restaurant",
                        description:
                            "Local restaurant known for grilled fish and lake scenery",
                        start_time: "19:00",
                        end_time: "21:00",
                        item_type: "restaurant",
                        image_url: "/p9.png",
                    },
                ],
            },
            {
                id: 3,
                itinerary_id: 1,
                day_date: "14-04-2026",
                day_number: 3,
                items: [
                    {
                        id: 7,
                        itinerary_day_id: 3,
                        destination_id: 31,
                        title: "Ancient Ruins Tour",
                        description:
                            "Guided exploration of historic ruins and ancient architecture",
                        start_time: "09:00",
                        end_time: "11:00",
                        item_type: "destination",
                    },
                    {
                        id: 8,
                        itinerary_day_id: 3,
                        destination_id: 34,
                        title: "City Art Museum",
                        description:
                            "Modern and classical art exhibitions from regional artists",
                        start_time: "13:00",
                        end_time: "15:00",
                        item_type: "activity",
                    },
                    {
                        id: 9,
                        itinerary_day_id: 3,
                        destination_id: 39,
                        title: "Harbour Night Walk",
                        description:
                            "Evening walk through the illuminated harbour district",
                        start_time: "20:00",
                        end_time: "22:00",
                        item_type: "activity",
                    },
                ],
            },
        ],
    });

    const [selectedDayId, setSelectedDayId] = useState(
        itenirary.days?.[0]?.id || null,
    );

    const selectedDay = useMemo(() => {
        return itenirary.days?.find((day) => day.id === selectedDayId);
    }, [itenirary.days, selectedDayId]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const [activeItem, setActiveItem] = useState<IteneraryItem | null>(null);

    const MotionLoader = motion(Loader2);
    if (loading)
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
            </div>
        );

    const handleDragStart = (event: DragStartEvent) => {
        const item = selectedDay?.items?.find((i) => i.id === event.active.id);
        if (item) setActiveItem(item);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveItem(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItenirary((prev) => {
            if (!prev.days) return prev;
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
                        {itenirary.created_at}
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
                        {!itenirary.days ? (
                            <h1>{t("empty_trip")}</h1>
                        ) : (
                            itenirary.days.map((day) => (
                                <div
                                    key={day.id}
                                    onClick={() => setSelectedDayId(day.id)}
                                    className={`${styles.day} ${
                                        selectedDayId === day.id
                                            ? styles.active
                                            : ""
                                    }`}
                                >
                                    <h3>
                                        {day.day_number
                                            .toString()
                                            .padStart(2, "0")}
                                    </h3>

                                    <p>{t("day_label")}</p>
                                </div>
                            ))
                        )}

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
                                                    <h3>{activeItem.title}</h3>
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
