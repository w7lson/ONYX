/**
 * Skeleton — shimmer placeholder shapes
 *
 * Usage:
 *   <Skeleton />                          — single text line
 *   <Skeleton variant="circle" size={40} />
 *   <Skeleton variant="card" />
 *   <Skeleton lines={3} />               — multiple text lines
 */
export function Skeleton({
    variant = 'text',
    lines = 1,
    size,
    width,
    height,
    className = '',
}) {
    const base = 'skeleton-shimmer rounded-lg';

    if (variant === 'circle') {
        const s = size ?? 40;
        return (
            <span
                aria-hidden="true"
                className={`${base} block rounded-full shrink-0 ${className}`}
                style={{ width: s, height: s }}
            />
        );
    }

    if (variant === 'card') {
        return (
            <div
                aria-hidden="true"
                className={`${base} rounded-2xl ${className}`}
                style={{ width: width ?? '100%', height: height ?? 120 }}
            />
        );
    }

    if (variant === 'stat') {
        return (
            <div aria-hidden="true" className={`flex gap-3 items-center ${className}`}>
                <Skeleton variant="circle" size={44} />
                <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton width="40%" height={20} />
                    <Skeleton width="60%" height={14} />
                </div>
            </div>
        );
    }

    /* text lines */
    const lineArray = Array.from({ length: lines });
    return (
        <div aria-busy="true" aria-label="Loading..." className={`flex flex-col gap-2 ${className}`}>
            {lineArray.map((_, i) => (
                <span
                    key={i}
                    className={`${base} block`}
                    style={{
                        width: width ?? (i === lineArray.length - 1 && lines > 1 ? '70%' : '100%'),
                        height: height ?? 16,
                    }}
                />
            ))}
        </div>
    );
}
