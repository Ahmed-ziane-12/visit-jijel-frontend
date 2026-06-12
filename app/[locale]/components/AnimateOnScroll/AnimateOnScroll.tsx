'use client';

import { motion, Variants } from 'framer-motion';

type AnimationVariant = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'fade';

interface AnimateOnScrollProps {
    children: React.ReactNode;
    variant?: AnimationVariant;
    delay?: number;
    duration?: number;
    className?: string;
}

const variants: Record<AnimationVariant, Variants> = {
    fadeUp: {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    },
    fadeDown: {
        hidden: { opacity: 0, y: -40 },
        visible: { opacity: 1, y: 0 },
    },
    fadeLeft: {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0 },
    },
    fadeRight: {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0 },
    },
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
};

const AnimateOnScroll = ({
    children,
    variant = 'fadeUp',
    delay = 0,
    duration = 0.5,
    className,
}: AnimateOnScrollProps) => {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration, delay, ease: 'easeOut' }}
            variants={variants[variant]}
        >
            {children}
        </motion.div>
    );
};

export default AnimateOnScroll;
