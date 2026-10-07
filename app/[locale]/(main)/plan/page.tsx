"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuizLayout from "../../components/Quiz/QuizLayout";
import styles from "./plan.module.css";
import DatesAndTravelers from "../../components/Quiz/Steps/DatesAndTravelers";
import { useTranslations } from "next-intl";
import Vibe from "../../components/Quiz/Steps/Vibe";
import Budget from "../../components/Quiz/Steps/Budget";
import PreviewStep from "../../components/Quiz/Steps/PreviewStep";
import { PlanState } from "@/types/quiz";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { createTrip, TripPayload } from "@/lib/itinerary";
import ConfirmDialog from "@/app/[locale]/components/ConfirmDialog/ConfirmDialog";

const INITIAL_PLAN: PlanState = {
    dates: undefined,
    adults: 1,
    children: 0,
    vibes: [],
    budget: {
        budgetType: "standard",
        customBudget: 0,
        customBudgetType: "overall",
    },
    accommodation: "notBooked",
    preferences: [],
};

export default function PlanPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [plan, setPlan] = useState<PlanState>(INITIAL_PLAN);
    const [nextError, setNextError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const resumeRef = useRef(false);
    const router = useRouter();
    const t = useTranslations("plan");
    const { user, loading: authLoading } = useAuth();

    const updatePlan = (partial: Partial<PlanState>) => {
        setPlan((prev) => ({ ...prev, ...partial }));
        setNextError(null);
    };

    const toPayload = (planState: PlanState): TripPayload => {
        const from = planState.dates?.from as Date;
        const to = planState.dates?.to ?? from;

        return {
            start_date: format(from, "yyyy-MM-dd"),
            end_date: format(to, "yyyy-MM-dd"),
            adults: planState.adults,
            children: planState.children,
            vibes: planState.vibes,
            preferences: planState.preferences,
            accommodation: planState.accommodation,
            budget: {
                budgetType: planState.budget.budgetType,
                customBudget:
                    planState.budget.budgetType === "custom"
                        ? planState.budget.customBudget
                        : undefined,
                customBudgetType: planState.budget.customBudgetType,
            },
            status: "draft",
        };
    };

    const submitPlan = async (planState: PlanState): Promise<void> => {
        if (!planState.dates?.from) return;

        setSubmitting(true);
        setNextError(null);

        try {
            const trip = await createTrip(toPayload(planState));
            sessionStorage.removeItem("plan");
            sessionStorage.removeItem("pending_plan");
            router.push(`/trip/${trip.id}`);
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setNextError(error.response?.data?.message ?? t("create_error"));
            setSubmitting(false);
        }
    };

    // Resume after login: the plan was stashed in sessionStorage before redirecting.
    useEffect(() => {
        if (authLoading || resumeRef.current) return;

        const raw = sessionStorage.getItem("plan");
        const pending = sessionStorage.getItem("pending_plan");

        if (!raw || !pending) return;

        if (!user) {
            sessionStorage.removeItem("plan");
            sessionStorage.removeItem("pending_plan");
            return;
        }

        let planState: PlanState;
        try {
            planState = JSON.parse(raw) as PlanState;
        } catch {
            sessionStorage.removeItem("plan");
            sessionStorage.removeItem("pending_plan");
            return;
        }

        if (!planState.dates?.from) {
            sessionStorage.removeItem("plan");
            sessionStorage.removeItem("pending_plan");
            return;
        }

        resumeRef.current = true;
        // Deferred so the effect itself does not trigger a cascading render.
        const timer = window.setTimeout(() => {
            void submitPlan(planState);
        }, 0);
        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user]);

    const steps = [
        {
            id: 1,
            ind: "steps.dates.ind",
            title: "steps.dates.title",
            description: "steps.dates.description",
            nextLabel: "steps.dates.next",
        },
        {
            id: 2,
            ind: "steps.vibe.ind",
            title: "steps.vibe.title",
            description: "steps.vibe.description",
            nextLabel: "steps.vibe.next",
        },
        {
            id: 3,
            ind: "steps.budget.ind",
            title: "steps.budget.title",
            description: "steps.budget.description",
            nextLabel: "steps.budget.next",
        },
        {
            id: 4,
            ind: "steps.preview.ind",
            title: "steps.preview.title",
            description: "steps.preview.description",
            nextLabel: "steps.preview.next",
        },
    ] as const;

    const activeStep = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const datesMissing = isLastStep && !plan.dates?.from;

    const goNext = () => {
        if (isLastStep) {
            if (!plan.dates?.from) {
                setNextError(t("preview.dates_required"));
                return;
            }
            if (authLoading || submitting) return;

            if (!user) {
                // Keep the answers while the user signs in, then resume.
                sessionStorage.setItem("plan", JSON.stringify(plan));
                sessionStorage.setItem("pending_plan", "1");
                setLoginDialogOpen(true);
                return;
            }

            void submitPlan(plan);
            return;
        }
        if (currentStep >= steps.length - 1) return;
        setCurrentStep((prev) => prev + 1);
        setNextError(null);
    };

    const goBack = () => {
        if (currentStep <= 0) return;
        setCurrentStep((prev) => prev - 1);
        setNextError(null);
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <QuizLayout
            currentStep={t(activeStep.ind)}
            totalSteps={steps.length}
            title={t(activeStep.title)}
            description={t(activeStep.description)}
            progress={progress}
            nextLabel={submitting ? t("creating") : t(activeStep.nextLabel)}
            canGoBack={currentStep > 0}
            isLastStep={isLastStep}
            onNext={goNext}
            onBack={goBack}
            nextDisabled={datesMissing || submitting || authLoading}
            nextErrorMessage={nextError}
        >
            <div className={styles.stepContainer}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        {currentStep === 0 && (
                            <DatesAndTravelers
                                value={{
                                    dates: plan.dates,
                                    adults: plan.adults,
                                    children: plan.children,
                                }}
                                onChange={(val) =>
                                    updatePlan({
                                        dates: val.dates,
                                        adults: val.adults,
                                        children: val.children,
                                    })
                                }
                            />
                        )}
                        {currentStep === 1 && (
                            <Vibe
                                value={plan.vibes}
                                onChange={(vibes) => updatePlan({ vibes })}
                            />
                        )}
                        {currentStep === 2 && (
                            <Budget value={plan} onChange={setPlan} />
                        )}
                        {currentStep === 3 && (
                            <PreviewStep
                                data={plan}
                                datesMissing={!plan.dates?.from}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <ConfirmDialog
                open={loginDialogOpen}
                theme="info"
                title={t("login_required.title")}
                message={t("login_required.message")}
                confirmLabel={t("login_required.confirm")}
                onConfirm={() => {
                    setLoginDialogOpen(false);
                    router.push("/login?next=/plan");
                }}
                onCancel={() => {
                    setLoginDialogOpen(false);
                    sessionStorage.removeItem("plan");
                    sessionStorage.removeItem("pending_plan");
                }}
            />
        </QuizLayout>
    );
}
