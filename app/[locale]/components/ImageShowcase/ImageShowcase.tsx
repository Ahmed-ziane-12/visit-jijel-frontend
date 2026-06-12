"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageShowcaseProps {
    images: string[];
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
}

export default function ImageShowcase({
    images,
    initialIndex = 0,
    open,
    onClose,
}: ImageShowcaseProps) {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        setIndex(initialIndex);
    }, [initialIndex, open]);

    const goNext = useCallback(() => {
        setIndex((i) => Math.min(i + 1, images.length - 1));
    }, [images.length]);

    const goPrev = useCallback(() => {
        setIndex((i) => Math.max(i - 1, 0));
    }, []);

    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, goNext, goPrev]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open || images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-5000 flex items-center justify-center bg-black/90">
            <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-white/20"
            >
                <X size={22} />
            </button>

            <span className="absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                {index + 1} / {images.length}
            </span>

            {index > 0 && (
                <button
                    onClick={goPrev}
                    className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-white/20"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex h-full w-full items-center justify-center p-16"
                >
                    <Image
                        src={images[index]}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                        placeholder="blur"
                        blurDataURL={`${images[index]}?w=10&q=1`}
                    />
                </motion.div>
            </AnimatePresence>

            {index < images.length - 1 && (
                <button
                    onClick={goNext}
                    className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-white/20"
                >
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
}
