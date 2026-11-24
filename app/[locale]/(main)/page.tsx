"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import axios from "@/lib/axios";
import type { Destination } from "@/types/map";
import { localizeDestination } from "@/lib/localize";
import { Hero } from "../components/Home/Hero";
import { ThemeMarquee } from "../components/Home/ThemeMarquee";
import { HowItWorks } from "../components/Home/HowItWorks";
import {
    TopDestinations,
    type HomeDestination,
} from "../components/Home/TopDestinations";
import { Features } from "../components/Home/Features";
import { BusinessPanel } from "../components/Home/BusinessPanel";
import { MobileSoon } from "../components/Home/MobileSoon";
import { FinalCta } from "../components/Home/FinalCta";

type DestinationWithFlags = Destination & { is_featured?: boolean };

export default function Home() {
    const t = useTranslations("home");
    const locale = useLocale();
    const [destinations, setDestinations] = useState<Destination[]>([]);

    useEffect(() => {
        let cancelled = false;

        axios
            .get("/api/v1/destinations")
            .then(({ data }) => {
                if (cancelled) return;
                const list = Array.isArray(data) ? data : (data?.data ?? []);
                setDestinations(list);
            })
            .catch(() => {
                /* Keep the curated fallback cards when the API is offline. */
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Curated cards keep the bento grid complete before the API responds (or
    // when the database has fewer than four destinations).
    const fallback: HomeDestination[] = [
        {
            name: t("dest_fallback_1"),
            category: t("cat_landmark"),
            image: "/phare.jpg",
            href: "/explore",
        },
        {
            name: t("dest_fallback_2"),
            category: t("cat_beach"),
            image: "/b.jpg",
            href: "/explore",
        },
        {
            name: t("dest_fallback_3"),
            category: t("cat_history"),
            image: "/g.jpg",
            href: "/explore",
        },
        {
            name: t("dest_fallback_4"),
            category: t("cat_beach"),
            image: "/p5.jpg",
            href: "/explore",
        },
    ];

    const featured = destinations.filter(
        (destination) => (destination as DestinationWithFlags).is_featured,
    );
    const pool = featured.length >= 4 ? featured : destinations;

    const fromApi: HomeDestination[] = pool.slice(0, 4).map((destination, index) => {
        const localized = localizeDestination(destination, locale);
        const media = destination.media ?? [];
        const cover =
            media.find((item) => item.is_cover)?.secure_url ??
            media[0]?.secure_url;

        return {
            id: destination.id,
            name: localized.name,
            category: localized.category || t("cat_nature"),
            image: cover ?? fallback[index].image,
            href: `/explore/${destination.id}`,
        };
    });

    const top = fromApi.length === 4 ? fromApi : fallback;

    return (
        <MotionConfig reducedMotion="user">
            <Hero />
            <ThemeMarquee />
            <HowItWorks />
            <TopDestinations items={top} />
            <Features />
            <BusinessPanel />
            <MobileSoon />
            <FinalCta />
        </MotionConfig>
    );
}
