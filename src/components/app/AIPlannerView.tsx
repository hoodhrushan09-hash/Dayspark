import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  RotateCcw,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
} from 'lucide-react';
import { Task, Priority, ScheduledBlock, PlannerPlan } from '../../types';
import {
  generateDailyPlan,
  acceptAndSavePlan,
  timeToMinutes,
  minutesToTime,
} from '../../services/plannerService';
import { getTodayString } from '../../lib/dates';
import { useAuth } from '../../contexts/AuthContext';

interface AIPlannerViewProps {
  tasks: Task[];
  onTasksUpdated?: () => void;
  onNavigateToCalendar?: () => void;
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  tasks,
  onTasksUpdated,
  onNavigateToCalendar,
}) => {
  const { currentUser } = useAuth();
  const todayStr = getTodayString();

  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Active generated plan state
  const [activePlan, setActivePlan] = useState<{
    summary: string;
    blocks: ScheduledBlock[];
    conflictWarnings: string[];
    isManualFallback?: boolean;
    setupMessage?: string;
  } | null>(null);

  const promptSuggestions = [
    'Need to finish slide deck (90m), gym workout (45m), 1-on-1 team call, and clear inbox.',
    'Heavy deep-work day: code review for 2 hours, bug fixing, write API docs before 4pm.',
    'Balanced day: 3 study sessions of 45m with short breaks, plus personal errands.',
    'Catch-up day: review overdue tasks, reply to urgent emails, and plan the remainder of the week.',
  ];

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    setSavedSuccessMessage(null);

    try {
      const result = await generateDailyPlan({
        date,
        userPrompt: userPrompt.trim(),
        startTime,
        endTime,
        existingTasks: tasks,
      });

      setActivePlan({
        summary: result.planSummary,
        blocks: result.scheduledBlocks,
        conflictWarnings: result.conflictWarnings,
        isManualFallback: result.isManualFallback,
        setupMessage: result.setupMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Replan remaining day from current time
  const handleReplanRemainingDay = () => {
    if (!activePlan) return;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const roundedMins = Math.ceil(currentMins / 15) * 15; // round up to nearest 15 mins

    let pointer = roundedMins;
    const updatedBlocks = activePlan.blocks.map((block) => {
      const bStart = pointer;
      const bEnd = pointer + block.durationMinutes;
      pointer = bEnd + 10;
      return {
        ...block,
        startTime: minutesToTime(bStart),
        endTime: minutesToTime(bEnd),
      };
    });

    const endMins = timeToMinutes(endTime);
    const newWarnings: string[] = [];
    if (pointer > endMins) {
      newWarnings.push(
        `Replanned schedule extends past ${endTime}. Consider trimming block durations or carrying low-priority items forward.`
      );
    }

    setActivePlan({
      ...activePlan,
      summary: `Replanned remaining day starting from ${minutesToTime(roundedMins)}.`,
      blocks: updatedBlocks,
      conflictWarnings: newWarnings,
    });
  };

  // Edit / update single block
  const handleUpdateBlock = (index: number, updates: Partial<ScheduledBlock>) => {
    if (!activePlan) return;
    const updated = [...activePlan.blocks];
    updated[index] = { ...updated[index], ...updates };
    setActivePlan({ ...activePlan, blocks: updated });
  };

  const handleRemoveBlock = (index: number) => {
    if (!activePlan) return;
    const updated = activePlan.blocks.filter((_, i) => i !== index);
    setActivePlan({ ...activePlan, blocks: updated });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!activePlan) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= activePlan.blocks.length) return;

    const copy = [...activePlan.blocks];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    // Recalculate start and end times sequentially
    let pointer = timeToMinutes(startTime);
    const resequenced = copy.map((block) => {
      const bStart = pointer;
      const bEnd = pointer + block.durationMinutes;
      pointer = bEnd + 10;
      return {
        ...block,
        startTime: minutesToTime(bStart),
        endTime: minutesToTime(bEnd),
      };
    });

    setActivePlan({ ...activePlan, blocks: resequenced });
  };

  // Accept and save approved schedule into DaySpark tasks & calendar
  const handleAcceptPlan = async () => {
    if (!currentUser || !activePlan) return;
    setIsSaving(true);
    try {
      const planPayload: PlannerPlan = {
        id: `plan_${Date.now()}`,
        userId: currentUser.uid,
        date,
        originalPrompt: userPrompt,
        planSummary: activePlan.summary,
        totalPlannedMinutes: activePlan.blocks.reduce((acc, b) => acc + b.durationMinutes, 0),
        availableMinutes: Math.max(30, timeToMinutes(endTime) - timeToMinutes(startTime)),
        conflictWarnings: activePlan.conflictWarnings,
        scheduledBlocks: activePlan.blocks,
        status: 'accepted',
        createdAt: new Date().toISOString(),
      };

      const { createdCount, updatedCount } = await acceptAndSavePlan(
        currentUser.uid,
        planPayload,
        tasks
      );

      setSavedSuccessMessage(
        `Plan approved! Scheduled ${createdCount} new tasks and updated ${updatedCount} existing items on your calendar.`
      );
      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalPlannedMinutes = activePlan
    ? activePlan.blocks.reduce((acc, b) => acc + b.durationMinutes, 0)
    : 0;
  const availableMinutes = Math.max(30, timeToMinutes(endTime) - timeToMinutes(startTime));
  const workloadRatio = Math.min(100, Math.round((totalPlannedMinutes / availableMinutes) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FF7058]/10 text-[#FF7058] dark:bg-[#FF7058]/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              AI Personal Planner
            </h1>
          </div>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Turn your messy to-dos and thoughts into a realistic, conflict-free daily schedule.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#747474] dark:text-[#A0A09B] mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-sm text-[#262626] dark:text-[#F3F3F0] focus:ring-2 focus:ring-[#FF7058] outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#747474] dark:text-[#A0A09B] mb-1">
              Start Work
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-sm text-[#262626] dark:text-[#F3F3F0] focus:ring-2 focus:ring-[#FF7058] outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#747474] dark:text-[#A0A09B] mb-1">
              End Work
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-sm text-[#262626] dark:text-[#F3F3F0] focus:ring-2 focus:ring-[#FF7058] outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#747474] dark:text-[#A0A09B] mb-1.5">
            Describe what you need to accomplish today (in plain natural language)
          </label>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={4}
            placeholder="e.g., I have to prepare the client proposal (approx 2 hours), make dentist appointment at 2pm, run 5km, and fix bug #104. Urgent client email needs to go out first thing."
            className="w-full px-4 py-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-sm text-[#262626] dark:text-[#F3F3F0] focus:ring-2 focus:ring-[#FF7058] outline-hidden resize-none transition-all"
          />
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#747474] dark:text-[#A0A09B]">
            Need inspiration? Try one of these:
          </span>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setUserPrompt(suggestion)}
                className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-[#282A26] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] dark:text-[#A0A09B] hover:text-[#FF7058] hover:border-[#FF7058]/40 transition-colors text-left"
              >
                "{suggestion.slice(0, 48)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B]">
          <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
            Window: {startTime} - {endTime} ({Math.round(availableMinutes / 60 * 10) / 10} hours)
          </span>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !userPrompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF7058] to-[#FF8C75] text-white font-bold text-xs shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Crafting Your Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Smart Schedule</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs font-semibold">{savedSuccessMessage}</p>
          </div>
          {onNavigateToCalendar && (
            <button
              onClick={onNavigateToCalendar}
              className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shrink-0"
            >
              View in Calendar
            </button>
          )}
        </div>
      )}

      {/* Generated Schedule Review Section */}
      {activePlan && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Summary & Workload Overview */}
          <div className="p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7058]">
                  Proposed Day Plan
                </span>
                <p className="text-sm font-semibold text-[#262626] dark:text-[#F3F3F0] mt-0.5">
                  {activePlan.summary}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReplanRemainingDay}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#282A26] text-xs font-semibold text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white transition-colors"
                  title="Replan remaining tasks starting from now"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replan from Now</span>
                </button>
              </div>
            </div>

            {/* Workload Meter */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#747474] dark:text-[#A0A09B] mb-1">
                <span>Planned Workload ({totalPlannedMinutes} mins)</span>
                <span>
                  {workloadRatio}% of available working time ({availableMinutes} mins)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E8E7E0] dark:bg-[#2E302B] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    workloadRatio > 100
                      ? 'bg-rose-500'
                      : workloadRatio > 80
                      ? 'bg-amber-500'
                      : 'bg-[#FF7058]'
                  }`}
                  style={{ width: `${Math.min(100, workloadRatio)}%` }}
                />
              </div>
            </div>

            {/* Conflict Warnings */}
            {activePlan.conflictWarnings && activePlan.conflictWarnings.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Scheduling Considerations Detected</span>
                </div>
                <ul className="text-xs list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
                  {activePlan.conflictWarnings.map((warning, wIdx) => (
                    <li key={wIdx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Time Blocks List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-[#747474] dark:text-[#A0A09B]">
                Scheduled Focus Blocks ({activePlan.blocks.length})
              </span>
              <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                Reorder or tweak before accepting
              </span>
            </div>

            {activePlan.blocks.map((block, idx) => (
              <div
                key={block.id || idx}
                className={`p-4 rounded-2xl border transition-all ${
                  block.isUrgent
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Time pill */}
                    <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#282A26] border border-[#E8E7E0] dark:border-[#2E302B] text-center shrink-0">
                      <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] font-mono">
                        {block.startTime}
                      </span>
                      <span className="text-[10px] text-[#747474] dark:text-[#A0A09B] font-mono">
                        {block.endTime}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          value={block.title}
                          onChange={(e) => handleUpdateBlock(idx, { title: e.target.value })}
                          className="font-bold text-sm text-[#262626] dark:text-[#F3F3F0] bg-transparent border-b border-transparent hover:border-[#E8E7E0] dark:hover:border-[#2E302B] focus:border-[#FF7058] outline-hidden transition-colors"
                        />
                        {block.isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300">
                            Urgent
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474] dark:text-[#A0A09B]">
                          {block.category}
                        </span>
                        <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
                          · {block.durationMinutes}m
                        </span>
                      </div>

                      {block.reasoning && (
                        <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1">
                          {block.reasoning}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Block Controls: Reorder & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBlock(idx, 'up')}
                      className="p-1 rounded-lg text-[#747474] hover:text-[#262626] dark:hover:text-white disabled:opacity-30 hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]"
                      title="Move block earlier"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === activePlan.blocks.length - 1}
                      onClick={() => handleMoveBlock(idx, 'down')}
                      className="p-1 rounded-lg text-[#747474] hover:text-[#262626] dark:hover:text-white disabled:opacity-30 hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]"
                      title="Move block later"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(idx)}
                      className="p-1 rounded-lg text-[#747474] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
                      title="Remove block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
              Ready? Accepting adds these items to your tasks and calendar time blocks.
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActivePlan(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleAcceptPlan}
                disabled={isSaving || activePlan.blocks.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF7058] hover:bg-[#e65e47] text-white font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving Plan...' : 'Accept & Save Plan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
