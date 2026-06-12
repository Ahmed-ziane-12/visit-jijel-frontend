"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    TrendingUp,
    MapPin,
    DollarSign,
    Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./sortBy.module.css";

export type SortOption = "popular" | "nearest" | "cheapest" | "top-rated";

interface SortByProps {
    onSortChange: (option: SortOption) => void;
    defaultOption?: SortOption;
    className?: string;
}

export default function SortBy({
    onSortChange,
    defaultOption = "popular",
    className,
}: SortByProps) {
    const t = useTranslations("sort");
    const SORT_OPTIONS: {
        value: SortOption;
        label: string;
        icon: React.ReactNode;
    }[] = [
        { value: "popular", label: t("popular"), icon: <TrendingUp size={16} /> },
        { value: "nearest", label: t("nearest"), icon: <MapPin size={16} /> },
        { value: "cheapest", label: t("cheapest"), icon: <DollarSign size={16} /> },
        { value: "top-rated", label: t("top_rated"), icon: <Star size={16} /> },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] =
        useState<SortOption>(defaultOption);

    const selectedLabel =
        SORT_OPTIONS.find((opt) => opt.value === selectedOption)?.label ||
        t("sort_by");

    const handleSelect = (option: SortOption) => {
        setSelectedOption(option);
        onSortChange(option);
        setIsOpen(false);
    };

    return (
        <div className={`${styles.sortContainer} ${className || ""}`}>
            <button
                className={styles.sortButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t("sort_aria")}
            >
                <span className={styles.sortLabel}>
                    {
                        SORT_OPTIONS.find((opt) => opt.value === selectedOption)
                            ?.icon
                    }
                    {selectedLabel}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className={styles.dropdown}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    className={`${styles.sortOption} ${selectedOption === option.value ? styles.active : ""}`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <span className={styles.optionIcon}>
                                        {option.icon}
                                    </span>
                                    <span>{option.label}</span>
                                    {selectedOption === option.value && (
                                        <motion.span
                                            className={styles.checkmark}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            ✓
                                        </motion.span>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
