/**
 * Avatar — image with initials fallback
 *
 * Props:
 *   src    — image URL
 *   name   — full name (used for initials & alt text)
 *   size   — 'xs'(24) | 'sm'(32) | 'md'(40) | 'lg'(56) | 'xl'(80)
 *   status — 'online' | 'offline' | null
 */
export function Avatar({ src, name = '', size = 'md', status, className = '' }) {
    const sizes = {
        xs: { px: 24, text: 'text-[10px]', dot: 'w-2 h-2' },
        sm: { px: 32, text: 'text-xs',     dot: 'w-2.5 h-2.5' },
        md: { px: 40, text: 'text-sm',     dot: 'w-3 h-3' },
        lg: { px: 56, text: 'text-base',   dot: 'w-3.5 h-3.5' },
        xl: { px: 80, text: 'text-xl',     dot: 'w-4 h-4' },
    };

    const s = sizes[size] ?? sizes.md;

    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');

    return (
        <span
            className={`relative inline-flex shrink-0 ${className}`}
            style={{ width: s.px, height: s.px }}
        >
            {src ? (
                <img
                    src={src}
                    alt={name || 'Avatar'}
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <span
                    className={[
                        'flex w-full h-full items-center justify-center rounded-full',
                        'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold',
                        s.text,
                    ].join(' ')}
                >
                    {initials || '?'}
                </span>
            )}
            {status && (
                <span
                    className={[
                        'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-slate-900',
                        s.dot,
                        status === 'online' ? 'bg-success-500' : 'bg-slate-400',
                    ].join(' ')}
                />
            )}
        </span>
    );
}
