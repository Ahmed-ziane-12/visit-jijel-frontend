"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import styles from "./quiz.module.css";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

type QuizLayoutProps = {
    children: ReactNode;
    currentStep: string;
    totalSteps: number;
    title: string;
    description: string;
    progress: number;
    nextLabel: string;
    canGoBack: boolean;
    isLastStep: boolean;
    onNext: () => void;
    onBack: () => void;
};

export default function QuizLayout({
    children,
    currentStep,
    totalSteps,
    title,
    description,
    progress,
    nextLabel,
    canGoBack,
    isLastStep,
    onNext,
    onBack,
}: QuizLayoutProps) {
    const t = useTranslations("plan");

    // Parse current step number from string (e.g., "Step 3" -> 3)
    const currentStepNumber = parseInt(currentStep.split(" ").pop() || "1");

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <p className={styles.stepIndicator}>{currentStep}</p>

                    <h1 className={styles.title}>{title}</h1>
                    <div className={styles.progressBar}>
                        <motion.div
                            className={styles.progressFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        />
                    </div>
                    <p className={styles.description}>{description}</p>
                </header>

                {/* CONTENT */}
                <main className={styles.mainContent}>{children}</main>

                {/* BOTTOM */}
                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <button
                            onClick={onBack}
                            disabled={!canGoBack}
                            className={`${styles.backButton}  flex items-center gap-1`}
                        >
                            <ChevronLeft size={16} /> {t("back_btn")}
                        </button>

                        {/* Step Circles */}
                        <div className={styles.stepCircles}>
                            {Array.from({ length: totalSteps }, (_, i) => {
                                const stepNumber = i + 1;
                                const isActive =
                                    stepNumber === currentStepNumber;
                                const isCompleted =
                                    stepNumber < currentStepNumber;

                                return (
                                    <motion.div
                                        key={i}
                                        className={`${styles.stepCircle} 
                                            ${isActive ? styles.activeStep : ""} 
                                            ${isCompleted ? styles.completedStep : ""}`}
                                        initial={false}
                                        animate={{
                                            scale: isActive ? 1.15 : 1,
                                            backgroundColor: isActive
                                                ? "var(--primary-clr)"
                                                : isCompleted
                                                  ? "var(--primary-clr)"
                                                  : "#e2e8f0",
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {isCompleted && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={styles.checkmark}
                                            >
                                                ✓
                                            </motion.span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className={styles.footerButtons}>
                            <button className={styles.saveButton}>
                                {t("save_btn")}
                            </button>

                            <button
                                onClick={onNext}
                                className={`${styles.nextButton} flex items-center gap-1`}
                            >
                                {nextLabel}
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
