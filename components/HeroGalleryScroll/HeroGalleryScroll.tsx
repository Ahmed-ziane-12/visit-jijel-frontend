"use client";

import { motion } from "framer-motion";
import { MapPin, Compass, Map, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
    ContainerScroll,
    BentoGrid,
    BentoCell,
    ContainerScale,
} from "./hero-gallery-scroll-animation";

const IMAGES = ["/phare.jpg", "/zoo.jpg", "/g.jpg", "/p2.jpg", "/p5.jpg"];

export function HeroGalleryScroll() {
    const t = useTranslations("home");

    return (
        <ContainerScroll className="h-[350vh]">
            <BentoGrid className="sticky left-0 top-0 z-0 h-screen w-full p-4">
                {IMAGES.map((src, index) => (
                    <BentoCell
                        key={index}
                        className="overflow-hidden rounded-3xl"
                    >
                        <Image
                            className="size-full object-cover object-center"
                            src={src}
                            alt=""
                            fill
                            sizes="(max-width:768px) 100vw, 50vw"
                        />
                    </BentoCell>
                ))}
            </BentoGrid>

            <ContainerScale className="relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-(--primary-clr) bg-(--background)/80 text-(--primary-clr) text-sm font-medium mb-6 backdrop-blur-sm">
                        <MapPin size={14} />
                        {t("hero_badge")}
                    </span>
                </motion.div>

                <motion.h1
                    className="text-(--foreground) font-bold leading-[1.1] mb-5 text-balance"
                    style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                >
                    {t("hero_title")}
                </motion.h1>

                <motion.p
                    className="text-(--light-fg) text-lg md:text-xl max-w-2xl mx-auto mb-10 text-balance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                >
                    {t("hero_desc")}
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                >
                    <Link
                        href="/explore"
                        className="text-white inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-sm bg-(--primary-clr) hover:opacity-90 transition-all"
                    >
                        <Compass size={16} color="white" />
                        Explore
                        {/* {t("hero_start") ?? "Explore Destinations"} */}
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
            </ContainerScale>
        </ContainerScroll>
    );
}
