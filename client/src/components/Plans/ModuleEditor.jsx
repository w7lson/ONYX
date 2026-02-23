import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, GripVertical, ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react';

const TYPE_COLORS = {
    action: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    milestone: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    habit: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
    resource: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
};

export default function ModuleEditor({
    module,
    index,
    totalModules,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
}) {
    const { t } = useTranslation();
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(module.title);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskEditValue, setTaskEditValue] = useState('');
    const [newTaskContent, setNewTaskContent] = useState('');
    const [showAddTask, setShowAddTask] = useState(false);

    const handleSaveTitle = () => {
        if (titleValue.trim()) {
            onUpdate({ title: titleValue.trim() });
        }
        setEditingTitle(false);
    };

    const handleStartEditTask = (task) => {
        setEditingTaskId(task.id || task._tempId);
        setTaskEditValue(task.content);
    };

    const handleSaveTask = (taskIndex) => {
        if (taskEditValue.trim()) {
            onUpdateTask(taskIndex, { content: taskEditValue.trim() });
        }
        setEditingTaskId(null);
    };

    const handleAddTask = () => {
        if (newTaskContent.trim()) {
            onAddTask({ content: newTaskContent.trim(), type: 'action' });
            setNewTaskContent('');
            setShowAddTask(false);
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
            {/* Module header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                <GripVertical size={16} className="text-gray-400 shrink-0" />

                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                {editingTitle ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input
                            value={titleValue}
                            onChange={e => setTitleValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                            className="flex-1 px-2 py-1 text-sm font-semibold bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                            autoFocus
                        />
                        <button onClick={handleSaveTitle} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded">
                            <Check size={14} />
                        </button>
                        <button onClick={() => { setEditingTitle(false); setTitleValue(module.title); }} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <h3
                        onClick={() => setEditingTitle(true)}
                        className="flex-1 font-semibold text-sm text-gray-800 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        {module.title}
                    </h3>
                )}

                {/* Move buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        onClick={onMoveUp}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                    >
                        <ChevronUp size={14} />
                    </button>
                    <button
                        onClick={onMoveDown}
                        disabled={index === totalModules - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
                    >
                        <ChevronDown size={14} />
                    </button>
                </div>

                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Tasks */}
            <div className="px-4 py-3 space-y-1.5">
                {module.tasks.map((task, taskIndex) => {
                    const taskKey = task.id || task._tempId;
                    const isEditing = editingTaskId === taskKey;

                    return (
                        <div key={taskKey} className="flex items-center gap-2 group">
                            {/* Type badge */}
                            {task.type && (
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[task.type] || TYPE_COLORS.action}`}>
                                    {t(`plans.generator.taskType.${task.type}`)}
                                </span>
                            )}

                            {/* Task content */}
                            {isEditing ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        value={taskEditValue}
                                        onChange={e => setTaskEditValue(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSaveTask(taskIndex)}
                                        className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                                        autoFocus
                                    />
                                    <button onClick={() => handleSaveTask(taskIndex)} className="p-1 text-green-500">
                                        <Check size={14} />
                                    </button>
                                    <button onClick={() => setEditingTaskId(null)} className="p-1 text-gray-400">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                    {task.content}
                                </span>
                            )}

                            {/* Task actions (show on hover) */}
                            {!isEditing && (
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleStartEditTask(task)}
                                        className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                                    >
                                        <Pencil size={12} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTask(taskIndex)}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add task */}
                {showAddTask ? (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            value={newTaskContent}
                            onChange={e => setNewTaskContent(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleAddTask();
                                if (e.key === 'Escape') { setShowAddTask(false); setNewTaskContent(''); }
                            }}
                            placeholder={t('plans.generator.taskPlaceholder')}
                            className="flex-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-300 placeholder-gray-400"
                            autoFocus
                        />
                        <button onClick={handleAddTask} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded">
                            <Check size={14} />
                        </button>
                        <button onClick={() => { setShowAddTask(false); setNewTaskContent(''); }} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddTask(true)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors mt-1"
                    >
                        <Plus size={12} />
                        {t('plans.generator.addTask')}
                    </button>
                )}
            </div>
        </div>
    );
}
