import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Flame,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  Printer,
  Calendar,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  History,
  FileText,
} from 'lucide-react';
import {
  Task,
  Habit,
  HabitRecord,
  FocusSession,
  Goal,
  DailyScore,
  WeeklyReview,
  UserAchievement,
} from '../../types';
import { getTodayString, formatDate } from '../../lib/dates';
import { EmptyState } from '../common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';

interface WeeklyReviewViewProps {
  tasks: Task[];
  habits: Habit[];
  habitRecords: HabitRecord[];
  focusSessions: FocusSession[];
  goals: Goal[];
  dailyScores: DailyScore[];
  userAchievements: UserAchievement[];
  weeklyReviews: WeeklyReview[];
  onSaveReview: (review: Omit<WeeklyReview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  onCarryForwardTask: (taskId: string, newDueDate: string) => Promise<void>;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({
  tasks,
  habits,
  habitRecords,
  focusSessions,
  goals,
  dailyScores,
  userAchievements,
  weeklyReviews,
  onSaveReview,
  onCarryForwardTask,
}) => {
  const { userProfile } = useAuth();
  const todayStr = getTodayString();

  // Calculate current week date range (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStartStr = monday.toISOString().split('T')[0];
  const weekEndStr = sunday.toISOString().split('T')[0];

  // Selected past review or current review
  const [selectedReviewId, setSelectedReviewId] = useState<string>('current');

  // Next week planning inputs
  const [reflectionWins, setReflectionWins] = useState('');
  const [reflectionImprovements, setReflectionImprovements] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [priorityInput, setPriorityInput] = useState('');
  const [nextWeekPriorities, setNextWeekPriorities] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [nextWeekGoals, setNextWeekGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute metrics for current week (weekStartStr to weekEndStr)
  const weekTasks = tasks.filter((t) => t.dueDate && t.dueDate >= weekStartStr && t.dueDate <= weekEndStr);
  const tasksCompleted = weekTasks.filter((t) => t.completed).length;
  const tasksTotal = weekTasks.length;

  const weekHabitRecords = habitRecords.filter(
    (r) => r.date >= weekStartStr && r.date <= weekEndStr
  );
  const habitsCompletedCount = weekHabitRecords.filter((r) => r.completed).length;
  const habitRate = weekHabitRecords.length > 0 ? Math.round((habitsCompletedCount / weekHabitRecords.length) * 100) : 0;

  const weekFocusSessions = focusSessions.filter(
    (s) => s.startedAt && s.startedAt.split('T')[0] >= weekStartStr && s.startedAt.split('T')[0] <= weekEndStr
  );
  const focusMinutes = weekFocusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const weekScores = dailyScores.filter((s) => s.date >= weekStartStr && s.date <= weekEndStr);
  const avgDailyScore = weekScores.length > 0 ? Math.round(weekScores.reduce((acc, s) => acc + s.score, 0) / weekScores.length) : 0;

  // Best day of week
  const dayTaskMap: { [day: string]: number } = {};
  for (const t of weekTasks) {
    if (t.completed && t.dueDate) {
      const dName = new Date(t.dueDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
      dayTaskMap[dName] = (dayTaskMap[dName] || 0) + 1;
    }
  }
  let bestDay = 'None yet';
  let bestDayCount = 0;
  for (const [d, count] of Object.entries(dayTaskMap)) {
    if (count > bestDayCount) {
      bestDayCount = count;
      bestDay = `${d} (${count} tasks)`;
    }
  }

  // Achievements unlocked this week
  const achievementsEarned = userAchievements.filter(
    (a) => a.unlocked && a.unlockedAt && a.unlockedAt.split('T')[0] >= weekStartStr
  ).length;

  // Prior week comparison if prior review exists
  const priorReview = weeklyReviews.find((r) => r.weekEnd < weekStartStr);

  // Unfinished tasks eligible to carry forward
  const unfinishedTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate <= weekEndStr
  );

  // Observations / Insights
  const generatedInsights: Array<{
    type: 'trend' | 'achievement' | 'focus' | 'habit';
    title: string;
    message: string;
  }> = [];
  if (tasksCompleted >= 5) {
    generatedInsights.push({
      type: 'achievement' as const,
      title: 'Strong Completion Velocity',
      message: `You completed ${tasksCompleted} tasks this week, demonstrating reliable momentum.`,
    });
  }
  if (focusMinutes >= 60) {
    generatedInsights.push({
      type: 'focus' as const,
      title: 'Deep Focus Immersion',
      message: `You logged ${Math.round((focusMinutes / 60) * 10) / 10} hours of dedicated focus intervals.`,
    });
  }
  if (habitRate >= 70) {
    generatedInsights.push({
      type: 'habit' as const,
      title: 'High Habit Consistency',
      message: `Your habits hit a ${habitRate}% completion rate across the week.`,
    });
  }
  if (generatedInsights.length === 0) {
    generatedInsights.push({
      type: 'trend' as const,
      title: 'Beginning of the Cycle',
      message: 'Keep logging daily actions to reveal detailed performance patterns.',
    });
  }

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priorityInput.trim()) return;
    setNextWeekPriorities((prev) => [...prev, priorityInput.trim()]);
    setPriorityInput('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    setNextWeekGoals((prev) => [...prev, goalInput.trim()]);
    setGoalInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveReview({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        tasksCompleted,
        tasksTotal,
        habitRate,
        focusMinutes,
        avgDailyScore,
        bestDay,
        achievementsEarned,
        reflectionWins,
        reflectionImprovements,
        nextWeekPriorities,
        nextWeekGoals,
        personalNotes,
        insights: generatedInsights,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedPastReview = weeklyReviews.find((r) => r.id === selectedReviewId);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header and Print / History Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF7058] mb-1">
            <Compass className="w-4 h-4" />
            <span>
              {formatDate(weekStartStr, userProfile?.dateFormat)} — {formatDate(weekEndStr, userProfile?.dateFormat)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Weekly Review & Insights
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Celebrate what worked, identify obstacles, and set clear intentions for next week.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Historical Reviews Dropdown */}
          {weeklyReviews.length > 0 && (
            <select
              value={selectedReviewId}
              onChange={(e) => setSelectedReviewId(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] cursor-pointer"
            >
              <option value="current">Current Week (In Progress)</option>
              {weeklyReviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.weekStart} to {r.weekEnd}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="btn-press flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] text-[#747474] hover:text-[#262626] dark:hover:text-white cursor-pointer shadow-2xs"
            title="Print weekly report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
        </div>
      </div>

      {/* Review Content */}
      {selectedPastReview ? (
        /* Display Past Saved Review */
        <div className="space-y-6">
          <div className="card-lift p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              Past Review: {selectedPastReview.weekStart} to {selectedPastReview.weekEnd}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824]">
                <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] font-mono">
                  {selectedPastReview.tasksCompleted} / {selectedPastReview.tasksTotal}
                </div>
                <div className="text-[11px] text-[#747474]">Tasks Completed</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824]">
                <div className="text-2xl font-black text-[#8EDCC0] font-mono">
                  {selectedPastReview.habitRate}%
                </div>
                <div className="text-[11px] text-[#747474]">Habit Rate</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824]">
                <div className="text-2xl font-black text-[#8BCBFA] font-mono">
                  {selectedPastReview.focusMinutes}m
                </div>
                <div className="text-[11px] text-[#747474]">Focus Time</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824]">
                <div className="text-2xl font-black text-[#FF7058] font-mono">
                  {selectedPastReview.avgDailyScore}
                </div>
                <div className="text-[11px] text-[#747474]">Avg Daily Score</div>
              </div>
            </div>

            {selectedPastReview.reflectionWins && (
              <div className="pt-2">
                <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] block mb-1">
                  What Worked Well:
                </span>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] whitespace-pre-line bg-[#F8F8F5] dark:bg-[#262824] p-3 rounded-xl">
                  {selectedPastReview.reflectionWins}
                </p>
              </div>
            )}

            {selectedPastReview.reflectionImprovements && (
              <div className="pt-2">
                <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] block mb-1">
                  What Could Be Improved:
                </span>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] whitespace-pre-line bg-[#F8F8F5] dark:bg-[#262824] p-3 rounded-xl">
                  {selectedPastReview.reflectionImprovements}
                </p>
              </div>
            )}

            {selectedPastReview.nextWeekPriorities?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] block mb-1">
                  Priorities Set:
                </span>
                <ul className="list-disc list-inside text-xs text-[#747474] dark:text-[#A0A09B] space-y-1">
                  {selectedPastReview.nextWeekPriorities.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Current Week In-Progress Review Form & Metrics */
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="card-lift p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF7058]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tasks</span>
              </div>
              <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] mt-1 font-mono">
                {tasksCompleted} <span className="text-xs font-normal text-[#747474]">/ {tasksTotal}</span>
              </div>
              <div className="text-[11px] text-[#747474] mt-0.5">
                {tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0}% completion
              </div>
            </div>

            <div className="card-lift p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8EDCC0]">
                <Flame className="w-4 h-4" />
                <span>Habit Rate</span>
              </div>
              <div className="text-2xl font-black text-[#8EDCC0] mt-1 font-mono">
                {habitRate}%
              </div>
              <div className="text-[11px] text-[#747474] mt-0.5">
                {habitsCompletedCount} check-ins logged
              </div>
            </div>

            <div className="card-lift p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8BCBFA]">
                <Clock className="w-4 h-4" />
                <span>Focus Time</span>
              </div>
              <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] mt-1 font-mono">
                {Math.round((focusMinutes / 60) * 10) / 10}h
              </div>
              <div className="text-[11px] text-[#747474] mt-0.5">
                {weekFocusSessions.length} sessions
              </div>
            </div>

            <div className="card-lift p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFD166]">
                <Sparkles className="w-4 h-4" />
                <span>Avg Daily Score</span>
              </div>
              <div className="text-2xl font-black text-[#FFD166] mt-1 font-mono">
                {avgDailyScore}
              </div>
              <div className="text-[11px] text-[#747474] mt-0.5">
                Best day: {bestDay}
              </div>
            </div>
          </div>

          {/* Evidence-Based Observations & Insights */}
          <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF7058]" />
              <span>Evidence-Based Observations</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {generatedInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] text-xs space-y-1"
                >
                  <div className="font-bold text-[#262626] dark:text-[#F3F3F0]">
                    {insight.title}
                  </div>
                  <p className="text-[#747474] dark:text-[#A0A09B] leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Carry Forward Unfinished Tasks */}
          {unfinishedTasks.length > 0 && (
            <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
              <h2 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0] flex items-center justify-between">
                <span>Carry Forward Unfinished Tasks</span>
                <span className="text-xs text-[#747474] font-normal">
                  {unfinishedTasks.length} open items
                </span>
              </h2>
              <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
                Roll selected incomplete tasks into next week's schedule with one click.
              </p>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {unfinishedTasks.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] text-xs"
                  >
                    <span className="truncate font-medium text-[#262626] dark:text-[#F3F3F0]">
                      {t.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => onCarryForwardTask(t.id, todayStr)}
                      className="btn-press px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#FF7058]/10 text-[#FF7058] hover:bg-[#FF7058] hover:text-white transition-all cursor-pointer whitespace-nowrap ml-2"
                    >
                      Carry to Next Week →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualitative Reflections Form */}
          <div className="card-lift p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              Weekly Retrospective
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
                What worked well this week?
              </label>
              <textarea
                rows={2}
                value={reflectionWins}
                onChange={(e) => setReflectionWins(e.target.value)}
                placeholder="Key accomplishments, focused sessions, or habits that felt effortless..."
                className="input-smooth w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
                What obstacles arose, and what could be improved?
              </label>
              <textarea
                rows={2}
                value={reflectionImprovements}
                onChange={(e) => setReflectionImprovements(e.target.value)}
                placeholder="Distractions, unrealistic commitments, or energy dips to address..."
                className="input-smooth w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
              />
            </div>

            {/* Next Week Priorities */}
            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
                Top Priorities for Next Week
              </label>
              <form onSubmit={handleAddPriority} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={priorityInput}
                  onChange={(e) => setPriorityInput(e.target.value)}
                  placeholder="e.g. Launch prototype to early reviewers"
                  className="input-smooth flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
                />
                <button
                  type="submit"
                  className="btn-press px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#262626] dark:bg-white text-white dark:text-[#262626] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>

              {nextWeekPriorities.length > 0 && (
                <div className="space-y-1">
                  {nextWeekPriorities.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#F8F8F5] dark:bg-[#262824] text-xs"
                    >
                      <span>{p}</span>
                      <button
                        type="button"
                        onClick={() => setNextWeekPriorities((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-[#747474] hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
                Personal Notes & Thoughts
              </label>
              <textarea
                rows={2}
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Any general thoughts, ideas, or reminders..."
                className="input-smooth w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Weekly review saved (+75 XP awarded)
                </span>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-press px-5 py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Weekly Review'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
