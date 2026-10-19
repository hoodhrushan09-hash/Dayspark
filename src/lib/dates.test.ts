import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getGreeting,
  formatDate,
  getRelativeDateLabel,
  groupTasksByDateRange,
  calculateHabitStreak,
} from './dates.ts';
import type { Task } from '../types/index.ts';

test('getGreeting returns appropriate time-of-day greeting', () => {
  const morning = new Date('2026-10-18T09:00:00');
  const afternoon = new Date('2026-10-18T14:00:00');
  const evening = new Date('2026-10-18T20:00:00');

  assert.equal(getGreeting(morning), 'Good morning');
  assert.equal(getGreeting(afternoon), 'Good afternoon');
  assert.equal(getGreeting(evening), 'Good evening');
});

test('formatDate formats YYYY-MM-DD into readable strings', () => {
  assert.equal(formatDate('2026-10-18', 'MMM D, YYYY'), 'Oct 18, 2026');
  assert.equal(formatDate('2026-10-18', 'DD/MM/YYYY'), '18/10/2026');
  assert.equal(formatDate('2026-10-18', 'YYYY-MM-DD'), '2026-10-18');
});

test('getRelativeDateLabel properly identifies today, tomorrow, and overdue dates', () => {
  assert.equal(getRelativeDateLabel('2026-10-18', '2026-10-18'), 'Today');
  assert.equal(getRelativeDateLabel('2026-10-19', '2026-10-18'), 'Tomorrow');
  assert.equal(getRelativeDateLabel('2026-10-17', '2026-10-18'), 'Yesterday');
  assert.equal(getRelativeDateLabel('2026-10-15', '2026-10-18'), '3d overdue');
});

test('groupTasksByDateRange correctly groups tasks into respective buckets', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      userId: 'u1',
      title: 'Past unfinished task',
      completed: false,
      priority: 'high',
      category: 'Work',
      dueDate: '2026-10-16',
      createdAt: '2026-10-16',
      updatedAt: '2026-10-16',
    },
    {
      id: '2',
      userId: 'u1',
      title: 'Today task',
      completed: false,
      priority: 'urgent',
      category: 'Personal',
      dueDate: '2026-10-18',
      createdAt: '2026-10-18',
      updatedAt: '2026-10-18',
    },
    {
      id: '3',
      userId: 'u1',
      title: 'Tomorrow task',
      completed: false,
      priority: 'medium',
      category: 'Study',
      dueDate: '2026-10-19',
      createdAt: '2026-10-18',
      updatedAt: '2026-10-18',
    },
  ];

  const grouped = groupTasksByDateRange(mockTasks, '2026-10-18');
  assert.equal(grouped.overdue.length, 1);
  assert.equal(grouped.today.length, 1);
  assert.equal(grouped.tomorrow.length, 1);
  assert.equal(grouped.overdue[0].id, '1');
  assert.equal(grouped.today[0].id, '2');
});

test('calculateHabitStreak correctly computes consecutive daily streaks', () => {
  const records = [
    { date: '2026-10-16', completed: true },
    { date: '2026-10-17', completed: true },
    { date: '2026-10-18', completed: true },
  ];
  const { currentStreak, longestStreak } = calculateHabitStreak(records, undefined, '2026-10-18');
  assert.equal(currentStreak, 3);
  assert.equal(longestStreak, 3);
});
