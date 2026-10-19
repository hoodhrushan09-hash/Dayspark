import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Goal, Milestone, GoalStatus, Category } from '../../types';
import { Plus, Trash2, Calendar, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialGoal?: Goal | null;
  categories: Category[];
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<GoalStatus>('active');
  const [milestones, setMilestones] = useState<{ id: string; title: string; completed: boolean }[]>(
    []
  );
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category);
      setTargetDate(initialGoal.targetDate || '');
      setStatus(initialGoal.status);
      setMilestones(initialGoal.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.name || 'Personal');
      setTargetDate('');
      setStatus('active');
      setMilestones([]);
    }
    setNewMilestoneText('');
    setError(null);
  }, [initialGoal, isOpen, categories]);

  const addMilestone = () => {
    if (!newMilestoneText.trim()) return;
    setMilestones((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        title: newMilestoneText.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneText('');
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required.');
      return;
    }

    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetDate: targetDate || undefined,
        status,
        milestones,
        progress,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save goal:', err);
      setError('Failed to save goal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialGoal ? 'Edit Goal' : 'Create New Goal'}
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
            Goal Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete System Design Certification"
            className="input-smooth w-full px-3.5 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
            Why is this goal important?
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Clarify your motivation and expected outcome..."
            className="input-smooth w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
          />
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
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#747474]" /> Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input-smooth w-full px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>
        </div>

        {/* Milestones checklist builder */}
        <div className="pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B]">
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#B8A7F9]" />
            Milestones ({milestones.length})
          </label>

          <div className="space-y-1.5 mb-2 max-h-40 overflow-y-auto">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="group/m flex items-center justify-between p-2 rounded-xl bg-[#F8F8F5] dark:bg-[#282A26] border border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#B8A7F9]/40 transition-all duration-150 text-xs"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={m.completed}
                    onChange={() =>
                      setMilestones((prev) =>
                        prev.map((item) =>
                          item.id === m.id ? { ...item, completed: !item.completed } : item
                        )
                      )
                    }
                    className="rounded accent-[#FF7058] transition-transform duration-150 hover:scale-110 cursor-pointer"
                  />
                  <span className={m.completed ? 'line-through text-[#747474]' : 'font-medium'}>
                    {m.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="text-[#747474] hover:text-red-500 transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMilestone();
                }
              }}
              placeholder="Add a milestone (e.g. Finish module 1)"
              className="input-smooth flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
            />
            <button
              type="button"
              onClick={addMilestone}
              className="btn-press px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
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
            className="btn-press px-5 py-2 text-xs font-semibold rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 transition disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            {isSaving ? 'Saving...' : initialGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
