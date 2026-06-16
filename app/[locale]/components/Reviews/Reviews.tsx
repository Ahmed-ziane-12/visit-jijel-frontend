"use client";

import { useState } from "react";
import { MessageSquareText, PencilLine, Star, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Review } from "@/types/map";
import { useTranslations } from "next-intl";

interface ReviewsProps {
    reviews: Review[] | undefined;
    onSubmit: (rating: number, body: string) => Promise<void>;
}

export default function Reviews({ reviews, onSubmit }: ReviewsProps) {
    const t = useTranslations("reviews");
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [body, setBody] = useState("");

    const [loading, setLoading] = useState(false);

    const isLoading = reviews === undefined;
    const isEmpty = reviews?.length === 0;

    const handleSubmit = async () => {
        if (rating === 0 || loading) return;

        setLoading(true);

        try {
            await onSubmit(rating, body);

            setOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const sameYear = d.getFullYear() === now.getFullYear();

        return d.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: sameYear ? undefined : "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <MessageSquareText
                        size={20}
                        className="text-(--primary-clr)"
                    />
                    {t("title")}
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-3 px-3 py-3 rounded-md bg-black text-white text-sm cursor-pointer hover:opacity-80"
                >
                    <PencilLine size={16} />
                    {t("write_review")}
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1">
                {/* LOADING SKELETON */}
                {isLoading && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="border border-(--border) rounded-lg p-3 animate-pulse"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="w-32 h-3 bg-gray-200 rounded" />
                                        <div className="w-20 h-2 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="mt-3 w-full h-3 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                )}

                {/* EMPTY STATE */}
                {!isLoading && isEmpty && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                        <MessageSquareText size={40} />
                        <p className="text-lg font-medium">{t("no_reviews")}</p>
                    </div>
                )}

                {/* REVIEWS */}
                {!isLoading && !isEmpty && (
                    <div className="flex flex-col gap-4">
                        {reviews!.map((r) => (
                            <div
                                key={r.id}
                                className="flex flex-col gap-4 border border-(--border) bg-white rounded-lg p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* AVATAR */}
                                        <img
                                            src={
                                                r.user.profile?.media?.[0]
                                                    ?.secure_url ||
                                                "https://placehold.net/avatar.png"
                                            }
                                            className="w-10 h-10 rounded-full object-cover"
                                            alt={t("avatar_alt")}
                                        />

                                        <div>
                                            <p className="font-bold">
                                                {r.user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(r.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* STARS */}
                                    <div className="flex gap-1 text-yellow-500">
                                        {Array.from({ length: 5 }).map(
                                            (_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    fill={
                                                        i < r.rating
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>

                                {r.body && (
                                    <p className="text-[1rem] text-gray-600 ms-12">
                                        {r.body}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white w-[90%] max-w-md rounded-xl p-4 relative"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <button
                                onClick={() => setOpen(false)}
                                className="absolute top-3 right-3"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-lg font-semibold mb-3">
                                {t("modal_title")}
                            </h2>

                            {/* STARS */}
                            <div className="flex gap-1 mb-3">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const index = i + 1;
                                    return (
                                        <Star
                                            key={i}
                                            size={24}
                                            className="cursor-pointer"
                                            onMouseEnter={() => setHover(index)}
                                            onMouseLeave={() => setHover(0)}
                                            onClick={() => setRating(index)}
                                            fill={
                                                index <= (hover || rating)
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    );
                                })}
                            </div>

                            {/* TEXT */}
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder={t("placeholder")}
                                className="w-full border border-(--border) rounded-md p-2 text-sm h-24 resize-none"
                                disabled={loading}
                            />

                            {/* SUBMIT */}
                            <button
                                disabled={loading || rating === 0}
                                onClick={handleSubmit}
                                className="mt-3 w-full bg-black text-white py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            className="animate-spin"
                                            size={18}
                                        />
                                        {t("submitting")}
                                    </>
                                ) : (
                                    t("submit_btn")
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
