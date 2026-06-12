'use client';

import { useEffect, useCallback } from 'react';
import styles from './ConfirmDialog.module.css';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export type DialogTheme = 'success' | 'warning' | 'info' | 'danger';

interface ConfirmDialogProps {
    open: boolean;
    theme: DialogTheme;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ICONS: Record<DialogTheme, string> = {
    success: '✓',
    warning: '⚠',
    info: 'ℹ',
    danger: '!',
};

export default function ConfirmDialog({
    open,
    theme,
    title,
    message,
    confirmLabel,
    cancelLabel,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const t = useTranslations("confirm_dialog");
    confirmLabel = confirmLabel ?? t("confirm");
    cancelLabel = cancelLabel ?? t("cancel");
    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onCancel();
        },
        [onCancel, loading],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
        <div
            className={styles.overlay}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) onCancel();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
        >
            <motion.div
                className={`${styles.dialog} ${styles[theme]}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
            >
                <div className={styles.stripe} />

                <div className={styles.body}>
                    <div className={styles.top}>
                        <div className={`${styles.icon} ${styles[`icon_${theme}`]}`}>
                            {ICONS[theme]}
                        </div>
                        <h2 id="dialog-title" className={styles.title}>
                            {title}
                        </h2>
                    </div>
                    <p id="dialog-message" className={styles.message}>
                        {message}
                    </p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={onCancel} disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button
                        className={`${styles.btnConfirm} ${styles[`btnConfirm_${theme}`]} ${loading ? styles.loading : ''}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? t("loading") : confirmLabel}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
