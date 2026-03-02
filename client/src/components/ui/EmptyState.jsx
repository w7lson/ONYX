import { Button } from './Button';

/**
 * EmptyState — centred placeholder for empty data
 *
 * Props:
 *   icon        — ReactNode (Lucide icon or SVG)
 *   title       — string
 *   description — string
 *   action      — { label, onClick, variant? }
 *   secondaryAction — { label, onClick }
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    secondaryAction,
    className = '',
}) {
    return (
        <div
            className={[
                'flex flex-col items-center justify-center text-center py-16 px-6 min-h-[240px]',
                className,
            ].join(' ')}
        >
            {icon && (
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                    {icon}
                </div>
            )}
            {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    {description}
                </p>
            )}
            {(action || secondaryAction) && (
                <div className="flex items-center gap-3 mt-6">
                    {secondaryAction && (
                        <Button variant="ghost" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </Button>
                    )}
                    {action && (
                        <Button
                            variant={action.variant ?? 'primary'}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
