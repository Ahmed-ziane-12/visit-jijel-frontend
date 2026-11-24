"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

const BAR_HEIGHTS = [38, 62, 48, 74, 56, 88, 66];
const ROW_BARS = [72, 46, 88];

export function BusinessPanel() {
    const t = useTranslations("home");
    const reduce = useReducedMotion();

    const points = [
        t("business_point1"),
        t("business_point2"),
        t("business_point3"),
        t("business_point4"),
    ];

    const rows = [
        { label: t("dash_listings"), value: "24" },
        { label: t("dash_bookings"), value: "8" },
        { label: t("dash_views"), value: "1.2k" },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.businessPanel}>
                    <div className={styles.businessGrid}>
                        <Reveal>
                            <span
                                className={`${styles.eyebrow} ${styles.businessTag}`}
                            >
                                <span className={styles.eyebrowDot} />
                                {t("business_tag")}
                            </span>
                            <h2 className={styles.businessTitle}>
                                {t("business_title")}
                            </h2>
                            <p className={styles.businessDesc}>
                                {t("business_desc")}
                            </p>

                            <ul className={styles.checkList}>
                                {points.map((point) => (
                                    <li className={styles.checkItem} key={point}>
                                        <span className={styles.checkMark}>
                                            <Check size={11} strokeWidth={3} />
                                        </span>
                                        {point}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register?role=business_owner"
                                className={styles.businessBtn}
                            >
                                {t("business_cta")}
                                <ArrowRight size={16} />
                            </Link>
                        </Reveal>

                        <Reveal delay={0.15} className={styles.dashWrap}>
                            <div className={styles.dash}>
                                <div className={styles.dashHead}>
                                    <span className={styles.dashTitle}>
                                        {t("dash_title")}
                                    </span>
                                    <span className={styles.dashLive}>
                                        <span className={styles.dashLiveDot} />
                                        {t("dash_live")}
                                    </span>
                                </div>

                                <div className={styles.dashRows}>
                                    {rows.map((row, index) => (
                                        <div
                                            className={styles.dashRow}
                                            key={row.label}
                                        >
                                            <span>{row.label}</span>
                                            <span className={styles.dashRowValue}>
                                                {row.value}
                                            </span>
                                            <span className={styles.dashRowBar}>
                                                <motion.span
                                                    className={
                                                        styles.dashRowBarFill
                                                    }
                                                    initial={{ width: 0 }}
                                                    whileInView={{
                                                        width: `${ROW_BARS[index]}%`,
                                                    }}
                                                    viewport={{
                                                        once: true,
                                                        margin: "-50px",
                                                    }}
                                                    transition={{
                                                        duration: reduce ? 0 : 0.8,
                                                        delay: reduce
                                                            ? 0
                                                            : 0.15 + index * 0.1,
                                                        ease: [0.22, 1, 0.36, 1],
                                                    }}
                                                />
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.dashChart}>
                                    <p className={styles.dashChartLabel}>
                                        {t("dash_chart")}
                                    </p>
                                    <motion.div
                                        className={styles.bars}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={{
                                            hidden: {},
                                            visible: {
                                                transition: {
                                                    staggerChildren: reduce
                                                        ? 0
                                                        : 0.07,
                                                },
                                            },
                                        }}
                                    >
                                        {BAR_HEIGHTS.map((height, index) => (
                                            <motion.span
                                                className={styles.bar}
                                                key={index}
                                                variants={{
                                                    hidden: {
                                                        height: 0,
                                                        opacity: 0.4,
                                                    },
                                                    visible: {
                                                        height: `${height}%`,
                                                        opacity: 1,
                                                        transition: {
                                                            duration: reduce
                                                                ? 0
                                                                : 0.7,
                                                            ease: [
                                                                0.22, 1, 0.36,
                                                                1,
                                                            ],
                                                        },
                                                    },
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
