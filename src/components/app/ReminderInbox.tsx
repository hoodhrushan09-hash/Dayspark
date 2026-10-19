import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  RotateCcw,
  Plus,
  AlertCircle,
  X,
  Volume2,
  Check,
} from 'lucide-react';
import { Reminder, ReminderStatus, Task } from '../../types';
import {
  createReminder,
  snoozeReminder,
  dismissReminder,
  completeReminder,
  deleteReminder,
  requestNotificationPermission,
} from '../../services/reminderService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/dates';

interface ReminderInboxProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: Reminder[];
  tasks?: Task[];
}

export const ReminderInbox: React.FC<ReminderInboxProps> = ({
  isOpen,
  onClose,
  reminders,
  tasks = [],
}) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'snoozed' | 'history'>('pending');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRemindAt, setNewRemindAt] = useState('');
  const [associatedTaskId, setAssociatedTaskId] = useState('');

  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const nowIso = new Date().toISOString();

  const pendingReminders = reminders.filter((r) => r.status === 'pending');
  const snoozedReminders = reminders.filter((r) => r.status === 'snoozed');
  const historyReminders = reminders.filter(
    (r) => r.status === 'completed' || r.status === 'dismissed'
  );

  const handleEnableSystemNotifications = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTitle.trim() || !newRemindAt) return;

    await createReminder(currentUser.uid, {
      title: newTitle.trim(),
      remindAt: newRemindAt,
      associatedType: associatedTaskId ? 'task' : 'custom',
      associatedId: associatedTaskId || undefined,
    });

    setNewTitle('');
    setNewRemindAt('');
    setAssociatedTaskId('');
    setIsAddingNew(false);
  };

  const displayedList =
    activeTab === 'pending'
      ? pendingReminders
      : activeTab === 'snoozed'
      ? snoozedReminders
      : historyReminders;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#FFFDF9] dark:bg-[#1A1B19] h-full shadow-2xl border-l border-[#E8E7E0] dark:border-[#2E302B] flex flex-col p-6 space-y-5 animate-in slide-in-from-right duration-200 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FF7058]/10 text-[#FF7058]">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#262626] dark:text-[#F3F3F0]">
                Reminders & Inbox
              </h2>
              <span className="text-xs text-[#747474]">
                {pendingReminders.length} active reminder(s)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Permission Banner */}
        {permissionStatus !== 'granted' && (
          <div className="p-3.5 rounded-2xl bg-[#FF7058]/8 border border-[#FF7058]/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#FF7058] shrink-0" />
              <span className="text-[#262626] dark:text-[#F3F3F0]">
                Allow browser alerts for scheduled reminders?
              </span>
            </div>
            <button
              onClick={handleEnableSystemNotifications}
              className="px-2.5 py-1 rounded-lg bg-[#FF7058] text-white font-bold text-[11px] hover:bg-[#e65e47] shrink-0 transition-colors"
            >
              Enable
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl text-xs font-semibold">
            {(['pending', 'snoozed', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-[#20221F] text-[#FF7058] font-bold shadow-2xs'
                    : 'text-[#747474]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF7058] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Alert</span>
          </button>
        </div>

        {/* Quick Add Form */}
        {isAddingNew && (
          <form
            onSubmit={handleCreateReminder}
            className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] shadow-xs space-y-3 animate-in fade-in"
          >
            <h4 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
              Create New Reminder
            </h4>
            <input
              type="text"
              required
              placeholder="What do you need to be reminded of?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs outline-hidden"
            />
            <input
              type="datetime-local"
              required
              value={newRemindAt}
              onChange={(e) => setNewRemindAt(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs outline-hidden"
            />

            {tasks.length > 0 && (
              <select
                value={associatedTaskId}
                onChange={(e) => setAssociatedTaskId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs outline-hidden"
              >
                <option value="">Link to task (optional)...</option>
                {tasks.slice(0, 15).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-2.5 py-1 text-xs text-[#747474]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 rounded-xl bg-[#FF7058] text-white font-bold text-xs hover:bg-[#e65e47]"
              >
                Schedule
              </button>
            </div>
          </form>
        )}

        {/* Reminders List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto">
          {displayedList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#747474] border border-dashed border-[#E8E7E0] dark:border-[#2E302B] rounded-2xl">
              No reminders in this tab.
            </div>
          ) : (
            displayedList.map((rem) => {
              const isPastDue = rem.remindAt < nowIso && rem.status === 'pending';

              return (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    isPastDue
                      ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20'
                      : 'border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                        {rem.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#747474] mt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-[#FF7058]" />
                        <span>{new Date(rem.remindAt).toLocaleString()}</span>
                        {isPastDue && (
                          <span className="text-rose-500 font-bold font-sans">· Overdue</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        if (currentUser) await deleteReminder(currentUser.uid, rem.id);
                      }}
                      className="text-[#A0A09B] hover:text-rose-500 p-1"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Actions: Complete, Snooze, Dismiss */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E7E0]/60 dark:border-[#2E302B]/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          if (currentUser) await snoozeReminder(currentUser.uid, rem.id, 15);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474] hover:text-[#262626] font-semibold"
                      >
                        +15m
                      </button>
                      <button
                        onClick={async () => {
                          if (currentUser) await snoozeReminder(currentUser.uid, rem.id, 60);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474] hover:text-[#262626] font-semibold"
                      >
                        +1h
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={async () => {
                          if (currentUser) await dismissReminder(currentUser.uid, rem.id);
                        }}
                        className="text-[#747474] hover:underline"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={async () => {
                          if (currentUser) await completeReminder(currentUser.uid, rem.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] hover:bg-emerald-600 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
