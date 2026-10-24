import test from 'node:test';
import assert from 'node:assert/strict';
import { Task } from '../../types';

function computeDailyProgress(tasks: Task[], todayStr: string) {
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completed = todayTasks.filter((t) => t.completed).length;
  const total = todayTasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isAllComplete = total > 0 && completed === total;
  return { todayTasks, completed, total, percentage, isAllComplete };
}

test('computeDailyProgress calculates 0% gracefully with no scheduled tasks', () => {
  const stats = computeDailyProgress([], '2026-10-22');
  assert.equal(stats.total, 0);
  assert.equal(stats.completed, 0);
  assert.equal(stats.percentage, 0);
  assert.equal(stats.isAllComplete, false);
});

test('computeDailyProgress calculates accurate progress percentage on task updates', () => {
  const tasks: Task[] = [
    {
      id: '1',
      userId: 'user-1',
      title: 'Finish report',
      completed: true,
      priority: 'high',
      category: 'Work',
      dueDate: '2026-10-22',
      createdAt: '2026-10-22T08:00:00Z',
      updatedAt: '2026-10-22T09:00:00Z',
    },
    {
      id: '2',
      userId: 'user-1',
      title: 'Send invoice',
      completed: false,
      priority: 'medium',
      category: 'Finance',
      dueDate: '2026-10-22',
      createdAt: '2026-10-22T08:30:00Z',
      updatedAt: '2026-10-22T08:30:00Z',
    },
    {
      id: '3',
      userId: 'user-1',
      title: 'Future plan',
      completed: false,
      priority: 'low',
      category: 'Personal',
      dueDate: '2026-10-25',
      createdAt: '2026-10-22T08:30:00Z',
      updatedAt: '2026-10-22T08:30:00Z',
    },
  ];

  // 1 out of 2 for today completed = 50%
  const stats1 = computeDailyProgress(tasks, '2026-10-22');
  assert.equal(stats1.total, 2);
  assert.equal(stats1.completed, 1);
  assert.equal(stats1.percentage, 50);
  assert.equal(stats1.isAllComplete, false);

  // Complete second task = 100%
  const tasksCompleted = tasks.map((t) => (t.id === '2' ? { ...t, completed: true } : t));
  const stats2 = computeDailyProgress(tasksCompleted, '2026-10-22');
  assert.equal(stats2.total, 2);
  assert.equal(stats2.completed, 2);
  assert.equal(stats2.percentage, 100);
  assert.equal(stats2.isAllComplete, true);
});

test('Celebration transition logic avoids repeated triggers on page reload', () => {
  // Mock session storage
  const mockSessionStorage = new Map<string, string>();
  const todayStr = '2026-10-22';
  const celebrationKey = `dayspark_celebrated_${todayStr}`;

  // Initial load simulation with already 100% complete tasks
  let celebrationTriggered = false;
  let hasMounted = false;
  let prevRemaining: number | null = null;

  function evaluateCelebration(remaining: number, total: number) {
    if (!hasMounted) {
      hasMounted = true;
      prevRemaining = remaining;
      return false; // Do not trigger on page load / refresh
    }

    if (prevRemaining !== null && prevRemaining > 0 && remaining === 0 && total > 0) {
      if (mockSessionStorage.get(celebrationKey) !== 'true') {
        mockSessionStorage.set(celebrationKey, 'true');
        prevRemaining = remaining;
        return true;
      }
    }
    prevRemaining = remaining;
    return false;
  }

  // 1. Initial reload when already 100% complete:
  const triggeredOnReload = evaluateCelebration(0, 3);
  assert.equal(triggeredOnReload, false, 'Should not celebrate on reload');

  // 2. Fresh session starting with 1 remaining task:
  hasMounted = false;
  prevRemaining = null;
  mockSessionStorage.clear();

  // Initial mount with 1 remaining task:
  assert.equal(evaluateCelebration(1, 3), false);

  // User checks off the remaining task:
  assert.equal(evaluateCelebration(0, 3), true, 'Should celebrate upon dynamic transition to all completed');
  assert.equal(mockSessionStorage.get(celebrationKey), 'true');

  // Another re-render or re-evaluation in the same session:
  assert.equal(evaluateCelebration(0, 3), false, 'Should not repeat celebration in the same session');
});
