export default function TimerCircular({ timeLeft, totalTime, mode }) {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const offset = circumference * (1 - progress);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const strokeColor = mode === 'focus' ? '#2563eb' : '#22c55e';

    return (
        <div className="flex items-center justify-center">
            <svg width="280" height="280" className="transform -rotate-90">
                <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-200 dark:text-gray-800"
                />
                <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
            </svg>
            <span className="absolute text-5xl font-bold text-gray-800 dark:text-gray-100 font-mono">
                {display}
            </span>
        </div>
    );
}
