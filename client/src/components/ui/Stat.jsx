import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Stat — metric card with icon, value, label, and optional trend
 *
 * Props:
 *   icon    — ReactNode
 *   value   — string | number
 *   label   — string
 *   trend   — number (positive = up, negative = down, 0 = flat)
 *   trendLabel — string (e.g. 'vs last week')
 *   color   — 'primary' | 'success' | 'warning' | 'error' | 'info'
 */
export function Stat({ icon, value, label, trend, trendLabel, color = 'primary', className = '' }) {
    const colors = {
        primary: { bg: 'bg-primary-50 dark:bg-primary-950', icon: 'text-primary-600 dark:text-primary-400' },
        success: { bg: 'bg-success-50 dark:bg-success-900/30', icon: 'text-success-600 dark:text-success-400' },
        warning: { bg: 'bg-warning-50 dark:bg-warning-900/30', icon: 'text-warning-600 dark:text-warning-400' },
        error:   { bg: 'bg-error-50 dark:bg-error-900/20', icon: 'text-error-600 dark:text-error-400' },
        info:    { bg: 'bg-info-50 dark:bg-info-900/30', icon: 'text-info-600 dark:text-info-400' },
    };

    const c = colors[color] ?? colors.primary;

    const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
    const trendColor =
        trend > 0 ? 'text-success-600 dark:text-success-400' :
        trend < 0 ? 'text-error-600 dark:text-error-400' :
        'text-slate-400';

    return (
        <div
            className={[
                'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5',
                'shadow-[0_1px_3px_0_rgb(0_0_0/0.07)] flex items-start gap-4',
                className,
            ].join(' ')}
        >
            {icon && (
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}
                >
                    {icon}
                </div>
            )}
            <div className="flex flex-col min-w-0">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {value}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {label}
                </span>
                {trend !== undefined && (
                    <span className={`flex items-center gap-1 text-xs mt-1.5 font-medium ${trendColor}`}>
                        <TrendIcon size={13} />
                        {Math.abs(trend)}%{trendLabel && <span className="text-slate-400 font-normal ml-0.5">{trendLabel}</span>}
                    </span>
                )}
            </div>
        </div>
    );
}
