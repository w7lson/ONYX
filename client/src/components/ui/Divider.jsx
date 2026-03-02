/**
 * Divider — horizontal or vertical separator
 *
 * Props:
 *   orientation — 'horizontal' | 'vertical'
 *   label       — string (shown centred on horizontal divider)
 */
export function Divider({ orientation = 'horizontal', label, className = '' }) {
    if (orientation === 'vertical') {
        return (
            <span
                role="separator"
                aria-orientation="vertical"
                className={`w-px self-stretch bg-slate-200 dark:bg-slate-800 ${className}`}
            />
        );
    }

    if (label) {
        return (
            <div
                role="separator"
                className={`flex items-center gap-3 ${className}`}
            >
                <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                    {label}
                </span>
                <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
        );
    }

    return (
        <hr
            role="separator"
            className={`border-none h-px bg-slate-200 dark:bg-slate-800 ${className}`}
        />
    );
}
