"use client";

import {
    CalendarDays,
    Compass,
    Languages,
    Smartphone,
    Sparkles,
    UtensilsCrossed,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

export function Features() {
    const t = useTranslations("home");

    const features = [
        {
            Icon: Sparkles,
            title: t("feat_itineraries"),
            description: t("feat_itineraries_desc"),
        },
        {
            Icon: Compass,
            title: t("feat_explore"),
            description: t("feat_explore_desc"),
        },
        {
            Icon: UtensilsCrossed,
            title: t("feat_stay"),
            description: t("feat_stay_desc"),
        },
        {
            Icon: CalendarDays,
            title: t("feat_events"),
            description: t("feat_events_desc"),
        },
        {
            Icon: Smartphone,
            title: t("feat_apps"),
            description: t("feat_apps_desc"),
            soon: true,
        },
        {
            Icon: Languages,
            title: t("feat_language"),
            description: t("feat_language_desc"),
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <Reveal className={styles.head}>
                    <span className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} />
                        {t("features_tag")}
                    </span>
                    <h2 className={styles.h2}>{t("features_title")}</h2>
                    <p className={styles.lead}>{t("features_desc")}</p>
                </Reveal>

                <div className={styles.featureGrid}>
                    {features.map(
                        ({ Icon, title, description, soon }, index) => (
                            <Reveal key={title} delay={index * 0.07}>
                                <div
                                    className={styles.featureCard}
                                    onMouseMove={(event) => {
                                        const rect =
                                            event.currentTarget.getBoundingClientRect();
                                        event.currentTarget.style.setProperty(
                                            "--mx",
                                            `${event.clientX - rect.left}px`,
                                        );
                                        event.currentTarget.style.setProperty(
                                            "--my",
                                            `${event.clientY - rect.top}px`,
                                        );
                                    }}
                                >
                                    <span className={styles.featureIcon}>
                                        <Icon size={21} />
                                    </span>
                                    <h3 className={styles.featureTitle}>
                                        {title}
                                        {soon && (
                                            <span className={styles.soonBadge}>
                                                {t("badge_soon")}
                                            </span>
                                        )}
                                    </h3>
                                    <p className={styles.featureDesc}>
                                        {description}
                                    </p>
                                </div>
                            </Reveal>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}
