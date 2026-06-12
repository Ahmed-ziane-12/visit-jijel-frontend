"use client";
import { useLocale } from "next-intl";
import { DropDownMenu } from "../DropDownMenu/DropDownMenu";
import { useRouter, usePathname } from "@/lib/navigation";
import { ChevronDown } from "lucide-react";

const languages = [
    {
        code: "en",
        label: "English",
        flag: "https://flagcdn.com/w20/gb.png",
    },
    {
        code: "fr",
        label: "Français",
        flag: "https://flagcdn.com/w20/fr.png",
    },
    {
        code: "ar",
        label: "العربية",
        flag: "https://flagcdn.com/w20/dz.png",
    },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

export function LanguageDropdown() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const current = locale as LanguageCode;

    const selected = languages.find((l) => l.code === current)!;

    return (
        <DropDownMenu
            align="right"
            minWidth={160}
            trigger={
                <button
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "0.5rem 1rem",
                        borderRadius: "12px",
                        border: "0.5px solid var(--border)",
                        background: "transparent",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    <span>
                        <img
                            src={selected.flag}
                            alt={selected.code}
                            width={20}
                            height={20}
                        />
                    </span>
                    <span>{selected.label}</span>
                    <ChevronDown
                        size={16}
                        color="#71717a"
                        className="self-end"
                    />
                </button>
            }
            sections={[
                {
                    items: languages.map((lang) => ({
                        icon: (
                            <img
                                src={lang.flag}
                                alt={lang.code}
                                width={20}
                                height={20}
                            />
                        ),
                        label: lang.label,
                        variant: current === lang.code ? "warning" : "default",
                        onClick: () => {
                            router.replace(pathname, { locale: lang.code });
                        },
                    })),
                },
            ]}
        />
    );
}
