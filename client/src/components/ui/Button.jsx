import { Spinner } from './Spinner';

const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-all duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ' +
    'active:scale-[0.98] select-none';

const variants = {
    primary:
        'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700',
    secondary:
        'border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 ' +
        'dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950',
    ghost:
        'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
    danger:
        'bg-error-500 text-white hover:bg-error-600',
    'danger-ghost':
        'border border-error-500 text-error-500 bg-transparent hover:bg-error-50 ' +
        'dark:border-error-500 dark:text-error-500 dark:hover:bg-error-900/20',
    link:
        'text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 p-0 h-auto',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-[15px] h-[38px]',
    lg: 'px-6 py-3 text-base h-[46px]',
};

/**
 * Button — 6 variants × 3 sizes
 *
 * Props:
 *   variant  — 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'link'
 *   size     — 'sm' | 'md' | 'lg'
 *   loading  — bool (shows spinner, disables interaction)
 *   leftIcon — ReactNode
 *   rightIcon — ReactNode
 */
export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-busy={loading || undefined}
            className={[
                base,
                variants[variant] ?? variants.primary,
                variant !== 'link' ? (sizes[size] ?? sizes.md) : '',
                isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
                className,
            ].join(' ')}
        >
            {loading ? (
                <Spinner size={size === 'sm' ? 14 : 16} className="shrink-0" />
            ) : (
                leftIcon && <span className="shrink-0">{leftIcon}</span>
            )}
            {children}
            {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </button>
    );
}
