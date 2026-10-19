import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Habit, HabitFrequency, Category } from '../../types';
import { Flame } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialHabit?: Habit | null;
  categories: Category[];
}

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
  categories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [color, setColor] = useState('#8EDCC0');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = ['#8EDCC0', '#FF7058', '#FFD166', '#8BCBFA', '#B8A7F9'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setDescription(initialHabit.description || '');
      setCategory(initialHabit.category);
      setColor(initialHabit.color || '#8EDCC0');
      setFrequency(initialHabit.frequency);
      setCustomDays(initialHabit.customDays || [1, 2, 3, 4, 5]);
    } else {
      setName('');
      setDescription('');
      setCategory(categories[0]?.name || 'Health');
      setColor('#8EDCC0');
      setFrequency('daily');
      setCustomDays([1, 2, 3, 4, 5]);
    }
    setError(null);
  }, [initialHabit, isOpen, categories]);

  const toggleDay = (dayIdx: number) => {
    if (customDays.includes(dayIdx)) {
      setCustomDays(customDays.filter((d) => d !== dayIdx));
    } else {
      setCustomDays([...customDays, dayIdx]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        color,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined,
      });
      onClose();
    } catch (err: unknown) {
      console.error('Failed to save habit:', err);
      setError('Failed to save habit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialHabit ? 'Edit Habit' : 'New Habit'}
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
            Habit Name *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 20-minute morning walk"
            className="input-smooth w-full px-3.5 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
            Why build this habit?
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Keep it small and consistent..."
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
              <option value="Health">Health</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Color Accent
            </label>
            <div className="flex items-center gap-2 mt-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform duration-150 hover:scale-125 active:scale-95 cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#FF7058]' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1.5 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#FF7058]" /> Schedule
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'daily', label: 'Every Day' },
                { id: 'weekdays', label: 'Weekdays' },
                { id: 'custom', label: 'Custom Days' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFrequency(opt.id)}
                className={`btn-press py-1.5 text-xs font-medium rounded-xl border text-center cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
                  frequency === opt.id
                    ? 'border-[#FF7058] bg-[#FF7058]/10 text-[#FF7058] shadow-2xs font-semibold'
                    : 'border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {frequency === 'custom' && (
            <div className="flex items-center justify-between gap-1 mt-3 p-2 bg-[#F8F8F5] dark:bg-[#282A26] rounded-xl">
              {dayNames.map((name, idx) => {
                const isSelected = customDays.includes(idx);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`btn-press w-8 h-8 rounded-lg text-xs font-semibold cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF7058] text-white shadow-2xs scale-105'
                        : 'text-[#747474] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
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
            {isSaving ? 'Saving...' : initialHabit ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
