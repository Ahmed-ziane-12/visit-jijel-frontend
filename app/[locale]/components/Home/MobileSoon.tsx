"use client";

import { useState } from "react";
import { Apple, Check, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";
import styles from "./home.module.css";

export function MobileSoon() {
    const t = useTranslations("home");
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const badges = [
        { Icon: Apple, label: t("mobile_ios") },
        { Icon: Smartphone, label: t("mobile_android") },
    ];

    return (
        <section className={`${styles.section} ${styles.sectionTint}`}>
            <div className={`${styles.container} ${styles.mobile}`}>
                <Reveal className={styles.mobileHead}>
                    <span className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} />
                        {t("mobile_tag")}
                    </span>
                    <span className={styles.mobileIcon}>
                        <Smartphone size={22} />
                    </span>
                    <h2 className={styles.h2}>{t("mobile_title")}</h2>
                    <p className={`${styles.lead} ${styles.mobileLead}`}>
                        {t("mobile_desc")}
                    </p>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className={styles.badges}>
                        {badges.map(({ Icon, label }) => (
                            <div className={styles.badge} key={label}>
                                <span className={styles.badgeIcon}>
                                    <Icon size={18} />
                                </span>
                                <span>
                                    <span className={styles.badgeLabel}>
                                        {t("mobile_badge_note")}
                                    </span>
                                    <span className={styles.badgeName}>
                                        {label}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.notify}>
                        {sent ? (
                            <p className={styles.notifySuccess}>
                                <Check size={15} />
                                {t("mobile_notify_success")}
                            </p>
                        ) : open ? (
                            <form
                                className={styles.notifyForm}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    if (!email.trim()) return;
                                    // No newsletter endpoint exists yet; keep the
                                    // confirmation local until one is available.
                                    setSent(true);
                                }}
                            >
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder={t(
                                        "mobile_notify_placeholder",
                                    )}
                                    aria-label={t("mobile_notify_placeholder")}
                                    className={styles.notifyInput}
                                />
                                <button
                                    type="submit"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                >
                                    {t("mobile_notify_submit")}
                                </button>
                            </form>
                        ) : (
                            <Magnetic>
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={() => setOpen(true)}
                                >
                                    {t("mobile_notify")}
                                </button>
                            </Magnetic>
                        )}
                    </div>

                    <p className={styles.mobileStats}>
                        {t("mobile_stats")}
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
