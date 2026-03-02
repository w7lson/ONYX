/**
 * Badge — 6 semantic variants × 2 sizes
 *
 * Props:
 *   variant — 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
 *   size    — 'sm' | 'md'
 *   dot     — bool (shows a coloured dot before label)
 */
export function Badge({
    variant = 'default',
    size = 'sm',
    dot = false,
    className = '',
    children,
    ...props
}) {
    const base = 'inline-flex items-center gap-1.5 font-medium rounded-full leading-none';

    const variants = {
        default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
        success: 'bg-success-50 text-success-700 dark:bg-success-900/40 dark:text-success-400',
        warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/40 dark:text-warning-400',
        error:   'bg-error-50  text-error-700  dark:bg-error-900/30  dark:text-error-400',
        info:    'bg-info-50   text-info-700   dark:bg-info-900/40   dark:text-info-400',
    };

    const dotColors = {
        default: 'bg-slate-400',
        primary: 'bg-primary-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error:   'bg-error-500',
        info:    'bg-info-500',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            {...props}
            className={[
                base,
                variants[variant] ?? variants.default,
                sizes[size] ?? sizes.sm,
                className,
            ].join(' ')}
        >
            {dot && (
                <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] ?? dotColors.default}`}
                />
            )}
            {children}
        </span>
    );
}
