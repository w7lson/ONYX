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
            default:        return <TimerCircular {...props} />;
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
                {t('pomodoroPage.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t('pomodoroPage.subtitle')}</p>

            {/* Mode indicator / Presets */}
            {mode === 'focus' ? (
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {PRESETS.map((mins) => (
                        <button
                            key={mins}
                            onClick={() => handleSelectPreset(mins)}
                            className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                                selectedPreset === mins
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]'
                            }`}
                        >
                            {t('pomodoroPage.preset', { minutes: mins })}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex justify-center mb-8">
                    <span className="px-4 py-2 rounded-[10px] text-sm font-medium bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300">
                        {t('pomodoroPage.shortBreak')}
                    </span>
                </div>
            )}

            {/* Timer */}
            <div className="flex items-center justify-center mb-8 min-h-[280px]">
                {renderTimer()}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mb-6">
                <button
                    onClick={handleReset}
                    aria-label="Reset timer"
                    className="p-3 rounded-full bg-white/[0.06] text-slate-400 hover:bg-white/[0.10] hover:text-white transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
                <button
                    onClick={toggleRunning}
                    aria-label={isRunning ? 'Pause' : 'Start'}
                    className="p-4 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1)]"
                >
                    {isRunning ? <Pause size={28} /> : <Play size={28} />}
                </button>
                <button
                    onClick={toggleSettings}
                    aria-label="Settings"
                    className="p-3 rounded-full bg-white/[0.06] text-slate-400 hover:bg-white/[0.10] hover:text-white transition-colors"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Pomodoro count */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
                {t('pomodoroPage.pomodorosCompleted', { count: pomodoroCount })}
            </p>

            {/* Session label */}
            <div className="mb-8">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={t('pomodoroPage.sessionLabel')}
                    className="w-full px-4 py-2.5 rounded-[10px] border border-white/[0.08] bg-[#161A22] text-slate-800 dark:text-slate-100 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                />
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="bg-[#161A22] rounded-2xl border border-white/[0.06] p-5 mb-8 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('pomodoroPage.settings')}</h3>

                    {/* Design switcher */}
                    <div className="mb-5">
                        <label className="text-sm text-slate-600 dark:text-slate-400 mb-2 block">{t('pomodoroPage.timerDesign')}</label>
                        <div className="flex gap-2 flex-wrap">
                            {DESIGNS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setTimerDesign(d)}
                                    className={`px-3 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
                                        timerDesign === d
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]'
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
                            { key: 'focus',      label: t('pomodoroPage.focusDuration')      },
                            { key: 'shortBreak', label: t('pomodoroPage.shortBreakDuration') },
                        ].map(({ key, label: dLabel }) => (
                            <div key={key}>
                                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{dLabel}</label>
                                <input
                                    type="number"
                                    value={durations[key]}
                                    onChange={(e) => handleDurationChange(key, e.target.value)}
                                    min={1}
                                    max={120}
                                    className="w-full px-3 py-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Session History */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    {t('pomodoroPage.sessionHistory')}
                </h2>
                <SessionHistory sessions={sessions} />
            </div>
        </div>
    );
}
