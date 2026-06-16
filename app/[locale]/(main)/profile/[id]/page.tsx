"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera,
    User,
    Mail,
    Phone,
    FileText,
    Briefcase,
    CalendarDays,
    Heart,
    Settings,
    Save,
} from "lucide-react";
import Image from "next/image";
import styles from "./profile.module.css";
import axios from "@/lib/axios";
import UploadModal from "@/app/[locale]/components/UploadModal/UploadModal";
import dynamic from "next/dynamic";
import { CalendarEvent } from "../../../components/Calendar/Calendar";
import { Media } from "@/types/map";

// Dynamically import Calendar to avoid SSR issues
// const Calendar = dynamic(
//     () => import("../../../components/Calendar/Calendar"),
//     {
//         ssr: false,
//         loading: () => (
//             <div className={styles.calendarLoading}>
//                 {t("loading_calendar")}
//             </div>
//         ),
//     },
// );

type TabType = "trips" | "calendar" | "saved" | "settings";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    coverImage?: string;
    profileImage?: string;
}

export default function ProfilePage() {
    const t = useTranslations("profile");
    const tc = useTranslations("common");
    const { user, loading, refreshUser } = useAuth();
    const params = useParams();
    const router = useRouter();
    const profileId = params?.id as string;
    const isOwnProfile = user?.id.toString() === profileId;
    const Calendar = dynamic(
        () => import("../../../components/Calendar/Calendar"),
        {
            ssr: false,
            loading: () => (
                <div className={styles.calendarLoading}>
                    {t("loading_calendar")}
                </div>
            ),
        },
    );

    useEffect(() => {
        if (!loading && user?.profile?.role === "business_owner") {
            router.replace(`/dashboard/`);
        }
    }, [loading, user, profileId, router]);

    const [activeTab, setActiveTab] = useState<TabType>("trips");
    const [isCoverUploadOpen, setIsCoverUploadOpen] = useState(false);
    const [isProfileUploadOpen, setIsProfileUploadOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
    });

    // Fetch user's calendar events
    const fetchEvents = async () => {
        if (!user) return;
        if (user.profile.role == "business_owner") return;

        setEventsLoading(true);
        try {
            const response = await axios.get("/api/v1/user/events");
            const formattedEvents = response.data.map((event: any) => ({
                id: event.id.toString(),
                title: event.title,
                start: new Date(event.start_date),
                end: event.end_date ? new Date(event.end_date) : undefined,
                allDay: event.all_day,
                description: event.description,
                location: event.location,
                attendees: event.attendees,
                color: event.color || "#eb662b",
                tripId: event.trip_id,
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            const media = user.profile?.media ?? [];
            setProfile({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.profile?.phone || "",
                bio: user.profile?.bio || "",
                coverImage:
                    media.find((m: Media) => m.collection === "covers")
                        ?.secure_url ??
                    "https://placehold.net/8-800x600.png",
                profileImage:
                    media.find((m: Media) => m.collection === "profiles")
                        ?.secure_url ??
                    "https://placehold.net/avatar-5.png",
            });
            setEditForm({
                name: user.name,
                email: user.email,
                phone: user.profile?.phone || "",
                bio: user.profile?.bio || "",
            });

            // Fetch events when user is loaded
            fetchEvents();
        }
    }, [user]);

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put("/api/v1/profile", editForm);
            setProfile((prev) => (prev ? { ...prev, ...editForm } : null));
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    // Calendar event handlers
    const handleAddEvent = async (event: CalendarEvent) => {
        try {
            const response = await axios.post("/api/v1/user/events", {
                title: event.title,
                start_date: event.start,
                end_date: event.end,
                all_day: event.allDay,
                description: event.description,
                location: event.location,
                attendees: event.attendees,
            });

            setEvents([
                ...events,
                { ...event, id: response.data.id.toString() },
            ]);
        } catch (error) {
            console.error("Failed to add event:", error);
        }
    };

    const handleUpdateEvent = async (event: CalendarEvent) => {
        try {
            await axios.put(`/api/v1/user/events/${event.id}`, {
                title: event.title,
                start_date: event.start,
                end_date: event.end,
                all_day: event.allDay,
                description: event.description,
                location: event.location,
                attendees: event.attendees,
            });

            setEvents(events.map((e) => (e.id === event.id ? event : e)));
        } catch (error) {
            console.error("Failed to update event:", error);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        try {
            await axios.delete(`/api/v1/user/events/${eventId}`);
            setEvents(events.filter((e) => e.id !== eventId));
        } catch (error) {
            console.error("Failed to delete event:", error);
        }
    };

    const tabs = [
        {
            id: "trips" as TabType,
            label: t("tab_trips"),
            icon: <Briefcase size={20} />,
        },
        {
            id: "calendar" as TabType,
            label: t("tab_calendar"),
            icon: <CalendarDays size={20} />,
        },
        {
            id: "saved" as TabType,
            label: t("tab_saved"),
            icon: <Heart size={20} />,
        },
        {
            id: "settings" as TabType,
            label: t("tab_settings"),
            icon: <Settings size={20} />,
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "trips":
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.tripsContainer}>
                            <h2>{t("no_trips_title")}</h2>
                            <p>{t("no_trips_desc")}</p>
                        </div>
                    </div>
                );
            case "calendar":
                return (
                    <div className={styles.calendarTabContent}>
                        {eventsLoading ? (
                            <div className={styles.calendarLoading}>
                                <div className={styles.spinner} />
                                <p>{t("loading_events")}</p>
                            </div>
                        ) : (
                            <Calendar
                                events={events}
                                onEventAdd={handleAddEvent}
                                onEventUpdate={handleUpdateEvent}
                                onEventDelete={handleDeleteEvent}
                                editable={true}
                                selectable={true}
                                initialView="dayGridMonth"
                                height="600px"
                            />
                        )}
                    </div>
                );
            case "saved":
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.savedContainer}>
                            <h2>{t("no_saved_title")}</h2>
                            <p>{t("no_saved_desc")}</p>
                        </div>
                    </div>
                );
            case "settings":
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.settingsContainer}>
                            <h2>{t("settings_title")}</h2>
                            <p>{t("settings_desc")}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!profile) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <>
            <div className={styles.profilePage}>
                {/* Cover Image Section */}
                <div className={styles.coverSection}>
                    <div className={styles.coverImageContainer}>
                        <Image
                            src={profile.coverImage || "/p4.jpg"}
                            alt={t("cover_alt")}
                            fill
                            className={styles.coverImage}
                        />
                        {isOwnProfile && (
                            <div className={styles.coverOverlay}>
                                <button
                                    className={styles.uploadButton}
                                    onClick={() => setIsCoverUploadOpen(true)}
                                >
                                    <Camera size={20} />
                                    <span>{t("upload_cover")}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Image Section */}
                    <div className={styles.profileImageContainer}>
                        <div className={styles.profileImageWrapper}>
                            <Image
                                src={
                                    profile.profileImage ||
                                    "/default-avatar.jpg"
                                }
                                alt={t("profile_alt")}
                                width={120}
                                height={120}
                                className={styles.profileImage}
                            />
                            {isOwnProfile && (
                                <div className={styles.profileOverlay}>
                                    <button
                                        className={styles.profileUploadButton}
                                        onClick={() =>
                                            setIsProfileUploadOpen(true)
                                        }
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Info Section */}
                <div className={styles.profileInfo}>
                    {isEditing ? (
                        <div className={styles.editForm}>
                            <div className={styles.formGroup}>
                                <label>
                                    <User size={16} />
                                    {t("name_label")}
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <Mail size={16} />
                                    {t("email_label")}
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            email: e.target.value,
                                        })
                                    }
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <Phone size={16} />
                                    {t("phone_label")}
                                </label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <FileText size={16} />
                                    {t("bio_label")}
                                </label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            bio: e.target.value,
                                        })
                                    }
                                    className={styles.textarea}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className={styles.cancelButton}
                                >
                                    {tc("cancel")}
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    className={styles.saveButton}
                                >
                                    <Save size={16} />
                                    {t("save_changes")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.nameSection}>
                                <h1 className={styles.name}>{profile.name}</h1>
                                {isOwnProfile && (
                                    <button
                                        className={styles.editButton}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        {t("edit_profile")}
                                    </button>
                                )}
                            </div>
                            <div className={styles.contactInfo}>
                                <div className={styles.infoItem}>
                                    <Mail size={16} />
                                    <span>{profile.email}</span>
                                </div>
                                {profile.phone && (
                                    <div className={styles.infoItem}>
                                        <Phone size={16} />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                            </div>
                            {profile.bio && (
                                <div className={styles.bio}>
                                    <FileText size={16} />
                                    <p>{profile.bio}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Tabs Section */}
                {isOwnProfile && (
                    <div className={styles.tabsSection}>
                        <div className={styles.tabsHeader}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className={styles.tabsContent}>
                            {renderTabContent()}
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modals */}
            <UploadModal
                isOpen={isCoverUploadOpen}
                onClose={() => setIsCoverUploadOpen(false)}
                modelType="profile"
                modelId={user?.profile?.id ?? profile.id}
                collection="covers"
                isCover={true}
                onUploadSuccess={(url) => {
                    setProfile((prev) =>
                        prev ? { ...prev, coverImage: url } : null,
                    );
                    refreshUser();
                }}
            />

            <UploadModal
                isOpen={isProfileUploadOpen}
                onClose={() => setIsProfileUploadOpen(false)}
                modelType="profile"
                modelId={user?.profile?.id ?? profile.id}
                collection="profiles"
                isCover={false}
                onUploadSuccess={(url) => {
                    setProfile((prev) =>
                        prev ? { ...prev, profileImage: url } : null,
                    );
                    refreshUser();
                }}
            />
        </>
    );
}
