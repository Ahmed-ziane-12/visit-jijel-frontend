import { DateRange } from "react-day-picker";

export type VibeId = "beach" | "mountain" | "food" | "history";

export type CustomBudgetType = "daily" | "overall";

export type BudgetLevel = "budget" | "standard" | "luxury" | "custom";

export type Preference =
    | "beaches"
    | "history"
    | "nature"
    | "food"
    | "adventure"
    | "city";

export type PlanState = {
    dates: DateRange | undefined;
    adults: number;
    children: number;
    vibes: VibeId[];
    budget: {
        budgetType: BudgetLevel;
        customBudget: number;
        customBudgetType: CustomBudgetType;
    };
    accommodation: "booked" | "notBooked";
    preferences: Preference[];
};
