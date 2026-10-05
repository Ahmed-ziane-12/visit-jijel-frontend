"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type ChipInputProps = {
    id?: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    maxTags?: number;
    maxTagLength?: number;
    suggestions?: string[];
};

export default function ChipInput({
    id,
    value,
    onChange,
    placeholder,
    maxTags = 20,
    maxTagLength = 100,
    suggestions = [],
}: ChipInputProps) {
    const [draft, setDraft] = useState("");

    const add = (raw: string) => {
        const tag = raw.trim().replace(/\s+/g, " ");

        if (!tag) return;
        if (tag.length > maxTagLength) return;
        if (value.length >= maxTags) return;

        const exists = value.some(
            (item) => item.toLowerCase() === tag.toLowerCase(),
        );

        if (exists) {
            setDraft("");
            return;
        }

        onChange([...value, tag]);
        setDraft("");
    };

    const remove = (tag: string) => {
        onChange(value.filter((item) => item !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
            return;
        }

        if (e.key === "Backspace" && !draft && value.length > 0) {
            remove(value[value.length - 1]);
        }
    };

    const available = suggestions.filter(
        (item) =>
            !value.some((tag) => tag.toLowerCase() === item.toLowerCase()),
    );

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    id={id}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => add(draft)}
                    placeholder={placeholder}
                    disabled={value.length >= maxTags}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-(--border) bg-(--background) text-sm outline-none focus:border-(--primary-clr) transition-colors disabled:opacity-50"
                />

                <button
                    type="button"
                    onClick={() => add(draft)}
                    disabled={!draft.trim() || value.length >= maxTags}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-(--border) text-sm font-medium hover:border-(--primary-clr) hover:text-(--primary-clr) transition-all cursor-pointer disabled:opacity-40 disabled:hover:border-(--border) disabled:hover:text-inherit"
                >
                    <Plus size={16} />
                    {placeholder ? "" : "Add"}
                </button>
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--primary-clr)/10 text-(--primary-clr) text-xs font-medium"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => remove(tag)}
                                className="cursor-pointer hover:opacity-70"
                                aria-label={`Remove ${tag}`}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {available.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {available.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => add(item)}
                            disabled={value.length >= maxTags}
                            className="px-2.5 py-1 rounded-full border border-dashed border-(--border) text-xs text-(--light-fg) hover:border-(--primary-clr) hover:text-(--primary-clr) transition-all cursor-pointer disabled:opacity-40"
                        >
                            + {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}