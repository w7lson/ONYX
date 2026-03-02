import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { Globe } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'uk', label: 'Українська', flag: '🇺🇦' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const QUESTIONS = [
    {
        id: 'currentLevel',
        options: ['under1h', '1-2hours', '2-4hours', '4-6hours', '6plus'],
    },
    {
        id: 'learningStyle',
        options: ['visual', 'reading', 'handson'],
    },
    {
        id: 'preferredContent',
        options: ['videos', 'articles', 'interactive'],
    },
    {
        id: 'pace',
        options: ['intensive', 'moderate', 'relaxed'],
    },
    {
        id: 'reviewFrequency',
        options: ['daily', 'weekly', 'monthly'],
    },
];

export default function Quiz({ onComplete }) {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getToken, isSignedIn } = useAuth();

    const [languageStepDone, setLanguageStepDone] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

    const totalSteps = QUESTIONS.length + 1; // +1 for language step
    const displayStep = !languageStepDone ? 0 : currentStep + 1;

    const currentQuestion = QUESTIONS[currentStep];

    const handleLanguageSelect = (code) => {
        setSelectedLanguage(code);
        i18n.changeLanguage(code);
        localStorage.setItem('language', code);
    };

    const handleLanguageContinue = () => {
        setLanguageStepDone(true);
    };

    const handleOptionSelect = (value) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleNext = async () => {
        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Unauthenticated user: store in localStorage for post-signup sync
            if (!isSignedIn) {
                const pendingData = { ...answers, language: selectedLanguage };
                localStorage.setItem('pendingOnboardingAnswers', JSON.stringify(pendingData));
                if (onComplete) onComplete(answers);
                return;
            }

            // Authenticated user: save via API
            setIsSubmitting(true);
            try {
                const token = await getToken();
                const res = await fetch('/api/preferences', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...answers, language: selectedLanguage }),
                });

                if (!res.ok) throw new Error('Failed to save preferences');
                if (onComplete) {
                    onComplete(answers);
                }
            } catch (error) {
                console.error("Failed to save preferences:", error);
                toast.error(t('quiz.error'));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (!languageStepDone) return;
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            setLanguageStepDone(false);
        }
    };

    const cardClass = "bg-[#161A22] border border-white/[0.06] rounded-2xl p-8 shadow-[0_4px_6px_-1px_rgb(0_0_0/0.2)]";

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Progress bar */}
            <div className="mb-8">
                <div className="h-1.5 bg-white/[0.06] rounded-full">
                    <motion.div
                        className="h-full bg-primary-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((displayStep + 1) / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-sm text-slate-500 mt-2 text-right">
                    {displayStep + 1} / {totalSteps}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!languageStepDone ? (
                    <motion.div
                        key="language"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cardClass}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Globe size={28} className="text-primary-400" />
                            <h2 className="text-2xl font-bold text-slate-100">
                                {t('onboarding.languageTitle')}
                            </h2>
                        </div>
                        <p className="text-slate-400 mb-6">
                            {t('onboarding.languageSubtitle')}
                        </p>

                        <div className="space-y-3">
                            {LANGUAGES.map(({ code, label, flag }) => (
                                <button
                                    key={code}
                                    onClick={() => handleLanguageSelect(code)}
                                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                                        selectedLanguage === code
                                            ? 'border-primary-500 bg-primary-950 text-primary-300'
                                            : 'border-white/[0.06] hover:border-primary-900 hover:bg-white/[0.04] text-slate-300'
                                    }`}
                                >
                                    <span className="text-2xl">{flag}</span>
                                    <span className="font-medium text-lg">{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleLanguageContinue}
                                className="px-6 py-2.5 rounded-[10px] font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                            >
                                {t('quiz.next')}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cardClass}
                    >
                        <h2 className="text-2xl font-bold mb-6 text-slate-100">
                            {t(`quiz.${currentQuestion.id}.question`)}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map((value) => (
                                <button
                                    key={value}
                                    onClick={() => handleOptionSelect(value)}
                                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                                        answers[currentQuestion.id] === value
                                            ? 'border-primary-500 bg-primary-950 text-primary-300'
                                            : 'border-white/[0.06] hover:border-primary-900 hover:bg-white/[0.04] text-slate-300'
                                    }`}
                                >
                                    <span className="font-medium">{t(`quiz.${currentQuestion.id}.${value}`)}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={handleBack}
                                className="px-5 py-2 rounded-lg font-medium transition-colors text-slate-400 hover:text-slate-200"
                            >
                                {t('quiz.back')}
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!answers[currentQuestion.id] || isSubmitting}
                                className={`px-6 py-2.5 rounded-[10px] font-semibold transition-colors ${
                                    answers[currentQuestion.id] && !isSubmitting
                                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                                        : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting
                                    ? t('quiz.saving')
                                    : currentStep === QUESTIONS.length - 1
                                        ? t('quiz.finish')
                                        : t('quiz.next')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
