import type { Task } from '../types/index.ts';

export function getGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours < 12) {
    return 'Good morning';
  } else if (hours < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export function getTodayString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowString(date: Date = new Date()): string {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTodayString(tomorrow);
}

export function formatDate(
  dateStr?: string,
  formatType: 'MMM D, YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY' = 'MMM D, YYYY'
): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);

  if (formatType === 'YYYY-MM-DD') {
    return dateStr;
  }
  if (formatType === 'DD/MM/YYYY') {
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}, ${y}`;
}

export function getRelativeDateLabel(dateStr?: string, referenceToday?: string): string {
  if (!dateStr) return 'No due date';
  const today = referenceToday || getTodayString();
  const [y, m, d] = today.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);

  const [ty, tm, td] = dateStr.split('-').map(Number);
  const targetDate = new Date(ty, tm - 1, td);

  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

  return formatDate(dateStr);
}

export interface TaskGroups {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  later: Task[];
  unscheduled: Task[];
}

export function groupTasksByDateRange(tasks: Task[], todayStr: string = getTodayString()): TaskGroups {
  const groups: TaskGroups = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
    unscheduled: [],
  };

  const [y, m, d] = todayStr.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);
  const tomorrowStr = getTomorrowString(todayDate);

  const weekEndDate = new Date(todayDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekEndStr = getTodayString(weekEndDate);

  for (const task of tasks) {
    if (!task.dueDate) {
      groups.unscheduled.push(task);
      continue;
    }

    if (task.completed) {
      if (task.dueDate === todayStr) {
        groups.today.push(task);
      } else if (task.dueDate < todayStr) {
        // completed overdue is not categorized as overdue, stays in past/later
        groups.later.push(task);
      } else {
        groups.later.push(task);
      }
      continue;
    }

    if (task.dueDate < todayStr) {
      groups.overdue.push(task);
    } else if (task.dueDate === todayStr) {
      groups.today.push(task);
    } else if (task.dueDate === tomorrowStr) {
      groups.tomorrow.push(task);
    } else if (task.dueDate <= weekEndStr) {
      groups.thisWeek.push(task);
    } else {
      groups.later.push(task);
    }
  }

  return groups;
}

export function calculateHabitStreak(
  records: { date: string; completed: boolean }[],
  targetDays?: number[], // e.g. [1,2,3,4,5] for weekdays
  referenceDateStr: string = getTodayString()
): { currentStreak: number; longestStreak: number } {
  if (!records || records.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completedMap = new Map<string, boolean>();
  for (const r of records) {
    if (r.completed) {
      completedMap.set(r.date, true);
    }
  }

  const [y, m, d] = referenceDateStr.split('-').map(Number);
  const cursor = new Date(y, m - 1, d);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check today or yesterday as start of streak
  const todayKey = getTodayString(cursor);
  const isTodayTarget = !targetDays || targetDays.length === 0 || targetDays.includes(cursor.getDay());

  // Check backwards for current streak
  let checkCursor = new Date(cursor);
  let streakBroken = false;

  // If today is completed, count it. If not completed yet today, check yesterday
  const completedToday = completedMap.get(todayKey);
  if (!completedToday) {
    checkCursor.setDate(checkCursor.getDate() - 1);
  }

  while (!streakBroken) {
    const dayOfWeek = checkCursor.getDay();
    const isTarget = !targetDays || targetDays.length === 0 || targetDays.includes(dayOfWeek);
    const key = getTodayString(checkCursor);

    if (isTarget) {
      if (completedMap.get(key)) {
        currentStreak++;
      } else {
        streakBroken = true;
        break;
      }
    }
    checkCursor.setDate(checkCursor.getDate() - 1);
    // limit check to max 365 days
    if (currentStreak > 365) break;
  }

  // Calculate longest streak by sorting completed dates
  const sortedDates = Array.from(completedMap.keys()).sort();
  if (sortedDates.length === 0) {
    return { currentStreak, longestStreak: currentStreak };
  }

  tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    const currDate = new Date(dy, dm - 1, dd);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak };
}

export interface CalendarDay {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export function getCalendarDaysForMonth(
  year: number,
  month: number, // 0-11
  tasks: Task[] = [],
  weekStart: 'monday' | 'sunday' = 'monday',
  todayStr: string = getTodayString()
): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 is Sun, 1 is Mon
  let leadDays = 0;
  if (weekStart === 'monday') {
    leadDays = (startDayOfWeek + 6) % 7;
  } else {
    leadDays = startDayOfWeek;
  }

  const days: CalendarDay[] = [];

  // Previous month padding
  for (let i = leadDays; i > 0; i--) {
    const prevDate = new Date(year, month, 1 - i);
    const dateString = getTodayString(prevDate);
    days.push({
      dateString,
      dayNumber: prevDate.getDate(),
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      tasks: tasks.filter((t) => t.dueDate === dateString),
    });
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const currDate = new Date(year, month, d);
    const dateString = getTodayString(currDate);
    days.push({
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      tasks: tasks.filter((t) => t.dueDate === dateString),
    });
  }

  // Trailing days to complete 35 or 42 grid
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const dateString = getTodayString(nextDate);
    days.push({
      dateString,
      dayNumber: nextDate.getDate(),
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      tasks: tasks.filter((t) => t.dueDate === dateString),
    });
  }

  return days;
}

export function getWeekRange(
  dateStr: string = getTodayString(),
  weekStart: 'monday' | 'sunday' = 'monday'
): { start: string; end: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const curr = new Date(y, m - 1, d);
  const day = curr.getDay();
  const diff = weekStart === 'sunday' ? day : (day + 6) % 7;
  const start = new Date(curr);
  start.setDate(curr.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: getTodayString(start), end: getTodayString(end) };
}
