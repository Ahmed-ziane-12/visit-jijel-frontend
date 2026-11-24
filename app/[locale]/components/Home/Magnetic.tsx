"use client";

import { useRef } from "react";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from "framer-motion";

interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    /** How strongly the element follows the cursor (0–1). */
    strength?: number;
    /** Maximum offset in pixels. */
    max?: number;
}

/**
 * Wraps a button/link and gives it a subtle magnetic pull toward the cursor.
 * Disabled for touch devices (no mousemove) and reduced-motion users.
 */
export function Magnetic({
    children,
    className,
    strength = 0.22,
    max = 10,
}: MagneticProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const reduce = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 260, damping: 20, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 260, damping: 20, mass: 0.4 });

    return (
        <motion.span
            ref={ref}
            className={className}
            style={{ display: "inline-flex", x: springX, y: springY }}
            onMouseMove={(event) => {
                if (reduce || !ref.current) return;
                const rect = ref.current.getBoundingClientRect();
                const offsetX =
                    (event.clientX - (rect.left + rect.width / 2)) * strength;
                const offsetY =
                    (event.clientY - (rect.top + rect.height / 2)) * strength;
                x.set(Math.max(-max, Math.min(max, offsetX)));
                y.set(Math.max(-max, Math.min(max, offsetY)));
            }}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
        >
            {children}
        </motion.span>
    );
}
