import { format } from "date-fns";
import {
    Calendar,
    Users,
    Sparkles,
    Wallet,
    House,
    Heart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { PlanState } from "@/types/quiz";
import styles from "./preview.module.css";

const PreviewStep = ({ data }: { data: PlanState }) => {
    const t = useTranslations("quiz.preview");
    const tv = useTranslations("quiz.vibe");
    const tb = useTranslations("quiz.budget");

    const VIBE_LABELS: Record<string, string> = {
        beach: tv("beach_title"),
        mountain: tv("mountain_title"),
        food: tv("food_title"),
        history: tv("history_title"),
    };

    const PREFERENCE_LABELS: Record<string, string> = {
        beaches: tb("pref_beaches"),
        history: tb("pref_history"),
        nature: tb("pref_nature"),
        food: tb("pref_food"),
        adventure: tb("pref_adventure"),
        city: tb("pref_city"),
    };

    const BUDGET_LABELS: Record<string, string> = {
        budget: tb("budget_label"),
        standard: tb("standard_label"),
        luxury: tb("luxury_label"),
        custom: tb("custom_budget"),
    };
    return (
        <div className={styles.container}>
            {/* Dates & Travelers */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{t("dates_title")}</h2>
                <div className={styles.row}>
                    <Calendar className={styles.rowIcon} />
                    <span className={styles.rowLabel}>{t("dates_label")}</span>
                    {data.dates?.from ? (
                        <span>
                            {format(data.dates.from, "MMM d, yyyy")}
                            {data.dates.to &&
                                ` — ${format(data.dates.to, "MMM d, yyyy")}`}
                        </span>
                    ) : (
                        <span className={styles.empty}>{t("not_set")}</span>
                    )}
                </div>
                <div className={styles.row}>
                    <Users className={styles.rowIcon} />
                    <span className={styles.rowLabel}>{t("travelers_label")}</span>
                    <span>
                        {data.adults} adult{data.adults !== 1 ? "s" : ""}
                        {data.children > 0 &&
                            `, ${data.children} child${data.children !== 1 ? "ren" : ""}`}
                    </span>
                </div>
            </div>

            {/* Vibe */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{t("vibe_title")}</h2>
                <div className={styles.row}>
                    <Sparkles className={styles.rowIcon} />
                    <span className={styles.rowLabel}>{t("interests_label")}</span>
                    {data.vibes.length > 0 ? (
                        <div className={styles.chips}>
                            {data.vibes.map((v) => (
                                <span key={v} className={styles.chip}>
                                    {VIBE_LABELS[v] ?? v}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.empty}>{t("none_selected")}</span>
                    )}
                </div>
            </div>

            {/* Budget & Preferences */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>{t("budget_title")}</h2>
                <div className={styles.row}>
                    <Wallet className={styles.rowIcon} />
                    <span className={styles.rowLabel}>{t("budget_label")}</span>
                    <span>
                        {BUDGET_LABELS[data.budget.budgetType] ??
                            data.budget.budgetType}
                        {data.budget.budgetType === "custom" &&
                            ` — DZD ${data.budget.customBudget}/${data.budget.customBudgetType}`}
                    </span>
                </div>
                <div className={styles.row}>
                    <House className={styles.rowIcon} />
                    <span className={styles.rowLabel}>{t("accommodation_label")}</span>
                    <span>
                        {data.accommodation === "booked"
                            ? t("accommodation_booked")
                            : t("accommodation_need")}
                    </span>
                </div>
                <div className={styles.row}>
                    <Heart className={styles.rowIcon} />
                    <span className={styles.rowLabel}>{t("preferences_label")}</span>
                    {data.preferences.length > 0 ? (
                        <div className={styles.chips}>
                            {data.preferences.map((p) => (
                                <span key={p} className={styles.chip}>
                                    {PREFERENCE_LABELS[p] ?? p}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className={styles.empty}>{t("none_selected")}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewStep;
