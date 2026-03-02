import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const config = {
    success: {
        icon: CheckCircle,
        bar: 'bg-success-500',
        iconClass: 'text-success-600 dark:text-success-400',
        bg: 'bg-success-50 dark:bg-success-900/20',
        border: 'border-success-200 dark:border-success-800',
        title: 'text-success-800 dark:text-success-300',
        text: 'text-success-700 dark:text-success-400',
    },
    warning: {
        icon: AlertTriangle,
        bar: 'bg-warning-500',
        iconClass: 'text-warning-600 dark:text-warning-400',
        bg: 'bg-warning-50 dark:bg-warning-900/20',
        border: 'border-warning-200 dark:border-warning-800',
        title: 'text-warning-800 dark:text-warning-300',
        text: 'text-warning-700 dark:text-warning-400',
    },
    error: {
        icon: XCircle,
        bar: 'bg-error-500',
        iconClass: 'text-error-600 dark:text-error-400',
        bg: 'bg-error-50 dark:bg-error-900/20',
        border: 'border-error-200 dark:border-error-800',
        title: 'text-error-800 dark:text-error-300',
        text: 'text-error-700 dark:text-error-400',
    },
    info: {
        icon: Info,
        bar: 'bg-info-500',
        iconClass: 'text-info-600 dark:text-info-400',
        bg: 'bg-info-50 dark:bg-info-900/20',
        border: 'border-info-200 dark:border-info-800',
        title: 'text-info-800 dark:text-info-300',
        text: 'text-info-700 dark:text-info-400',
    },
};

/**
 * Alert — inline contextual message
 *
 * Props:
 *   variant   — 'success' | 'warning' | 'error' | 'info'
 *   title     — string
 *   onClose   — () => void (shows × button)
 *   action    — ReactNode (optional CTA)
 */
export function Alert({
    variant = 'info',
    title,
    onClose,
    action,
    className = '',
    children,
}) {
    const c = config[variant] ?? config.info;
    const Icon = c.icon;

    return (
        <div
            role="alert"
            className={[
                'relative flex gap-3 p-4 rounded-xl border overflow-hidden',
                c.bg, c.border, className,
            ].join(' ')}
        >
            {/* Left accent bar */}
            <span className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar} rounded-l-xl`} />

            <Icon size={18} className={`shrink-0 mt-0.5 ${c.iconClass}`} />

            <div className="flex-1 min-w-0">
                {title && (
                    <p className={`text-sm font-semibold mb-0.5 ${c.title}`}>{title}</p>
                )}
                {children && (
                    <p className={`text-sm ${c.text}`}>{children}</p>
                )}
                {action && <div className="mt-2">{action}</div>}
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    aria-label="Dismiss"
                    className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors -mt-0.5"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}
