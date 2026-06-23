"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import styles from "./page.module.css";
import type { Destination } from "@/types/map";
import { HeroGalleryScroll } from "@/components/HeroGalleryScroll/HeroGalleryScroll";

/* ─── Helpers ─── */

const BLUR =
  typeof btoa === "function"
    ? "data:image/svg+xml;base64," +
      btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="#334155"/></svg>',
      )
    : "";

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
                        i < rating ? "text-amber-400" : "text-[var(--border)]"
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
        <span className="inline-block px-3 py-1 rounded-full border border-[var(--border)] text-xs font-medium uppercase tracking-wider text-[var(--light-fg)] mb-4">
            {label}
        </span>
    );
}

/* ─── Component ─── */

export default function Home() {
    const t = useTranslations("home");

    /* data */
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
                    axios.get("/api/v1/businesses", {
                        params: { type: "restaurant,hotel" },
                    }),
                    axios.get("/api/v1/events"),
                ]);
                setDests(dr.data ?? []);
                setBiz(br.data?.data ?? br.data ?? []);
                setEvts(er.data?.data ?? er.data ?? []);
            } catch {
                /* silent */
            }
        })();
    }, []);

    const featured = dests.filter((d) => (d as any).is_featured);
    const display = featured.length >= 3 ? featured : dests;
    const main = display[0];
    const sides = display.slice(1, 3);

    return (
        <div>
            {/* ══════ HERO (X100-style scroll gallery) ══════ */}
            <HeroGalleryScroll />

            {/* ══════ DESTINATIONS ══════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="py-20 md:py-28 px-4 md:px-8"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div variants={fadeUp}>
                        <SectionTag
                            label={t("explore_tag") ?? "Explore Nature"}
                        />
                        <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-12">
                            {t("section_recommended")}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Feature card — 2 cols */}
                        {main && (
                            <motion.div
                                variants={fadeUp}
                                className="md:col-span-2 group relative rounded-2xl overflow-hidden bg-[var(--dim-bg)]"
                            >
                                <Link href={`/explore/${main.id}`}>
                                    <div className="relative aspect-[16/10]">
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
                                            sizes="(max-width:768px) 100vw, 66vw"
                                            placeholder="blur"
                                            blurDataURL={BLUR}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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
                            </motion.div>
                        )}

                        {/* Side stack */}
                        <div className="flex flex-col gap-6">
                            {sides.map((dest) => (
                                <motion.div
                                    key={dest.id}
                                    variants={fadeUp}
                                    className="group relative flex-1 rounded-2xl overflow-hidden bg-[var(--dim-bg)]"
                                >
                                    <Link href={`/explore/${dest.id}`}>
                                        <div className="relative h-full min-h-[180px]">
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
                                                sizes="(max-width:768px) 100vw, 33vw"
                                                placeholder="blur"
                                                blurDataURL={BLUR}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-5">
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-[0.65rem] font-semibold uppercase tracking-wider mb-2">
                                                {dest.category ?? "Nature"}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">
                                                {dest.name}
                                            </h3>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

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
                                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--primary-clr)] flex items-center justify-center shrink-0">
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
                            className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm bg-[var(--primary-clr)] text-white hover:opacity-90 transition"
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
                className="py-20 md:py-28 px-4 md:px-8 bg-[var(--dim-bg)]"
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
                            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                                {t("section_popular")}
                            </h2>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => scrollTrack("left")}
                                disabled={!canScrollL}
                                className="w-11 h-11 rounded-full border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--primary-clr)] hover:text-white hover:border-[var(--primary-clr)] transition cursor-pointer disabled:cursor-default"
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
                                className="w-11 h-11 rounded-full border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[var(--foreground)] disabled:opacity-30 hover:bg-[var(--primary-clr)] hover:text-white hover:border-[var(--primary-clr)] transition cursor-pointer disabled:cursor-default"
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
                            <p className="text-[var(--light-fg)] py-10">
                                No businesses yet
                            </p>
                        )}
                        {biz.map((item) => (
                            <div
                                key={item.id}
                                className={`${styles.card} group`}
                            >
                                <Link href={`/explore?type=${item.type}`}>
                                    <div className="rounded-2xl overflow-hidden bg-[var(--background)] border border-[var(--border)] transition-shadow hover:shadow-lg">
                                        <div className="relative aspect-[4/3] overflow-hidden">
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
                                            <h3 className="font-semibold text-[var(--foreground)] truncate mb-1.5">
                                                {item.name}
                                            </h3>
                                            <StarRating rating={4} />
                                            <p className="text-sm text-[var(--light-fg)] mt-1.5 mb-3">
                                                {item.wilaya ?? "Jijel"}
                                                {item.listings_count
                                                    ? ` · ${item.listings_count} offers`
                                                    : ""}
                                            </p>
                                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary-clr)] group-hover:gap-2.5 transition-all">
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
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                            {t("section_events")}
                        </h2>
                    </motion.div>

                    <div>
                        {evts.length === 0 && (
                            <p className="text-center text-[var(--light-fg)] py-10">
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
                                        className="flex items-center gap-4 px-5 py-4 rounded-xl hover:bg-[var(--dim-bg)] transition-colors group"
                                    >
                                        <div className="w-16 h-[66px] shrink-0 rounded-xl bg-[var(--primary-clr)] text-white flex flex-col items-center justify-center leading-none">
                                            <span className="text-xl font-bold">
                                                {day}
                                            </span>
                                            <span className="text-[0.6rem] font-semibold uppercase tracking-wider opacity-85 mt-0.5">
                                                {month}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-[var(--foreground)] truncate">
                                                {evt.title}
                                            </h4>
                                            <p className="text-sm text-[var(--light-fg)] truncate mt-0.5">
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
                                            className="text-[var(--light-fg)] shrink-0 transition-all group-hover:translate-x-1 group-hover:text-[var(--primary-clr)]"
                                        />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div variants={fadeUp} className="text-center mt-12">
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-sm border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary-clr)] hover:text-[var(--primary-clr)] transition-colors"
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
                        className="rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--primary-clr)]/20 to-[var(--primary-clr)]/10 p-12 md:p-16 text-center"
                    >
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--primary-clr)]/50 bg-[var(--primary-clr)]/30">
                            <svg
                                className="text-[var(--primary-clr)]"
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
                        <h2 className="mb-4 text-3xl md:text-4xl font-bold text-[var(--foreground)]">
                            {t("mobile_title")}
                        </h2>
                        <p className="mx-auto mb-8 max-w-2xl text-base text-[var(--light-fg)]">
                            {t("mobile_desc")}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="rounded-full px-7 py-3.5 font-semibold text-sm bg-[var(--primary-clr)] text-white hover:opacity-90 transition">
                                {t("mobile_notify")}
                            </button>
                            <button className="rounded-full px-7 py-3.5 font-semibold text-sm border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--dim-bg)] transition">
                                {t("mobile_learn")}
                            </button>
                        </div>
                        <p className="mt-6 text-xs text-[var(--light-fg)]">
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
                className="min-w-[90%] justify-self-center mr-4 ml-4 py-20 my-20 rounded-3xl border border-[var(--border)] px-4 md:px-8"
            >
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h2
                        variants={fadeUp}
                        className="mb-5 text-3xl md:text-4xl font-bold text-[var(--foreground)] text-balance"
                    >
                        {t("cta_title")}
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        className="mx-auto mb-8 max-w-xl text-base text-[var(--light-fg)]"
                    >
                        {t("cta_desc")}
                    </motion.p>
                    <motion.div variants={fadeUp}>
                        <Link
                            href="/plan"
                            className="inline-flex items-center gap-2 rounded-full px-9 py-4 font-semibold bg-[var(--primary-clr)] text-white hover:opacity-90 transition"
                        >
                            {t("cta_btn")}
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                    <motion.p
                        variants={fadeUp}
                        className="mt-5 text-xs text-[var(--light-fg)]"
                    >
                        {t("cta_footnote")}
                    </motion.p>
                </div>
            </motion.section>
        </div>
    );
}
