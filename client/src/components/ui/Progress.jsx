/**
 * ProgressBar — linear progress
 *
 * Props:
 *   value    — 0–100
 *   size     — 'xs' | 'sm' | 'md' | 'lg'
 *   variant  — 'primary' | 'success' | 'warning' | 'error'
 *   label    — string (shown above right)
 *   showPct  — bool (shows % label)
 *   animated — bool (stripes animation, default false)
 */
export function ProgressBar({
    value = 0,
    size = 'sm',
    variant = 'primary',
    label,
    showPct = false,
    className = '',
}) {
    const clamped = Math.min(100, Math.max(0, value));

    const heights = {
        xs: 'h-1',
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const fills = {
        primary: 'bg-primary-600',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error:   'bg-error-500',
    };

    /* Semantic variant based on value when variant='auto' */
    const autoVariant =
        variant === 'auto'
            ? clamped >= 80 ? 'success'
            : clamped >= 50 ? 'primary'
            : clamped >= 25 ? 'warning'
            : 'error'
            : variant;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {(label || showPct) && (
                <div className="flex items-center justify-between">
                    {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
                    {showPct && <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{clamped}%</span>}
                </div>
            )}
            <div
                className={`w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${heights[size] ?? heights.sm}`}
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${fills[autoVariant] ?? fills.primary}`}
                    style={{ width: `${clamped}%` }}
                />
            </div>
        </div>
    );
}

/**
 * ProgressCircle — SVG circular progress
 *
 * Props:
 *   value   — 0–100
 *   size    — number (px, default 56)
 *   stroke  — number (stroke width, default 4)
 *   variant — 'primary' | 'success' | 'warning' | 'error'
 *   label   — string (shown in centre)
 */
export function ProgressCircle({
    value = 0,
    size = 56,
    stroke = 4,
    variant = 'primary',
    label,
    className = '',
}) {
    const clamped = Math.min(100, Math.max(0, value));
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (clamped / 100) * circ;

    const colors = {
        primary: '#0D9488',
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#F43F5E',
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-slate-100 dark:text-slate-800"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none"
                    stroke={colors[variant] ?? colors.primary}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            {label && (
                <span className="absolute text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                </span>
            )}
        </div>
    );
}
