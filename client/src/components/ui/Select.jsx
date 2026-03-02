import { ChevronDown } from 'lucide-react';

/**
 * Select — native <select> with custom styling
 *
 * Props:
 *   label      — string
 *   helperText — string
 *   error      — string
 *   size       — 'sm' | 'md' | 'lg'
 */
export function Select({
    label,
    helperText,
    error,
    size = 'md',
    id,
    className = '',
    children,
    ...props
}) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizes = {
        sm: 'h-8  pl-3 pr-8 text-sm',
        md: 'h-10 pl-3 pr-9 text-[15px]',
        lg: 'h-12 pl-4 pr-10 text-base',
    };

    const base =
        'w-full rounded-[10px] border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
        'appearance-none transition-all duration-150 outline-none cursor-pointer ' +
        'focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ' +
        'disabled:opacity-50 disabled:cursor-not-allowed';

    const borderClass = error
        ? 'border-error-500'
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
            <div className="relative">
                <select
                    id={inputId}
                    aria-invalid={!!error}
                    className={[base, borderClass, sizes[size] ?? sizes.md].join(' ')}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
            </div>
            {(error || helperText) && (
                <p className={`text-xs ${error ? 'text-error-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {error ?? helperText}
                </p>
            )}
        </div>
    );
}
