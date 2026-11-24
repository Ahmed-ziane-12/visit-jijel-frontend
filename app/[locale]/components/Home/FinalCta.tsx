"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

export function FinalCta() {
    const t = useTranslations("home");

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <Reveal className={styles.ctaBox}>
                    <span
                        className={`${styles.ctaBlob} ${styles.ctaBlobOne}`}
                        aria-hidden="true"
                    />
                    <span
                        className={`${styles.ctaBlob} ${styles.ctaBlobTwo}`}
                        aria-hidden="true"
                    />

                    <h2 className={styles.ctaTitle}>{t("cta_title")}</h2>
                    <p className={styles.ctaDesc}>{t("cta_desc")}</p>

                    <div className={styles.ctaActions}>
                        <Magnetic>
                            <Link
                                href="/plan"
                                className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                                {t("cta_btn")}
                                <ArrowRight size={17} />
                            </Link>
                        </Magnetic>
                    </div>

                    <p className={styles.ctaFootnote}>{t("cta_footnote")}</p>
                </Reveal>
            </div>
        </section>
    );
}
