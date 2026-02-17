import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const PomodoroContext = createContext();

const DEFAULT_DURATIONS = { focus: 30, shortBreak: 5 };
const PRESETS = [30, 45, 60];

export function PomodoroProvider({ children }) {
    const [durations, setDurations] = useState(DEFAULT_DURATIONS);
    const [selectedPreset, setSelectedPreset] = useState(30);
    const [mode, setMode] = useState('focus');
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [timerDesign, setTimerDesign] = useState('circular');
    const [label, setLabel] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [lastCompletedSession, setLastCompletedSession] = useState(null);

    const intervalRef = useRef(null);

    const totalTime = mode === 'focus'
        ? durations.focus * 60
        : durations.shortBreak * 60;

    // Timer tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft]);

    // Timer complete
    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            if (mode === 'focus') {
                // Signal session completion for API saving
                setLastCompletedSession({
                    durationMin: durations.focus,
                    label: label || null,
                    completedAt: Date.now(),
                });
                setPomodoroCount(prev => prev + 1);
                // Auto-start break
                setMode('shortBreak');
                setTimeLeft(durations.shortBreak * 60);
                setIsRunning(true);
            } else {
                // Break finished, back to focus (don't auto-start)
                setMode('focus');
                setTimeLeft(durations.focus * 60);
                setIsRunning(false);
            }
        }
    }, [timeLeft, isRunning, mode, durations, label]);

    const handleSelectPreset = useCallback((minutes) => {
        setSelectedPreset(minutes);
        setDurations(prev => ({ ...prev, focus: minutes }));
        if (mode === 'focus') {
            setTimeLeft(minutes * 60);
            setIsRunning(false);
        }
    }, [mode]);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        if (mode === 'focus') setTimeLeft(durations.focus * 60);
        else setTimeLeft(durations.shortBreak * 60);
    }, [mode, durations]);

    const handleDurationChange = useCallback((key, value) => {
        const num = Math.max(1, Math.min(120, parseInt(value) || 1));
        setDurations(prev => ({ ...prev, [key]: num }));
        if (!isRunning) {
            if (key === 'focus' && mode === 'focus') {
                setTimeLeft(num * 60);
            } else if (key === 'shortBreak' && mode === 'shortBreak') {
                setTimeLeft(num * 60);
            }
        }
    }, [mode, isRunning]);

    const toggleRunning = useCallback(() => {
        setIsRunning(prev => !prev);
    }, []);

    const toggleSettings = useCallback(() => {
        setShowSettings(prev => !prev);
    }, []);

    const value = {
        durations, mode, timeLeft, isRunning, pomodoroCount,
        timerDesign, label, showSettings, totalTime,
        selectedPreset, lastCompletedSession,
        setTimerDesign, setLabel, handleSelectPreset,
        handleReset, handleDurationChange,
        toggleRunning, toggleSettings,
    };

    return (
        <PomodoroContext.Provider value={value}>
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
}

export { PRESETS };
