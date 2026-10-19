import {
  AchievementDefinition,
  AchievementKey,
  Task,
  Habit,
  HabitRecord,
  FocusSession,
  Goal,
  DailyScore,
  WeeklyReview,
} from '../types';

export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: 'first_step',
    title: 'First Step',
    description: 'Complete your first task',
    howToEarn: 'Check off any scheduled or backlogged task item.',
    iconName: 'CheckCircle2',
    color: '#8EDCC0',
    targetCount: 1,
    category: 'tasks',
  },
  {
    key: 'task_master',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    howToEarn: 'Successfully complete 10 tasks across your days.',
    iconName: 'Award',
    color: '#FF7058',
    targetCount: 10,
    category: 'tasks',
  },
  {
    key: 'getting_consistent',
    title: 'Getting Consistent',
    description: 'Complete habits on 3 separate days',
    howToEarn: 'Check off at least one habit on three distinct calendar dates.',
    iconName: 'Flame',
    color: '#FFD166',
    targetCount: 3,
    category: 'habits',
  },
  {
    key: 'focus_starter',
    title: 'Focus Starter',
    description: 'Finish your first focus session',
    howToEarn: 'Complete any focus interval without interruption.',
    iconName: 'Clock',
    color: '#8BCBFA',
    targetCount: 1,
    category: 'focus',
  },
  {
    key: 'focus_champion',
    title: 'Focus Champion',
    description: 'Finish 10 focus sessions',
    howToEarn: 'Log 10 completed focus sessions in your timer history.',
    iconName: 'Zap',
    color: '#B8A7F9',
    targetCount: 10,
    category: 'focus',
  },
  {
    key: 'goal_getter',
    title: 'Goal Getter',
    description: 'Complete a goal or milestone',
    howToEarn: 'Mark a milestone as finished or reach 100% on a major goal.',
    iconName: 'Target',
    color: '#FF7058',
    targetCount: 1,
    category: 'goals',
  },
  {
    key: 'weekly_winner',
    title: 'Weekly Winner',
    description: 'Complete your first weekly review',
    howToEarn: 'Reflect and save your first weekly retrospective and plan.',
    iconName: 'Compass',
    color: '#8EDCC0',
    targetCount: 1,
    category: 'reviews',
  },
  {
    key: 'productivity_milestone',
    title: 'Productivity Milestone',
    description: 'Reach a daily score of 80+',
    howToEarn: 'Score 80 or higher on your daily productivity rating.',
    iconName: 'Sparkles',
    color: '#FFD166',
    targetCount: 80,
    category: 'overall',
  },
  {
    key: 'habit_hero',
    title: 'Habit Hero',
    description: 'Complete 20 habit check-ins',
    howToEarn: 'Log 20 total habit completions across any period.',
    iconName: 'ShieldCheck',
    color: '#8EDCC0',
    targetCount: 20,
    category: 'habits',
  },
  {
    key: 'deep_diver',
    title: 'Deep Diver',
    description: 'Accumulate over 100 minutes of focus time',
    howToEarn: 'Record at least 100 total minutes of deep focus timer work.',
    iconName: 'Timer',
    color: '#8BCBFA',
    targetCount: 100,
    category: 'focus',
  },
];

export interface AchievementEvaluationResult {
  key: AchievementKey;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function evaluateAchievements(
  tasks: Task[],
  habits: Habit[],
  habitRecords: HabitRecord[],
  focusSessions: FocusSession[],
  goals: Goal[],
  dailyScores: DailyScore[],
  weeklyReviews: WeeklyReview[]
): AchievementEvaluationResult[] {
  // 1. Tasks completed count
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  // 2. Distinct habit dates
  const completedHabitRecords = habitRecords.filter((r) => r.completed);
  const distinctHabitDates = new Set(completedHabitRecords.map((r) => r.date)).size;
  const totalHabitCompletions = completedHabitRecords.length;

  // 3. Focus sessions count & minutes
  const completedFocusSessions = focusSessions.filter((s) => s.sessionType === 'focus');
  const focusSessionCount = completedFocusSessions.length;
  const totalFocusMinutes = completedFocusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // 4. Goals & milestones completed
  const completedMilestones = goals.reduce((acc, g) => {
    return acc + (g.milestones?.filter((m) => m.completed).length || 0);
  }, 0);
  const completedGoalsCount = goals.filter((g) => g.status === 'completed' || g.progress === 100).length;
  const goalAchievementPoints = completedMilestones + completedGoalsCount;

  // 5. Weekly reviews
  const weeklyReviewsCount = weeklyReviews.length;

  // 6. Max daily score reached
  const maxScore = Math.max(0, ...dailyScores.map((s) => s.score || 0));

  return ALL_ACHIEVEMENTS.map((ach) => {
    let progress = 0;
    const maxProgress = ach.targetCount;

    switch (ach.key) {
      case 'first_step':
        progress = Math.min(maxProgress, completedTasksCount);
        break;
      case 'task_master':
        progress = Math.min(maxProgress, completedTasksCount);
        break;
      case 'getting_consistent':
        progress = Math.min(maxProgress, distinctHabitDates);
        break;
      case 'focus_starter':
        progress = Math.min(maxProgress, focusSessionCount);
        break;
      case 'focus_champion':
        progress = Math.min(maxProgress, focusSessionCount);
        break;
      case 'goal_getter':
        progress = Math.min(maxProgress, goalAchievementPoints);
        break;
      case 'weekly_winner':
        progress = Math.min(maxProgress, weeklyReviewsCount);
        break;
      case 'productivity_milestone':
        progress = Math.min(maxProgress, maxScore);
        break;
      case 'habit_hero':
        progress = Math.min(maxProgress, totalHabitCompletions);
        break;
      case 'deep_diver':
        progress = Math.min(maxProgress, totalFocusMinutes);
        break;
    }

    const unlocked = progress >= maxProgress;

    return {
      key: ach.key,
      unlocked,
      progress,
      maxProgress,
    };
  });
}
