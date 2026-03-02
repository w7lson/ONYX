import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Target, Timer, BookOpen, FileText, BarChart3, ArrowRight, Sparkles, UserPlus } from 'lucide-react';
import { SignInButton, useAuth } from '@clerk/clerk-react';
import Quiz from '../components/Onboarding/Quiz';

export default function Onboarding() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isSignedIn, getToken } = useAuth();
    const [phase, setPhase] = useState('quiz');
    const [answers, setAnswers] = useState({});

    const handleQuizComplete = (quizAnswers) => {
        setAnswers(quizAnswers);
        setPhase('results');
    };

    const handleFinish = () => navigate('/dashboard');

    useEffect(() => {
        if (isSignedIn && phase === 'signup') {
            const syncPendingPreferences = async () => {
                const pending = localStorage.getItem('pendingOnboardingAnswers');
                if (!pending) { setPhase('goalPrompt'); return; }
                try {
                    const data = JSON.parse(pending);
                    const token = await getToken();
                    const res = await fetch('/api/preferences', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (res.ok) localStorage.removeItem('pendingOnboardingAnswers');
                } catch (err) {
                    console.error('Failed to sync pending preferences:', err);
                }
                setPhase('goalPrompt');
            };
            syncPendingPreferences();
        }
    }, [isSignedIn, phase, getToken]);

    return (
        <div className="min-h-screen bg-[#0C0E12] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-4xl space-y-8">
                {phase === 'quiz' && (
                    <>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                                {t('onboarding.title')}
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                {t('onboarding.subtitle')}
                            </p>
                        </div>
                        <Quiz onComplete={handleQuizComplete} />
                    </>
                )}

                <AnimatePresence mode="wait">
                    {phase === 'results' && (
                        <ResultsScreen
                            key="results"
                            answers={answers}
                            onNext={() => {
                                if (!isSignedIn) setPhase('signup');
                                else setPhase('goalPrompt');
                            }}
                            showSignupHint={!isSignedIn}
                        />
                    )}
                    {phase === 'signup' && !isSignedIn && <SignUpScreen key="signup" />}
                    {phase === 'goalPrompt' && isSignedIn && (
                        <GoalPromptScreen
                            key="goalPrompt"
                            onGoToGoals={() => navigate('/goals')}
                            onSkip={() => setPhase('tour')}
                        />
                    )}
                    {phase === 'tour' && <FeatureTourScreen key="tour" onFinish={handleFinish} />}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ResultsScreen({ answers, onNext, showSignupHint }) {
    const { t } = useTranslation();

    const preferenceItems = [
        { key: 'currentLevel',     icon: '📊' },
        { key: 'learningStyle',    icon: '🧠' },
        { key: 'preferredContent', icon: '📚' },
        { key: 'pace',             icon: '⚡' },
        { key: 'reviewFrequency',  icon: '🔄' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success-50 dark:bg-success-900/30 flex items-center justify-center">
                    <CheckCircle size={32} className="text-success-600 dark:text-success-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {t('onboarding.resultsTitle')}
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {t('onboarding.resultsSubtitle')}
                </p>
            </div>

            <div className="bg-[#161A22] rounded-2xl border border-white/[0.06] shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08)] p-6 mb-6">
                <div className="space-y-3">
                    {preferenceItems.map(({ key, icon }) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                                <span>{icon}</span>
                                {t(`profile.${key}`)}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-slate-100 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs">
                                {answers[key] ? t(`quiz.${key}.${answers[key]}`) : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                >
                    {showSignupHint ? t('onboarding.createAccount') : t('onboarding.continue')}
                    <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}

function SignUpScreen() {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm mx-auto text-center"
        >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                <UserPlus size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('onboarding.signupTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
                {t('onboarding.signupSubtitle')}
            </p>

            <SignInButton mode="modal">
                <button className="w-full px-6 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center gap-2">
                    <UserPlus size={18} />
                    {t('onboarding.createAccount')}
                </button>
            </SignInButton>
        </motion.div>
    );
}

function GoalPromptScreen({ onGoToGoals, onSkip }) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm mx-auto text-center"
        >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
                <Target size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t('onboarding.goalTitle')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
                {t('onboarding.goalSubtitle')}
            </p>

            <div className="space-y-3">
                <button
                    onClick={onGoToGoals}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                    <Target size={18} />
                    {t('onboarding.setGoalNow')}
                </button>
                <button
                    onClick={onSkip}
                    className="w-full px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
                >
                    {t('onboarding.skipForNow')}
                </button>
            </div>
        </motion.div>
    );
}

function FeatureTourScreen({ onFinish }) {
    const { t } = useTranslation();

    const features = [
        { icon: Timer,    color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950',   key: 'pomodoro'   },
        { icon: BookOpen, color: 'text-primary-500',                       bg: 'bg-primary-50 dark:bg-primary-950',   key: 'flashcards' },
        { icon: FileText, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-900/30',key: 'tests'      },
        { icon: Target,   color: 'text-info-600 dark:text-info-400',       bg: 'bg-info-50 dark:bg-info-900/30',      key: 'goals'      },
        { icon: BarChart3,color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-50 dark:bg-warning-900/30',key: 'progress'   },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warning-50 dark:bg-warning-900/30 flex items-center justify-center">
                    <Sparkles size={32} className="text-warning-600 dark:text-warning-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {t('onboarding.tourTitle')}
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {t('onboarding.tourSubtitle')}
                </p>
            </div>

            <div className="grid gap-2 mb-8">
                {features.map(({ icon: Icon, color, bg, key }) => (
                    <div
                        key={key}
                        className="bg-[#161A22] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4"
                    >
                        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon size={22} className={color} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                {t(`onboarding.tour.${key}.title`)}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t(`onboarding.tour.${key}.desc`)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <button
                    onClick={onFinish}
                    className="px-8 py-3 bg-primary-600 text-white rounded-[10px] font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                >
                    {t('onboarding.goToDashboard')}
                    <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}
