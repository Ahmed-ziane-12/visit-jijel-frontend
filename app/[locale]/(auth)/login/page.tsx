"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { LoginCredentials } from "@/types/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
}

interface Alert {
    type: "error" | "success";
    message: string;
}

interface LoginResponse {
    message?: string;
    role?: "client" | "business_owner" | "admin";
    email_verified?: boolean;
    user?: Record<string, unknown>;
}

export default function LoginForm() {
    const router = useRouter();
    const t = useTranslations("auth.login");
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [form, setForm] = useState<LoginCredentials>({
        email: "",
        password: "",
        remember: false,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const eyeVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        tap: { scale: 0.9 },
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckbox = (e: ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, remember: e.target.checked }));
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await login(form);

            if (data.role === "client" && !data.email_verified) {
                sessionStorage.setItem("show_verify_alert", "1");
            }

            if (data.role === "business_owner") {
                router.push("/dashboard/");
            } else {
                router.push("/");
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setError(error.response?.data?.message ?? t("connection_error"));
        } finally {
            setLoading(false);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className={styles.card}
        >
            <div className={styles.stripe} />

            <div className={styles.header}>
                <p className={styles.eyebrow}>{t("eyebrow")}</p>
                <h1 className={styles.title}>
                    {t.rich("title", { em: (chunks) => <em>{chunks}</em> })}
                </h1>
            </div>

            {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={`${styles.passwordField} `}>
                    <div
                        className={`${styles.passwordWrapper} ${styles.field}`}
                    >
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={t("password_placeholder")}
                            value={form.password}
                            onChange={handleChange}
                            className={errors.password ? styles.inputError : ""}
                        />
                        <motion.button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword(!showPassword)}
                            variants={eyeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            whileTap="tap"
                            aria-label={
                                showPassword
                                    ? t("hide_password")
                                    : t("show_password")
                            }
                        >
                            <AnimatePresence mode="wait">
                                {showPassword ? (
                                    <motion.div
                                        key="eye-off"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <EyeOff size={18} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="eye"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Eye size={18} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                    {errors.password && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.fieldError}
                        >
                            {errors.password}
                        </motion.span>
                    )}
                </div>
                <div className={styles.options}>
                    <label className={styles.rememberLabel}>
                        <input
                            type="checkbox"
                            name="remember"
                            checked={form.remember}
                            onChange={handleCheckbox}
                            className={styles.rememberCheckbox}
                        />
                        <span className={styles.rememberText}>
                            {t("remember")}
                        </span>
                    </label>

                    <div className={styles.forgot}>
                        <Link href="/forgot-password">{t("forgot")}</Link>
                    </div>
                </div>
                {form.remember && (
                    <p className={styles.rememberNote}>{t("stay_signedin")}</p>
                )}
                <button
                    type="submit"
                    className={`${styles.btnSubmit} ${loading ? styles.loading : ""}`}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            {t("submitting")}
                        </>
                    ) : (
                        t("signin_btn")
                    )}
                </button>
            </form>

            <p className={styles.note}>
                {t.rich("no_account", {
                    link: (chunks) => <Link href="/register">{chunks}</Link>,
                })}
            </p>
        </motion.div>
    );
}
