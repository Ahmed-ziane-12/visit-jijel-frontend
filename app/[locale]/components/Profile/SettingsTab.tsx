"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
    User,
    Mail,
    Phone,
    KeyRound,
    LogOut,
    Trash2,
    Globe,
    Wallet,
    Compass,
    Heart,
    Bell,
    Eye,
    MapPin,
    Star,
    History,
    Database,
    ShieldCheck,
    Smartphone,
    Activity,
    Lock,
} from "lucide-react";
import styles from "./SettingsTab.module.css";

interface SettingsTabProps {
    email?: string;
    phone?: string;
}

function Section({
    icon,
    title,
    description,
    children,
}: {
    icon: ReactNode;
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>{icon}</div>
                <div className={styles.sectionTitle}>
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                </div>
            </div>
            <div className={styles.sectionBody}>{children}</div>
        </section>
    );
}

function Row({
    icon,
    label,
    description,
    value,
    children,
    danger,
}: {
    icon?: ReactNode;
    label: string;
    description?: string;
    value?: string;
    children?: ReactNode;
    danger?: boolean;
}) {
    return (
        <div className={`${styles.row} ${danger ? styles.dangerRow : ""}`}>
            {icon && <div className={styles.rowIcon}>{icon}</div>}
            <div className={styles.rowInfo}>
                <span className={styles.rowLabel}>{label}</span>
                {description && <span className={styles.rowDesc}>{description}</span>}
                {value && <span className={styles.rowValue}>{value}</span>}
            </div>
            {children && <div className={styles.rowControl}>{children}</div>}
        </div>
    );
}

function Toggle({
    on,
    onToggle,
    label,
}: {
    on: boolean;
    onToggle: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
            onClick={onToggle}
        >
            <span className={styles.toggleThumb} />
        </button>
    );
}

export default function SettingsTab({ email, phone }: SettingsTabProps) {
    const t = useTranslations("profile");

    const [language, setLanguage] = useState("en");
    const [currency, setCurrency] = useState("DZD");
    const [tripStyle, setTripStyle] = useState("balanced");
    const [applyPreferences, setApplyPreferences] = useState(true);
    const [visibility, setVisibility] = useState("public");
    const [twoFactor, setTwoFactor] = useState(false);
    const [notifications, setNotifications] = useState({
        tripReminders: true,
        upcomingActivities: true,
        events: true,
        newDestinations: false,
        promotions: false,
    });

    const toggleNotification = (key: keyof typeof notifications) =>
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className={styles.settings}>
            {/* ── Account ── */}
            <Section
                icon={<User size={18} />}
                title={t("settings_account")}
                description={t("settings_account_desc")}
            >
                <Row icon={<Mail size={16} />} label={t("email_label")} value={email}>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_change")}
                    </button>
                </Row>
                <Row icon={<KeyRound size={16} />} label={t("settings_password")}>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_change")}
                    </button>
                </Row>
                <Row
                    icon={<Phone size={16} />}
                    label={t("phone_label")}
                    value={phone || t("settings_not_set")}
                >
                    <button type="button" className={styles.actionButton}>
                        {t("settings_edit")}
                    </button>
                </Row>
                <Row
                    icon={<LogOut size={16} />}
                    label={t("settings_logout")}
                    description={t("settings_logout_desc")}
                >
                    <button type="button" className={styles.actionButton}>
                        {t("settings_logout")}
                    </button>
                </Row>
                <Row
                    icon={<Trash2 size={16} />}
                    label={t("settings_delete_account")}
                    description={t("settings_delete_account_desc")}
                    danger
                >
                    <button type="button" className={styles.dangerButton}>
                        {t("settings_delete_account")}
                    </button>
                </Row>
            </Section>

            {/* ── Preferences ── */}
            <Section
                icon={<Compass size={18} />}
                title={t("settings_preferences")}
                description={t("settings_preferences_desc")}
            >
                <Row icon={<Globe size={16} />} label={t("settings_language")}>
                    <select
                        className={styles.select}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        aria-label={t("settings_language")}
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                    </select>
                </Row>
                <Row icon={<Wallet size={16} />} label={t("settings_currency")}>
                    <select
                        className={styles.select}
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        aria-label={t("settings_currency")}
                    >
                        <option value="DZD">DZD (دج)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </Row>
                <Row icon={<Compass size={16} />} label={t("settings_trip_style")}>
                    <select
                        className={styles.select}
                        value={tripStyle}
                        onChange={(e) => setTripStyle(e.target.value)}
                        aria-label={t("settings_trip_style")}
                    >
                        <option value="relaxed">{t("settings_style_relaxed")}</option>
                        <option value="balanced">{t("settings_style_balanced")}</option>
                        <option value="adventurous">
                            {t("settings_style_adventurous")}
                        </option>
                    </select>
                </Row>
                <Row icon={<Heart size={16} />} label={t("settings_interests")}>
                    <div className={styles.chips}>
                        {t("settings_interests_value")
                            .split("·")
                            .map((interest) => (
                                <span key={interest} className={styles.chip}>
                                    {interest.trim()}
                                </span>
                            ))}
                    </div>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_edit")}
                    </button>
                </Row>
                <Row
                    label={t("settings_apply_preferences")}
                    description={t("settings_apply_preferences_desc")}
                >
                    <Toggle
                        on={applyPreferences}
                        onToggle={() => setApplyPreferences((v) => !v)}
                        label={t("settings_apply_preferences")}
                    />
                </Row>
            </Section>

            {/* ── Notifications ── */}
            <Section
                icon={<Bell size={18} />}
                title={t("settings_notifications")}
                description={t("settings_notifications_desc")}
            >
                <Row label={t("settings_notif_trip_reminders")}>
                    <Toggle
                        on={notifications.tripReminders}
                        onToggle={() => toggleNotification("tripReminders")}
                        label={t("settings_notif_trip_reminders")}
                    />
                </Row>
                <Row label={t("settings_notif_upcoming_activities")}>
                    <Toggle
                        on={notifications.upcomingActivities}
                        onToggle={() => toggleNotification("upcomingActivities")}
                        label={t("settings_notif_upcoming_activities")}
                    />
                </Row>
                <Row label={t("settings_notif_events")}>
                    <Toggle
                        on={notifications.events}
                        onToggle={() => toggleNotification("events")}
                        label={t("settings_notif_events")}
                    />
                </Row>
                <Row label={t("settings_notif_new_destinations")}>
                    <Toggle
                        on={notifications.newDestinations}
                        onToggle={() => toggleNotification("newDestinations")}
                        label={t("settings_notif_new_destinations")}
                    />
                </Row>
                <Row label={t("settings_notif_promotions")}>
                    <Toggle
                        on={notifications.promotions}
                        onToggle={() => toggleNotification("promotions")}
                        label={t("settings_notif_promotions")}
                    />
                </Row>
            </Section>

            {/* ── Privacy & Data ── */}
            <Section
                icon={<Eye size={18} />}
                title={t("settings_privacy")}
                description={t("settings_privacy_desc")}
            >
                <Row icon={<User size={16} />} label={t("settings_visibility")}>
                    <select
                        className={styles.select}
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        aria-label={t("settings_visibility")}
                    >
                        <option value="public">{t("settings_visibility_public")}</option>
                        <option value="followers">
                            {t("settings_visibility_followers")}
                        </option>
                        <option value="private">
                            {t("settings_visibility_private")}
                        </option>
                    </select>
                </Row>
                <Row icon={<MapPin size={16} />} label={t("settings_saved_places")}>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_manage")}
                    </button>
                </Row>
                <Row icon={<Star size={16} />} label={t("settings_reviews")}>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_view")}
                    </button>
                </Row>
                <Row icon={<History size={16} />} label={t("settings_trip_history")}>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_view")}
                    </button>
                </Row>
                <Row
                    icon={<Database size={16} />}
                    label={t("settings_personal_data")}
                    description={t("settings_personal_data_desc")}
                >
                    <button type="button" className={styles.actionButton}>
                        {t("settings_download")}
                    </button>
                </Row>
            </Section>

            {/* ── Security ── */}
            <Section
                icon={<ShieldCheck size={18} />}
                title={t("settings_security")}
                description={t("settings_security_desc")}
            >
                <Row
                    icon={<Lock size={16} />}
                    label={t("settings_password_management")}
                    description={t("settings_password_management_desc")}
                >
                    <button type="button" className={styles.actionButton}>
                        {t("settings_change")}
                    </button>
                </Row>
                <Row
                    icon={<Smartphone size={16} />}
                    label={t("settings_two_factor")}
                    description={t("settings_two_factor_desc")}
                >
                    <Toggle
                        on={twoFactor}
                        onToggle={() => setTwoFactor((v) => !v)}
                        label={t("settings_two_factor")}
                    />
                </Row>
                <Row
                    icon={<KeyRound size={16} />}
                    label={t("settings_active_sessions")}
                    value={t("settings_active_sessions_value")}
                >
                    <button type="button" className={styles.actionButton}>
                        {t("settings_manage")}
                    </button>
                </Row>
                <Row icon={<Activity size={16} />} label={t("settings_recent_activity")}>
                    <button type="button" className={styles.actionButton}>
                        {t("settings_view")}
                    </button>
                </Row>
            </Section>
        </div>
    );
}
