export default function TimerDigital({ timeLeft, mode }) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const color = mode === 'focus'
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-green-600 dark:text-green-400';

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`text-8xl font-mono font-bold tracking-wider ${color}`}>
                {display}
            </div>
            <div className="mt-4 flex gap-1">
                {display.split('').map((char, i) => (
                    <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                            char !== ':' ? 'bg-blue-400 dark:bg-blue-600' : 'bg-transparent'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
