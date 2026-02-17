import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronUp, ChevronDown, MoreVertical, Pencil, Trash2, Calendar, Gift, FileText } from 'lucide-react';

function MilestoneMenu({ milestone, onEdit, onDelete, onEditDescription, onEditTargetDate, onEditReward }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
            >
                <MoreVertical size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]">
                    <button
                        onClick={() => { onEditDescription(milestone); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <FileText size={14} />
                        {t('goals.specify.editDescription')}
                    </button>
                    <button
                        onClick={() => { onEditTargetDate(milestone); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Calendar size={14} />
                        {t('goals.specify.editTargetDate')}
                    </button>
                    <button
                        onClick={() => { onEditReward(milestone); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <Gift size={14} />
                        {t('goals.specify.editReward')}
                    </button>
                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button
                        onClick={() => { onDelete(milestone.id); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                        <Trash2 size={14} />
                        {t('goals.specify.deleteMilestone')}
                    </button>
                </div>
            )}
        </div>
    );
}

function MilestoneEditModal({ milestone, field, onSave, onClose }) {
    const { t } = useTranslation();
    const [value, setValue] = useState(milestone[field] || '');

    const labels = {
        description: t('goals.specify.editDescription'),
        targetDate: t('goals.specify.editTargetDate'),
        reward: t('goals.specify.editReward'),
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{labels[field]}</h3>
                {field === 'targetDate' ? (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                ) : field === 'description' ? (
                    <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}
                <div className="flex gap-2 mt-4 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {t('goals.specify.cancel')}
                    </button>
                    <button
                        onClick={() => onSave(milestone.id, field, value)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t('goals.specify.save')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MilestoneList({ milestones, onChange }) {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [modalState, setModalState] = useState(null); // { milestone, field }

    const addMilestone = () => {
        const newMilestone = {
            id: `temp-${Date.now()}`,
            title: '',
            description: '',
            reward: '',
            targetDate: '',
            order: milestones.length,
        };
        onChange([...milestones, newMilestone]);
        setEditingId(newMilestone.id);
        setEditingTitle('');
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const updated = [...milestones];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        onChange(updated.map((m, i) => ({ ...m, order: i })));
    };

    const moveDown = (index) => {
        if (index === milestones.length - 1) return;
        const updated = [...milestones];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        onChange(updated.map((m, i) => ({ ...m, order: i })));
    };

    const deleteMilestone = (id) => {
        onChange(milestones.filter(m => m.id !== id).map((m, i) => ({ ...m, order: i })));
    };

    const startEditing = (milestone) => {
        setEditingId(milestone.id);
        setEditingTitle(milestone.title);
    };

    const finishEditing = () => {
        if (editingId) {
            if (!editingTitle.trim()) {
                onChange(milestones.filter(m => m.id !== editingId).map((m, i) => ({ ...m, order: i })));
            } else {
                onChange(milestones.map(m => m.id === editingId ? { ...m, title: editingTitle.trim() } : m));
            }
            setEditingId(null);
            setEditingTitle('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') finishEditing();
        if (e.key === 'Escape') {
            setEditingId(null);
            setEditingTitle('');
        }
    };

    const handleModalSave = (milestoneId, field, value) => {
        onChange(milestones.map(m => m.id === milestoneId ? { ...m, [field]: value } : m));
        setModalState(null);
    };

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {t('goals.specify.milestonesTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('goals.specify.milestonesSubtitle')}
            </p>

            <div className="space-y-2 mb-4">
                {milestones.map((milestone, index) => (
                    <div
                        key={milestone.id}
                        className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5"
                    >
                        {/* Reorder arrows */}
                        <div className="flex flex-col">
                            <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronUp size={14} />
                            </button>
                            <button
                                onClick={() => moveDown(index)}
                                disabled={index === milestones.length - 1}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronDown size={14} />
                            </button>
                        </div>

                        {/* Order number */}
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-5 text-center">
                            {index + 1}
                        </span>

                        {/* Title */}
                        <div className="flex-1 flex items-center gap-1 min-w-0">
                            {editingId === milestone.id ? (
                                <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={finishEditing}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    placeholder={t('goals.specify.milestonePlaceholder')}
                                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
                                />
                            ) : (
                                <>
                                    <span className="text-sm text-gray-800 dark:text-gray-100 truncate">
                                        {milestone.title || t('goals.specify.milestonePlaceholder')}
                                    </span>
                                    <button
                                        onClick={() => startEditing(milestone)}
                                        className="flex-shrink-0 p-0.5 text-gray-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* 3-dots menu */}
                        <MilestoneMenu
                            milestone={milestone}
                            onDelete={deleteMilestone}
                            onEditDescription={(m) => setModalState({ milestone: m, field: 'description' })}
                            onEditTargetDate={(m) => setModalState({ milestone: m, field: 'targetDate' })}
                            onEditReward={(m) => setModalState({ milestone: m, field: 'reward' })}
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={addMilestone}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
                <Plus size={16} />
                {t('goals.specify.addMilestone')}
            </button>

            {modalState && (
                <MilestoneEditModal
                    milestone={modalState.milestone}
                    field={modalState.field}
                    onSave={handleModalSave}
                    onClose={() => setModalState(null)}
                />
            )}
        </div>
    );
}
