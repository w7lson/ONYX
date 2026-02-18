import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Target, Timer, BookOpen, FileText, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import Quiz from '../components/Onboarding/Quiz';
import { useGuest } from '../contexts/GuestContext';

export default function Onboarding() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isGuest } = useGuest();
    const [phase, setPhase] = useState('quiz');
    const [answers, setAnswers] = useState({});

    const handleQuizComplete = (quizAnswers) => {
        setAnswers(quizAnswers);
        setPhase('results');
    };

    const handleGoToGoals = () => {
        navigate('/goals');
    };

    const handleSkipToTour = () => {
        setPhase('tour');
    };

    const handleFinish = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-6xl space-y-8">
                {phase === 'quiz' && (
                    <>
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                                {t('onboarding.title')}
                            </h1>
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
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
                            onNext={() => isGuest ? setPhase('tour') : setPhase('goalPrompt')}
                        />
                    )}

                    {phase === 'goalPrompt' && !isGuest && (
                        <GoalPromptScreen
                            key="goalPrompt"
                            onGoToGoals={handleGoToGoals}
                            onSkip={handleSkipToTour}
                        />
                    )}

                    {phase === 'tour' && (
                        <FeatureTourScreen
                            key="tour"
                            onFinish={handleFinish}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ResultsScreen({ answers, onNext }) {
    const { t } = useTranslation();

    const preferenceItems = [
        { key: 'primaryGoal', icon: '🎯' },
        { key: 'currentLevel', icon: '📊' },
        { key: 'learningStyle', icon: '🧠' },
        { key: 'preferredContent', icon: '📚' },
        { key: 'pace', icon: '⚡' },
        { key: 'reviewFrequency', icon: '🔄' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t('onboarding.resultsTitle')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('onboarding.resultsSubtitle')}
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="space-y-4">
                    {preferenceItems.map(({ key, icon }) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <span>{icon}</span>
                                {t(`profile.${key}`)}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full text-sm">
                                {answers[key] ? t(`quiz.${key}.${answers[key]}`) : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                    {t('onboarding.continue')}
                    <ArrowRight size={18} />
                </button>
            </div>
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
            className="max-w-lg mx-auto text-center"
        >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Target size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('onboarding.goalTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('onboarding.goalSubtitle')}
            </p>

            <div className="space-y-3">
                <button
                    onClick={onGoToGoals}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                    <Target size={18} />
                    {t('onboarding.setGoalNow')}
                </button>
                <button
                    onClick={onSkip}
                    className="w-full px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
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
        { icon: Timer, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', key: 'pomodoro' },
        { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', key: 'flashcards' },
        { icon: FileText, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', key: 'tests' },
        { icon: Target, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', key: 'goals' },
        { icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', key: 'progress' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Sparkles size={32} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t('onboarding.tourTitle')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('onboarding.tourSubtitle')}
                </p>
            </div>

            <div className="grid gap-3 mb-8">
                {features.map(({ icon: Icon, color, bg, key }) => (
                    <div
                        key={key}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon size={24} className={color} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {t(`onboarding.tour.${key}.title`)}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t(`onboarding.tour.${key}.desc`)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <button
                    onClick={onFinish}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                    {t('onboarding.goToDashboard')}
                    <ArrowRight size={18} />
                </button>
            </div>
        </motion.div>
    );
}
