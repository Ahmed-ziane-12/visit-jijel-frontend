"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import { EventClickArg, DateSelectArg, EventInput } from "@fullcalendar/core";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./Calendar.module.css";

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date | string;
    end?: Date | string;
    allDay?: boolean;
    description?: string;
    location?: string;
    attendees?: number;
    color?: string;
    tripId?: number;
}

interface CalendarProps {
    events: CalendarEvent[];
    onEventAdd?: (event: CalendarEvent) => void;
    onEventUpdate?: (event: CalendarEvent) => void;
    onEventDelete?: (eventId: string) => void;
    onEventClick?: (event: CalendarEvent) => void;
    initialView?:
        | "dayGridMonth"
        | "timeGridWeek"
        | "timeGridDay"
        | "listWeek"
        | "multiMonthYear";
    height?: string | number;
    weekends?: boolean;
    editable?: boolean;
    selectable?: boolean;
}

export default function Calendar({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete,
    onEventClick,
    initialView = "dayGridMonth",
    height = "auto",
    weekends = true,
    editable = true,
    selectable = true,
}: CalendarProps) {
    const t = useTranslations("calendar");
    const calendarRef = useRef<FullCalendar>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null,
    );
    const [showEventModal, setShowEventModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
        title: "",
        description: "",
        location: "",
        attendees: 1,
        start: new Date(),
        end: new Date(),
        allDay: false,
    });

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setEventForm({
            title: "",
            description: "",
            location: "",
            attendees: 1,
            start: selectInfo.start,
            end: selectInfo.end || selectInfo.start,
            allDay: selectInfo.allDay,
        });
        setIsEditing(false);
        setShowEventModal(true);
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        const event: CalendarEvent = {
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.start!,
            end: clickInfo.event.end || undefined,
            allDay: clickInfo.event.allDay,
            description: clickInfo.event.extendedProps.description,
            location: clickInfo.event.extendedProps.location,
            attendees: clickInfo.event.extendedProps.attendees,
            color: clickInfo.event.backgroundColor,
        };

        setSelectedEvent(event);
        setEventForm(event);
        setIsEditing(true);
        setShowEventModal(true);

        if (onEventClick) {
            onEventClick(event);
        }
    };

    const handleEventDrop = (dropInfo: any) => {
        const updatedEvent: CalendarEvent = {
            id: dropInfo.event.id,
            title: dropInfo.event.title,
            start: dropInfo.event.start,
            end: dropInfo.event.end || undefined,
            allDay: dropInfo.event.allDay,
            description: dropInfo.event.extendedProps.description,
            location: dropInfo.event.extendedProps.location,
            attendees: dropInfo.event.extendedProps.attendees,
        };

        if (onEventUpdate) {
            onEventUpdate(updatedEvent);
        }
    };

    const handleEventResize = (resizeInfo: any) => {
        const updatedEvent: CalendarEvent = {
            id: resizeInfo.event.id,
            title: resizeInfo.event.title,
            start: resizeInfo.event.start,
            end: resizeInfo.event.end || undefined,
            allDay: resizeInfo.event.allDay,
            description: resizeInfo.event.extendedProps.description,
            location: resizeInfo.event.extendedProps.location,
            attendees: resizeInfo.event.extendedProps.attendees,
        };

        if (onEventUpdate) {
            onEventUpdate(updatedEvent);
        }
    };

    const handleSaveEvent = () => {
        if (!eventForm.title) {
            alert(t("event_title_required"));
            return;
        }

        const newEvent: CalendarEvent = {
            id:
                isEditing && selectedEvent
                    ? selectedEvent.id
                    : Date.now().toString(),
            title: eventForm.title!,
            start: eventForm.start!,
            end: eventForm.end,
            allDay: eventForm.allDay,
            description: eventForm.description,
            location: eventForm.location,
            attendees: eventForm.attendees,
        };

        if (isEditing && onEventUpdate) {
            onEventUpdate(newEvent);
        } else if (onEventAdd) {
            onEventAdd(newEvent);
        }

        setShowEventModal(false);
        setEventForm({
            title: "",
            description: "",
            location: "",
            attendees: 1,
            start: new Date(),
            end: new Date(),
            allDay: false,
        });
        setIsEditing(false);
        setSelectedEvent(null);
    };

    const handleDeleteEvent = () => {
        if (selectedEvent && onEventDelete) {
            onEventDelete(selectedEvent.id);
            setShowEventModal(false);
            setSelectedEvent(null);
        }
    };

    const formatEventsForCalendar = (): EventInput[] => {
        return events.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            backgroundColor: event.color || "#eb662b",
            borderColor: event.color || "#eb662b",
            extendedProps: {
                description: event.description,
                location: event.location,
                attendees: event.attendees,
                tripId: event.tripId,
            },
        }));
    };

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarWrapper}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                        listPlugin,
                        multiMonthPlugin,
                    ]}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                    }}
                    initialView={initialView}
                    events={formatEventsForCalendar()}
                    selectable={selectable}
                    selectMirror={true}
                    editable={editable}
                    droppable={true}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    weekends={weekends}
                    height={height}
                    slotMinTime="06:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={true}
                    nowIndicator={true}
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        meridiem: false,
                        hour12: false,
                    }}
                    titleFormat={{ year: "numeric", month: "long" }}
                    buttonText={{
                        today: t("today"),
                        month: t("month"),
                        week: t("week"),
                        day: t("day"),
                        list: t("list"),
                    }}
                    locale="en"
                    firstDay={1}
                />
            </div>

            {/* Event Modal */}
            <AnimatePresence>
                {showEventModal && (
                    <>
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEventModal(false)}
                        />
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>
                                    {t(isEditing ? "edit_event_title" : "add_event_title")}
                                </h2>
                                <button
                                    className={styles.closeButton}
                                    onClick={() => setShowEventModal(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <CalendarIcon size={16} />
                                        {t("event_title_label")}
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={eventForm.title}
                                        onChange={(e) =>
                                            setEventForm({
                                                ...eventForm,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder={t("event_title_placeholder")}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>
                                            {t("start_label")}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={styles.input}
                                            value={
                                                eventForm.start
                                                    ? new Date(eventForm.start)
                                                          .toISOString()
                                                          .slice(0, 16)
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setEventForm({
                                                    ...eventForm,
                                                    start: new Date(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>

                                    {!eventForm.allDay && (
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                {t("end_label")}
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className={styles.input}
                                                value={
                                                    eventForm.end
                                                        ? new Date(
                                                              eventForm.end,
                                                          )
                                                              .toISOString()
                                                              .slice(0, 16)
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setEventForm({
                                                        ...eventForm,
                                                        end: new Date(
                                                            e.target.value,
                                                        ),
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={eventForm.allDay}
                                            onChange={(e) =>
                                                setEventForm({
                                                    ...eventForm,
                                                    allDay: e.target.checked,
                                                })
                                            }
                                        />
                                        {t("all_day_label")}
                                    </label>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <MapPin size={16} />
                                        {t("location_label")}
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={eventForm.location || ""}
                                        onChange={(e) =>
                                            setEventForm({
                                                ...eventForm,
                                                location: e.target.value,
                                            })
                                        }
                                        placeholder={t("location_placeholder")}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <Users size={16} />
                                        {t("attendees_label")}
                                    </label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={eventForm.attendees || 1}
                                        onChange={(e) =>
                                            setEventForm({
                                                ...eventForm,
                                                attendees: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        min={1}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        {t("description_label")}
                                    </label>
                                    <textarea
                                        className={styles.textarea}
                                        value={eventForm.description || ""}
                                        onChange={(e) =>
                                            setEventForm({
                                                ...eventForm,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder={t("description_placeholder")}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                {isEditing && (
                                    <button
                                        className={styles.deleteButton}
                                        onClick={handleDeleteEvent}
                                    >
                                        {t("delete_btn")}
                                    </button>
                                )}
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.cancelButton}
                                        onClick={() => setShowEventModal(false)}
                                    >
                                        {t("cancel_btn")}
                                    </button>
                                    <button
                                        className={styles.saveButton}
                                        onClick={handleSaveEvent}
                                    >
                                        {t(isEditing ? "update_btn" : "save_btn")}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
