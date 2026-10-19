import { Task, Habit, HabitRecord, FocusSession, Goal, DailyScore, DailyScoreBreakdown } from '../types';

export function calculateDailyProductivityScore(
  dateStr: string,
  userId: string,
  tasks: Task[],
  habits: Habit[],
  habitRecords: HabitRecord[],
  focusSessions: FocusSession[],
  goals: Goal[] = []
): DailyScore {
  // 1. Task Component (Max 40 points)
  const todayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const tasksCompletedToday = tasks.filter(
    (t) => (t.dueDate === dateStr || t.completedAt?.startsWith(dateStr)) && t.completed
  ).length;

  let taskPoints = 0;
  const tasksTotal = todayTasks.length;

  if (tasksTotal > 0) {
    const ratio = Math.min(1, tasksCompletedToday / tasksTotal);
    taskPoints = Math.round(ratio * 40);
  } else if (tasksCompletedToday > 0) {
    // Completed unassigned/extra tasks
    taskPoints = Math.min(40, tasksCompletedToday * 15);
  } else {
    taskPoints = 0;
  }

  // 2. Habit Component (Max 25 points)
  const activeHabits = habits.filter((h) => !h.archived);
  const habitsCompletedToday = habitRecords.filter(
    (r) => r.date === dateStr && r.completed
  ).length;

  let habitPoints = 0;
  if (activeHabits.length > 0) {
    const habitRatio = Math.min(1, habitsCompletedToday / activeHabits.length);
    habitPoints = Math.round(habitRatio * 25);
  } else {
    habitPoints = 0;
  }

  // 3. Goal Component (Max 15 points)
  const activeGoals = goals.filter((g) => g.status === 'active' || g.status === 'completed');
  let goalPoints = 0;
  if (activeGoals.length > 0) {
    const completedGoals = activeGoals.filter((g) => g.progress === 100 || g.status === 'completed');
    if (completedGoals.length > 0) {
      goalPoints = 15;
    } else {
      const avgProgress =
        activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length;
      goalPoints = Math.round((avgProgress / 100) * 15);
    }
  } else {
    goalPoints = 0;
  }

  // 4. Focus Component (Max 20 points)
  const todayFocusMinutes = focusSessions
    .filter((s) => s.startedAt?.startsWith(dateStr) && s.sessionType === 'focus')
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // 25 mins = 10 pts, 50+ mins = 20 pts
  const focusPoints = Math.min(20, Math.round((todayFocusMinutes / 25) * 10));

  const totalRaw = taskPoints + habitPoints + goalPoints + focusPoints;
  const score = Math.min(100, Math.max(0, totalRaw));

  let encouragement = "A fresh page awaits. Take one small step whenever you're ready.";
  if (score >= 90) {
    encouragement = "Exceptional day! You've reached peak momentum. Be proud and remember to rest!";
  } else if (score >= 75) {
    encouragement = "Fantastic focus! You've accomplished meaningful work today.";
  } else if (score >= 50) {
    encouragement = "Steady progress! Consistent daily effort creates extraordinary results.";
  } else if (score >= 25) {
    encouragement = "Good foundation building today. Every small completion builds momentum.";
  }

  const breakdown: DailyScoreBreakdown = {
    taskPoints,
    habitPoints,
    goalPoints,
    focusPoints,
    tasksCompleted: tasksCompletedToday,
    tasksTotal,
    habitsCompleted: habitsCompletedToday,
    habitsActive: activeHabits.length,
    focusMinutes: todayFocusMinutes,
  };

  return {
    id: dateStr,
    userId,
    date: dateStr,
    score,
    breakdown,
    encouragement,
    updatedAt: new Date().toISOString(),
  };
}
