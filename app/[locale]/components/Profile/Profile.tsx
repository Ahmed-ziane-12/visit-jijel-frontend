"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./Profile.module.css";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import { LogOut, Settings, User } from "lucide-react";

export interface ProfileDropdownProps {
    userName?: string;
    userEmail?: string;
    avatarUrl?: string | null;
    initials?: string;
}

const ProfileDropdown = ({
    userName = "John Doe",
    userEmail = "john@example.com",
    avatarUrl = null,
    initials = "JD",
}: ProfileDropdownProps) => {
    const t = useTranslations("profile_menu");
    const { user, logout } = useAuth();
    const router = useRouter();
    const { isOpen, open, close } = useConfirmDialog();

    const [loading, setLoading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isOpen) setIsMenuOpen(false);
        };
        if (isMenuOpen) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isMenuOpen, isOpen]);

    const handleLogout = async (): Promise<void> => {
        setLoading(true);
        try {
            await logout();
            close();
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutClick = (): void => {
        setIsMenuOpen(false);
        open();
    };

    return (
        <>
            <div ref={dropdownRef} className={styles.profileDropdown}>
                <button
                    className={styles.triggerButton}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    aria-label={t("menu_aria")}
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={userName}
                            className={styles.avatar}
                        />
                    ) : (
                        <div className={styles.avatarInitials}>{initials}</div>
                    )}
                </button>

                {isMenuOpen && (
                    <div className={styles.menu} role="menu">
                        <div className={styles.menuHeader}>
                            <p className={styles.userName}>{userName}</p>
                            <p className={styles.userEmail}>{userEmail}</p>
                        </div>

                        <div className={styles.divider} />
                        <Link
                            href={
                                user?.is_admin || user?.is_super_admin
                                    ? "/admin"
                                    : user?.profile.role === "business_owner"
                                      ? "/dashboard/"
                                      : "/profile/" + user?.id
                            }
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className={styles.menuIcon}>
                                <User />
                            </span>
                            {user?.is_admin || user?.is_super_admin ? (
                                <span className={styles.menuLabel}>
                                    {t("admin_panel")}
                                </span>
                            ) : user?.profile.role === "business_owner" ? (
                                <span className={styles.menuLabel}>
                                    {t("dashboard")}
                                </span>
                            ) : (
                                <span className={styles.menuLabel}>
                                    {t("my_profile")}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/settings"
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className={styles.menuIcon}>
                                <Settings />
                            </span>
                            <span className={styles.menuLabel}>{t("settings")}</span>
                        </Link>

                        <div className={styles.divider} />
                        <button
                            className={`${styles.menuItem} ${styles.logoutItem}`}
                            onClick={handleLogoutClick}
                            role="menuitem"
                        >
                            <span className={styles.menuIcon}>
                                <LogOut />
                            </span>
                            <span className={styles.menuLabel}>{t("sign_out")}</span>
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={isOpen}
                theme="danger"
                title={t("sign_out_title")}
                message={t("sign_out_message")}
                confirmLabel={t("sign_out_confirm")}
                cancelLabel={t("sign_out_cancel")}
                loading={loading}
                onConfirm={handleLogout}
                onCancel={close}
            />
        </>
    );
};

export default ProfileDropdown;
