import React from "react";
import styles from "./problem.module.css";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { AppWindow, ClockAlert, Form, NotebookPen } from "lucide-react";

const ProblemsSection = () => {
    const t = useTranslations("home");
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <h1>
                    {t("problem_heading")}
                </h1>
                <p>{t("problem_sub")}</p>
            </div>
            <div className={styles.right}>
                <div className={styles.problems}>
                    <div className={styles.row}>
                        <div className={styles.problem}>
                            <span className={styles.icon}>
                                <AppWindow className="h-6 w-6 text-white" />
                            </span>
                            <p>{t("problem1_desc")}</p>
                        </div>
                        <div className={styles.problem}>
                            <span className={styles.icon}>
                                <Form className="h-6 w-6 text-white" />
                            </span>
                            <p>{t("problem2_desc")}</p>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.problem}>
                            <span className={styles.icon}>
                                <NotebookPen className="h-6 w-6 text-white" />
                            </span>
                            <p>{t("problem3_desc")}</p>
                        </div>
                        <div className={styles.problem}>
                            <span className={styles.icon}>
                                <ClockAlert className="h-6 w-6 text-white" />
                            </span>
                            <p>{t("problem4_desc")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemsSection;
