import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileQuestion, Trash2, FlaskConical } from 'lucide-react';

export const EXAMPLE_TEST = {
    id: '__example__',
    topic: 'Study Techniques',
    completedAt: null,
    attempts: [],
    questions: [
        {
            id: 'ex-1',
            type: 'mc',
            questionText: 'What does the Pomodoro Technique primarily aim to improve?',
            options: { a: 'Reading speed', b: 'Focus and time management', c: 'Memory retention', d: 'Note-taking skills' },
            correctAnswer: 'b',
        },
        {
            id: 'ex-2',
            type: 'mc',
            questionText: 'In spaced repetition, when should you review a card you found easy?',
            options: { a: 'Immediately', b: 'After 1 day', c: 'After a longer interval', d: 'Never again' },
            correctAnswer: 'c',
        },
        {
            id: 'ex-3',
            type: 'mc',
            questionText: 'The Feynman Technique involves explaining a concept as if you are:',
            options: { a: 'An expert presenter', b: 'A student yourself', c: 'Teaching a beginner', d: 'Writing a textbook' },
            correctAnswer: 'c',
        },
        {
            id: 'ex-4',
            type: 'mc',
            questionText: 'Active recall is most effective because it:',
            options: { a: 'Reduces study time', b: 'Strengthens memory through retrieval practice', c: 'Eliminates the need for repetition', d: 'Improves reading speed' },
            correctAnswer: 'b',
        },
        {
            id: 'ex-5',
            type: 'mc',
            questionText: 'How long is a standard Pomodoro work interval?',
            options: { a: '15 minutes', b: '20 minutes', c: '25 minutes', d: '30 minutes' },
            correctAnswer: 'c',
        },
    ],
};

export default function TestList({ tests, onCreateTest, generating, onSelectTest, onDeleteTest }) {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [questionCount, setQuestionCount] = useState('10');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const handleCreate = () => {
        if (!topic.trim() && !content.trim()) return;
        const validCount = Math.max(1, Math.min(20, parseInt(questionCount) || 10));
        onCreateTest({ topic: topic.trim(), content: content.trim(), questionCount: validCount });
        setTopic('');
        setContent('');
        setShowCreate(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {t('tests.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('tests.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                    <Plus size={18} />
                    {t('tests.createTest')}
                </button>
            </div>

            {showCreate && (
                <div className="bg-[#161A22] rounded-lg border border-white/[0.06] p-5 mb-6">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t('tests.topicPlaceholder')}
                        className="w-full px-4 py-2 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />

                    <label className="text-sm text-slate-400 block mb-1">{t('tests.pasteContent')}</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('tests.contentPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-2 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 placeholder-slate-500 mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />

                    <div className="mb-3">
                        <label className="text-sm text-slate-400 block mb-1">{t('tests.questionCount')}</label>
                        <input
                            type="number"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(e.target.value)}
                            min={1}
                            max={20}
                            className="w-20 px-3 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.05] text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={generating}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {generating ? t('tests.generating') : t('tests.generate')}
                        </button>
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2 bg-white/[0.06] text-slate-300 rounded-md font-medium hover:bg-white/[0.10] transition-colors"
                        >
                            {t('tests.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {/* Example test card — always visible */}
            <div className="mb-4">
                <div
                    onClick={() => onSelectTest(EXAMPLE_TEST)}
                    className="bg-[#161A22] rounded-lg border border-primary-900/60 p-4 hover:border-primary-700 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.12)] transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FlaskConical size={18} className="text-primary-400 shrink-0" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-100">{t('tests.exampleTest')}</h3>
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary-900/50 text-primary-300 font-medium">
                                        {t('tests.exampleBadge')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mt-0.5">{t('tests.exampleDesc')}</p>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500">{EXAMPLE_TEST.questions.length} {t('tests.questionCount').toLowerCase()}</span>
                    </div>
                </div>
            </div>

            {tests.length === 0 ? (
                <div className="bg-[#161A22] border border-white/[0.06] rounded-lg p-6 text-center">
                    <FileQuestion size={40} className="text-primary-500 mx-auto mb-3" />
                    <p className="text-slate-400">{t('tests.noTests')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tests.map((test) => (
                        <div
                            key={test.id}
                            onClick={() => onSelectTest(test)}
                            className="bg-[#161A22] rounded-lg border border-white/[0.06] p-4 hover:border-primary-900 hover:shadow-[0_4px_6px_-1px_rgb(0_0_0/0.12)] transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-100">{test.topic}</h3>
                                    <p className="text-sm text-slate-400 mt-0.5">
                                        {test.questions?.length || 0} {t('tests.questionCount').toLowerCase()} &middot; {new Date(test.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    {test.completedAt ? (
                                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                                            test.score >= 80
                                                ? 'bg-green-500/20 text-green-400'
                                                : test.score >= 60
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {t('tests.score')}: {test.score}%
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 text-sm rounded-full bg-white/[0.06] text-slate-400">
                                            {t('tests.notCompleted')}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmId(test.id);
                                        }}
                                        className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-2"
                                        title={t('tests.deleteTest')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#161A22] border border-white/[0.08] rounded-lg p-6 max-w-sm w-full shadow-xl">
                        <p className="text-slate-100 mb-4">{t('tests.confirmDeleteTest')}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 bg-white/[0.06] text-slate-300 rounded-md font-medium hover:bg-white/[0.10] transition-colors"
                            >
                                {t('tests.cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteTest(deleteConfirmId);
                                    setDeleteConfirmId(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                            >
                                {t('tests.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
