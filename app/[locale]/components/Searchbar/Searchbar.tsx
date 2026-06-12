"use client";

import { useState } from "react";
import styles from "./Searchbar.module.css";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export function SearchBar({
    placeholder,
    onSearch,
}: SearchBarProps) {
    const t = useTranslations("common");
    const navbarT = useTranslations("navbar");
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSearch?.(query);
        }
    };

    const handleClear = () => {
        setQuery("");
        onSearch?.("");
    };

    return (
        <div
            className={`${styles.searchContainer} ${
                isFocused ? styles.focused : ""
            }`}
        >
            <Search className="h-4 w-4 text-(--light-fg)" />

            <input
                type="text"
                className={styles.searchInput}
                placeholder={placeholder || navbarT("search")}
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                aria-label={t("search")}
            />

            {query && (
                <button
                    className={styles.clearButton}
                    onClick={handleClear}
                    aria-label={t("clear_search")}
                    type="button"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
}
