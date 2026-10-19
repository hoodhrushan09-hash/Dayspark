import {
  Task,
  Project,
  Note,
  Habit,
  HabitRecord,
  Goal,
  FocusSession,
  WeeklyReview,
  Expense,
  Budget,
  Reminder,
  UserProfile,
} from '../types';
import { createTask, updateTask } from './taskService';
import { createProject, updateProject } from './projectService';
import { createNote, updateNote } from './noteService';
import { createHabit, updateHabit } from './habitService';
import { createGoal, updateGoal } from './goalService';
import { createExpense, updateExpense } from './expenseService';
import { createReminder, updateReminder } from './reminderService';

export interface DaySparkBackupPayload {
  version: '1.0';
  exportedAt: string;
  sourceApp: 'DaySpark';
  data: {
    tasks?: Task[];
    projects?: Project[];
    notes?: Note[];
    habits?: Habit[];
    habitRecords?: HabitRecord[];
    goals?: Goal[];
    focusSessions?: FocusSession[];
    weeklyReviews?: WeeklyReview[];
    expenses?: Expense[];
    budgets?: Budget[];
    reminders?: Reminder[];
  };
}

export interface BackupPreviewSummary {
  tasksCount: number;
  projectsCount: number;
  notesCount: number;
  habitsCount: number;
  goalsCount: number;
  expensesCount: number;
  remindersCount: number;
  focusSessionsCount: number;
  totalRecords: number;
  exportedAt?: string;
  version: string;
}

// Generate structured JSON string for backup (zero credentials or tokens)
export function generateBackupJSON(data: {
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  habits: Habit[];
  habitRecords: HabitRecord[];
  goals: Goal[];
  focusSessions: FocusSession[];
  weeklyReviews: WeeklyReview[];
  expenses: Expense[];
  budgets: Budget[];
  reminders: Reminder[];
}): string {
  // Strip any accidental sensitive info and sanitize
  const backup: DaySparkBackupPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    sourceApp: 'DaySpark',
    data: {
      tasks: data.tasks.map((t) => ({ ...t })),
      projects: data.projects.map((p) => ({ ...p })),
      notes: data.notes.map((n) => ({ ...n })),
      habits: data.habits.map((h) => ({ ...h })),
      habitRecords: data.habitRecords.map((r) => ({ ...r })),
      goals: data.goals.map((g) => ({ ...g })),
      focusSessions: data.focusSessions.map((f) => ({ ...f })),
      weeklyReviews: data.weeklyReviews.map((w) => ({ ...w })),
      expenses: data.expenses.map((e) => ({ ...e })),
      budgets: data.budgets.map((b) => ({ ...b })),
      reminders: data.reminders.map((rem) => ({ ...rem })),
    },
  };

  return JSON.stringify(backup, null, 2);
}

// Generate CSV string for Tasks
export function generateTasksCSV(tasks: Task[]): string {
  const headers = ['Title', 'Completed', 'Priority', 'Category', 'Due Date', 'Due Time', 'Duration (mins)', 'Description'];
  const rows = tasks.map((t) => [
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.completed ? 'TRUE' : 'FALSE',
    t.priority,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    t.dueDate || '',
    t.dueTime || '',
    t.estimatedDuration || '',
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Generate CSV string for Expenses
export function generateExpensesCSV(expenses: Expense[], currency: string = 'USD'): string {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description', 'Notes'];
  const rows = expenses.map((e) => [
    e.date,
    e.type,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    currency,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Trigger file download in browser
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Validate parsed JSON backup
export function validateBackupFile(jsonString: string): {
  valid: boolean;
  error?: string;
  payload?: DaySparkBackupPayload;
  summary?: BackupPreviewSummary;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File content is not a valid JSON object.' };
    }
    if (parsed.sourceApp !== 'DaySpark' && !parsed.data) {
      return {
        valid: false,
        error: 'Unrecognized backup structure. Expected DaySpark backup format.',
      };
    }

    const data = parsed.data || parsed;
    const summary: BackupPreviewSummary = {
      tasksCount: Array.isArray(data.tasks) ? data.tasks.length : 0,
      projectsCount: Array.isArray(data.projects) ? data.projects.length : 0,
      notesCount: Array.isArray(data.notes) ? data.notes.length : 0,
      habitsCount: Array.isArray(data.habits) ? data.habits.length : 0,
      goalsCount: Array.isArray(data.goals) ? data.goals.length : 0,
      expensesCount: Array.isArray(data.expenses) ? data.expenses.length : 0,
      remindersCount: Array.isArray(data.reminders) ? data.reminders.length : 0,
      focusSessionsCount: Array.isArray(data.focusSessions) ? data.focusSessions.length : 0,
      totalRecords: 0,
      exportedAt: parsed.exportedAt,
      version: parsed.version || '1.0',
    };

    summary.totalRecords =
      summary.tasksCount +
      summary.projectsCount +
      summary.notesCount +
      summary.habitsCount +
      summary.goalsCount +
      summary.expensesCount +
      summary.remindersCount +
      summary.focusSessionsCount;

    return {
      valid: true,
      payload: parsed,
      summary,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to parse backup file: ${err.message || 'Syntax error'}`,
    };
  }
}

// Apply import payload to user database
export async function applyBackupImport(
  userId: string,
  payload: DaySparkBackupPayload,
  duplicateStrategy: 'skip' | 'overwrite',
  existingData: {
    tasks: Task[];
    projects: Project[];
    notes: Note[];
    habits: Habit[];
    goals: Goal[];
    expenses: Expense[];
    reminders: Reminder[];
  }
): Promise<{ importedCount: number; skippedCount: number }> {
  let importedCount = 0;
  let skippedCount = 0;

  const data = payload.data;

  // Import Tasks
  if (Array.isArray(data.tasks)) {
    const existingIds = new Set(existingData.tasks.map((t) => t.id));
    for (const item of data.tasks) {
      if (!item.title) continue;
      if (existingIds.has(item.id)) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
        } else {
          await updateTask(userId, item.id, item);
          importedCount++;
        }
      } else {
        await createTask(userId, {
          title: item.title,
          description: item.description,
          completed: Boolean(item.completed),
          priority: item.priority || 'medium',
          category: item.category || 'Work',
          projectId: item.projectId,
          dueDate: item.dueDate,
          dueTime: item.dueTime,
          estimatedDuration: item.estimatedDuration,
          tags: item.tags,
          isPriorityToday: item.isPriorityToday,
          recurrence: item.recurrence,
        });
        importedCount++;
      }
    }
  }

  // Import Projects
  if (Array.isArray(data.projects)) {
    const existingIds = new Set(existingData.projects.map((p) => p.id));
    for (const item of data.projects) {
      if (!item.name) continue;
      if (existingIds.has(item.id)) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
        } else {
          await updateProject(userId, item.id, item);
          importedCount++;
        }
      } else {
        await createProject(userId, {
          name: item.name,
          description: item.description,
          color: item.color || '#8BCBFA',
          deadline: item.deadline,
          status: item.status || 'active',
        });
        importedCount++;
      }
    }
  }

  // Import Notes
  if (Array.isArray(data.notes)) {
    const existingIds = new Set(existingData.notes.map((n) => n.id));
    for (const item of data.notes) {
      if (!item.title) continue;
      if (existingIds.has(item.id)) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
        } else {
          await updateNote(userId, item.id, item);
          importedCount++;
        }
      } else {
        await createNote(userId, {
          title: item.title,
          content: item.content || '',
          tags: item.tags || [],
          isPinned: Boolean(item.isPinned),
          isArchived: Boolean(item.isArchived),
          color: item.color,
          linkedTaskId: item.linkedTaskId,
          linkedGoalId: item.linkedGoalId,
          linkedProjectId: item.linkedProjectId,
          checklists: item.checklists || [],
        });
        importedCount++;
      }
    }
  }

  // Import Expenses
  if (Array.isArray(data.expenses)) {
    const existingIds = new Set(existingData.expenses.map((e) => e.id));
    for (const item of data.expenses) {
      if (!item.amount || !item.category || !item.date) continue;
      if (existingIds.has(item.id)) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
        } else {
          await updateExpense(userId, item.id, item);
          importedCount++;
        }
      } else {
        await createExpense(userId, {
          amount: item.amount,
          type: item.type || 'expense',
          category: item.category,
          date: item.date,
          description: item.description || '',
          notes: item.notes,
          paymentMethod: item.paymentMethod,
        });
        importedCount++;
      }
    }
  }

  // Import Reminders
  if (Array.isArray(data.reminders)) {
    const existingIds = new Set(existingData.reminders.map((r) => r.id));
    for (const item of data.reminders) {
      if (!item.title || !item.remindAt) continue;
      if (existingIds.has(item.id)) {
        if (duplicateStrategy === 'skip') {
          skippedCount++;
        } else {
          await updateReminder(userId, item.id, item);
          importedCount++;
        }
      } else {
        await createReminder(userId, {
          title: item.title,
          remindAt: item.remindAt,
          associatedType: item.associatedType,
          associatedId: item.associatedId,
        });
        importedCount++;
      }
    }
  }

  return { importedCount, skippedCount };
}
