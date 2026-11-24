"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Landmark, Trees, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import { Magnetic } from "./Magnetic";
import styles from "./home.module.css";

const CHIPS = [
    { key: "hero_chip_beaches", Icon: Waves },
    { key: "hero_chip_ruins", Icon: Landmark },
    { key: "hero_chip_nature", Icon: Trees },
] as const;

function Wave({ className }: { className: string }) {
    return (
        <svg
            className={`${styles.waveSvg} ${className}`}
            viewBox="0 0 720 120"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M0,64 C120,24 240,24 360,64 C480,104 600,104 720,64 L720,120 L0,120 Z" />
        </svg>
    );
}

export function Hero() {
    const t = useTranslations("home");
    const reduce = useReducedMotion();
    const words = t("hero_title").split(" ");

    return (
        <section className={styles.hero}>
            {/* Slow drifting coastal photo */}
            <div className={styles.heroMedia}>
                <Image
                    src="/p2.jpg"
                    alt=""
                    fill
                    preload
                    sizes="100vw"
                    className={styles.heroImg}
                />
                <div className={styles.heroScrim} aria-hidden="true" />
            </div>

            <div className={styles.heroInner}>
                <div className={styles.heroCopy}>
                    <motion.span
                        className={styles.heroEyebrow}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduce ? 0 : 0.65,
                            ease: "easeOut",
                        }}
                    >
                        <span className={styles.heroEyebrowDot} />
                        {t("hero_badge")}
                    </motion.span>

                    <h1 className={styles.heroTitle}>
                        {words.map((word, index) => (
                            <Fragment key={`${word}-${index}`}>
                                <span className={styles.wordMask}>
                                    <motion.span
                                        className={styles.word}
                                        initial={{ y: "115%" }}
                                        animate={{ y: "0%" }}
                                        transition={{
                                            duration: reduce ? 0 : 0.9,
                                            delay: reduce
                                                ? 0
                                                : 0.12 + index * 0.07,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                </span>
                                {index < words.length - 1 ? " " : null}
                            </Fragment>
                        ))}
                    </h1>

                    <motion.p
                        className={styles.heroSub}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduce ? 0 : 0.7,
                            delay: reduce ? 0 : 0.45,
                            ease: "easeOut",
                        }}
                    >
                        {t("hero_desc")}
                    </motion.p>

                    <motion.div
                        className={styles.heroActions}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reduce ? 0 : 0.7,
                            delay: reduce ? 0 : 0.58,
                            ease: "easeOut",
                        }}
                    >
                        <Magnetic>
                            <Link
                                href="/plan"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                                {t("hero_plan")}
                                <ArrowRight size={17} />
                            </Link>
                        </Magnetic>
                        <Magnetic>
                            <Link
                                href="/explore"
                                className={`${styles.btn} ${styles.btnGhost}`}
                            >
                                <Compass size={17} />
                                {t("hero_start")}
                            </Link>
                        </Magnetic>
                    </motion.div>
                </div>

                {/* Floating glass chips */}
                <div className={styles.chips}>
                    {CHIPS.map(({ key, Icon }, index) => (
                        <motion.div
                            key={key}
                            className={styles.chip}
                            initial={{ opacity: 0, x: 26 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: reduce ? 0 : 0.7,
                                delay: reduce ? 0 : 0.55 + index * 0.12,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <div
                                className={styles.chipInner}
                                style={{
                                    animationDelay: `${index * 0.7}s`,
                                }}
                            >
                                <span className={styles.chipIcon}>
                                    <Icon size={18} />
                                </span>
                                <span className={styles.chipLabel}>
                                    {t(key)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <a href="#themes" className={styles.scrollCue}>
                <span>{t("hero_scroll")}</span>
                <span className={styles.scrollLine} aria-hidden="true" />
            </a>

            {/* Soft animated waves */}
            <div className={styles.waves} aria-hidden="true">
                <div className={`${styles.waveTrack} ${styles.waveBack}`}>
                    <Wave className={styles.waveBackPath} />
                    <Wave className={styles.waveBackPath} />
                </div>
                <div className={`${styles.waveTrack} ${styles.waveFront}`}>
                    <Wave className={styles.waveFrontPath} />
                    <Wave className={styles.waveFrontPath} />
                </div>
            </div>
        </section>
    );
}
