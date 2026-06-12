"use client";
import React from "react";
import styles from "./Footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const Footer = () => {
    const t = useTranslations("footer");
    const pathname = usePathname();

    const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/explore");

    if (isAuthRoute) return null;

    return (
        <footer className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <Image
                            src={"/logo_dark.svg"}
                            height={1000}
                            width={1000}
                            alt={t("logo_alt")}
                        />
                        <p className={styles.tagline}>
                            {t("tagline")}
                        </p>
                    </div>
                    <div className={styles.links}>
                        <div className={styles.column}>
                            <h4>{t("explore_title")}</h4>
                            <Link href="/explore">{t("destinations_link")}</Link>
                            <Link href="/plan">{t("plan_link")}</Link>
                            <Link href="/explore">{t("beaches_link")}</Link>
                            <Link href="/explore">{t("historical_link")}</Link>
                        </div>
                        <div className={styles.column}>
                            <h4>{t("support_title")}</h4>
                            <Link href="#">{t("help_center")}</Link>
                            <Link href="#">{t("contact_us")}</Link>
                            <Link href="#">{t("faq")}</Link>
                            <Link href="#">{t("accessibility")}</Link>
                        </div>
                        <div className={styles.column}>
                            <h4>{t("company_title")}</h4>
                            <Link href="#">{t("about_us")}</Link>
                            <Link href="#">{t("privacy")}</Link>
                            <Link href="#">{t("terms")}</Link>
                            <Link href="#">{t("cookies")}</Link>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <span>
                        {t("copyright", { year: new Date().getFullYear() })}
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
