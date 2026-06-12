'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';
import styles from './DropDownMenu.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MenuItemVariant = 'default' | 'danger' | 'warning' | 'success';

export interface DropDownMenuItem {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: MenuItemVariant;
    disabled?: boolean;
}

export interface DropDownMenuSection {
    items: DropDownMenuItem[];
}

export interface DropDownMenuProps {
    /** The trigger element — anything clickable */
    trigger: ReactNode;

    /** Optional title shown at the top of the menu */
    title?: ReactNode;

    /** Optional bottom section rendered below the last divider */
    bottomSection?: ReactNode;

    /** Main menu sections (each section is separated by a divider) */
    sections: DropDownMenuSection[];

    /** Alignment of the menu relative to the trigger */
    align?: 'left' | 'right';

    /** Min-width of the menu panel in px (default: 200) */
    minWidth?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DropDownMenu({
    trigger,
    title,
    bottomSection,
    sections,
    align = 'right',
    minWidth = 200,
}: DropDownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    const handleItemClick = (cb: () => void, disabled?: boolean) => {
        if (disabled) return;
        cb();
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={styles.wrapper}>
            {/* Trigger */}
            <div
                className={styles.trigger}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                {trigger}
            </div>

            {/* Menu panel */}
            {isOpen && (
                <div className={`${styles.menu} ${styles[align]}`} style={{ minWidth }} role="menu">
                    {/* Optional title */}
                    {title && (
                        <>
                            <div className={styles.title}>{title}</div>
                            <div className={styles.divider} />
                        </>
                    )}

                    {/* Sections */}
                    {sections.map((section, si) => (
                        <div key={si}>
                            {si > 0 && <div className={styles.divider} />}
                            {section.items.map((item, ii) => (
                                <button
                                    key={ii}
                                    role="menuitem"
                                    disabled={item.disabled}
                                    className={[
                                        styles.item,
                                        styles[item.variant ?? 'default'],
                                        item.disabled ? styles.disabled : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={() => handleItemClick(item.onClick, item.disabled)}
                                >
                                    {item.icon && (
                                        <span className={styles.icon} aria-hidden="true">
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className={styles.label}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}

                    {/* Optional bottom section */}
                    {bottomSection && (
                        <>
                            <div className={styles.divider} />
                            <div className={styles.bottom}>{bottomSection}</div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
