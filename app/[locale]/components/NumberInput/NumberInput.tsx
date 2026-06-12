"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type NumberInputProps = {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    value?: number;
    onChange?: (value: number) => void;
};

export default function NumberInput({
    min = 0,
    max = 100,
    step = 1,
    defaultValue = 0,
    value: controlledValue,
    onChange,
}: NumberInputProps) {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(String(defaultValue));
    const displayValue = isControlled ? String(controlledValue) : internalValue;

    const updateValue = (val: string) => {
        if (isControlled) {
            onChange?.(Number(val || 0));
        } else {
            setInternalValue(val);
        }
    };

    const numericValue = Number(displayValue || 0);

    const increment = () => {
        const next = Math.min(numericValue + step, max);
        updateValue(String(next));
    };

    const decrement = () => {
        const next = Math.max(numericValue - step, min);
        updateValue(String(next));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === "") {
            updateValue("");
            return;
        }

        if (!/^\d+$/.test(val)) {
            return;
        }

        const num = Number(val);

        if (num > max) {
            updateValue(String(max));
            return;
        }

        updateValue(val);
    };

    const handleBlur = () => {
        if (displayValue === "") {
            updateValue(String(min));
        }
    };

    const handleFocus = () => {
        if (displayValue === "0") {
            updateValue("");
        }
    };

    return (
        <div className="flex items-center gap-3">
            {/* MINUS */}
            <button
                type="button"
                onClick={decrement}
                className="
          flex h-10 w-10 items-center justify-center
          rounded-full border border-[var(--border)]
          bg-[var(--background)] shadow-sm transition
          hover:bg-[var(--dim-bg)]
          active:scale-95
        "
            >
                <Minus className="h-[16px] w-[16px] text-[var(--foreground)]" />
            </button>

            {/* INPUT */}
            <input
                type="number"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className="
          w-20 rounded-xl border border-[var(--border)]
          bg-[var(--background)] py-2 text-center text-lg font-medium
          outline-none transition
          focus:border-[#eb662b]
        "
            />

            {/* PLUS */}
            <button
                type="button"
                onClick={increment}
                className="
          flex h-10 w-10 items-center justify-center
          rounded-full border border-[var(--border)]
          bg-[var(--background)] shadow-sm transition
          hover:bg-bg-[var(--dim-bg)]
          active:scale-95
        "
            >
                <Plus className="h-[16px] w-[16px]" />
            </button>
        </div>
    );
}
