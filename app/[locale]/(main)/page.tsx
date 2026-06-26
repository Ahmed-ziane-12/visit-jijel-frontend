"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    ArrowRight,
    ChevronRight,
    Star,
    MapPin,
    Compass,
    Map,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import styles from "./page.module.css";
import type { Destination } from "@/types/map";

const HERO_IMAGES = ["/phare.jpg", "/zoo.jpg", "/g.jpg", "/p2.jpg"];

function FloatingImage({ src, index }: { src: string; index: number }) {
    const positions = [
        { top: "5%", left: "2%", w: 200, h: 260 },
        { top: "10%", right: "3%", w: 180, h: 240 },
        { bottom: "8%", left: "6%", w: 220, h: 280 },
        { bottom: "5%", right: "5%", w: 160, h: 210 },
        { top: "35%", left: "50%", w: 140, h: 190 },
    ] as const;
    const p = positions[index];

    return (
        <motion.div
            className="absolute rounded-2xl overflow-hidden shadow-lg hidden md:block"
            style={{
                width: p.w,
                height: p.h,
                top: "top" in p ? p.top : undefined,
                bottom: "bottom" in p ? p.bottom : undefined,
                left: "left" in p ? p.left : undefined,
                right: "right" in p ? p.right : undefined,
            }}
            animate={{ y: [0, -12, 0] }}
            transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.4,
            }}
        >
            <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes={`${p.w}px`}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
        </motion.div>
    );
}

/* ─── Helpers ─── */

function DestinationsSkeleton() {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl overflow-hidden bg-(--dim-bg) animate-pulse">
                <div className="aspect-16/10" />
            </div>
            <div className="flex flex-col gap-6">
                <div className="flex-1 rounded-2xl bg-(--dim-bg) animate-pulse min-h-45" />
                <div className="flex-1 rounded-2xl bg-(--dim-bg) animate-pulse min-h-45" />
            </div>
        </div>
    );
}

/* ─── Types ─── */

interface BizItem {
    id: number;
    name: string;
    type: string;
    description: string | null;
    media: { secure_url: string; is_cover: boolean }[];
    listings_count?: number;
    wilaya: string | null;
}

interface EvtItem {
    id: number;
    title: string;
    description: string;
    starts_at: string;
    location: string | null;
    destination?: { id: number; name: string } | null;
}

/* ─── Helpers ─── */

function formatDate(s: string) {
    const d = new Date(s);
    return {
        day: String(d.getDate()),
        month: d.toLocaleDateString("en", { month: "short" }),
    };
}

function StarRating({ rating = 4 }: { rating?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    className={
                        i < rating ? "text-amber-400" : "text-(--border)"
                    }
                    fill={i < rating ? "currentColor" : "none"}
                />
            ))}
        </div>
    );
}

/* ─── Animation variants (ui-language standard) ─── */

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

/* ─── Section label pattern ─── */

function SectionTag({ label }: { label: string }) {
    return (
        <span className="inline-block px-3 py-1 rounded-full border border-(--border) text-xs font-medium uppercase tracking-wider text-(--light-fg) mb-4">
            {label}
        </span>
    );
}

/* ─── Component ─── */

export default function Home() {
    const t = useTranslations("home");

    /* data */
    const [loading, setLoading] = useState(true);
    const [dests, setDests] = useState<Destination[]>([]);
    const [biz, setBiz] = useState<BizItem[]>([]);
    const [evts, setEvts] = useState<EvtItem[]>([]);

    /* carousel */
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollL, setCanScrollL] = useState(false);
    const [canScrollR, setCanScrollR] = useState(false);

    const checkScroll = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollL(el.scrollLeft > 4);
        setCanScrollR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        el.addEventListener("scroll", checkScroll, { passive: true });
        checkScroll();
        return () => {
            ro.disconnect();
            el.removeEventListener("scroll", checkScroll);
        };
    }, [checkScroll, biz]);

    const scrollTrack = (dir: "left" | "right") => {
        trackRef.current?.scrollBy({
            left: dir === "left" ? -320 : 320,
            behavior: "smooth",
        });
    };

    /* fetch */
    useEffect(() => {
        (async () => {
            try {
                const [dr, br, er] = await Promise.all([
                    axios.get("/api/v1/destinations"),
                    axios.get("/api/v1/businesses"),
                    axios.get("/api/v1/events"),
                ]);
                setDests(dr.data ?? []);
                setBiz(br.data?.data ?? br.data ?? []);
                setEvts(er.data?.data ?? er.data ?? []);
            } catch {
                /* silent */
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const featured = dests.filter((d) => (d as any).is_featured);
    console.log(featured.length >= 3);

    const display = featured.length >= 3 ? featured : dests;
    const main = display[0];
    const sides = display.slice(1, 3);

    return (
        <div>
            {/* ══════ HERO (floating images + text) ══════ */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden pt-50">
                {HERO_IMAGES.map((src, i) => (
                    <FloatingImage key={src} src={src} index={i} />
                ))}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-(--primary-clr) bg-(--background)/80 text-(--primary-clr) text-sm font-medium mb-6">
                        <MapPin size={14} />
                        {t("hero_badge")}
                    </span>
                </motion.div>

                <motion.h1
                    className="text-(--foreground) font-bold leading-[1.1] mb-5 text-balance max-w-4xl"
                    style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {t("hero_title")}
                </motion.h1>

                <motion.p
                    className="text-(--light-fg) text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {t("hero_desc")}
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Link
                        href="/explore"
                        className="text-white inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm bg-(--primary-clr) hover:opacity-90 transition-all"
                    >
                        <Compass size={16} color="white" />
                        Explore
                        <ArrowRight size={16} />
                    </Link>
                    <Link
                        href="/plan"
                        className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm border border-(--border) text-(--foreground) hover:bg-(--dim-bg) transition-colors"
                    >
                        <Map size={16} />
                        {t("hero_plan") ?? "Plan Your Trip"}
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </section>

            {/* ══════ DESTINATIONS ══════ */}
            <section className="py-20 md:py-28 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12">
                        <SectionTag
                            label={t("explore_tag") ?? "Explore Nature"}
                        />
                        <h2 className="text-3xl md:text-4xl font-bold text-(--foreground)">
                            {t("section_recommended")}
                        </h2>
                    </div>

                    {loading && dests.length === 0 ? (
                        <DestinationsSkeleton />
                    ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Feature card — 2 cols */}
                            {main && (
                                <Link
                                    href={`/explore/${main.id}`}
                                    className="md:col-span-2 group relative rounded-2xl overflow-hidden bg-(--dim-bg)"
                                >
                                    <div className="relative aspect-16/10">
                                        <Image
                                            src={
                                                ((main as any)
                                                    .cover_image_url as string) ??
                                                (main as any).media?.[0]
                                                    ?.secure_url ??
                                                "/g.jpg"
                                            }
                                            alt={main.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width:768px) 100vw, 640px"
                                            loading="eager"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider mb-3">
                                            {main.category ?? "Nature"}
                                        </span>
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                                            {main.name}
                                        </h3>
                                        <p className="text-white/80 text-sm line-clamp-2">
                                            {main.description}
                                        </p>
                                    </div>
                                </Link>
                            )}

                            {/* Side stack */}
                            <div className="flex flex-col gap-6">
                                {sides.map((dest) => (
                                    <Link
                                        key={dest.id}
                                        href={`/explore/${dest.id}`}
                                        className="group relative flex-1 rounded-2xl overflow-hidden bg-(--dim-bg) min-h-45"
                                    >
                                        <div className="absolute inset-0">
                                            <Image
                                                src={
                                                    ((dest as any)
                                                        .cover_image_url as string) ??
                                                    (dest as any).media?.[0]
                                                        ?.secure_url ??
                                                    "/g.jpg"
                                                }
                                                alt={dest.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                sizes="(max-width:768px) 100vw, 280px"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[0.65rem] font-semibold uppercase tracking-wider mb-2">
                                                {dest.category ?? "Nature"}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">
                                                {dest.name}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════ PARTNER HUB ══════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="bg-[#0d1117] py-20 md:py-28 px-4 md:px-8"
            >
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <motion.div variants={fadeUp} className="text-white">
                        <SectionTag label={t("partner_tag") ?? "Business"} />
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {t("partner_title") ??
                                "Grow Your Business with Jijel"}
                        </h2>
                        <p className="text-white/60 text-base leading-relaxed mb-8">
                            {t("partner_desc") ??
                                "List your services, reach thousands of travelers, and manage bookings \u2014 all from one dashboard."}
                        </p>
                        <div className="space-y-3 mb-10">
                            {[
                                t("partner_benefit1") ??
                                    "Reach targeted travelers actively planning trips",
                                t("partner_benefit2") ??
                                    "Simple dashboard to manage listings and bookings",
                                t("partner_benefit3") ??
                                    "Real-time analytics and customer insights",
                                t("partner_benefit4") ??
                                    "Free to start \u2014 no subscription fees",
                            ].map((text, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 text-white/70 text-sm"
                                >
                                    <span className="mt-0.5 w-5 h-5 rounded-full bg-(--primary-clr) flex items-center justify-center shrink-0">
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path
                                                d="M2.5 6l2.5 2.5 5-5"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    {text}
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/register?role=business_owner"
                            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm bg-(--primary-clr) text-white hover:opacity-90 transition"
                        >
                            {t("partner_cta") ?? "Start Your Free Trial"}
                            <ArrowRight size={16} />
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="flex items-center justify-center"
                    >
                        <div className={styles.laptop}>
                            <div className={styles.laptopScreen}>
                                <div className={styles.laptopHeader}>
                                    <span className={styles.laptopDot} />
                                    <span className={styles.laptopDot} />
                                    <span className={styles.laptopDot} />
                                </div>
                                <div className={styles.laptopBody}>
                                    <div className={styles.laptopSidebar}>
                                        <div
                                            className={
                                                styles.laptopSidebarActive
                                            }
                                        />
                                        <div
                                            className={styles.laptopSidebarItem}
                                        />
                                        <div
                                            className={styles.laptopSidebarItem}
                                        />
                                        <div
                                            className={styles.laptopSidebarItem}
                                        />
                                    </div>
                                    <div className={styles.laptopMain}>
                                        <div className={styles.laptopRow} />
                                        <div className={styles.laptopRowSm} />
                                        <div className={styles.laptopRow} />
                                        <div
                                            className={styles.laptopRowAccent}
                                        />
                                        <div className={styles.laptopRow} />
                                        <div className={styles.laptopRowSm} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* ══════ STAY & DINE ══════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="py-20 md:py-28 px-4 md:px-8 bg-(--dim-bg)"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={fadeUp}
                        className="flex items-end justify-between gap-4 mb-10"
                    >
                        <div>
                            <SectionTag
                                label={t("essentials_tag") ?? "Stay & Dine"}
                            />
                            <h2 className="text-3xl md:text-4xl font-bold text-(--foreground)">
                                {t("section_popular")}
                            </h2>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => scrollTrack("left")}
                                disabled={!canScrollL}
                                className="w-11 h-11 rounded-full border border-(--border) bg-(--background) flex items-center justify-center text-(--foreground) disabled:opacity-30 hover:bg-(--primary-clr) hover:text-white hover:border-(--primary-clr) transition cursor-pointer disabled:cursor-default"
                                aria-label="Scroll left"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                            <button
                                onClick={() => scrollTrack("right")}
                                disabled={!canScrollR}
                                className="w-11 h-11 rounded-full border border-(--border) bg-(--background) flex items-center justify-center text-(--foreground) disabled:opacity-30 hover:bg-(--primary-clr) hover:text-white hover:border-(--primary-clr) transition cursor-pointer disabled:cursor-default"
                                aria-label="Scroll right"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        ref={trackRef}
                        className={styles.track}
                    >
                        {biz.length === 0 && (
                            <p className="text-(--light-fg) py-10">
                                No businesses yet
                            </p>
                        )}
                        {biz.map((item) => (
                            <div
                                key={item.id}
                                className={`${styles.card} group`}
                            >
                                <Link href={`/explore?type=${item.type}`}>
                                    <div className="rounded-2xl overflow-hidden bg-(--background) border border-(--border) transition-shadow hover:shadow-lg">
                                        <div className="relative aspect-4/3 overflow-hidden">
                                            <Image
                                                src={
                                                    item.media?.[0]
                                                        ?.secure_url ??
                                                    (item.type === "hotel"
                                                        ? "/p5.jpg"
                                                        : "/p2.jpg")
                                                }
                                                alt={item.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="280px"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-(--foreground) truncate mb-1.5">
                                                {item.name}
                                            </h3>
                                            <StarRating rating={4} />
                                            <p className="text-sm text-(--light-fg) mt-1.5 mb-3">
                                                {item.wilaya ?? "Jijel"}
                                                {item.listings_count
                                                    ? ` · ${item.listings_count} offers`
                                                    : ""}
                                            </p>
                                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--primary-clr) group-hover:gap-2.5 transition-all">
                                                {item.type === "hotel"
                                                    ? "Book Now"
                                                    : "Details"}
                                                <ArrowRight size={13} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* ══════ HAPPENING IN JIJEL ══════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="py-20 md:py-28 px-4 md:px-8"
            >
                <div className="max-w-3xl mx-auto">
                    <motion.div variants={fadeUp} className="text-center mb-14">
                        <SectionTag
                            label={t("events_tag") ?? "Happening in Jijel"}
                        />
                        <h2 className="text-3xl md:text-4xl font-bold text-(--foreground)">
                            {t("section_events")}
                        </h2>
                    </motion.div>

                    <div>
                        {evts.length === 0 && (
                            <p className="text-center text-(--light-fg) py-10">
                                No upcoming events
                            </p>
                        )}
                        {evts.slice(0, 5).map((evt, idx) => {
                            const { day, month } = formatDate(evt.starts_at);
                            return (
                                <motion.div
                                    key={evt.id ?? idx}
                                    variants={fadeUp}
                                >
                                    <Link
                                        href={`/explore?event=${evt.id}`}
                                        className="flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-(--dim-bg) transition-colors group"
                                    >
                                        <div className="w-16 h-16.5 shrink-0 rounded-xl bg-(--primary-clr) text-white flex flex-col items-center justify-center leading-none">
                                            <span className="text-xl font-bold">
                                                {day}
                                            </span>
                                            <span className="text-[0.6rem] font-semibold uppercase tracking-wider opacity-85 mt-0.5">
                                                {month}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-(--foreground) truncate">
                                                {evt.title}
                                            </h4>
                                            <p className="text-sm text-(--light-fg) truncate mt-0.5">
                                                {evt.location ??
                                                    evt.destination?.name ??
                                                    "Jijel"}
                                                {evt.description
                                                    ? ` · ${evt.description.slice(0, 60)}${evt.description.length > 60 ? "..." : ""}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <ChevronRight
                                            size={18}
                                            className="text-(--light-fg) shrink-0 transition-all group-hover:translate-x-1 group-hover:text-(--primary-clr)"
                                        />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div variants={fadeUp} className="text-center mt-12">
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-sm border border-(--border) text-(--foreground) hover:border-(--primary-clr) hover:text-(--primary-clr) transition-colors"
                        >
                            {t("see_all") ?? "Full Events Calendar"}
                            <ArrowRight size={15} />
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* ══════ MOBILE APP ══════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="py-20 md:py-28 px-4 md:px-8"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={fadeUp}
                        className="rounded-3xl border border-(--border) bg-linear-to-r from-(--primary-clr)/20 to-(--primary-clr)/10 p-12 md:p-16 text-center"
                    >
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-(--primary-clr)/50 bg-(--primary-clr)/30">
                            <svg
                                className="text-(--primary-clr)"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="5"
                                    y="2"
                                    width="14"
                                    height="20"
                                    rx="2"
                                    ry="2"
                                />
                                <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                        </div>
                        <h2 className="mb-4 text-3xl md:text-4xl font-bold text-(--foreground)">
                            {t("mobile_title")}
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-base text-(--light-fg)">
                            {t("mobile_desc")}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="rounded-full px-7 py-3.5 font-semibold text-sm bg-(--primary-clr) text-white hover:opacity-90 transition">
                                {t("mobile_notify")}
                            </button>
                            <button className="rounded-full px-7 py-3.5 font-semibold text-sm border border-(--border) text-(--foreground) hover:bg-(--dim-bg) transition">
                                {t("mobile_learn")}
                            </button>
                        </div>
                        <p className="mt-6 text-xs text-(--light-fg)">
                            {t("mobile_stats")}
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* ══════ FINAL CTA ══════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="min-w-[90%] justify-self-center mr-4 ml-4 py-20 my-20 rounded-3xl border border-(--border) px-4 md:px-8"
            >
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h2
                        variants={fadeUp}
                        className="mb-5 text-3xl md:text-4xl font-bold text-(--foreground) text-balance"
                    >
                        {t("cta_title")}
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="mx-auto mb-8 max-w-xl text-base text-(--light-fg)"
                    >
                        {t("cta_desc")}
                    </motion.p>
                    <motion.div variants={fadeUp}>
                        <Link
                            href="/plan"
                            className="inline-flex items-center gap-2 rounded-full px-9 py-4 font-semibold bg-(--primary-clr) text-white hover:opacity-90 transition"
                        >
                            {t("cta_btn")}
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                    <motion.p
                        variants={fadeUp}
                        className="mt-5 text-xs text-(--light-fg)"
                    >
                        {t("cta_footnote")}
                    </motion.p>
                </div>
            </motion.section>
        </div>
    );
}
