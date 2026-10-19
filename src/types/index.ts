export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  projectId?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedDuration?: number; // minutes
  tags?: string[];
  isPriorityToday?: boolean;
  recurrence?: RecurrenceType;
  calendarStartTime?: string; // HH:mm for calendar time blocking
  calendarDuration?: number; // minutes
  kanbanColumn?: 'todo' | 'inprogress' | 'done';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  status: GoalStatus;
  milestones: Milestone[];
  progress: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'custom';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  targetPerDay?: number;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  count?: number;
  createdAt: string;
}

export type FocusSessionType = 'focus' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  sessionType: FocusSessionType;
  startedAt: string;
  completedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
}

// FEATURE 1: Daily Productivity Score Snapshot
export interface DailyScoreBreakdown {
  taskPoints: number; // max 40
  habitPoints: number; // max 25
  goalPoints: number; // max 15
  focusPoints: number; // max 20
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsActive: number;
  focusMinutes: number;
}

export interface DailyScore {
  id: string; // YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD
  score: number; // 0 - 100
  breakdown: DailyScoreBreakdown;
  encouragement: string;
  updatedAt: string;
}

// FEATURE 2: XP, Levels, and Progression
export interface XPTransaction {
  id: string;
  userId: string;
  actionKey: string; // Idempotency key, e.g. task_abc123_completed
  amount: number;
  reason: string;
  createdAt: string;
}

// FEATURE 3: Achievements and Badges
export type AchievementKey =
  | 'first_step'
  | 'task_master'
  | 'getting_consistent'
  | 'focus_starter'
  | 'focus_champion'
  | 'goal_getter'
  | 'weekly_winner'
  | 'productivity_milestone'
  | 'habit_hero'
  | 'deep_diver';

export interface AchievementDefinition {
  key: AchievementKey;
  title: string;
  description: string;
  howToEarn: string;
  iconName: string;
  color: string;
  targetCount: number;
  category: 'tasks' | 'habits' | 'focus' | 'goals' | 'reviews' | 'overall';
}

export interface UserAchievement {
  id: string; // matches AchievementKey
  userId: string;
  achievementKey: AchievementKey;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

// FEATURE 4: Weekly Review and Insights
export interface WeeklyReviewInsight {
  type: 'achievement' | 'trend' | 'habit' | 'focus';
  title: string;
  message: string;
}

export interface WeeklyReview {
  id: string; // e.g. review_2026_W42
  userId: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  tasksCompleted: number;
  tasksTotal: number;
  habitRate: number; // percentage 0 - 100
  focusMinutes: number;
  avgDailyScore: number;
  bestDay: string; // e.g. "Tuesday"
  achievementsEarned: number;
  reflectionWins: string;
  reflectionImprovements: string;
  nextWeekPriorities: string[];
  nextWeekGoals: string[];
  personalNotes: string;
  insights?: WeeklyReviewInsight[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// WORKSPACE EXPANSION MODULES
// ==========================================

// MODULE 1: AI Planner
export interface ScheduledBlock {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  priority: Priority;
  category: string;
  reasoning?: string;
  isUrgent?: boolean;
  taskId?: string;
}

export interface PlannerPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  originalPrompt: string;
  planSummary: string;
  totalPlannedMinutes: number;
  availableMinutes: number;
  conflictWarnings?: string[];
  scheduledBlocks: ScheduledBlock[];
  status: 'draft' | 'accepted' | 'archived';
  createdAt: string;
}

// MODULE 3: Smart Notes & Knowledge Hub
export interface NoteChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  color?: string;
  linkedTaskId?: string;
  linkedGoalId?: string;
  linkedProjectId?: string;
  checklists?: NoteChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// MODULE 5: Personal Expense Tracker
export type ExpenseCategory =
  | 'Housing'
  | 'Food & Dining'
  | 'Transportation'
  | 'Utilities'
  | 'Health & Fitness'
  | 'Entertainment'
  | 'Education'
  | 'Shopping'
  | 'Work & Business'
  | 'Personal'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  category: ExpenseCategory | string;
  date: string; // YYYY-MM-DD
  description: string;
  notes?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string; // YYYY-MM
  userId: string;
  month: string; // YYYY-MM
  monthlyLimit: number;
  categoryBudgets?: Record<string, number>;
  currency: string;
  updatedAt: string;
}

// MODULE 6: Projects and Kanban Boards
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  deadline?: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// MODULE 7: Smart Reminders & Notifications
export type ReminderStatus = 'pending' | 'dismissed' | 'completed' | 'snoozed';
export type ReminderAssociatedType = 'task' | 'habit' | 'goal' | 'project' | 'custom';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  remindAt: string; // ISO string or YYYY-MM-DDTHH:mm
  associatedType: ReminderAssociatedType;
  associatedId?: string;
  status: ReminderStatus;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// FEATURE 6: Dashboard Customization
export type DashboardWidgetId =
  | 'score'
  | 'tasks'
  | 'xp'
  | 'habits'
  | 'focus'
  | 'goals'
  | 'projects'
  | 'notes'
  | 'expenses'
  | 'reminders'
  | 'achievements'
  | 'weekly';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

export interface DashboardConfig {
  widgets: DashboardWidgetConfig[];
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme: 'system' | 'light' | 'dark';
  accentColor: string;
  reducedMotion: boolean;
  dateFormat: 'MMM D, YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY';
  timeFormat: '12h' | '24h';
  weekStart: 'monday' | 'sunday';
  defaultTaskDuration: number;
  totalXP?: number;
  level?: number;
  preferredCurrency?: string;
  dashboardConfig?: DashboardConfig;
  createdAt: string;
  updatedAt: string;
}

export type AppView =
  | 'today'
  | 'planner'
  | 'projects'
  | 'notes'
  | 'calendar'
  | 'tasks'
  | 'upcoming'
  | 'expenses'
  | 'goals'
  | 'habits'
  | 'focus'
  | 'reviews'
  | 'achievements'
  | 'statistics'
  | 'settings';

