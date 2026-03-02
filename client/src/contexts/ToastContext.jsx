import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/* ─── Context ─────────────────────────────────────────────────── */
const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
}

/* ─── Icons & colours per variant ─────────────────────────────── */
const config = {
    success: {
        icon: CheckCircle,
        bar: 'bg-success-500',
        iconClass: 'text-success-500',
        border: 'border-success-200 dark:border-success-800',
    },
    error: {
        icon: XCircle,
        bar: 'bg-error-500',
        iconClass: 'text-error-500',
        border: 'border-error-200 dark:border-error-800',
    },
    warning: {
        icon: AlertTriangle,
        bar: 'bg-warning-500',
        iconClass: 'text-warning-500',
        border: 'border-warning-200 dark:border-warning-800',
    },
    info: {
        icon: Info,
        bar: 'bg-info-500',
        iconClass: 'text-info-500',
        border: 'border-info-200 dark:border-info-800',
    },
};

/* ─── Individual Toast ─────────────────────────────────────────── */
function Toast({ id, variant = 'info', title, message, onRemove }) {
    const c = config[variant] ?? config.info;
    const Icon = c.icon;

    return (
        <div
            role={variant === 'error' ? 'alert' : 'status'}
            aria-live={variant === 'error' ? 'assertive' : 'polite'}
            className={[
                'toast-enter relative flex gap-3 w-80 max-w-full p-4 pr-3',
                'bg-[#1A1D24] border border-white/[0.08] rounded-2xl shadow-[0_10px_15px_-3px_rgb(0_0_0/0.4)]',
                'border overflow-hidden',
                c.border,
            ].join(' ')}
        >
            {/* Left accent */}
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar} rounded-l-2xl`} />

            <Icon size={18} className={`shrink-0 mt-0.5 ${c.iconClass}`} />

            <div className="flex-1 min-w-0">
                {title && (
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {title}
                    </p>
                )}
                {message && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {message}
                    </p>
                )}
            </div>

            <button
                onClick={() => onRemove(id)}
                aria-label="Dismiss notification"
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start"
            >
                <X size={15} />
            </button>
        </div>
    );
}

/* ─── Provider ─────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((variant, title, message, duration = 4000) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev.slice(-4), { id, variant, title, message }]);
        if (duration > 0) setTimeout(() => remove(id), duration);
        return id;
    }, [remove]);

    const api = {
        success: (title, message, dur) => toast('success', title, message, dur),
        error:   (title, message, dur) => toast('error',   title, message, dur),
        warning: (title, message, dur) => toast('warning', title, message, dur),
        info:    (title, message, dur) => toast('info',    title, message, dur),
        dismiss: remove,
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            {/* Toast stack */}
            <div
                aria-label="Notifications"
                className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
            >
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast {...t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
