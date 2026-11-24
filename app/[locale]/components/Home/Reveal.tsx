"use client";

import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    /** Delay in seconds, useful for staggering siblings. */
    delay?: number;
    /** Vertical travel in pixels. */
    y?: number;
}

/**
 * Fade-and-slide-up wrapper used by every home page block.
 * Reduced-motion visitors get the final state instantly (duration 0).
 */
export function Reveal({ children, className, delay = 0, y = 26 }: RevealProps) {
    const reduce = useReducedMotion();

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{
                duration: reduce ? 0 : 0.7,
                delay: reduce ? 0 : delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
