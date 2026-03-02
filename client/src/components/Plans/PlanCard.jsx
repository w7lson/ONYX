import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronDown, Trash2, Target, Pencil, Check, X, Plus,
    Briefcase, DollarSign, Heart, GraduationCap, Users, Sparkles, Palette, Home
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const FOCUS_ICONS = {
    careerWork: Briefcase,
    moneyFinance: DollarSign,
    healthFitness: Heart,
    educationLearning: GraduationCap,
    relationshipsSocial: Users,
    personalGrowth: Sparkles,
    hobbiesCreative: Palette,
    homeLiving: Home,
    Uncategorized: Target,
};

export default function PlanCard({ plan, onToggleTask, onDelete, onRefresh }) {
    const { t } = useTranslation();
    const { getToken } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [moduleEditTitle, setModuleEditTitle] = useState('');
    const [addingTaskModuleId, setAddingTaskModuleId] = useState(null);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskEditContent, setTaskEditContent] = useState('');

    const totalTasks = plan.modules.reduce((sum, mod) => sum + mod.tasks.length, 0);
    const completedTasks = plan.modules.reduce((sum, mod) => sum + mod.tasks.filter(t => t.isCompleted).length, 0);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const GoalIcon = plan.goal ? (FOCUS_ICONS[plan.goal.focus] || Target) : null;

    const handleDeletePlan = async () => {
        try {
            const token = await getToken();
            await axios.delete(`/api/plans/${plan.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onDelete?.();
        } catch (err) {
            console.error('Error deleting plan:', err);
        }
    };

    const handleUpdateModule = async (moduleId) => {
        if (!moduleEditTitle.trim()) return;
        try {
            const token = await getToken();
            await axios.put(`/api/modules/${moduleId}`, { title: moduleEditTitle.trim() }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingModuleId(null);
            onRefresh?.();
        } catch (err) {
            console.error('Error updating module:', err);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        try {
            const token = await getToken();
            await axios.delete(`/api/modules/${moduleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onRefresh?.();
        } catch (err) {
            console.error('Error deleting module:', err);
        }
    };

    const handleAddTask = async (moduleId) => {
        if (!newTaskContent.trim()) return;
        try {
            const token = await getToken();
            await axios.post(`/api/modules/${moduleId}/tasks`, { content: newTaskContent.trim() }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddingTaskModuleId(null);
            setNewTaskContent('');
            onRefresh?.();
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    const handleUpdateTask = async (taskId) => {
        if (!taskEditContent.trim()) return;
        try {
            const token = await getToken();
            await axios.put(`/api/tasks/${taskId}`, { content: taskEditContent.trim() }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEditingTaskId(null);
            onRefresh?.();
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const token = await getToken();
            await axios.delete(`/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onRefresh?.();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    return (
        <div className="bg-[#161A22] rounded-lg border border-white/[0.06] overflow-hidden transition-colors">
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-slate-100">{plan.title}</h2>
                        {plan.description && (
                            <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        {confirmDelete ? (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleDeletePlan}
                                    className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                >
                                    {t('plans.card.confirmDelete')}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="p-1 text-slate-500 hover:text-slate-300"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                title={t('plans.card.delete')}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Goal badge + progress */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {plan.goal && GoalIcon && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary-500/10 text-primary-400 rounded-full">
                                <GoalIcon size={12} />
                                {plan.goal.title}
                            </span>
                        )}
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            plan.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : plan.status === 'failed'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-white/[0.06] text-slate-400'
                        }`}>
                            {plan.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24">
                            <div className="h-2 bg-white/[0.08] rounded-full">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400 w-10 text-right">
                            {progress}%
                        </span>

                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-md hover:bg-white/[0.06] transition-colors"
                        >
                            <ChevronDown size={18} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded modules */}
            {expanded && (
                <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                    {plan.modules.map((module) => {
                        const modCompleted = module.tasks.filter(t => t.isCompleted).length;
                        const modTotal = module.tasks.length;

                        return (
                            <div key={module.id} className="border border-white/[0.06] rounded-lg p-4 bg-white/[0.02]">
                                <div className="flex justify-between items-center mb-2">
                                    {editingModuleId === module.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                value={moduleEditTitle}
                                                onChange={e => setModuleEditTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleUpdateModule(module.id)}
                                                className="flex-1 px-2 py-1 text-sm font-semibold bg-white/[0.05] border border-primary-500/40 rounded-md focus:outline-none text-slate-200"
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdateModule(module.id)} className="p-1 text-green-400"><Check size={14} /></button>
                                            <button onClick={() => setEditingModuleId(null)} className="p-1 text-slate-500"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <h3 className="font-semibold text-slate-200">{module.title}</h3>
                                    )}
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        {editingModuleId !== module.id && (
                                            <>
                                                <button
                                                    onClick={() => { setEditingModuleId(module.id); setModuleEditTitle(module.title); }}
                                                    className="p-1 text-slate-500 hover:text-primary-400 rounded transition-colors"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteModule(module.id)}
                                                    className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1.5 bg-white/[0.08] rounded-full mb-3">
                                    <div
                                        className="h-full bg-primary-500 rounded-full transition-all"
                                        style={{ width: `${modTotal > 0 ? (modCompleted / modTotal) * 100 : 0}%` }}
                                    />
                                </div>

                                {/* Tasks */}
                                <ul className="space-y-1">
                                    {module.tasks.map((task) => (
                                        <li
                                            key={task.id}
                                            className="flex items-center gap-2 text-sm text-slate-400 group"
                                        >
                                            <button
                                                onClick={() => onToggleTask(task.id)}
                                                className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                    task.isCompleted
                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                        : 'border-white/20 hover:border-primary-400'
                                                }`}
                                            >
                                                {task.isCompleted && <span className="text-xs">✓</span>}
                                            </button>

                                            {editingTaskId === task.id ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <input
                                                        value={taskEditContent}
                                                        onChange={e => setTaskEditContent(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdateTask(task.id)}
                                                        className="flex-1 px-2 py-0.5 text-sm bg-white/[0.05] border border-primary-500/40 rounded focus:outline-none text-slate-200"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleUpdateTask(task.id)} className="p-0.5 text-green-400"><Check size={12} /></button>
                                                    <button onClick={() => setEditingTaskId(null)} className="p-0.5 text-slate-500"><X size={12} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span
                                                        className={`flex-1 cursor-pointer hover:bg-white/[0.04] rounded px-1 py-0.5 transition-colors ${
                                                            task.isCompleted ? 'line-through text-slate-600' : ''
                                                        }`}
                                                        onClick={() => onToggleTask(task.id)}
                                                    >
                                                        {task.content}
                                                    </span>
                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setEditingTaskId(task.id); setTaskEditContent(task.content); }}
                                                            className="p-0.5 text-slate-500 hover:text-primary-400"
                                                        >
                                                            <Pencil size={11} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="p-0.5 text-slate-500 hover:text-red-400"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                {/* Add task */}
                                {addingTaskModuleId === module.id ? (
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            value={newTaskContent}
                                            onChange={e => setNewTaskContent(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleAddTask(module.id);
                                                if (e.key === 'Escape') { setAddingTaskModuleId(null); setNewTaskContent(''); }
                                            }}
                                            placeholder={t('plans.generator.taskPlaceholder')}
                                            className="flex-1 px-2 py-1 text-sm bg-white/[0.05] border border-white/[0.08] rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-300 placeholder-slate-600"
                                            autoFocus
                                        />
                                        <button onClick={() => handleAddTask(module.id)} className="p-1 text-green-400"><Check size={14} /></button>
                                        <button onClick={() => { setAddingTaskModuleId(null); setNewTaskContent(''); }} className="p-1 text-slate-500"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingTaskModuleId(module.id)}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-400 transition-colors mt-2"
                                    >
                                        <Plus size={12} />
                                        {t('plans.generator.addTask')}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
