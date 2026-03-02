import { Check, Minus } from 'lucide-react';

/**
 * Checkbox
 *
 * Props:
 *   label         — string
 *   description   — string (sub-label)
 *   indeterminate — bool
 *   error         — string
 */
export function Checkbox({
    label,
    description,
    indeterminate = false,
    error,
    id,
    className = '',
    checked,
    ...props
}) {
    const inputId = id ?? (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isChecked = checked || indeterminate;

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex items-start gap-3 cursor-pointer group ${className}`}
        >
            <span className="relative mt-0.5 shrink-0">
                <input
                    type="checkbox"
                    id={inputId}
                    checked={checked}
                    aria-checked={indeterminate ? 'mixed' : checked}
                    className="sr-only"
                    {...props}
                />
                <span
                    className={[
                        'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-150',
                        isChecked
                            ? 'bg-primary-600 border-primary-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-primary-400',
                        error ? 'border-error-500' : '',
                    ].join(' ')}
                >
                    {indeterminate ? (
                        <Minus size={11} className="text-white stroke-[3]" />
                    ) : checked ? (
                        <Check size={11} className="text-white stroke-[3]" />
                    ) : null}
                </span>
                <span className="absolute -inset-1 rounded-lg group-focus-within:ring-2 group-focus-within:ring-primary-600/30 group-focus-within:ring-offset-1 pointer-events-none" />
            </span>
            {(label || description) && (
                <span className="flex flex-col gap-0.5">
                    {label && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {description}
                        </span>
                    )}
                    {error && (
                        <span className="text-xs text-error-500">{error}</span>
                    )}
                </span>
            )}
        </label>
    );
}
