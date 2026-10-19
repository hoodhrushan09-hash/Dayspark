import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProductivityStats, calculateCategoryBreakdown } from './stats.ts';
import type { Task, FocusSession, Habit, HabitRecord } from '../types/index.ts';

test('calculateProductivityStats accurately calculates completion rates and focus totals', () => {
  const mockTasks: Task[] = [
    {
      id: 't1',
      userId: 'u1',
      title: 'Task 1',
      completed: true,
      priority: 'high',
      category: 'Work',
      dueDate: '2026-10-18',
      createdAt: '2026-10-18',
      updatedAt: '2026-10-18',
    },
    {
      id: 't2',
      userId: 'u1',
      title: 'Task 2',
      completed: false,
      priority: 'medium',
      category: 'Work',
      dueDate: '2026-10-18',
      createdAt: '2026-10-18',
      updatedAt: '2026-10-18',
    },
  ];

  const mockHabits: Habit[] = [];
  const mockHabitRecords: HabitRecord[] = [];

  const mockSessions: FocusSession[] = [
    {
      id: 's1',
      userId: 'u1',
      durationMinutes: 25,
      sessionType: 'focus',
      startedAt: '2026-10-18T10:00:00Z',
      completedAt: '2026-10-18T10:25:00Z',
    },
    {
      id: 's2',
      userId: 'u1',
      durationMinutes: 25,
      sessionType: 'focus',
      startedAt: '2026-10-18T11:00:00Z',
      completedAt: '2026-10-18T11:25:00Z',
    },
  ];

  const stats = calculateProductivityStats(
    mockTasks,
    mockHabits,
    mockHabitRecords,
    mockSessions,
    7,
    '2026-10-18'
  );

  assert.equal(stats.tasksCompletedToday, 1);
  assert.equal(stats.tasksRemainingToday, 1);
  assert.equal(stats.dailyCompletionRate, 50);
  assert.equal(stats.focusMinutesToday, 50);
  assert.equal(stats.totalFocusSessionsToday, 2);
});

test('calculateCategoryBreakdown computes correct counts and percentages', () => {
  const mockTasks: Task[] = [
    { id: '1', userId: 'u1', title: 'T1', completed: false, priority: 'low', category: 'Work', createdAt: '', updatedAt: '' },
    { id: '2', userId: 'u1', title: 'T2', completed: false, priority: 'low', category: 'Work', createdAt: '', updatedAt: '' },
    { id: '3', userId: 'u1', title: 'T3', completed: false, priority: 'low', category: 'Health', createdAt: '', updatedAt: '' },
    { id: '4', userId: 'u1', title: 'T4', completed: false, priority: 'low', category: 'Health', createdAt: '', updatedAt: '' },
  ];

  const breakdown = calculateCategoryBreakdown(mockTasks);
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].name, 'Work');
  assert.equal(breakdown[0].count, 2);
  assert.equal(breakdown[0].percentage, 50);
});
