import { useTranslation } from 'react-i18next';
import { Flame, Trophy } from 'lucide-react';

export default function StreakDisplay({ currentStreak, longestStreak }) {
    const { t } = useTranslation();

    return (
        <>
            <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                <div className="w-10 h-10 rounded-md bg-orange-500/10 flex items-center justify-center">
                    <Flame size={20} className="text-orange-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-100">{currentStreak}</p>
                    <p className="text-xs text-slate-400">{t('habits.streak')}</p>
                </div>
            </div>
            <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-4 flex items-center gap-3 shadow-[0_1px_3px_0_rgb(0_0_0/0.07)]">
                <div className="w-10 h-10 rounded-md bg-yellow-500/10 flex items-center justify-center">
                    <Trophy size={20} className="text-yellow-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-100">{longestStreak}</p>
                    <p className="text-xs text-slate-400">{t('habits.longestStreak')}</p>
                </div>
            </div>
        </>
    );
}
