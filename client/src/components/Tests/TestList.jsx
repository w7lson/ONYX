import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileQuestion, Trash2 } from 'lucide-react';

export default function TestList({ tests, onCreateTest, generating, onSelectTest, onDeleteTest }) {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [topic, setTopic] = useState('');
    const [content, setContent] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const handleCreate = () => {
        if (!topic.trim() && !content.trim()) return;
        onCreateTest({ topic: topic.trim(), content: content.trim(), questionCount });
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
                            onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
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
