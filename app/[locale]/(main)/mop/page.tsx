"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/axios";
import AnimateOnScroll from "../components/AnimateOnScroll/AnimateOnScroll";
import ProblemsSection from "../components/Problems/ProblemsSection";
import SolutionSection from "../components/SolutionSection/SolutionSection";
import PreviewSection from "../components/PreviewSection/PreviewSection";
import SearchCard from "../components/SearchCard/SearchCard";
import { ArrowRight, MapPinSearch, WandSparkles } from "lucide-react";
import type { Destination } from "@/types/map";

function useSections(t: ReturnType<typeof useTranslations>) {
    return [
        { key: "recommended", title: t("section_recommended") },
        { key: "popular", title: t("section_popular") },
        { key: "events", title: t("section_events") },
        { key: "nearby", title: t("section_nearby") },
        { key: "gems", title: t("section_gems") },
    ];
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function Home() {
    const t = useTranslations("home");
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    const [destinations, setDestinations] = useState<Destination[]>([]);

    useEffect(() => {
        axios
            .get("/api/v1/destinations")
            .then((res) => setDestinations(res.data));
    }, []);

    const sectionData = useMemo(() => {
        if (destinations.length === 0) return [];
        const sections = useSections(t);
        const shuffled = shuffle(destinations);
        const size = Math.min(
            8,
            Math.ceil(destinations.length / sections.length),
        );
        return sections.map((s, i) => ({
            ...s,
            items: shuffled.slice(i * size, (i + 1) * size),
        }));
    }, [destinations, t]);

    if (loading) return null;

    function getImage(dest: Destination) {
        return (
            dest.media?.find((m) => m.is_cover)?.secure_url ||
            dest.media?.[0]?.secure_url ||
            "/p2.jpg"
        );
    }

    if (isAuthenticated) {
        const recommended = sectionData.find((s) => s.key === "recommended");
        const otherSections = sectionData.filter(
            (s) => s.key !== "recommended",
        );

        return (
            <main className={styles.feed}>
                <h1 className={styles.welcome}>
                    {t("welcome", { name: user?.name ?? "" })}
                </h1>

                {recommended && recommended.items.length > 0 && (
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                {recommended.title}
                            </h2>
                        </div>
                        <div className={styles.bentoGrid}>
                            <div
                                className={styles.bentoLeft}
                                style={{
                                    backgroundImage: `url(${getImage(recommended.items[0])})`,
                                }}
                                onClick={() =>
                                    router.push(
                                        `/explore/${recommended.items[0].id}`,
                                    )
                                }
                            >
                                <div className={styles.bentoOverlay} />
                                <span className={styles.bentoTitle}>
                                    {recommended.items[0].name}
                                </span>
                            </div>
                            <div className={styles.bentoRight}>
                                {recommended.items.slice(1, 3).map((dest) => (
                                    <div
                                        key={dest.id}
                                        className={styles.bentoSmall}
                                        style={{
                                            backgroundImage: `url(${getImage(dest)})`,
                                        }}
                                        onClick={() =>
                                            router.push(`/explore/${dest.id}`)
                                        }
                                    >
                                        <div className={styles.bentoOverlay} />
                                        <span className={styles.bentoTitle}>
                                            {dest.name}
                                        </span>
                                    </div>
                                ))}
                                <div className={styles.bentoLastRow}>
                                    {recommended.items[3] && (
                                        <div
                                            className={styles.bentoSmall}
                                            style={{
                                                backgroundImage: `url(${getImage(recommended.items[3])})`,
                                            }}
                                            onClick={() =>
                                                router.push(
                                                    `/explore/${recommended.items[3].id}`,
                                                )
                                            }
                                        >
                                            <div
                                                className={styles.bentoOverlay}
                                            />
                                            <span className={styles.bentoTitle}>
                                                {recommended.items[3].name}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        className={styles.bentoSeeAll}
                                        onClick={() => router.push("/explore")}
                                    >
                                        <ArrowRight size={16} />
                                        {t("see_all")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {otherSections.map((section) => (
                    <section key={section.key} className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>
                                {section.title}
                            </h2>
                            <button className={styles.seeAll}>{t("see_all")}</button>
                        </div>
                        <div className={styles.scrollRow}>
                            {section.items.map((dest) => (
                                <SearchCard
                                    key={dest.id}
                                    id={dest.id}
                                    name={dest.name}
                                    description={dest.description}
                                    image={getImage(dest)}
                                    badge={dest.category}
                                    type="destination"
                                    onButtonClick={(id) =>
                                        router.push(`/explore/${id}`)
                                    }
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.left}>
                    <h1 className={styles.title}>
                        {t("hero_title")}
                    </h1>
                    <p className={styles.subtitle}>{t("hero_desc")}</p>
                    <div className={styles.cta}>
                        <button>
                            <MapPinSearch className="h-5 w-5" />
                            {t("hero_start")}
                        </button>
                        <button>
                            <WandSparkles className="h-5 w-5" />
                            {t("hero_demo")}
                        </button>
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.column}>
                        <motion.div
                            initial={{ opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`${styles.frame} ${styles.first}`}
                        >
                            <Image
                                src={"/g.jpg"}
                                alt={""}
                                width={1000}
                                height={1000}
                            />
                        </motion.div>
                    </div>
                    <div className={styles.column}>
                        <motion.div
                            initial={{ opacity: 0, y: -22 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1 }}
                            className={styles.frame}
                        >
                            <Image
                                src={"/b.jpg"}
                                alt={""}
                                width={1000}
                                height={1000}
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.5 }}
                            className={`${styles.frame} ${styles.last}`}
                        >
                            <Image
                                src={"/p2.jpg"}
                                alt={""}
                                width={1000}
                                height={1000}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
            <AnimateOnScroll
                className={styles.problems}
                variant="fadeUp"
                delay={0.5}
            >
                <ProblemsSection />
            </AnimateOnScroll>
            <AnimateOnScroll
                className={styles.solutions}
                variant="fadeUp"
                delay={0.5}
            >
                <SolutionSection />
            </AnimateOnScroll>
            <AnimateOnScroll
                className={styles.preview}
                variant="fadeUp"
                delay={0.5}
            >
                <PreviewSection />
            </AnimateOnScroll>
            <section className={styles.mobile}></section>

            <section className={styles.contact}></section>
        </main>
    );
}
