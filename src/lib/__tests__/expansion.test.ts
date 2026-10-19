import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timeToMinutes, minutesToTime } from '../../services/plannerService';
import { getWeekRange, getTodayString } from '../dates';
import { validateBackupFile, generateTasksCSV, generateExpensesCSV } from '../../services/backupService';
import { Task, Expense } from '../../types';

test('timeToMinutes and minutesToTime accurately convert clock times', () => {
  assert.equal(timeToMinutes('09:00'), 540);
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('14:30'), 870);
  assert.equal(timeToMinutes('23:59'), 1439);

  assert.equal(minutesToTime(540), '09:00');
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(870), '14:30');
  assert.equal(minutesToTime(1439), '23:59');
});

test('getWeekRange computes consistent 7-day windows', () => {
  const rangeMon = getWeekRange('2026-10-19', 'monday');
  assert.equal(rangeMon.start, '2026-10-19');
  assert.equal(rangeMon.end, '2026-10-25');

  const rangeSun = getWeekRange('2026-10-19', 'sunday');
  assert.equal(rangeSun.start, '2026-10-18');
  assert.equal(rangeSun.end, '2026-10-24');
});

test('validateBackupFile identifies DaySpark backup schemas correctly', () => {
  const validPayload = {
    version: '1.0',
    sourceApp: 'DaySpark',
    exportedAt: '2026-10-19T00:00:00Z',
    data: {
      tasks: [{ id: 't1', title: 'Test Task', completed: false, priority: 'medium' }],
      projects: [{ id: 'p1', name: 'Test Project', status: 'active' }],
      notes: [{ id: 'n1', title: 'Test Note', content: 'Note content' }],
      expenses: [{ id: 'e1', amount: 42.5, category: 'Food & Dining', date: '2026-10-19', type: 'expense' }],
      reminders: [{ id: 'r1', title: 'Reminder', remindAt: '2026-10-19T10:00:00Z', status: 'pending' }],
    },
  };

  const res = validateBackupFile(JSON.stringify(validPayload));
  assert.equal(res.valid, true);
  assert.equal(res.summary?.tasksCount, 1);
  assert.equal(res.summary?.projectsCount, 1);
  assert.equal(res.summary?.notesCount, 1);
  assert.equal(res.summary?.expensesCount, 1);
  assert.equal(res.summary?.remindersCount, 1);

  const invalidJson = validateBackupFile('not json');
  assert.equal(invalidJson.valid, false);

  const missingData = validateBackupFile(JSON.stringify({ otherApp: 'Unknown' }));
  assert.equal(missingData.valid, false);
});

test('generateTasksCSV and generateExpensesCSV create valid headers and rows', () => {
  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      userId: 'user-1',
      title: 'Design "DaySpark" Landing Page',
      category: 'Work',
      priority: 'high',
      completed: true,
      dueDate: '2026-10-19',
      createdAt: '2026-10-19T00:00:00Z',
      updatedAt: '2026-10-19T00:00:00Z',
    },
  ];

  const tasksCsv = generateTasksCSV(sampleTasks);
  assert.match(tasksCsv, /^Title,Completed,Priority,Category,Due Date/);
  assert.match(tasksCsv, /"Design ""DaySpark"" Landing Page"/);

  const sampleExpenses: Expense[] = [
    {
      id: 'exp-1',
      userId: 'user-1',
      amount: 15.75,
      type: 'expense',
      category: 'Food & Dining',
      description: 'Lunch meeting',
      date: '2026-10-19',
      paymentMethod: 'credit_card',
      createdAt: '2026-10-19T00:00:00Z',
      updatedAt: '2026-10-19T00:00:00Z',
    },
  ];

  const expCsv = generateExpensesCSV(sampleExpenses);
  assert.match(expCsv, /^Date,Type,Category,Amount,Currency,Description/);
  assert.match(expCsv, /15\.75/);
});
