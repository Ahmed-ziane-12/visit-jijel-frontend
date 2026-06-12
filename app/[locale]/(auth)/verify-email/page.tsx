"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";
import axios from "@/lib/axios";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const fadeUp = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
};

const springScale = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: "spring" as const, stiffness: 200, damping: 10 },
} as const;

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations("auth.verify");
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        "loading",
    );
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const id = searchParams.get("id");
            const hash = searchParams.get("hash");
            const expires = searchParams.get("expires");
            const signature = searchParams.get("signature");

            if (!id || !hash || !expires || !signature) {
                setStatus("error");
                setMessage(t("invalid_link"));
                return;
            }

            try {
                const { data } = await axios.get(
                    `/api/v1/verify-email/${id}/${hash}`,
                    { params: { expires, signature } },
                );

                if (data.message) {
                    setStatus("success");
                    setMessage(t("success"));
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    setStatus("error");
                    setMessage(data.message || t("failed"));
                }
            } catch {
                setStatus("error");
                setMessage(t("expired"));
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className={styles.card}>
            <div className={styles.stripe} />

            <motion.div className={styles.header} {...fadeUp}>
                <p className={styles.eyebrow}>{t("eyebrow")}</p>
                <h1 className={styles.title}>
                    {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
                </h1>
            </motion.div>

            {status === "loading" && (
                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.1 }}
                    style={{ textAlign: "center", padding: "2rem 0" }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            width: 48,
                            height: 48,
                            margin: "0 auto 1.25rem",
                            color: "#eb662b",
                        }}
                    >
                        <Loader2 size={48} />
                    </motion.div>
                    <p
                        style={{
                            fontSize: "0.9rem",
                            color: "#4a4540",
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        {t("verifying")}
                        <br />
                        <span style={{ fontSize: "0.82rem", color: "#999" }}>
                            {t("please_wait")}
                        </span>
                    </p>
                </motion.div>
            )}

            {status === "success" && (
                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.1 }}
                    style={{ textAlign: "center", padding: "1rem 0" }}
                >
                    <motion.div {...springScale}>
                        <CheckCircle
                            size={56}
                            style={{ color: "#22c55e", margin: "0 auto 1rem" }}
                        />
                    </motion.div>
                    <p
                        style={{
                            fontSize: "0.9rem",
                            color: "#4a4540",
                            lineHeight: 1.6,
                            marginBottom: "1.5rem",
                        }}
                    >
                        {message}
                    </p>
                    <Link
                        href="/login"
                        className={styles.btnSubmit}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            textDecoration: "none",
                            width: "100%",
                        }}
                    >
                        <Mail size={16} />
                        {t("go_to_login")}
                    </Link>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.1 }}
                    style={{ textAlign: "center", padding: "1rem 0" }}
                >
                    <motion.div {...springScale}>
                        <XCircle
                            size={56}
                            style={{ color: "#c0392b", margin: "0 auto 1rem" }}
                        />
                    </motion.div>

                    <div
                        className={`${styles.alert} ${styles.alertError}`}
                        style={{ textAlign: "left" }}
                    >
                        {message}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                            marginTop: "1rem",
                        }}
                    >
                        <Link
                            href="/login"
                            className={styles.btnSubmit}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                textDecoration: "none",
                            }}
                        >
                            {t("back_to_login")}
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.btnSubmit}
                            style={{
                                background: "transparent",
                                color: "#eb662b",
                                border: "1.5px solid #eb662b",
                            }}
                        >
                            {t("try_again")}
                        </button>
                    </div>
                </motion.div>
            )}

            <p className={styles.note}>
                {t.rich("need_help", { link: (chunks) => <Link href="/contact">{chunks}</Link> })}
            </p>
        </div>
    );
}
