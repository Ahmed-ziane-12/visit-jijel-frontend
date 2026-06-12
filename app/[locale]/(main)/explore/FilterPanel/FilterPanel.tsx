"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightOpen, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./FilterPanel.module.css";

export interface FilterState {
    search: string;
    types: string[];
    ratings: number[];
}

interface Props {
    onSearch: (query: string) => void;
    onApply: (filters: FilterState) => void;
}

const TYPE_OPTIONS = ["destination", "business", "event"];
const RATING_OPTIONS = [4, 3, 2, 1];

export default function FilterPanel({ onSearch, onApply }: Props) {
    const t = useTranslations("explore");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        onSearch(value);
    };

    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type],
        );
    };

    const toggleRating = (rating: number) => {
        setSelectedRatings((prev) =>
            prev.includes(rating)
                ? prev.filter((r) => r !== rating)
                : [...prev, rating],
        );
    };

    const handleApply = () => {
        onApply({ search, types: selectedTypes, ratings: selectedRatings });
    };

    return (
        <>
            <button
                className={`${styles.toggleBtn} ${open ? styles.open : ""}`}
                onClick={() => setOpen((prev) => !prev)}
                aria-label={open ? t("close_filters") : t("open_filters")}
            >
                {open ? <X size={18} /> : <PanelRightOpen size={18} />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.aside
                        className={styles.panel}
                        initial={{ x: 320 }}
                        animate={{ x: 0 }}
                        exit={{ x: 320 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 250,
                        }}
                    >
                        <div className={styles.searchBox}>
                            <Search size={16} />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder={t("search_destinations")}
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className={styles.filters}>
                            <h4 className={styles.filterTitle}>{t("type")}</h4>
                            {TYPE_OPTIONS.map((type) => (
                                <label key={type} className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => toggleType(type)}
                                        className={styles.checkbox}
                                    />
                                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
                                </label>
                            ))}

                            <h4 className={styles.filterTitle}>{t("rating")}</h4>
                            {RATING_OPTIONS.map((r) => (
                                <label key={r} className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRatings.includes(r)}
                                        onChange={() => toggleRating(r)}
                                        className={styles.checkbox}
                                    />
                                    <span>{t("stars", { rating: r })}</span>
                                </label>
                            ))}
                        </div>

                        <button className={styles.applyBtn} onClick={handleApply}>
                            {t("apply_filters")}
                        </button>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
