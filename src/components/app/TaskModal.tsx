import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Task, Priority, RecurrenceType, Category } from '../../types';
import { Clock, Calendar, Star } from 'lucide-react';
import { getTodayString } from '../../lib/dates';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialTask?: Task | null;
  categories: Category[];
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(30);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [isPriorityToday, setIsPriorityToday] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '');
      setEstimatedDuration(initialTask.estimatedDuration || 30);
      setRecurrence(initialTask.recurrence || 'none');
      setIsPriorityToday(Boolean(initialTask.isPriorityToday));
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory(categories[0]?.name || 'Work');
      setDueDate(defaultDate || getTodayString());
      setDueTime('');
      setEstimatedDuration(30);
      setRecurrence('none');
      setIsPriorityToday(false);
    }
    setError(null);
  }, [initialTask, isOpen, defaultDate, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: initialTask ? initialTask.completed : false,
        priority,
        category,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        estimatedDuration: Number(estimatedDuration) || undefined,
        recurrence,
        isPriorityToday,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'border-slate-300 text-slate-600 dark:text-slate-400' },
    { value: 'medium', label: 'Medium', color: 'border-blue-400 text-blue-600 dark:text-blue-400' },
    { value: 'high', label: 'High', color: 'border-amber-400 text-amber-600 dark:text-amber-400' },
    { value: 'urgent', label: 'Urgent', color: 'border-red-400 text-red-600 dark:text-red-400' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'New Task'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="input-smooth w-full px-3.5 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
            Description or notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add additional context, links, or sub-points..."
            className="input-smooth w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#747474]" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-smooth w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#747474]" /> Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="input-smooth w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Estimated Duration (min)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              className="input-smooth w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>
        </div>

        {/* Priority Radio Buttons */}
        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1.5">
            Priority
          </label>
          <div className="grid grid-cols-4 gap-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`btn-press py-1.5 text-xs font-semibold rounded-xl border text-center cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
                  priority === opt.value
                    ? 'border-[#FF7058] bg-[#FF7058]/10 text-[#FF7058] shadow-2xs scale-[1.02]'
                    : 'border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] text-[#747474] hover:border-[#FF7058]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recurrence & Priority Today Toggle */}
        <div className="pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="px-2 py-1 text-xs rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#747474] dark:text-[#A0A09B] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
            >
              <option value="none">No Recurrence</option>
              <option value="daily">Repeat Daily</option>
              <option value="weekdays">Repeat Weekdays</option>
              <option value="weekly">Repeat Weekly</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-[#262626] dark:text-[#F3F3F0] cursor-pointer group">
            <input
              type="checkbox"
              checked={isPriorityToday}
              onChange={(e) => setIsPriorityToday(e.target.checked)}
              className="rounded accent-[#FF7058] transition-transform duration-150 group-hover:scale-110"
            />
            <span className="flex items-center gap-1 transition-colors group-hover:text-[#FF7058]">
              <Star className="w-3.5 h-3.5 text-[#FFD166] fill-current" />
              Focus Priority Today
            </span>
          </label>
        </div>

        <div className="pt-3 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-press px-4 py-2 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-press px-5 py-2 text-xs font-semibold rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            {isSaving ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
