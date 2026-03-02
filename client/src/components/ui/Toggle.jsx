/**
 * Toggle (Switch)
 *
 * Props:
 *   label       — string
 *   description — string
 *   size        — 'sm' | 'md'
 */
export function Toggle({
    label,
    description,
    size = 'md',
    id,
    checked,
    className = '',
    ...props
}) {
    const inputId = id ?? (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const track = {
        sm: 'w-8 h-4',
        md: 'w-10 h-6',
    };
    const thumb = {
        sm: 'w-3 h-3 top-0.5 left-0.5 translate-x-0 peer-checked:translate-x-4',
        md: 'w-[18px] h-[18px] top-[3px] left-[3px] translate-x-0 peer-checked:translate-x-4',
    };

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex items-center gap-3 cursor-pointer ${className}`}
        >
            <span className="relative shrink-0">
                <input
                    type="checkbox"
                    id={inputId}
                    role="switch"
                    aria-checked={checked}
                    checked={checked}
                    className="peer sr-only"
                    {...props}
                />
                {/* Track */}
                <span
                    className={[
                        'block rounded-full transition-colors duration-200 border',
                        track[size] ?? track.md,
                        'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600',
                        'peer-checked:bg-primary-600 peer-checked:border-primary-600',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-600/30 peer-focus-visible:ring-offset-2',
                    ].join(' ')}
                />
                {/* Thumb */}
                <span
                    className={[
                        'absolute bg-white rounded-full shadow transition-transform duration-200',
                        thumb[size] ?? thumb.md,
                    ].join(' ')}
                />
            </span>
            {(label || description) && (
                <span className="flex flex-col gap-0.5">
                    {label && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {description}
                        </span>
                    )}
                </span>
            )}
        </label>
    );
}
