import type { Task, FocusSession, Habit, HabitRecord } from '../types/index.ts';
import { getTodayString } from './dates.ts';

export interface ProductivitySummary {
  tasksCompletedToday: number;
  tasksRemainingToday: number;
  dailyCompletionRate: number; // 0 - 100
  focusMinutesToday: number;
  totalFocusSessionsToday: number;
  priorityTask?: Task;

  // Selected range stats
  rangeTasksCompleted: number;
  rangeTasksTotal: number;
  rangeCompletionRate: number;
  rangeFocusMinutes: number;
  habitConsistencyRate: number;
}

export interface CategoryMetric {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DailyActivityPoint {
  date: string;
  dayLabel: string;
  tasksCompleted: number;
  focusMinutes: number;
}

export function calculateProductivityStats(
  tasks: Task[],
  habits: Habit[],
  habitRecords: HabitRecord[],
  focusSessions: FocusSession[],
  rangeDays: 7 | 30 | 'month' = 7,
  referenceDateStr: string = getTodayString()
): ProductivitySummary {
  const todayStr = referenceDateStr;

  // Today specific calculations
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const tasksCompletedToday = todayTasks.filter((t) => t.completed).length;
  const tasksRemainingToday = todayTasks.filter((t) => !t.completed).length;
  const dailyCompletionRate =
    todayTasks.length > 0 ? Math.round((tasksCompletedToday / todayTasks.length) * 100) : 0;

  const todaySessions = focusSessions.filter(
    (s) => s.completedAt && s.completedAt.startsWith(todayStr) && s.sessionType === 'focus'
  );
  const focusMinutesToday = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalFocusSessionsToday = todaySessions.length;

  const priorityTask = todayTasks.find((t) => t.isPriorityToday && !t.completed) || todayTasks.find((t) => !t.completed);

  // Range calculations
  const [y, m, d] = todayStr.split('-').map(Number);
  const refDate = new Date(y, m - 1, d);

  let startDate: Date;
  if (rangeDays === 'month') {
    startDate = new Date(y, m - 1, 1);
  } else {
    startDate = new Date(refDate);
    startDate.setDate(startDate.getDate() - (rangeDays - 1));
  }
  const startDateStr = getTodayString(startDate);

  const rangeTasks = tasks.filter((t) => t.dueDate && t.dueDate >= startDateStr && t.dueDate <= todayStr);
  const rangeTasksCompleted = rangeTasks.filter((t) => t.completed).length;
  const rangeTasksTotal = rangeTasks.length;
  const rangeCompletionRate =
    rangeTasksTotal > 0 ? Math.round((rangeTasksCompleted / rangeTasksTotal) * 100) : 0;

  const rangeSessions = focusSessions.filter((s) => {
    if (!s.completedAt || s.sessionType !== 'focus') return false;
    const sessionDate = s.completedAt.slice(0, 10);
    return sessionDate >= startDateStr && sessionDate <= todayStr;
  });
  const rangeFocusMinutes = rangeSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // Habit consistency calculation
  const rangeRecords = habitRecords.filter((r) => r.date >= startDateStr && r.date <= todayStr);
  const activeHabits = habits.filter((h) => !h.archived);
  let habitConsistencyRate = 0;

  if (activeHabits.length > 0) {
    const daysCount = Math.max(1, Math.round((refDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const totalPossible = activeHabits.length * daysCount;
    const completedRecords = rangeRecords.filter((r) => r.completed).length;
    habitConsistencyRate = totalPossible > 0 ? Math.min(100, Math.round((completedRecords / totalPossible) * 100)) : 0;
  }

  return {
    tasksCompletedToday,
    tasksRemainingToday,
    dailyCompletionRate,
    focusMinutesToday,
    totalFocusSessionsToday,
    priorityTask,
    rangeTasksCompleted,
    rangeTasksTotal,
    rangeCompletionRate,
    rangeFocusMinutes,
    habitConsistencyRate,
  };
}

export function calculateCategoryBreakdown(
  tasks: Task[],
  categoryColors: Record<string, string> = {}
): CategoryMetric[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const t of tasks) {
    const cat = t.category || 'Other';
    counts[cat] = (counts[cat] || 0) + 1;
    total++;
  }

  if (total === 0) return [];

  const defaultPalette: Record<string, string> = {
    Work: '#8BCBFA',
    Personal: '#FF7058',
    Study: '#B8A7F9',
    Health: '#8EDCC0',
    Errands: '#FFD166',
    Other: '#9CA3AF',
    ...categoryColors,
  };

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: defaultPalette[name] || '#FF7058',
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateWeeklyActivity(
  tasks: Task[],
  focusSessions: FocusSession[],
  referenceDateStr: string = getTodayString()
): DailyActivityPoint[] {
  const [y, m, d] = referenceDateStr.split('-').map(Number);
  const refDate = new Date(y, m - 1, d);

  const days: DailyActivityPoint[] = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(refDate);
    targetDate.setDate(targetDate.getDate() - i);
    const dateStr = getTodayString(targetDate);
    const dayLabel = dayLabels[targetDate.getDay()];

    const tasksCompleted = tasks.filter((t) => t.completed && t.dueDate === dateStr).length;
    const focusMinutes = focusSessions
      .filter((s) => s.sessionType === 'focus' && s.completedAt && s.completedAt.startsWith(dateStr))
      .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

    days.push({
      date: dateStr,
      dayLabel,
      tasksCompleted,
      focusMinutes,
    });
  }

  return days;
}
