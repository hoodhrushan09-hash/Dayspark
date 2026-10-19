import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDailyProductivityScore } from '../score';
import { getLevelInfo, XP_REWARDS } from '../gamification';
import { evaluateAchievements } from '../achievements';
import { Task, Habit, HabitRecord, FocusSession, Goal } from '../../types';

test('calculateDailyProductivityScore calculates score cleanly without crashing on empty state', () => {
  const result = calculateDailyProductivityScore(
    '2026-10-18',
    'user-123',
    [],
    [],
    [],
    [],
    []
  );

  assert.equal(result.score, 0);
  assert.equal(result.breakdown.tasksCompleted, 0);
  assert.equal(result.breakdown.taskPoints, 0);
  assert.equal(result.breakdown.habitPoints, 0);
  assert.equal(result.breakdown.goalPoints, 0);
  assert.equal(result.breakdown.focusPoints, 0);
  assert.ok(result.encouragement.length > 0);
});

test('calculateDailyProductivityScore awards balanced points and respects 100 cap', () => {
  const tasks: Task[] = [
    {
      id: 't1',
      userId: 'user-123',
      title: 'Task 1',
      completed: true,
      priority: 'high',
      category: 'Work',
      dueDate: '2026-10-18',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T01:00:00Z',
    },
    {
      id: 't2',
      userId: 'user-123',
      title: 'Task 2',
      completed: true,
      priority: 'medium',
      category: 'Work',
      dueDate: '2026-10-18',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T01:00:00Z',
    },
  ];

  const habits: Habit[] = [
    {
      id: 'h1',
      userId: 'user-123',
      name: 'Morning walk',
      category: 'Health',
      color: '#8EDCC0',
      frequency: 'daily',
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
    },
  ];

  const habitRecords: HabitRecord[] = [
    {
      id: 'hr1',
      userId: 'user-123',
      habitId: 'h1',
      date: '2026-10-18',
      completed: true,
      createdAt: '2026-10-18T00:00:00Z',
    },
  ];

  const focusSessions: FocusSession[] = [
    {
      id: 'f1',
      userId: 'user-123',
      durationMinutes: 50,
      sessionType: 'focus',
      startedAt: '2026-10-18T09:00:00Z',
      completedAt: '2026-10-18T09:50:00Z',
    },
  ];

  const goals: Goal[] = [
    {
      id: 'g1',
      userId: 'user-123',
      title: 'Product Launch',
      category: 'Work',
      status: 'active',
      progress: 60,
      milestones: [
        { id: 'm1', title: 'Scope', completed: true },
        { id: 'm2', title: 'Build', completed: true },
      ],
      createdAt: '2026-10-18T00:00:00Z',
      updatedAt: '2026-10-18T00:00:00Z',
    },
  ];

  const result = calculateDailyProductivityScore(
    '2026-10-18',
    'user-123',
    tasks,
    habits,
    habitRecords,
    focusSessions,
    goals
  );

  assert.ok(result.score > 0);
  assert.ok(result.score <= 100);
  assert.equal(result.breakdown.tasksCompleted, 2);
  assert.equal(result.breakdown.habitsCompleted, 1);
  assert.equal(result.breakdown.focusMinutes, 50);
});

test('getLevelInfo computes progressive tiers accurately', () => {
  const level1 = getLevelInfo(0);
  assert.equal(level1.level, 1);
  assert.equal(level1.title, 'Initiate');
  assert.equal(level1.currentLevelXP, 0);

  const level2 = getLevelInfo(120);
  assert.equal(level2.level, 2);
  assert.equal(level2.title, 'Apprentice');
  assert.equal(level2.currentLevelXP, 20);

  const highLevel = getLevelInfo(2500);
  assert.ok(highLevel.level >= 6);
  assert.ok(highLevel.progressPercent >= 0 && highLevel.progressPercent <= 100);
});

test('evaluateAchievements correctly determines achievement unlocks', () => {
  const tasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
    id: `task-${i}`,
    userId: 'user-123',
    title: `Task ${i}`,
    completed: true,
    priority: 'medium',
    category: 'Work',
    createdAt: '2026-10-18T00:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  }));

  const evals = evaluateAchievements(tasks, [], [], [], [], [], []);
  const firstStep = evals.find((e) => e.key === 'first_step');
  const taskMaster = evals.find((e) => e.key === 'task_master');

  assert.ok(firstStep?.unlocked);
  assert.ok(taskMaster?.unlocked);
  assert.equal(taskMaster?.progress, 10);
});
