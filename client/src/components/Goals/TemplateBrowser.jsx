import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronRight, X, Briefcase, DollarSign, Heart, GraduationCap, Sparkles, LayoutGrid,
    MessageCircle, Building2, Scale, Dumbbell, Languages, Code2, BookOpen, Clock,
    PiggyBank, TrendingUp,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES } from '../../data/goalTemplates';

const FOCUS_ICONS = {
    careerWork: Briefcase,
    moneyFinance: DollarSign,
    healthFitness: Heart,
    educationLearning: GraduationCap,
    personalGrowth: Sparkles,
};

const TOPIC_ICONS = {
    interpersonalSkills: MessageCircle,
    jobsEmployment: Building2,
    weightManagement: Scale,
    exerciseTraining: Dumbbell,
    languages: Languages,
    skillsDevelopment: Code2,
    readingKnowledge: BookOpen,
    productivity: Clock,
    saving: PiggyBank,
    budgetingInvesting: TrendingUp,
};

export default function TemplateBrowser({ onSelect, onClose }) {
    const { t } = useTranslation();
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const handleAllClick = () => {
        setShowAll(true);
        setExpandedCategory(null);
        setSelectedTopic(null);
    };

    const handleCategoryClick = (focusKey) => {
        setShowAll(false);
        if (expandedCategory === focusKey) {
            setExpandedCategory(null);
            setSelectedTopic(null);
        } else {
            setExpandedCategory(focusKey);
            setSelectedTopic(null);
        }
    };

    const handleTopicClick = (category, topic) => {
        setShowAll(false);
        setSelectedTopic({ categoryKey: category.focusKey, topicKey: topic.topicKey, goals: topic.goals });
    };

    // Build a flat list of all goals grouped by topic for "All Categories" view
    const allTopics = showAll
        ? TEMPLATE_CATEGORIES.flatMap((cat) =>
            cat.topics.map((topic) => ({ topicKey: topic.topicKey, goals: topic.goals }))
        )
        : [];

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {t('goals.templateBrowser.title')}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex">
                {/* Left panel: Categories (25%) */}
                <div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
                    {/* All Categories button */}
                    <button
                        onClick={handleAllClick}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                            showAll
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <LayoutGrid size={15} className="shrink-0" />
                        <span className="truncate">{t('goals.templateBrowser.allCategories')}</span>
                    </button>

                    {TEMPLATE_CATEGORIES.map((category) => {
                        const Icon = FOCUS_ICONS[category.focusKey];
                        const isExpanded = expandedCategory === category.focusKey;

                        return (
                            <div key={category.focusKey}>
                                <button
                                    onClick={() => handleCategoryClick(category.focusKey)}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                                        isExpanded
                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {Icon && <Icon size={15} className="shrink-0" />}
                                    <span className="truncate">{t(`goals.specify.focuses.${category.focusKey}`)}</span>
                                    <ChevronRight
                                        size={14}
                                        className={`ml-auto shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    />
                                </button>

                                {/* Subtopics */}
                                {isExpanded && category.topics.map((topic) => (
                                    <button
                                        key={topic.topicKey}
                                        onClick={() => handleTopicClick(category, topic)}
                                        className={`w-full text-left pl-9 pr-3 py-2 text-xs transition-colors ${
                                            selectedTopic?.topicKey === topic.topicKey
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {t(`goals.templateBrowser.topics.${topic.topicKey}`)}
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Right panel: Goals (75%) */}
                <div className="w-3/4 p-4">
                    {showAll ? (
                        <div className="space-y-5">
                            {allTopics.map((topic) => {
                                const TopicIcon = TOPIC_ICONS[topic.topicKey];
                                return (
                                <div key={topic.topicKey}>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                        {TopicIcon && <TopicIcon size={15} className="text-gray-500 dark:text-gray-400" />}
                                        {t(`goals.templateBrowser.topics.${topic.topicKey}`)}
                                    </h4>
                                    <div className="space-y-2">
                                        {topic.goals.map((goal) => (
                                            <div
                                                key={goal.key}
                                                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                                            >
                                                <span className="text-sm text-gray-800 dark:text-gray-200">
                                                    {t(goal.titleKey)}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                                    <span className="text-xs text-blue-600 dark:text-blue-400">
                                                        {goal.milestoneKeys.length} {t('goals.templateBrowser.milestones')}
                                                    </span>
                                                    <button
                                                        onClick={() => onSelect(goal)}
                                                        className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                    >
                                                        {t(`goals.specify.durations.${goal.duration}`)}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    ) : !selectedTopic ? (
                        <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                            {t('goals.templateBrowser.selectTopic')}
                        </div>
                    ) : (() => {
                        const TopicIcon = TOPIC_ICONS[selectedTopic.topicKey];
                        return (
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                                {TopicIcon && <TopicIcon size={15} className="text-gray-500 dark:text-gray-400" />}
                                {t(`goals.templateBrowser.topics.${selectedTopic.topicKey}`)}
                            </h4>
                            <div className="space-y-2">
                                {selectedTopic.goals.map((goal) => (
                                    <div
                                        key={goal.key}
                                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                                    >
                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                            {t(goal.titleKey)}
                                        </span>
                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                {goal.milestoneKeys.length} {t('goals.templateBrowser.milestones')}
                                            </span>
                                            <button
                                                onClick={() => onSelect(goal)}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                            >
                                                {t(`goals.specify.durations.${goal.duration}`)}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
