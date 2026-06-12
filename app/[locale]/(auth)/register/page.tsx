"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type Role = "client" | "business_owner";

interface SignUpForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Role;
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

interface RegisterResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

interface RoleOption {
    value: Role;
    icon: string;
    label: string;
    desc: string;
}

function getRoles(t: ReturnType<typeof useTranslations>): RoleOption[] {
    return [
        {
            value: "client",
            icon: "🧳",
            label: t("role_traveller"),
            desc: t("role_traveller_desc"),
        },
        {
            value: "business_owner",
            icon: "🏨",
            label: t("role_business"),
            desc: t("role_business_desc"),
        },
    ];
}

export default function SignUpForm() {
    const router = useRouter();
    const t = useTranslations("auth.register");
    const ROLES = getRoles(t);
    const { register } = useAuth();

    const [form, setForm] = useState<SignUpForm>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "client",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [alert, setAlert] = useState<Alert | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (): FormErrors => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = t("name_required");
        if (!form.email.trim()) e.email = t("email_required");
        if (form.password.length < 8)
            e.password = t("password_length");
        if (form.password !== form.password_confirmation)
            e.password_confirmation = t("password_mismatch");
        return e;
    };

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        setAlert(null);

        const clientErrors = validate();
        if (Object.keys(clientErrors).length) {
            setErrors(clientErrors);
            return;
        }

        setLoading(true);

        try {
            await register(form);

            if (form.role === "business_owner") {
                router.push("/login");
            } else {
                router.push("/");
            }
        } catch (err) {
            const error = err as AxiosError<{
                message?: string;
                errors?: Record<string, string[]>;
            }>;
            const data = error.response?.data;

            if (data?.errors) {
                const mapped: FormErrors = {};
                (
                    Object.entries(data.errors) as [
                        keyof FormErrors,
                        string[],
                    ][]
                ).forEach(([key, msgs]) => {
                    mapped[key] = msgs[0];
                });
                setErrors(mapped);
            } else {
                setAlert({
                    type: "error",
                    message: data?.message ?? t("registration_failed"),
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Animation variants for the eye icon
    const eyeVariants = {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        tap: { scale: 0.9 },
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

            {alert && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`${styles.alert} ${alert.type === "error" ? styles.alertError : styles.alertSuccess}`}
                >
                    {alert.message}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <fieldset className={styles.roleFieldset}>
                    <div className={styles.roleCards}>
                        {ROLES.map((role) => (
                            <label
                                key={role.value}
                                className={`${styles.roleCard} ${form.role === role.value ? styles.roleCardActive : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={role.value}
                                    checked={form.role === role.value}
                                    onChange={handleChange}
                                    className={styles.roleRadio}
                                />
                                <span className={styles.roleName}>
                                    {role.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <div className={styles.field}>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t("name_placeholder")}
                        value={form.name}
                        onChange={handleChange}
                        className={errors.name ? styles.inputError : ""}
                    />
                    {errors.name && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.fieldError}
                        >
                            {errors.name}
                        </motion.span>
                    )}
                </div>

                <div className={styles.field}>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("email_placeholder")}
                        value={form.email}
                        onChange={handleChange}
                        className={errors.email ? styles.inputError : ""}
                    />
                    {errors.email && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.fieldError}
                        >
                            {errors.email}
                        </motion.span>
                    )}
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
                                showPassword ? t("hide_password") : t("show_password")
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

                <div className={`${styles.passwordField} ${styles.field}`}>
                    <div className={styles.passwordWrapper}>
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t("confirm_placeholder")}
                            value={form.password_confirmation}
                            onChange={handleChange}
                            className={
                                errors.password_confirmation
                                    ? styles.inputError
                                    : ""
                            }
                        />
                        <motion.button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            variants={eyeVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            whileTap="tap"
                            aria-label={
                                showConfirmPassword
                                    ? t("hide_password")
                                    : t("show_password")
                            }
                        >
                            <AnimatePresence mode="wait">
                                {showConfirmPassword ? (
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
                    {errors.password_confirmation && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.fieldError}
                        >
                            {errors.password_confirmation}
                        </motion.span>
                    )}
                </div>

                <motion.button
                    type="submit"
                    className={`${styles.btnSubmit} ${loading ? styles.loading : ""} `}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                    {loading ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <Loader2 size={18} />
                            </motion.div>
                            {t("creating")}
                        </>
                    ) : (
                        t("create_btn")
                    )}
                </motion.button>
            </form>

            <p className={styles.note}>
                {t.rich("have_account", { link: (chunks) => <Link href="/login">{chunks}</Link> })}
            </p>
        </motion.div>
    );
}
