import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import TimerCircular from '../components/Pomodoro/TimerCircular';
import TimerDigital from '../components/Pomodoro/TimerDigital';
import TimerMinimal from '../components/Pomodoro/TimerMinimal';
import SessionHistory from '../components/Pomodoro/SessionHistory';
import { usePomodoro, PRESETS } from '../contexts/PomodoroContext';

const DESIGNS = ['circular', 'digital', 'minimal'];

export default function Pomodoro() {
    const { getToken } = useAuth();
    const { t } = useTranslation();

    const {
        durations, mode, timeLeft, isRunning, pomodoroCount,
        timerDesign, label, showSettings, totalTime,
        selectedPreset, lastCompletedSession,
        setTimerDesign, setLabel, handleSelectPreset,
        handleReset, handleDurationChange,
        toggleRunning, toggleSettings,
    } = usePomodoro();

    const [sessions, setSessions] = useState([]);

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [getToken]);

    // Fetch session history on mount
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const config = await authHeaders();
                const res = await axios.get('/api/pomodoro/sessions', config);
                setSessions(res.data);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            }
        };
        fetchSessions();
    }, [authHeaders]);

    // Save completed session to API
    useEffect(() => {
        if (!lastCompletedSession) return;
        const saveSession = async () => {
            try {
                const config = await authHeaders();
                const res = await axios.post('/api/pomodoro/sessions', {
                    durationMin: lastCompletedSession.durationMin,
                    wasCompleted: true,
                    label: lastCompletedSession.label,
                }, config);
                setSessions(prev => [res.data, ...prev]);
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        };
        saveSession();
    }, [lastCompletedSession, authHeaders]);

    const renderTimer = () => {
        const props = { timeLeft, totalTime, mode };
        switch (timerDesign) {
            case 'digital': return <TimerDigital {...props} />;
            case 'minimal': return <TimerMinimal {...props} />;
            default: return <TimerCircular {...props} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {t('pomodoroPage.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('pomodoroPage.subtitle')}</p>

            {/* Duration Presets (focus mode) / Break indicator (break mode) */}
            {mode === 'focus' ? (
                <div className="flex justify-center gap-2 mb-8">
                    {PRESETS.map((mins) => (
                        <button
                            key={mins}
                            onClick={() => handleSelectPreset(mins)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedPreset === mins
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t('pomodoroPage.preset', { minutes: mins })}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex justify-center mb-8">
                    <span className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {t('pomodoroPage.shortBreak')}
                    </span>
                </div>
            )}

            {/* Timer Display */}
            <div className="relative flex items-center justify-center mb-8 min-h-[280px]">
                {renderTimer()}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mb-6">
                <button
                    onClick={handleReset}
                    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={toggleRunning}
                    className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg"
                >
                    {isRunning ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button
                    onClick={toggleSettings}
                    className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Pomodoro count */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('pomodoroPage.pomodorosCompleted', { count: pomodoroCount })}
            </p>

            {/* Session label */}
            <div className="max-w-md mx-auto mb-8">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={t('pomodoroPage.sessionLabel')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-8">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('pomodoroPage.settings')}</h3>

                    {/* Timer Design Switcher */}
                    <div className="mb-4">
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{t('pomodoroPage.timerDesign')}</label>
                        <div className="flex gap-2">
                            {DESIGNS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setTimerDesign(d)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        timerDesign === d
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {t(`pomodoroPage.${d}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Settings */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'focus', label: t('pomodoroPage.focusDuration') },
                            { key: 'shortBreak', label: t('pomodoroPage.shortBreakDuration') },
                        ].map(({ key, label: dLabel }) => (
                            <div key={key}>
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{dLabel}</label>
                                <input
                                    type="number"
                                    value={durations[key]}
                                    onChange={(e) => handleDurationChange(key, e.target.value)}
                                    min={1}
                                    max={120}
                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Session History */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    {t('pomodoroPage.sessionHistory')}
                </h2>
                <SessionHistory sessions={sessions} />
            </div>
        </div>
    );
}
