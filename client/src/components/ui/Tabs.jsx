/**
 * Tabs — tab bar + panel
 *
 * Usage:
 *   <Tabs tabs={[{ id, label, icon? }]} active={id} onChange={setId} />
 *
 * Props:
 *   tabs     — [{ id: string, label: string, icon?: ReactNode, badge?: string|number }]
 *   active   — string (active tab id)
 *   onChange — (id) => void
 *   variant  — 'underline' | 'pill'
 *   size     — 'sm' | 'md'
 */
export function Tabs({
    tabs = [],
    active,
    onChange,
    variant = 'underline',
    size = 'md',
    className = '',
}) {
    const sizes = {
        sm: 'text-sm px-3 py-2',
        md: 'text-[15px] px-4 py-2.5',
    };

    if (variant === 'pill') {
        return (
            <div
                role="tablist"
                className={[
                    'inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl',
                    className,
                ].join(' ')}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active === tab.id}
                        onClick={() => onChange?.(tab.id)}
                        className={[
                            'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150',
                            sizes[size] ?? sizes.md,
                            active === tab.id
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                        ].join(' ')}
                    >
                        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className="ml-0.5 min-w-[18px] h-[18px] px-1 text-[11px] font-semibold rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        );
    }

    /* underline variant */
    return (
        <div
            role="tablist"
            className={[
                'flex items-center border-b border-slate-200 dark:border-slate-800 gap-1',
                className,
            ].join(' ')}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active === tab.id}
                    onClick={() => onChange?.(tab.id)}
                    className={[
                        'inline-flex items-center gap-2 font-medium transition-all duration-150 border-b-2 -mb-px',
                        sizes[size] ?? sizes.md,
                        active === tab.id
                            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600',
                    ].join(' ')}
                >
                    {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                    {tab.label}
                    {tab.badge !== undefined && (
                        <span className={[
                            'ml-0.5 min-w-[18px] h-[18px] px-1 text-[11px] font-semibold rounded-full flex items-center justify-center',
                            active === tab.id
                                ? 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                        ].join(' ')}>
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
