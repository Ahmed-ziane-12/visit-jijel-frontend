"use client";

import { useState } from "react";
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
    const router = useRouter();
    const t = useTranslations("plan");

    const updatePlan = (partial: Partial<PlanState>) => {
        setPlan((prev) => ({ ...prev, ...partial }));
        setNextError(null);
    };

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
            router.push("/trip/1");
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
            nextLabel={t(activeStep.nextLabel)}
            canGoBack={currentStep > 0}
            isLastStep={isLastStep}
            onNext={goNext}
            onBack={goBack}
            nextDisabled={datesMissing}
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
        </QuizLayout>
    );
}
