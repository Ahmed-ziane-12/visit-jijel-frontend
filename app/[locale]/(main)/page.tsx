"use client";
import { ArrowRight, Zap, FileText, Smartphone } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "./page.module.css";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1] as const,
            delay: 0.1,
        },
    },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
};

export default function Home() {
    const t = useTranslations("home");
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const rotate1 = useTransform(scrollYProgress, [0, 1], [12, 35]);
    const rotate2 = useTransform(scrollYProgress, [0, 1], [-12, -35]);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className={`${styles.hero} relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8`}
            >
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="relative z-10 mx-auto max-w-3xl text-center"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="mb-6 inline-block rounded-full border border-accent/50 bg-accent/20 px-3 py-1"
                        >
                            <span className="text-sm font-medium text-accent">
                                {t("hero_badge")}
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="mb-6 text-balance text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl"
                        >
                            {t("hero_title")}
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-foreground/70 sm:text-xl"
                        >
                            {t("hero_desc")}
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
                        >
                            <button className="flex w-full items-center gap-2 rounded-lg bg-accent px-8 py-3 font-semibold text-white transition hover:opacity-90 sm:w-auto justify-center">
                                {t("hero_start")} <ArrowRight size={20} />
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-lg bg-muted px-8 py-3 font-semibold text-foreground transition hover:opacity-80 sm:w-auto justify-center">
                                {t("hero_demo")}
                            </button>
                        </motion.div>

                        <motion.p
                            variants={fadeUp}
                            className="text-sm text-foreground/60"
                        >
                            {t("hero_trust")}
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Problems Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                id="problems"
                className="bg-card/50 px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-7xl">
                    <motion.div variants={fadeUp} className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                            {t("problem_heading")}
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-foreground/70">
                            {t("problem_sub")}
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            {
                                icon: Zap,
                                title: t("problem1_title"),
                                desc: t("problem1_desc"),
                            },
                            {
                                icon: FileText,
                                title: t("problem2_title"),
                                desc: t("problem2_desc"),
                            },
                            {
                                icon: FileText,
                                title: t("problem3_title"),
                                desc: t("problem3_desc"),
                            },
                            {
                                icon: Zap,
                                title: t("problem4_title"),
                                desc: t("problem4_desc"),
                            },
                        ].map((p, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className="rounded-xl border border-border bg-background p-8 transition hover:border-accent/50"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                                    <p.icon className="text-accent" size={24} />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-foreground">
                                    {p.title}
                                </h3>
                                <p className="text-foreground/70">{p.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Solution Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                id="solution"
                className="px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-7xl">
                    <motion.div variants={fadeUp} className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                            {t("solution_heading")}
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-foreground/70">
                            {t("solution_sub")}
                        </p>
                    </motion.div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                step: "1",
                                title: t("solution1"),
                                desc: t("solution1_desc"),
                            },
                            {
                                step: "2",
                                title: t("solution2"),
                                desc: t("solution2_desc"),
                            },
                            {
                                step: "3",
                                title: t("solution3"),
                                desc: t("solution3_desc"),
                            },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className="relative"
                            >
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-accent/20">
                                    <span className="text-lg font-bold text-accent">
                                        {s.step}
                                    </span>
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-foreground">
                                    {s.title}
                                </h3>
                                <p className="text-foreground/70">{s.desc}</p>
                                {i < 2 && (
                                    <div className="absolute top-20 -right-4 hidden h-1 w-8 bg-accent/30 md:block" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div variants={fadeUp} className="mt-16 text-center">
                        <button className="mx-auto flex items-center gap-2 rounded-lg bg-accent px-8 py-3 font-semibold text-white transition hover:opacity-90">
                            {t("solution_cta")} <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </motion.section>

            {/* Preview Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                id="preview"
                className="bg-card/50 px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="flex justify-between items-center mx-auto max-w-7xl">
                    <motion.div variants={fadeUp} className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                            {t("preview_heading")}
                        </h2>
                        <p className="text-lg text-foreground/70">
                            {t("preview_sub")}
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} className="overflow-hidden ">
                        <div className="flex items-center justify-center">
                            <Image
                                src="/iten.svg"
                                alt="Sample Itinerary Preview"
                                width={800}
                                height={450}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        {/* <motion.p
                            variants={fadeUp}
                            className="mt-8 text-center text-foreground/70"
                        >
                            {t("preview_caption")}
                        </motion.p> */}
                    </motion.div>
                </div>
            </motion.section>

            {/* Mobile App Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                id="mobile"
                className="px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        variants={fadeUp}
                        className="rounded-2xl border border-accent/30 bg-linear-to-r from-accent/20 to-accent/10 p-12 text-center md:p-16"
                    >
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-accent/30">
                            <Smartphone className="text-accent" size={32} />
                        </div>

                        <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                            {t("mobile_title")}
                        </h2>

                        <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/70">
                            {t("mobile_desc")}
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button className="rounded-lg bg-accent px-8 py-3 font-semibold text-white transition hover:opacity-90">
                                {t("mobile_notify")}
                            </button>
                            <button className="rounded-lg bg-muted px-8 py-3 font-semibold text-foreground transition hover:opacity-80">
                                {t("mobile_learn")}
                            </button>
                        </div>

                        <p className="mt-6 text-sm text-foreground/60">
                            {t("mobile_stats")}
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Final CTA Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
                className="bg-card/50 px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-4xl text-center">
                    <motion.h2
                        variants={fadeUp}
                        className="mb-6 text-balance text-4xl font-bold text-foreground sm:text-5xl"
                    >
                        {t("cta_title")}
                    </motion.h2>

                    <motion.p
                        variants={fadeUp}
                        className="mx-auto mb-8 max-w-2xl text-lg text-foreground/70"
                    >
                        {t("cta_desc")}
                    </motion.p>

                    <motion.button
                        variants={fadeUp}
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-10 py-4 text-lg font-semibold text-white transition hover:opacity-90"
                    >
                        {t("cta_btn")} <ArrowRight size={24} />
                    </motion.button>

                    <motion.p
                        variants={fadeUp}
                        className="mt-6 text-sm text-foreground/60"
                    >
                        {t("cta_footnote")}
                    </motion.p>
                </div>
            </motion.section>
        </div>
    );
}
