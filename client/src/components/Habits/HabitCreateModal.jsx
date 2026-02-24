import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HabitCreateModal({ onClose, onCreate, goals = [] }) {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {t('habits.createHabit')}
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={18} />
                    </button>
                </div>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('habits.habitTitle')}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />

                {goals.length > 0 && (
                    <>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                            {t('habits.linkedGoal')}
                        </label>
                        <select
                            value={selectedGoalId}
                            onChange={(e) => setSelectedGoalId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        >
                            <option value="">{t('habits.noGoal')}</option>
                            {goals.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                        </select>
                    </>
                )}

                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    {t('habits.frequency')}
                </label>
                <div className="flex gap-2 mb-4">
                    {['daily', 'weekly', 'custom'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFrequency(f)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                frequency === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t(`habits.${f}`)}
                        </button>
                    ))}
                </div>

                {frequency === 'custom' && (
                    <div className="flex gap-1 mb-4">
                        {DAYS.map((day, i) => (
                            <button
                                key={i}
                                onClick={() => toggleDay(i)}
                                className={`w-9 h-9 text-xs font-medium rounded-full transition-colors ${
                                    daysOfWeek.includes(i)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t('habits.cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {t('habits.create')}
                    </button>
                </div>
            </div>
        </div>
    );
}
