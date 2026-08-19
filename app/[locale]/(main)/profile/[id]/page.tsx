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
    MessageSquare,
    MapPin,
} from "lucide-react";
import Image from "next/image";
import styles from "./profile.module.css";
import axios from "@/lib/axios";
import UploadModal from "@/app/[locale]/components/UploadModal/UploadModal";
import dynamic from "next/dynamic";
import { CalendarEvent } from "../../../components/Calendar/Calendar";
import { Media } from "@/types/map";
import { PublicProfile } from "@/types/social";
import PostsTab from "@/app/[locale]/components/Profile/PostsTab";
import ProfileSidebar from "@/app/[locale]/components/Profile/ProfileSidebar";

type TabType = "posts" | "trips" | "calendar" | "saved" | "settings";

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
    const { user, loading: authLoading, refreshUser } = useAuth();
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
        if (!authLoading && user?.profile?.role === "business_owner") {
            router.replace(`/dashboard/`);
        }
    }, [authLoading, user, profileId, router]);

    const [activeTab, setActiveTab] = useState<TabType>("posts");
    const [isCoverUploadOpen, setIsCoverUploadOpen] = useState(false);
    const [isProfileUploadOpen, setIsProfileUploadOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileUser, setProfileUser] = useState<PublicProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [mediaItems, setMediaItems] = useState<Media[]>([]);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        bio: "",
    });

    // Fetch the profile user by ID
    useEffect(() => {
        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                if (isOwnProfile && user) {
                    // Own profile — use auth context data
                    setProfileUser(user as unknown as PublicProfile);
                } else {
                    // Other user — fetch from API
                    const res = await axios.get(
                        `/api/v1/users/${profileId}`,
                    );
                    setProfileUser(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        if (!authLoading) {
            fetchProfile();
        }
    }, [authLoading, user, profileId, isOwnProfile]);

    // Populate local state from fetched profile
    useEffect(() => {
        if (!profileUser) return;

        const media = profileUser.profile?.media ?? [];
        setMediaItems(media);
        setProfile({
            id: profileUser.id,
            name: profileUser.name,
            email: profileUser.email ?? "",
            phone: profileUser.profile?.phone || "",
            bio: profileUser.profile?.bio || "",
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
            name: profileUser.name,
            email: profileUser.email ?? "",
            phone: profileUser.profile?.phone || "",
            bio: profileUser.profile?.bio || "",
        });

        // Fetch events only for own profile
        if (isOwnProfile) {
            fetchEvents();
        }
    }, [profileUser, isOwnProfile]);

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

    const handleSaveChanges = async () => {
        try {
            await axios.put("/api/v1/profile", editForm);
            setProfile((prev) => (prev ? { ...prev, ...editForm } : null));
            setIsEditing(false);
            refreshUser();
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

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
            id: "posts" as TabType,
            label: t("tab_posts"),
            icon: <MessageSquare size={18} />,
        },
        {
            id: "trips" as TabType,
            label: t("tab_trips"),
            icon: <Briefcase size={18} />,
        },
        {
            id: "calendar" as TabType,
            label: t("tab_calendar"),
            icon: <CalendarDays size={18} />,
        },
        {
            id: "saved" as TabType,
            label: t("tab_saved"),
            icon: <Heart size={18} />,
        },
        {
            id: "settings" as TabType,
            label: t("tab_settings"),
            icon: <Settings size={18} />,
        },
    ];

    const formatJoinDate = (dateStr?: string) => {
        if (!dateStr) return undefined;
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    const photos = mediaItems.filter(
        (m) => m.collection === "profiles" || !m.is_cover,
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "posts":
                return (
                    <PostsTab
                        userId={Number(profileId)}
                        isOwnProfile={isOwnProfile}
                    />
                );
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
                if (!isOwnProfile) {
                    return (
                        <div className={styles.tabContent}>
                            <div className={styles.tripsContainer}>
                                <h2>{t("tab_calendar")}</h2>
                                <p>Calendar is only available on your own profile.</p>
                            </div>
                        </div>
                    );
                }
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
                if (!isOwnProfile) {
                    return (
                        <div className={styles.tabContent}>
                            <div className={styles.tripsContainer}>
                                <h2>{t("tab_settings")}</h2>
                                <p>Settings are only available on your own profile.</p>
                            </div>
                        </div>
                    );
                }
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

    if (authLoading || profileLoading || !profile) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <>
            <div className={styles.profilePage}>
                {/* Cover Image */}
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
                                    onClick={() =>
                                        setIsCoverUploadOpen(true)
                                    }
                                >
                                    <Camera size={20} />
                                    <span>{t("upload_cover")}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Image */}
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

                {/* Header Info */}
                <div className={styles.headerInfo}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.name}>{profile.name}</h1>
                        <div className={styles.metaRow}>
                            {profileUser?.profile?.role && (
                                <span className={styles.metaItem}>
                                    <Briefcase size={14} />
                                    {profileUser.profile.role ===
                                    "business_owner"
                                        ? "Business Owner"
                                        : "Traveler"}
                                </span>
                            )}
                            {profileUser?.profile?.wilaya && (
                                <span className={styles.metaItem}>
                                    <MapPin size={14} />
                                    {profileUser.profile.wilaya}
                                </span>
                            )}
                            <span className={styles.metaItem}>
                                <CalendarDays size={14} />
                                Joined{" "}
                                {formatJoinDate(
                                    profileUser?.email_verified_at ??
                                        undefined,
                                ) ?? "2024"}
                            </span>
                        </div>
                    </div>
                    <div className={styles.headerRight}>
                        {isOwnProfile && (
                            <button
                                className={styles.editButton}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <User size={16} />
                                {isEditing
                                    ? tc("cancel")
                                    : t("edit_profile")}
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit Form */}
                <AnimatePresence>
                    {isEditing && isOwnProfile && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className={styles.editFormWrapper}
                        >
                            <div className={styles.editForm}>
                                <div className={styles.formRow}>
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
                                </div>
                                <div className={styles.formRow}>
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
                                            rows={2}
                                        />
                                    </div>
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
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
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
                </div>

                {/* Content: Two-column layout */}
                <div className={styles.contentGrid}>
                    {/* Left Column - Main content */}
                    <div className={styles.mainColumn}>
                        {renderTabContent()}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className={styles.sideColumn}>
                        <ProfileSidebar
                            name={profile.name}
                            email={profile.email}
                            bio={profile.bio}
                            phone={profile.phone}
                            role={
                                profileUser?.profile?.role ===
                                "business_owner"
                                    ? "Business Owner"
                                    : "Traveler"
                            }
                            city={
                                profileUser?.profile?.wilaya ?? undefined
                            }
                            joinDate={formatJoinDate(
                                profileUser?.email_verified_at ??
                                    undefined,
                            )}
                            tripCount={0}
                            photos={photos}
                        />
                    </div>
                </div>
            </div>

            {/* Upload Modals */}
            {isOwnProfile && (
                <>
                    <UploadModal
                        isOpen={isCoverUploadOpen}
                        onClose={() => setIsCoverUploadOpen(false)}
                        modelType="profile"
                        modelId={user?.profile?.id ?? profile.id}
                        collection="covers"
                        isCover={true}
                        onUploadSuccess={(url) => {
                            setProfile((prev) =>
                                prev
                                    ? { ...prev, coverImage: url }
                                    : null,
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
                                prev
                                    ? { ...prev, profileImage: url }
                                    : null,
                            );
                            refreshUser();
                        }}
                    />
                </>
            )}
        </>
    );
}
