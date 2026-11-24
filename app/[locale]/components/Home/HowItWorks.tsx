"use client";

import {
    motion,
    useReducedMotion,
    type Variants,
} from "framer-motion";
import {
    Compass,
    Landmark,
    Plane,
    Route,
    Sun,
    UtensilsCrossed,
    Waves,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

export function HowItWorks() {
    const t = useTranslations("home");
    const reduce = useReducedMotion();

    const listVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: reduce ? 0 : 0.13,
                delayChildren: reduce ? 0 : 0.15,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: 26 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: reduce ? 0 : 0.55,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const steps = [
        {
            number: "01",
            Icon: Compass,
            title: t("step1_title"),
            description: t("step1_desc"),
        },
        {
            number: "02",
            Icon: Route,
            title: t("step2_title"),
            description: t("step2_desc"),
        },
        {
            number: "03",
            Icon: Plane,
            title: t("step3_title"),
            description: t("step3_desc"),
        },
    ];

    const plan = [
        {
            time: "08:30",
            Icon: Landmark,
            title: t("plan_1_title"),
            meta: t("plan_1_meta"),
        },
        {
            time: "12:30",
            Icon: UtensilsCrossed,
            title: t("plan_2_title"),
            meta: t("plan_2_meta"),
        },
        {
            time: "15:00",
            Icon: Waves,
            title: t("plan_3_title"),
            meta: t("plan_3_meta"),
        },
        {
            time: "19:30",
            Icon: Sun,
            title: t("plan_4_title"),
            meta: t("plan_4_meta"),
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.howGrid}>
                    <div>
                        <Reveal>
                            <span className={styles.eyebrow}>
                                <span className={styles.eyebrowDot} />
                                {t("how_tag")}
                            </span>
                            <h2 className={styles.h2}>{t("how_title")}</h2>
                            <p className={styles.lead}>{t("how_desc")}</p>
                        </Reveal>

                        <div className={styles.steps}>
                            {steps.map(({ number, Icon, title, description }, index) => (
                                <motion.div
                                    key={number}
                                    className={styles.step}
                                    initial={{ opacity: 0, y: 22 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-70px" }}
                                    transition={{
                                        duration: reduce ? 0 : 0.6,
                                        delay: reduce ? 0 : index * 0.12,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    <span className={styles.stepNum}>
                                        {number}
                                    </span>
                                    <div>
                                        <h3 className={styles.stepTitle}>
                                            <Icon
                                                size={15}
                                                style={{
                                                    verticalAlign: "-2px",
                                                    marginInlineEnd: "0.4rem",
                                                    color: "var(--primary-clr)",
                                                }}
                                            />
                                            {title}
                                        </h3>
                                        <p className={styles.stepDesc}>
                                            {description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Tilted phone mockup */}
                    <div className={styles.phoneStage}>
                        <div className={styles.phoneGlow} aria-hidden="true" />
                        <motion.div
                            className={styles.phone}
                            initial={{ opacity: 0, y: 44, rotate: -11 }}
                            whileInView={{ opacity: 1, y: 0, rotate: -6 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{
                                duration: reduce ? 0 : 0.9,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <span
                                className={styles.phoneNotch}
                                aria-hidden="true"
                            />
                            <div className={styles.phoneScreen}>
                                <div className={styles.phoneHead}>
                                    <div>
                                        <p className={styles.phoneDay}>
                                            {t("plan_day")}
                                        </p>
                                        <p className={styles.phoneCity}>
                                            Jijel
                                        </p>
                                    </div>
                                    <span className={styles.phoneWeather}>
                                        {t("plan_weather")}
                                    </span>
                                </div>

                                <motion.div
                                    className={styles.phoneList}
                                    variants={listVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-60px" }}
                                >
                                    {plan.map(({ time, Icon, title, meta }) => (
                                        <motion.div
                                            key={time}
                                            className={styles.planItem}
                                            variants={itemVariants}
                                        >
                                            <span className={styles.planIcon}>
                                                <Icon size={15} />
                                            </span>
                                            <span>
                                                <span className={styles.planTitle}>
                                                    {title}
                                                </span>
                                                <span className={styles.planMeta}>
                                                    {meta}
                                                </span>
                                            </span>
                                            <span className={styles.planTime}>
                                                {time}
                                            </span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
