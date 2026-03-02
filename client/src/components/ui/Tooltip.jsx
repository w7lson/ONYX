import { useState } from 'react';

/**
 * Tooltip — hover text balloon
 *
 * Props:
 *   content   — string
 *   placement — 'top' | 'bottom' | 'left' | 'right'
 *   children  — trigger element
 */
export function Tooltip({ content, placement = 'top', children, className = '' }) {
    const [visible, setVisible] = useState(false);

    const placements = {
        top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left:   'right-full top-1/2 -translate-y-1/2 mr-2',
        right:  'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <span
            className={`relative inline-flex ${className}`}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            {visible && content && (
                <span
                    role="tooltip"
                    className={[
                        'absolute z-50 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap pointer-events-none',
                        'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-lg',
                        placements[placement] ?? placements.top,
                    ].join(' ')}
                >
                    {content}
                </span>
            )}
        </span>
    );
}
