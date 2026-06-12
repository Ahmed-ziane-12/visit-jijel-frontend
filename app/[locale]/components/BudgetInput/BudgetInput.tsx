"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

type BudgetType = "daily" | "overall";

type BudgetValue = {
    amount: number;
    type: BudgetType;
};

type BudgetInputProps = {
    value: BudgetValue;
    onChange: (value: BudgetValue) => void;
};

export default function BudgetInput({ value, onChange }: BudgetInputProps) {
    const commonT = useTranslations("common");
    const [open, setOpen] = useState(false);
    const [inputText, setInputText] = useState(
        value.amount > 0 ? String(value.amount) : "",
    );

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setInputText(raw);

        const amount = Number(raw);
        if (raw !== "") {
            onChange({
                ...value,
                amount: isNaN(amount) ? 0 : amount,
            });
        }
    };

    useEffect(() => {
        if (value.amount > 0) {
            setInputText(String(value.amount));
        }
    }, [value.amount]);

    const handleTypeChange = (type: BudgetType) => {
        onChange({
            ...value,
            type,
        });

        setOpen(false);
    };

    return (
        <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-sm">
                {/* Amount Input */}
                <div className="flex flex-1 items-center px-4">
                    <span className="mr-2 text-sm font-medium text-[var(--light-fg)]">
                        DZD
                    </span>

                    <input
                        type="number"
                        min={0}
                        value={inputText}
                        onChange={handleAmountChange}
                        placeholder={commonT("search")}
                        className="w-full bg-transparent py-3 outline-none"
                    />
                </div>

                {/* Dropdown */}
                <div className="relative border-l  border-[var(--border)]">
                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        className="flex h-full items-center gap-2 px-4 rounded-2xl text-sm font-medium capitalize transition hover:bg-[var(--dim-bg)]"
                    >
                        {value.type}
                        <ChevronDown size={16} />
                    </button>

                    {open && (
                        <div className="absolute right-0 top-full z-10 mt-2 w-36 overflow-hidden rounded-xl border border-[var(--dim-bg)] bg-[var(--border)] shadow-lg">
                            {(["daily", "overall"] as BudgetType[]).map(
                                (type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeChange(type)}
                                        className={`w-full px-4 py-3 text-left text-sm capitalize transition cursor-pointer hover:bg-[var(--light-primary)] ${
                                            value.type === type
                                                ? "bg-[var(--lighter-primary)] text-[var(--primary-clr)] font-semibold"
                                                : ""
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
