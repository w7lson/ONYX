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
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {t('tests.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{t('tests.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    {t('tests.createTest')}
                </button>
            </div>

            {showCreate && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t('tests.topicPlaceholder')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">{t('tests.pasteContent')}</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('tests.contentPlaceholder')}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />

                    <div className="mb-3">
                        <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">{t('tests.questionCount')}</label>
                        <input
                            type="number"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                            min={1}
                            max={20}
                            className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={generating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {generating ? t('tests.generating') : t('tests.generate')}
                        </button>
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('tests.cancel')}
                        </button>
                    </div>
                </div>
            )}

            {tests.length === 0 ? (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                    <FileQuestion size={40} className="text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-300">{t('tests.noTests')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tests.map((test) => (
                        <div
                            key={test.id}
                            onClick={() => onSelectTest(test)}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{test.topic}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        {test.questions?.length || 0} {t('tests.questionCount').toLowerCase()} &middot; {new Date(test.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    {test.completedAt ? (
                                        <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                                            test.score >= 80
                                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                : test.score >= 60
                                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                        }`}>
                                            {t('tests.score')}: {test.score}%
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                            {t('tests.notCompleted')}
                                        </span>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmId(test.id);
                                        }}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors ml-2"
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
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full shadow-xl">
                        <p className="text-gray-800 dark:text-gray-100 mb-4">{t('tests.confirmDeleteTest')}</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('tests.cancel')}
                            </button>
                            <button
                                onClick={() => {
                                    onDeleteTest(deleteConfirmId);
                                    setDeleteConfirmId(null);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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
