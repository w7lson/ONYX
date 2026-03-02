/**
 * Input — text, email, password, number, search
 *
 * Props:
 *   label       — string
 *   helperText  — string (shown below)
 *   error       — string (replaces helperText with error style)
 *   leftIcon    — ReactNode (shown inside left edge)
 *   rightIcon   — ReactNode (shown inside right edge)
 *   size        — 'sm' | 'md' | 'lg'
 */
export function Input({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    size = 'md',
    id,
    className = '',
    ...props
}) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizes = {
        sm: 'h-8  px-3 text-sm',
        md: 'h-10 px-3 text-[15px]',
        lg: 'h-12 px-4 text-base',
    };

    const base =
        'w-full rounded-[10px] border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
        'placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
        'transition-all duration-150 outline-none ' +
        'focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ' +
        'disabled:opacity-50 disabled:cursor-not-allowed';

    const borderClass = error
        ? 'border-error-500 dark:border-error-500'
        : 'border-slate-200 dark:border-slate-700';

    const iconPad = leftIcon
        ? size === 'sm' ? 'pl-8' : 'pl-10'
        : '';

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        {leftIcon}
                    </span>
                )}
                <input
                    id={inputId}
                    aria-invalid={!!error}
                    aria-describedby={error || helperText ? `${inputId}-helper` : undefined}
                    className={[base, borderClass, sizes[size] ?? sizes.md, iconPad].join(' ')}
                    {...props}
                />
                {rightIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {rightIcon}
                    </span>
                )}
            </div>
            {(error || helperText) && (
                <p
                    id={`${inputId}-helper`}
                    className={`text-xs ${error ? 'text-error-500' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {error ?? helperText}
                </p>
            )}
        </div>
    );
}

/**
 * Textarea — multiline text input
 */
export function Textarea({
    label,
    helperText,
    error,
    id,
    rows = 4,
    className = '',
    ...props
}) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const base =
        'w-full rounded-[10px] border px-3 py-2.5 text-[15px] bg-white dark:bg-slate-800 ' +
        'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
        'transition-all duration-150 outline-none resize-y ' +
        'focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ' +
        'disabled:opacity-50 disabled:cursor-not-allowed';

    const borderClass = error
        ? 'border-error-500 dark:border-error-500'
        : 'border-slate-200 dark:border-slate-700';

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                rows={rows}
                aria-invalid={!!error}
                className={[base, borderClass].join(' ')}
                {...props}
            />
            {(error || helperText) && (
                <p className={`text-xs ${error ? 'text-error-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {error ?? helperText}
                </p>
            )}
        </div>
    );
}
