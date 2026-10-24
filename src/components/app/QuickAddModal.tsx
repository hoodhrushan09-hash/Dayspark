import React, { useState } from 'react';
import { Plus, Calendar, Clock, Star, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Priority, Category } from '../../types';
import { getTodayString } from '../../lib/dates';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (task: {
    title: string;
    description?: string;
    priority: Priority;
    category: string;
    dueDate?: string;
    estimatedDuration?: number;
  }) => Promise<void>;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
}) => {
  const todayStr = getTodayString();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(categories[0]?.name || 'Work');
  const [dueDate, setDueDate] = useState(todayStr);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(25);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Date helpers
  const handleSetTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSetNextWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate: dueDate || undefined,
        estimatedDuration: Number(estimatedDuration) || undefined,
      });
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Add Task" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
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
            placeholder="What needs to be done? (Press Enter to save)"
            className="input-smooth w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
            Notes or link (optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context..."
            className="input-smooth w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        {/* Due Date Presets */}
        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#747474]" /> Due Date
            </span>
            <span className="text-[10px] font-normal text-[#747474] dark:text-[#A0A09B]">Optional</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => setDueDate(todayStr)}
              className={`btn-press px-2.5 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                dueDate === todayStr
                  ? 'bg-[#FF7058] text-white border-[#FF7058]'
                  : 'border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleSetTomorrow}
              className="btn-press px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={handleSetNextWeek}
              className="btn-press px-2.5 py-1 text-xs font-medium rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] cursor-pointer"
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => setDueDate('')}
              className={`btn-press px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                !dueDate
                  ? 'bg-[#FF7058] text-white border-[#FF7058]'
                  : 'border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B]'
              }`}
            >
              No Date
            </button>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-smooth w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        {/* Priority & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-press px-3.5 py-1.5 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#262824] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-press px-5 py-1.5 text-xs font-semibold rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Adding...' : 'Add Task (Enter)'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
