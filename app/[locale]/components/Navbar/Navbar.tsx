"use client";
import React, { useContext, useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { SearchBar } from "../Searchbar/Searchbar";
import Image from "next/image";
import { LanguageDropdown } from "../LanguageDropdown/LanguageDropdown";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import ProfileDropdown from "../Profile/Profile";
import { Menu, X, Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/context/ThemeContext";

const Navbar = () => {
    const t = useTranslations("navbar");
    const { user, isAuthenticated, logout, loading } = useAuth();
    const { toggle, theme } = useContext(ThemeContext);
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    const isExploreRoute = pathname.startsWith("/explore");

    const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

    const handleScroll = () => {
        const scrolled = window.scrollY;
        const v = scrolled > 100;
        setIsScrolled(v);
    };

    useEffect(() => {
        handleScroll();
        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isScrolled]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleSearch = async (query: string) => {
        if (query.trim().length < 2) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsMobileMenuOpen(false);
    };

    if (isAuthRoute) return null;

    return (
        <header
            className={`${styles.container} ${isScrolled || isExploreRoute ? styles.scrolled : ""}`}
        >
            <Link className={styles.logo} href={"/"}>
                {theme === "light" ? (
                    <Image
                        src={"/logo.svg"}
                        alt={""}
                        width={1000}
                        height={1000}
                    />
                ) : (
                    <Image
                        src={"/logo_dark.svg"}
                        alt={""}
                        width={1000}
                        height={1000}
                    />
                )}
            </Link>

            {/* Desktop Navigation */}
            <nav className={styles.menu}>
                <ul className={styles.links}>
                    <li
                        className={
                            pathname === "/" ||
                            pathname === "/fr" ||
                            pathname === "/ar"
                                ? styles.active
                                : ""
                        }
                    >
                        <Link className={styles.link} href={"/"}>
                            {t("home_link")}
                        </Link>
                    </li>
                    <li
                        className={
                            pathname === "/explore" ||
                            pathname === "/fr/explore" ||
                            pathname === "/ar/explore"
                                ? styles.active
                                : ""
                        }
                    >
                        <Link className={styles.link} href={"/explore"}>
                            {t("explore_link")}
                        </Link>
                    </li>
                    <li
                        className={
                            pathname === "/plan" ||
                            pathname === "/fr/plan" ||
                            pathname === "/ar/plan"
                                ? styles.active
                                : ""
                        }
                    >
                        <Link className={styles.link} href={"/plan"}>
                            {t("plan_link")}
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Desktop Right Section */}
            <div className={styles.desktopRight}>
                <div className={styles.searchWrapper}>
                    <SearchBar
                        placeholder={t("search")}
                        onSearch={handleSearch}
                    />
                </div>
                <button
                    className={styles.themeToggle}
                    onClick={toggle}
                    aria-label={
                        theme === "dark" ? t("switch_light") : t("switch_dark")
                    }
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <LanguageDropdown />
                <>
                    {loading ? (
                        <div className={styles.auth}>
                            <div className={styles.linkSkeleton} />
                            <div className={styles.avatarSkeleton} />
                        </div>
                    ) : isAuthenticated ? (
                        <div className={styles.auth}>
                            <ProfileDropdown
                                userName={user?.name}
                                userEmail={user?.email}
                                avatarUrl={user?.profile?.avatar}
                            />
                        </div>
                    ) : (
                        <Link className={styles.login} href={"/login"}>
                            {t("login")}
                        </Link>
                    )}
                </>
            </div>

            {/* Mobile Menu Button */}
            <button
                className={styles.mobileMenuButton}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={t("toggle_menu")}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className={styles.mobileOverlay}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className={styles.mobileMenu}>
                        <div className={styles.mobileSearch}>
                            <SearchBar
                                placeholder={t("search")}
                                onSearch={handleSearch}
                            />
                        </div>
                        <ul className={styles.mobileLinks}>
                            <li
                                className={
                                    pathname === "/" ? styles.active : ""
                                }
                            >
                                <Link className={styles.link} href={"/"}>
                                    {t("home_link")}
                                </Link>
                            </li>
                            <li
                                className={
                                    pathname === "/explore" ? styles.active : ""
                                }
                            >
                                <Link className={styles.link} href={"/explore"}>
                                    {t("explore_link")}
                                </Link>
                            </li>
                            <li
                                className={
                                    pathname === "/plan" ? styles.active : ""
                                }
                            >
                                <Link className={styles.link} href={"/plan"}>
                                    {t("plan_link")}
                                </Link>
                            </li>
                        </ul>
                        <div className={styles.mobileFooter}>
                            <div className={styles.mobileLanguage}>
                                <LanguageDropdown />
                            </div>
                            {loading ? (
                                <div className={styles.mobileAuth}>
                                    <div className={styles.linkSkeleton} />
                                    <div className={styles.avatarSkeleton} />
                                </div>
                            ) : isAuthenticated ? (
                                <div className={styles.mobileAuth}>
                                    <ProfileDropdown
                                        userName={user?.name}
                                        userEmail={user?.email}
                                        avatarUrl={user?.profile?.avatar}
                                    />
                                </div>
                            ) : (
                                <Link
                                    className={styles.mobileLogin}
                                    href={"/login"}
                                >
                                    {t("login")}
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Navbar;
