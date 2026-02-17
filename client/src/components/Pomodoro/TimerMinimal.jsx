export default function TimerMinimal({ timeLeft, totalTime, mode }) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    const barColor = mode === 'focus' ? 'bg-blue-500' : 'bg-green-500';

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className="text-7xl font-light text-gray-800 dark:text-gray-100 font-mono tracking-widest">
                {display}
            </div>
            <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-8">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
