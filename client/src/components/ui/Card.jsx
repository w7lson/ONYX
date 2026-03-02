/**
 * Card — 4 variants
 *
 * Props:
 *   variant  — 'default' | 'interactive' | 'flat'
 *   padding  — 'none' | 'sm' | 'md' | 'lg'
 *   as       — HTML tag or component (default 'div')
 */
export function Card({
    variant = 'default',
    padding = 'md',
    as: Tag = 'div',
    className = '',
    children,
    ...props
}) {
    const base =
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-150';

    const variants = {
        default: 'shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]',
        interactive:
            'shadow-[0_1px_3px_0_rgb(0_0_0/0.07)] cursor-pointer ' +
            'hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08)] hover:-translate-y-0.5 ' +
            'hover:border-primary-200 dark:hover:border-primary-900 ' +
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
        flat: 'shadow-none',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
    };

    return (
        <Tag
            {...props}
            className={[
                base,
                variants[variant] ?? variants.default,
                paddings[padding] ?? paddings.md,
                className,
            ].join(' ')}
        >
            {children}
        </Tag>
    );
}
