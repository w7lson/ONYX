import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Zap, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitCreateModal({ onClose, onCreate, goals = [] }) {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);
    const [selectedGoalId, setSelectedGoalId] = useState('');

    const toggleDay = (day) => {
        setDaysOfWeek(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = () => {
        if (!title.trim()) return;
        onCreate({
            title: title.trim(),
            frequency,
            daysOfWeek: frequency === 'custom' ? daysOfWeek : undefined,
            goalId: selectedGoalId || undefined,
        });
    };

    const freqOptions = [
        { key: 'daily', label: t('habits.daily') },
        { key: 'weekly', label: t('habits.weekly') },
        { key: 'custom', label: t('habits.custom') },
    ];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    className="relative w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Glow */}
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary-500/20 via-transparent to-transparent pointer-events-none" />

                    <div className="relative bg-[#161A22] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_24px_64px_-12px_rgba(0,0,0,0.7)]">
                        {/* Header */}
                        <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-white/[0.06]">
                            <div className="w-9 h-9 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                                <Zap size={17} className="text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-100 leading-tight">
                                    {t('habits.createHabit')}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Build a new daily habit</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-5">
                            {/* Habit name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                                    Habit Name
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder={t('habits.habitTitle')}
                                    autoFocus
                                    className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm"
                                />
                            </div>

                            {/* Linked goal */}
                            {goals.length > 0 && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                                        <Link2 size={11} />
                                        {t('habits.linkedGoal')}
                                    </label>
                                    <select
                                        value={selectedGoalId}
                                        onChange={(e) => setSelectedGoalId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm appearance-none"
                                    >
                                        <option value="">{t('habits.noGoal')}</option>
                                        {goals.map(g => (
                                            <option key={g.id} value={g.id}>{g.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Frequency */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                                    {t('habits.frequency')}
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                                    {freqOptions.map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setFrequency(key)}
                                            className={`py-2 text-sm font-medium rounded-lg transition-all ${
                                                frequency === key
                                                    ? 'bg-primary-600 text-white shadow-sm'
                                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom day picker */}
                            <AnimatePresence>
                                {frequency === 'custom' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                                            Days of the Week
                                        </label>
                                        <div className="flex gap-1.5 justify-between">
                                            {DAYS.map((day, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleDay(i)}
                                                    title={DAY_FULL[i]}
                                                    className={`flex-1 h-9 text-xs font-semibold rounded-lg transition-all ${
                                                        daysOfWeek.includes(i)
                                                            ? 'bg-primary-600 text-white ring-1 ring-primary-500/50'
                                                            : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.08] hover:text-slate-300'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3 px-6 pb-6">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 text-sm font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] hover:text-slate-200 transition-all"
                            >
                                {t('habits.cancel')}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!title.trim()}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-4px_rgba(34,197,94,0.4)]"
                            >
                                {t('habits.create')}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
