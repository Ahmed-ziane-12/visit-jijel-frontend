import { useState, useCallback } from 'react';

interface UseConfirmDialogReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    return { isOpen, open, close };
}
