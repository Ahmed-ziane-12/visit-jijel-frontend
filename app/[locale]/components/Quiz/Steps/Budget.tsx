import {
    House,
    Wallet,
    Waves,
    Landmark,
    Trees,
    UtensilsCrossed,
    Mountain,
    Building2,
    HandHeart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./budget.module.css";
import BudgetInput from "../../../components/BudgetInput/BudgetInput";
import { PlanState } from "@/types/quiz";

const Budget = ({
    value,
    onChange,
}: {
    value: PlanState;
    onChange: (data: PlanState) => void;
}) => {
    const t = useTranslations("quiz.budget");
    const budgetCards = [
        {
            key: "budget",
            title: t("budget_label"),
            description: t("budget_desc"),
        },
        {
            key: "standard",
            title: t("standard_label"),
            description: t("standard_desc"),
        },
        {
            key: "luxury",
            title: t("luxury_label"),
            description: t("luxury_desc"),
        },
    ] as const;

    const accomCards = [
        {
            key: "booked",
            title: t("accommodation_booked_label"),
            description: t("accommodation_booked_desc"),
        },
        {
            key: "notBooked",
            title: t("accommodation_need_label"),
            description: t("accommodation_need_desc"),
        },
    ] as const;

    const preferenceCards = [
        { key: "beaches", title: t("pref_beaches"), Icon: Waves },
        { key: "history", title: t("pref_history"), Icon: Landmark },
        { key: "nature", title: t("pref_nature"), Icon: Trees },
        { key: "city", title: t("pref_city"), Icon: Building2 },
        { key: "food", title: t("pref_food"), Icon: UtensilsCrossed },
        { key: "adventure", title: t("pref_adventure"), Icon: Mountain },
    ] as const;

    const updateBudget = (newBudget: Partial<PlanState["budget"]>) => {
        onChange({
            ...value,
            budget: {
                ...value.budget,
                ...newBudget,
            },
        });
    };

    const setAccommodation = (accommodation: "booked" | "notBooked") => {
        onChange({
            ...value,
            accommodation,
        });
    };

    const togglePreference = (pref: PlanState["preferences"][number]) => {
        const exists = value.preferences.includes(pref);

        onChange({
            ...value,
            preferences: exists
                ? value.preferences.filter((p) => p !== pref)
                : [...value.preferences, pref],
        });
    };

    return (
        <div className={styles.container}>
            {/* ---------------- BUDGET ---------------- */}
            <div className={styles.start}>
                <h1 className="flex items-center gap-4 text-[1.3rem] font-bold">
                    <Wallet className="text-[var(--primary-clr)]" />
                    {t("heading")}
                </h1>

                <div className={styles.cards}>
                    {budgetCards.map((card) => (
                        <div
                            key={card.key}
                            onClick={() =>
                                updateBudget({
                                    budgetType: card.key,
                                })
                            }
                            className={`${styles.card} ${
                                value.budget.budgetType === card.key
                                    ? styles.cardActive
                                    : ""
                            }`}
                        >
                            <h1>{card.title}</h1>
                            <p>{card.description}</p>
                        </div>
                    ))}

                    {/* Custom Budget */}
                    <div
                        onClick={() => updateBudget({ budgetType: "custom" })}
                        onFocus={() => updateBudget({ budgetType: "custom" })}
                        className={`${styles.card} ${
                            value.budget.budgetType === "custom"
                                ? styles.cardActive
                                : ""
                        }`}
                    >
                        <h1>{t("custom_budget")}</h1>
                        <p>{t("custom_budget_placeholder")}</p>

                        <BudgetInput
                            value={{
                                amount: value.budget.customBudget,
                                type: value.budget.customBudgetType,
                            }}
                            onChange={(val) =>
                                updateBudget({
                                    customBudget: val.amount,
                                    customBudgetType: val.type,
                                })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ---------------- ACCOMMODATION ---------------- */}
            <div className={styles.middle}>
                <h1 className="flex items-center gap-4 text-[1.3rem] font-bold">
                    <House className="text-[var(--primary-clr)]" />
                    {t("accommodation_heading")}
                </h1>

                <div className={styles.cards}>
                    {accomCards.map((card) => (
                        <div
                            key={card.key}
                            onClick={() => setAccommodation(card.key)}
                            className={`${styles.card} ${
                                value.accommodation === card.key
                                    ? styles.cardActive
                                    : ""
                            }`}
                        >
                            <h1>{card.title}</h1>
                            <p>{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ---------------- PREFERENCES ---------------- */}
            <div className={styles.end}>
                <h1 className="flex items-center justify-start gap-4 text-[1.3rem] font-bold">
                    <HandHeart className="text-[var(--primary-clr)]" />
                    {t("preferences_heading")}
                </h1>

                <div className={styles.cards}>
                    {preferenceCards.map(({ key, title, Icon }) => {
                        const isActive = value.preferences.includes(key);

                        return (
                            <div
                                key={key}
                                onClick={() => togglePreference(key)}
                                className={`${styles.card} flex cursor-pointer flex-col items-center justify-center gap-2 transition ${
                                    isActive ? styles.cardActive : ""
                                }`}
                            >
                                <Icon
                                    size={28}
                                    className={
                                        isActive
                                            ? "text-blue-600"
                                            : "text-zinc-600"
                                    }
                                />
                                <span className="text-sm font-medium">
                                    {title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Budget;
