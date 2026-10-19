import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { Modal } from '../common/Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', description: 'Quick add a new task from anywhere' },
    { key: '/  or  ⌘K', description: 'Open Global Search & Command Palette' },
    { key: '?', description: 'View keyboard shortcuts reference' },
    { key: 'Esc', description: 'Close active modal, drawer, or search' },
    { key: '1', description: 'Navigate to Today view' },
    { key: '2', description: 'Navigate to Upcoming view' },
    { key: '3', description: 'Navigate to Calendar view' },
    { key: '4', description: 'Navigate to My Tasks view' },
    { key: '5', description: 'Navigate to Goals view' },
    { key: '6', description: 'Navigate to Habits view' },
    { key: '7', description: 'Navigate to Focus Timer' },
    { key: '8', description: 'Navigate to Weekly Review & Insights' },
    { key: '9', description: 'Navigate to Achievements' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="md">
      <div className="space-y-4">
        <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
          Navigate and manage DaySpark with rapid keyboard controls. Shortcuts are disabled automatically while typing in text fields.
        </p>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] text-xs"
            >
              <span className="text-[#262626] dark:text-[#F3F3F0] font-medium">
                {sc.description}
              </span>
              <kbd className="px-2 py-1 rounded-md bg-white dark:bg-[#1A1B19] border border-[#E8E7E0] dark:border-[#383A35] text-[#262626] dark:text-[#F3F3F0] font-mono font-bold text-[11px] shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-press px-4 py-2 text-xs font-semibold rounded-xl bg-[#FF7058] text-white hover:bg-[#F06148] cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </Modal>
  );
};
