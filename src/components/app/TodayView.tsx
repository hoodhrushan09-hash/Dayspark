import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Star,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Sliders,
  Flame,
  Target,
  Award,
  Zap,
  Play,
  TrendingUp,
  Folder,
  BookOpen,
  DollarSign,
  Bell,
  Check,
} from 'lucide-react';
import {
  Task,
  Category,
  AppView,
  Habit,
  HabitRecord,
  Goal,
  DailyScore,
  XPTransaction,
  UserAchievement,
  DashboardConfig,
  Priority,
  Project,
  Note,
  Expense,
  Reminder,
} from '../../types';
import { getGreeting, getTodayString, formatDate } from '../../lib/dates';
import { calculateProductivityStats } from '../../lib/stats';
import { useAuth } from '../../contexts/AuthContext';
import { ProductivityScoreCard } from './ProductivityScoreCard';
import { XPProgressionWidget } from './XPProgressionWidget';
import { ALL_ACHIEVEMENTS } from '../../lib/achievements';
import { DEFAULT_DASHBOARD_CONFIG } from '../../services/userService';

interface TodayViewProps {
  tasks: Task[];
  categories: Category[];
  habits?: Habit[];
  habitRecords?: HabitRecord[];
  goals?: Goal[];
  dailyScores?: DailyScore[];
  todayScore: DailyScore;
  yesterdayScore?: DailyScore;
  weeklyScores: DailyScore[];
  totalXP: number;
  recentXPTransactions: XPTransaction[];
  userAchievements: UserAchievement[];
  dashboardConfig?: DashboardConfig;
  projects?: Project[];
  notes?: Note[];
  expenses?: Expense[];
  reminders?: Reminder[];
  onToggleTask: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onQuickAddTask: (
    title: string,
    priority: Priority,
    category: string
  ) => Promise<void>;
  onOpenNewTaskModal: (defaultDate?: string) => void;
  onToggleHabitDay?: (
    habitId: string,
    date: string,
    currentlyCompleted: boolean
  ) => Promise<void>;
  onOpenCustomizeDashboard: () => void;
  onNavigate: (view: AppView) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  categories,
  habits = [],
  habitRecords = [],
  goals = [],
  dailyScores = [],
  todayScore,
  yesterdayScore,
  weeklyScores,
  totalXP,
  recentXPTransactions,
  userAchievements,
  dashboardConfig,
  projects = [],
  notes = [],
  expenses = [],
  reminders = [],
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onQuickAddTask,
  onOpenNewTaskModal,
  onToggleHabitDay,
  onOpenCustomizeDashboard,
  onNavigate,
}) => {
  const { userProfile, currentUser } = useAuth();
  const todayStr = getTodayString();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [quickCategory, setQuickCategory] = useState(
    categories[0]?.name || 'Work'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const greeting = getGreeting();
  const userName =
    userProfile?.displayName || currentUser?.displayName || 'Friend';

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  );
  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr)
    .slice(0, 3);

  const stats = calculateProductivityStats(tasks, [], [], [], 7, todayStr);

  const priorityTask =
    todayTasks.find((t) => t.isPriorityToday && !t.completed) ||
    todayTasks.find((t) => t.priority === 'urgent' && !t.completed) ||
    todayTasks.find((t) => !t.completed);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onQuickAddTask(quickTitle.trim(), quickPriority, quickCategory);
      setQuickTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine active widgets configuration with automatic merging of new modules
  const activeWidgetList = (() => {
    const userWidgets = dashboardConfig?.widgets || [];
    if (userWidgets.length === 0) return [...DEFAULT_DASHBOARD_CONFIG.widgets];
    const userMap = new Map(userWidgets.map((w) => [w.id, w]));
    const merged = [...userWidgets];
    DEFAULT_DASHBOARD_CONFIG.widgets.forEach((dw) => {
      if (!userMap.has(dw.id)) {
        merged.push({ ...dw, order: merged.length + 1 });
      }
    });
    return merged;
  })();

  const sortedWidgets = activeWidgetList
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  // Quick stats calculations for other widgets
  const activeHabits = habits.filter((h) => !h.archived);
  const completedHabitsToday = activeHabits.filter((h) =>
    habitRecords.some((r) => r.habitId === h.id && r.date === todayStr && r.completed)
  ).length;

  const activeGoalsList = goals.filter(
    (g) => g.status === 'active' || !g.status
  );

  const unlockedCount = userAchievements.filter((a) => a.unlocked).length;
  const recentUnlockedBadges = userAchievements
    .filter((a) => a.unlocked)
    .sort(
      (a, b) =>
        new Date(b.unlockedAt || '').getTime() -
        new Date(a.unlockedAt || '').getTime()
    )
    .slice(0, 3)
    .map((ua) => ALL_ACHIEVEMENTS.find((def) => def.key === ua.achievementKey))
    .filter(Boolean);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Personalized Greeting Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF7058] mb-1">
            <Sparkles className="w-3.5 h-3.5 transition-transform duration-300 hover:rotate-12" />
            <span>{formatDate(todayStr, userProfile?.dateFormat)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            {greeting}, {userName}.
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Let's make today count. Take things one thoughtful step at a time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Dashboard Customize button */}
          <button
            onClick={onOpenCustomizeDashboard}
            className="btn-press px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] text-xs font-semibold text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white flex items-center gap-1.5 shadow-2xs hover:border-[#FF7058]/40 cursor-pointer"
            title="Customize dashboard layout and widgets"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FF7058]" />
            <span>Customize</span>
          </button>

          {/* New Task button */}
          <button
            onClick={() => onOpenNewTaskModal(todayStr)}
            className="btn-press group px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Overdue alert banner if any */}
      {overdueTasks.length > 0 && (
        <div className="card-lift p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200 group">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>
              You have <strong>{overdueTasks.length}</strong> unfinished task
              {overdueTasks.length > 1 ? 's' : ''} from previous days.
            </span>
          </div>
          <button
            onClick={() => onNavigate('upcoming')}
            className="font-bold underline hover:text-amber-900 dark:hover:text-white cursor-pointer self-start sm:self-auto transition-transform duration-150 group-hover:translate-x-0.5"
          >
            Review overdue tasks →
          </button>
        </div>
      )}

      {/* Metric summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-lift p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#8EDCC0]/60 cursor-default">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Completed Today
          </div>
          <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] mt-1.5 font-mono">
            {stats.tasksCompletedToday}
          </div>
          <div className="text-[11px] text-[#8EDCC0] font-semibold mt-1">
            {stats.dailyCompletionRate}% daily rate
          </div>
        </div>

        <div className="card-lift p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#8BCBFA]/60 cursor-default">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Tasks Remaining
          </div>
          <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] mt-1.5 font-mono">
            {stats.tasksRemainingToday}
          </div>
          <div className="text-[11px] text-[#747474] dark:text-[#A0A09B] mt-1">
            {todayTasks.length} scheduled total
          </div>
        </div>

        <div className="card-lift p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#FF7058]/60 cursor-default">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Focus Time Today
          </div>
          <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] mt-1.5 font-mono">
            {stats.focusMinutesToday}m
          </div>
          <div className="text-[11px] text-[#FF7058] font-semibold mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{stats.totalFocusSessionsToday} sessions</span>
          </div>
        </div>

        <div className="card-lift p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#FFD166]/60 cursor-default">
          <div className="text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            Habits Done
          </div>
          <div className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] mt-1.5 font-mono">
            {completedHabitsToday}/{activeHabits.length}
          </div>
          <div className="text-[11px] text-[#FFD166] font-semibold mt-1">
            {activeHabits.length > 0
              ? Math.round((completedHabitsToday / activeHabits.length) * 100)
              : 0}
            % finished
          </div>
        </div>
      </div>

      {/* DYNAMIC DASHBOARD WIDGETS (Sorted according to user customization) */}
      <div className="space-y-6">
        {sortedWidgets.map((widget) => {
          switch (widget.id) {
            case 'score':
              return (
                <div key="score">
                  <ProductivityScoreCard
                    todayScore={todayScore}
                    yesterdayScore={yesterdayScore}
                    weeklyScores={weeklyScores}
                  />
                </div>
              );

            case 'xp':
              return (
                <div key="xp">
                  <XPProgressionWidget
                    totalXP={totalXP}
                    recentTransactions={recentXPTransactions}
                  />
                </div>
              );

            case 'tasks':
              return (
                <div key="tasks" className="space-y-4">
                  {/* Priority Focus Hero Card */}
                  {priorityTask && (
                    <div className="card-lift p-5 rounded-2xl border border-[#FF7058]/30 bg-gradient-to-r from-[#FFFDF9] via-[#FFF8F6] to-[#FFFDF9] dark:from-[#222320] dark:via-[#262422] dark:to-[#222320] shadow-xs hover:border-[#FF7058]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#FF7058] text-white flex items-center gap-1 shadow-2xs">
                            <Star className="w-3 h-3 fill-current transition-transform duration-200 group-hover:scale-110" />
                            Most Important Today
                          </span>
                          <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
                            {priorityTask.category}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#FF7058]">
                          {priorityTask.title}
                        </h3>
                        {priorityTask.description && (
                          <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-xl line-clamp-1">
                            {priorityTask.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => onToggleTask(priorityTask)}
                          className="btn-press px-4 py-2 rounded-xl bg-white dark:bg-[#2E302B] border border-[#E8E7E0] dark:border-[#383A35] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] hover:border-[#8EDCC0] hover:text-[#1E4D3E] dark:hover:text-[#8EDCC0] flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#8EDCC0]" />
                          <span>Mark Done</span>
                        </button>
                        <button
                          onClick={() => onNavigate('focus')}
                          className="btn-press px-3.5 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Focus on this</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Quick Add Task Input */}
                  <form
                    onSubmit={handleQuickAdd}
                    className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shadow-2xs transition-all duration-200 focus-within:border-[#FF7058]/50 focus-within:shadow-xs"
                  >
                    <input
                      type="text"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="+ Quick add a task for today (press Enter or 'N' for modal)..."
                      className="flex-1 px-3 py-2 text-sm bg-transparent text-[#262626] dark:text-[#F3F3F0] focus:outline-hidden placeholder-[#A0A09B]"
                    />

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        value={quickPriority}
                        onChange={(e) =>
                          setQuickPriority(
                            e.target.value as Priority
                          )
                        }
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#747474] dark:text-[#A0A09B] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>

                      <select
                        value={quickCategory}
                        onChange={(e) => setQuickCategory(e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#747474] dark:text-[#A0A09B] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>

                      <button
                        type="submit"
                        disabled={isSubmitting || !quickTitle.trim()}
                        className="btn-press px-4 py-1.5 rounded-lg bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold disabled:opacity-40 shadow-2xs hover:shadow-xs cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </form>

                  {/* Today's Tasks List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                      <h2 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                        Today's Schedule ({todayTasks.length})
                      </h2>
                      <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
                        {todayTasks.filter((t) => t.completed).length} completed
                      </span>
                    </div>

                    {todayTasks.length === 0 ? (
                      <div className="card-lift p-10 text-center rounded-2xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9]/50 dark:bg-[#20221F]/50">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center mx-auto mb-3 transition-transform duration-200 hover:scale-110">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                          No tasks scheduled for today yet
                        </h3>
                        <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                          Add a task using the input above or plan your day with the New Task button.
                        </p>
                        <button
                          onClick={() => onOpenNewTaskModal(todayStr)}
                          className="btn-press px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md"
                        >
                          Add a Task for Today
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {todayTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`task-card group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                              task.completed
                                ? 'bg-[#F9F9F7] dark:bg-[#222421] border-[#E8E7E0] dark:border-[#2E302B] opacity-65 hover:opacity-85'
                                : 'bg-white dark:bg-[#20221F] border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/50 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <button
                                onClick={() => onToggleTask(task)}
                                className="cursor-pointer transition-transform duration-150 hover:scale-115 active:scale-90 flex-shrink-0"
                                aria-label={
                                  task.completed
                                    ? 'Mark task incomplete'
                                    : 'Mark task complete'
                                }
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-[#8EDCC0] transition-colors" />
                                ) : (
                                  <Circle className="w-5 h-5 text-[#A0A09B] group-hover:text-[#FF7058] transition-colors" />
                                )}
                              </button>

                              <div
                                className="min-w-0 flex-1 cursor-pointer"
                                onClick={() => onEditTask(task)}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium truncate transition-colors duration-150 ${
                                      task.completed
                                        ? 'line-through text-[#747474] dark:text-[#A0A09B]'
                                        : 'text-[#262626] dark:text-[#F3F3F0] group-hover:text-[#FF7058]'
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  {task.isPriorityToday && (
                                    <Star className="w-3.5 h-3.5 text-[#FFD166] fill-current flex-shrink-0 transition-transform duration-200 group-hover:scale-115" />
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-xs text-[#747474] dark:text-[#A0A09B] truncate mt-0.5">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              {task.dueTime && (
                                <span className="text-[11px] text-[#747474] dark:text-[#A0A09B] flex items-center gap-1 transition-colors group-hover:text-[#262626] dark:group-hover:text-white">
                                  <Clock className="w-3 h-3" />
                                  {task.dueTime}
                                </span>
                              )}
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#2E302B] text-[#747474] dark:text-[#A0A09B] font-medium transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                                {task.category}
                              </span>

                              {task.priority === 'urgent' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold transition-transform duration-150 group-hover:scale-105">
                                  Urgent
                                </span>
                              )}
                              {task.priority === 'high' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium transition-transform duration-150 group-hover:scale-105">
                                  High
                                </span>
                              )}

                              <button
                                onClick={() => onDeleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#747474] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                                aria-label="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );

            case 'habits':
              return (
                <div
                  key="habits"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FFD166]/20 text-[#B8870A] dark:text-[#FFD166] flex items-center justify-center">
                        <Flame className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                          Daily Habits ({completedHabitsToday}/{activeHabits.length})
                        </h3>
                        <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                          One-click check-in for momentum
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('habits')}
                      className="text-xs font-semibold text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {activeHabits.length === 0 ? (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2">
                      No active habits yet. Create your first habit in the Habits section!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeHabits.map((habit) => {
                        const isDone = habitRecords.some(
                          (r) =>
                            r.habitId === habit.id &&
                            r.date === todayStr &&
                            r.completed
                        );
                        return (
                          <div
                            key={habit.id}
                            onClick={() =>
                              onToggleHabitDay &&
                              onToggleHabitDay(habit.id, todayStr, isDone)
                            }
                            className={`btn-press p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isDone
                                ? 'bg-[#8EDCC0]/10 border-[#8EDCC0]/40'
                                : 'bg-white dark:bg-[#262824] border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: habit.color }}
                              />
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isDone
                                    ? 'line-through text-[#747474] dark:text-[#A0A09B]'
                                    : 'text-[#262626] dark:text-[#F3F3F0]'
                                }`}
                              >
                                {habit.name}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="cursor-pointer transition-transform duration-150 hover:scale-115"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-[#8EDCC0]" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#A0A09B]" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );

            case 'focus':
              return (
                <div
                  key="focus"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                        Focus Sessions
                      </h3>
                      <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
                        {stats.focusMinutesToday} minutes logged today across {stats.totalFocusSessionsToday} interval(s).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('focus')}
                    className="btn-press px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch 25m Timer</span>
                  </button>
                </div>
              );

            case 'goals':
              return (
                <div
                  key="goals"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#8BCBFA]/20 text-[#1A4F78] dark:text-[#8BCBFA] flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                          Active Goals ({activeGoalsList.length})
                        </h3>
                        <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                          Milestones driving your long-term vision
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('goals')}
                      className="text-xs font-semibold text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer"
                    >
                      <span>All Goals</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {activeGoalsList.length === 0 ? (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2">
                      No active goals yet. Add a goal to guide your priorities!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeGoalsList.slice(0, 4).map((goal) => {
                        const totalM = goal.milestones?.length || 0;
                        const doneM =
                          goal.milestones?.filter((m) => m.completed).length ||
                          0;
                        const pct =
                          totalM > 0
                            ? Math.round((doneM / totalM) * 100)
                            : goal.progress || 0;
                        return (
                          <div
                            key={goal.id}
                            onClick={() => onNavigate('goals')}
                            className="p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] hover:border-[#FF7058]/40 transition-all cursor-pointer space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate group-hover:text-[#FF7058] transition-colors">
                                {goal.title}
                              </span>
                              <span className="text-[11px] font-mono text-[#747474] dark:text-[#A0A09B]">
                                {pct}%
                              </span>
                            </div>
                            <div className="w-full bg-[#F5F5F2] dark:bg-[#30322D] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#8BCBFA] to-[#8EDCC0] transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-[#747474] dark:text-[#A0A09B]">
                              {doneM} of {totalM} milestones reached
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );

            case 'achievements':
              return (
                <div
                  key="achievements"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#B8A7F9]/20 text-[#6952D7] dark:text-[#B8A7F9] flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                          Unlocked Badges ({unlockedCount}/{ALL_ACHIEVEMENTS.length})
                        </h3>
                        <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                          Productivity trophies and milestones
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('achievements')}
                      className="text-xs font-semibold text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Badges</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {recentUnlockedBadges.length === 0 ? (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2">
                      Complete your first task or habit to unlock your initial badge!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {recentUnlockedBadges.map((badge) => (
                        <div
                          key={badge!.key}
                          onClick={() => onNavigate('achievements')}
                          className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] hover:border-[#FFD166]/50 transition-all cursor-pointer flex items-center gap-3"
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: badge!.color }}
                          >
                            <Award className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate text-[#262626] dark:text-[#F3F3F0]">
                              {badge!.title}
                            </div>
                            <div className="text-[10px] text-[#747474] dark:text-[#A0A09B] truncate">
                              {badge!.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );

            case 'weekly':
              return (
                <div
                  key="weekly"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#8EDCC0]/20 text-[#1E4D3E] dark:text-[#8EDCC0] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                        Weekly Review & Reflections
                      </h3>
                      <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
                        Reflect on wins, carry unfinished tasks forward, and plan your top priorities.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('reviews')}
                    className="btn-press px-4 py-2 rounded-xl bg-white dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#383A35] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058] flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <span>Open Weekly Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );

            case 'projects':
              return (
                <div
                  key="projects"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#B8A7F9]/20 text-[#5B45B2] dark:text-[#B8A7F9] flex items-center justify-center">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                          Active Projects ({projects.length})
                        </h3>
                        <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                          Kanban boards and project milestones
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('projects')}
                      className="text-xs font-semibold text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer"
                    >
                      <span>All Projects</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2">
                      No projects active. Group your tasks into organized projects!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {projects.slice(0, 3).map((proj) => {
                        const pTasks = tasks.filter((t) => t.projectId === proj.id);
                        const pDone = pTasks.filter((t) => t.completed).length;
                        const pct = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => onNavigate('projects')}
                            className="p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#282A26] hover:border-[#FF7058]/50 transition-all cursor-pointer space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: proj.color || '#FF7058' }}
                                />
                                <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate group-hover:text-[#FF7058]">
                                  {proj.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-[#747474]">
                                {pDone}/{pTasks.length}
                              </span>
                            </div>
                            <div className="w-full bg-[#F5F5F2] dark:bg-[#30322D] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: proj.color || '#FF7058',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );

            case 'notes':
              return (
                <div
                  key="notes"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#8BCBFA]/20 text-[#1A4F78] dark:text-[#8BCBFA] flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                          Recent Notes ({notes.length})
                        </h3>
                        <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                          Connected knowledge and checklists
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('notes')}
                      className="text-xs font-semibold text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Notes</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {notes.length === 0 ? (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2">
                      No notes yet. Capture your quick thoughts or checklists!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {notes.slice(0, 3).map((note) => (
                        <div
                          key={note.id}
                          onClick={() => onNavigate('notes')}
                          className="p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#282A26] hover:border-[#8BCBFA]/50 transition-all cursor-pointer space-y-1.5 group"
                        >
                          <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate group-hover:text-[#8BCBFA]">
                            {note.title || 'Untitled'}
                          </div>
                          <p className="text-[11px] text-[#747474] line-clamp-2">
                            {note.content || '(Empty)'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );

            case 'expenses': {
              const monthKey = todayStr.slice(0, 7);
              const thisMonthSpent = expenses
                .filter((e) => e.date.startsWith(monthKey) && e.type === 'expense')
                .reduce((sum, e) => Math.round((sum + e.amount) * 100) / 100, 0);

              return (
                <div
                  key="expenses"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                        Personal Expenses ({monthKey})
                      </h3>
                      <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
                        ${thisMonthSpent.toFixed(2)} recorded this month. Financial data is kept strictly private.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('expenses')}
                    className="btn-press px-4 py-2 rounded-xl bg-white dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#383A35] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058] flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <span>View Finances</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            case 'reminders': {
              const pendingRems = reminders.filter((r) => r.status === 'pending');
              return (
                <div
                  key="reminders"
                  className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                          Upcoming Reminders ({pendingRems.length})
                        </h3>
                        <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                          Scheduled notifications and critical alerts
                        </span>
                      </div>
                    </div>
                  </div>

                  {pendingRems.length === 0 ? (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2">
                      No pending reminders right now.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {pendingRems.slice(0, 4).map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#282A26] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate block">
                              {r.title}
                            </span>
                            <span className="text-[10px] text-[#747474] font-mono">
                              {new Date(r.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>

      {/* Upcoming Mini-Timeline Preview */}
      {upcomingTasks.length > 0 && (
        <div className="pt-6 border-t border-[#E8E7E0] dark:border-[#2E302B]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#747474] dark:text-[#A0A09B]">
              Coming up next
            </h3>
            <button
              onClick={() => onNavigate('upcoming')}
              className="text-xs font-medium text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer transition-colors group"
            >
              <span>View full timeline</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onNavigate('upcoming')}
                className="card-lift p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] hover:border-[#FF7058]/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="text-xs font-semibold text-[#FF7058] mb-1">
                  {formatDate(t.dueDate)}
                </div>
                <div className="text-sm font-medium text-[#262626] dark:text-[#F3F3F0] truncate transition-colors group-hover:text-[#FF7058]">
                  {t.title}
                </div>
                <div className="text-[10px] text-[#747474] dark:text-[#A0A09B] mt-1">
                  {t.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
