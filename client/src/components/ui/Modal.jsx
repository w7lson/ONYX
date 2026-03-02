import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal / Dialog
 *
 * Props:
 *   open      — bool
 *   onClose   — () => void
 *   title     — string
 *   size      — 'sm' | 'md' | 'lg' | 'xl'
 *   hideClose — bool (hides the × button)
 *   footer    — ReactNode (replaces default footer area)
 */
export function Modal({
    open,
    onClose,
    title,
    size = 'md',
    hideClose = false,
    footer,
    children,
    className = '',
}) {
    const panelRef = useRef(null);

    /* Escape key */
    useEffect(() => {
        if (!open) return;
        const handler = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    /* Focus trap */
    useEffect(() => {
        if (!open) return;
        const prev = document.activeElement;
        panelRef.current?.focus();
        return () => prev?.focus();
    }, [open]);

    /* Scroll lock */
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                tabIndex={-1}
                className={[
                    'relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_25px_-5px_rgb(0_0_0/0.15),0_8px_10px_-6px_rgb(0_0_0/0.1)]',
                    'border border-slate-200 dark:border-slate-800',
                    'flex flex-col max-h-[90vh] outline-none',
                    sizes[size] ?? sizes.md,
                    className,
                ].join(' ')}
            >
                {/* Header */}
                {(title || !hideClose) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                        {title && (
                            <h2
                                id="modal-title"
                                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                            >
                                {title}
                            </h2>
                        )}
                        {!hideClose && (
                            <button
                                onClick={onClose}
                                aria-label="Close dialog"
                                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
