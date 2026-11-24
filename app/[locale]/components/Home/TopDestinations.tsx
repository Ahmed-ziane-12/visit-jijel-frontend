"use client";

import Image from "next/image";
import Link from "next/link";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

export interface HomeDestination {
    id?: number;
    name: string;
    category: string;
    image: string;
    href: string;
}

function TiltCard({
    children,
    index,
}: {
    children: React.ReactNode;
    index: number;
}) {
    const reduce = useReducedMotion();
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springX = useSpring(rotateX, { stiffness: 160, damping: 18 });
    const springY = useSpring(rotateY, { stiffness: 160, damping: 18 });

    return (
        <motion.div
            className={styles.cardShell}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{
                duration: reduce ? 0 : 0.7,
                delay: reduce ? 0 : index * 0.09,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                rotateX: springX,
                rotateY: springY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={(event) => {
                if (reduce) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width - 0.5;
                const py = (event.clientY - rect.top) / rect.height - 0.5;
                rotateY.set(px * 9);
                rotateX.set(-py * 9);
            }}
            onMouseLeave={() => {
                rotateX.set(0);
                rotateY.set(0);
            }}
        >
            {children}
        </motion.div>
    );
}

export function TopDestinations({ items }: { items: HomeDestination[] }) {
    const t = useTranslations("home");

    return (
        <section className={`${styles.section} ${styles.sectionTint}`}>
            <div className={styles.container}>
                <div className={styles.destHead}>
                    <Reveal>
                        <span className={styles.eyebrow}>
                            <span className={styles.eyebrowDot} />
                            {t("dest_tag")}
                        </span>
                        <h2 className={styles.h2}>{t("dest_title")}</h2>
                        <p className={styles.lead}>{t("dest_desc")}</p>
                    </Reveal>
                    <Reveal delay={0.12}>
                        <Link href="/explore" className={styles.destAll}>
                            {t("dest_all")}
                            <ArrowRight size={15} />
                        </Link>
                    </Reveal>
                </div>

                <div className={styles.bento}>
                    {items.map((destination, index) => (
                        <TiltCard
                            key={`${destination.id ?? "spot"}-${index}`}
                            index={index}
                        >
                            <Link
                                href={destination.href}
                                className={styles.bentoCard}
                                aria-label={`${destination.name} — ${t("dest_view")}`}
                            >
                                <Image
                                    src={destination.image}
                                    alt={destination.name}
                                    fill
                                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                                    className={styles.cardImg}
                                />
                                <span
                                    className={styles.cardOverlay}
                                    aria-hidden="true"
                                />
                                <div className={styles.cardBody}>
                                    <div>
                                        <span className={styles.cardCat}>
                                            {destination.category}
                                        </span>
                                        <span className={styles.cardTitle}>
                                            {destination.name}
                                        </span>
                                    </div>
                                    <span
                                        className={styles.cardArrow}
                                        aria-hidden="true"
                                    >
                                        <ArrowUpRight size={18} />
                                    </span>
                                </div>
                            </Link>
                        </TiltCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
