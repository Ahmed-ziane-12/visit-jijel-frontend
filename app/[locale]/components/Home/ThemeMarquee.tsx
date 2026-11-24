"use client";

import { useTranslations } from "next-intl";
import styles from "./home.module.css";

const THEME_KEYS = [
    "marquee_1",
    "marquee_2",
    "marquee_3",
    "marquee_4",
    "marquee_5",
] as const;

export function ThemeMarquee() {
    const t = useTranslations("home");

    const group = (duplicate: boolean) => (
        <div className={styles.marqueeGroup} aria-hidden={duplicate || undefined}>
            {THEME_KEYS.map((key) => (
                <span className={styles.marqueeItem} key={key}>
                    <span className={styles.marqueeStar}>✦</span>
                    {t(key)}
                </span>
            ))}
        </div>
    );

    return (
        <div id="themes" className={styles.marquee}>
            <div className={styles.marqueeTrack}>
                {group(false)}
                {group(true)}
            </div>
        </div>
    );
}
