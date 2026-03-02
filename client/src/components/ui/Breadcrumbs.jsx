import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs
 *
 * Props:
 *   items — [{ label: string, to?: string }]
 *           Last item is current page (no link).
 *   showHome — bool (prepends a home icon link to '/')
 */
export function Breadcrumbs({ items = [], showHome = false, className = '' }) {
    const all = showHome
        ? [{ label: 'Home', to: '/', icon: true }, ...items]
        : items;

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex items-center gap-1.5 flex-wrap">
                {all.map((item, i) => {
                    const isLast = i === all.length - 1;

                    return (
                        <li key={i} className="flex items-center gap-1.5">
                            {i > 0 && (
                                <ChevronRight
                                    size={14}
                                    className="text-slate-400 shrink-0"
                                    aria-hidden="true"
                                />
                            )}
                            {isLast ? (
                                <span
                                    aria-current="page"
                                    className="text-sm font-medium text-slate-900 dark:text-slate-100"
                                >
                                    {item.icon ? <Home size={14} /> : item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.to ?? '/'}
                                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {item.icon ? <Home size={14} /> : item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
