/**
 * Radio / RadioGroup
 *
 * Usage:
 *   <RadioGroup label="Speed" value={val} onChange={setVal} options={[...]} />
 *   Or use individual <Radio> elements.
 */
export function Radio({ label, description, id, className = '', ...props }) {
    const inputId = id ?? (label ? `radio-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex items-start gap-3 cursor-pointer group ${className}`}
        >
            <span className="relative mt-0.5 shrink-0">
                <input
                    type="radio"
                    id={inputId}
                    className="peer sr-only"
                    {...props}
                />
                {/* Outer ring */}
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-slate-300 dark:border-slate-600 transition-all duration-150 peer-checked:border-primary-600 group-hover:border-primary-400 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-600/30 peer-focus-visible:ring-offset-1">
                    {/* Inner dot */}
                    <span className="w-2 h-2 rounded-full bg-primary-600 scale-0 transition-transform duration-150 peer-checked:scale-100 hidden peer-checked:block" />
                </span>
                {/* Dot (sibling trick doesn't work in JSX, so use ::after via className) */}
                <style>{`
                  input[type="radio"]:checked ~ span > span { display: block; transform: scale(1); }
                `}</style>
            </span>
            {(label || description) && (
                <span className="flex flex-col gap-0.5">
                    {label && (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {description}
                        </span>
                    )}
                </span>
            )}
        </label>
    );
}

/**
 * RadioGroup — wraps a list of radio options
 *
 * Props:
 *   label   — string
 *   options — [{ value, label, description? }]
 *   value   — current value
 *   onChange — (value) => void
 */
export function RadioGroup({ label, options = [], value, onChange, name, className = '' }) {
    const groupName = name ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : 'radio-group');

    return (
        <fieldset className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {label}
                </legend>
            )}
            {options.map((opt) => (
                <Radio
                    key={opt.value}
                    name={groupName}
                    label={opt.label}
                    description={opt.description}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={() => onChange?.(opt.value)}
                />
            ))}
        </fieldset>
    );
}
