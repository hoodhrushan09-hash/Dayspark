import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import { PlannerPlan, ScheduledBlock, Priority, Task } from '../types';
import { createTask, updateTask } from './taskService';

export interface PlanGenerationRequest {
  date: string; // YYYY-MM-DD
  userPrompt: string;
  startTime: string; // HH:mm, e.g. "09:00"
  endTime: string; // HH:mm, e.g. "17:00"
  existingTasks?: Task[];
  preferredFocusDuration?: number;
}

export interface PlanGenerationResult {
  planSummary: string;
  totalPlannedMinutes: number;
  availableMinutes: number;
  conflictWarnings: string[];
  scheduledBlocks: ScheduledBlock[];
  isManualFallback?: boolean;
  setupMessage?: string;
}

// Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

// Convert minutes from midnight to "HH:mm"
export function minutesToTime(totalMins: number): string {
  const norm = Math.max(0, Math.min(24 * 60 - 1, totalMins));
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Client service call to generate a plan via server-side endpoint (/api/plan)
export async function generateDailyPlan(
  request: PlanGenerationRequest
): Promise<PlanGenerationResult> {
  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (res.ok) {
      const data = await res.json();
      return validateAndSanitizePlanOutput(data, request);
    } else {
      const errData = await res.json().catch(() => ({}));
      // If server reports missing Gemini API key or error, use smart manual fallback
      return generateManualPlan(request, errData.message || 'AI configuration unavailable.');
    }
  } catch (error) {
    console.warn('AI plan request network error or endpoint offline. Falling back to heuristic planner:', error);
    return generateManualPlan(request, 'Operating in offline/direct planner mode.');
  }
}

// Heuristic fallback planner that parses text lines, priority keywords, times, and schedules blocks
export function generateManualPlan(
  req: PlanGenerationRequest,
  setupNote?: string
): PlanGenerationResult {
  const startMins = timeToMinutes(req.startTime || '09:00');
  const endMins = timeToMinutes(req.endTime || '17:00');
  const availableMinutes = Math.max(30, endMins - startMins);

  // Extract lines from prompt
  const rawLines = req.userPrompt
    .split(/\n|,|;/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const blocks: ScheduledBlock[] = [];
  let currentPointer = startMins;
  let totalPlanned = 0;
  const conflicts: string[] = [];

  const items = rawLines.length > 0 ? rawLines : ['Review priorities & inbox', 'Deep work block', 'Team check-in', 'Wrap up today’s tasks'];

  items.forEach((item, index) => {
    const lower = item.toLowerCase();
    let priority: Priority = 'medium';
    let isUrgent = false;

    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('bug')) {
      priority = 'urgent';
      isUrgent = true;
    } else if (lower.includes('important') || lower.includes('high') || lower.includes('client') || lower.includes('review')) {
      priority = 'high';
    } else if (lower.includes('quick') || lower.includes('easy') || lower.includes('optional') || lower.includes('low')) {
      priority = 'low';
    }

    // Estimate duration: parse if string has e.g. "45m", "1h", "30 mins"
    let duration = 45;
    const hourMatch = lower.match(/(\d+(\.\d+)?)\s*(h|hr|hour)/);
    const minMatch = lower.match(/(\d+)\s*(m|min)/);
    if (hourMatch) {
      duration = Math.round(parseFloat(hourMatch[1]) * 60);
    } else if (minMatch) {
      duration = parseInt(minMatch[1], 10);
    } else if (isUrgent) {
      duration = 60;
    } else if (priority === 'low') {
      duration = 30;
    }

    // Clamp duration to reasonable boundaries
    duration = Math.max(15, Math.min(240, duration));

    // Determine category
    let category = 'Work';
    if (lower.includes('workout') || lower.includes('gym') || lower.includes('run') || lower.includes('doctor')) category = 'Health';
    else if (lower.includes('study') || lower.includes('read') || lower.includes('course') || lower.includes('book')) category = 'Study';
    else if (lower.includes('grocery') || lower.includes('errand') || lower.includes('buy') || lower.includes('shop')) category = 'Errands';
    else if (lower.includes('call mom') || lower.includes('family') || lower.includes('clean')) category = 'Personal';

    const blockStart = currentPointer;
    const blockEnd = currentPointer + duration;

    // Check if exceeding day window
    if (blockEnd > endMins) {
      conflicts.push(`"${item}" extends beyond your chosen end time (${req.endTime}). Consider trimming duration or moving to tomorrow.`);
    }

    blocks.push({
      id: `block_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 5)}`,
      title: item.replace(/\b(\d+\s*(m|min|h|hr|hour|mins|hours))\b/gi, '').trim() || item,
      startTime: minutesToTime(blockStart),
      endTime: minutesToTime(blockEnd),
      durationMinutes: duration,
      priority,
      category,
      isUrgent,
      reasoning: isUrgent ? 'Scheduled early due to urgency keywords.' : `Allocated ${duration}m based on priority.`,
    });

    // 10 minute buffer between blocks
    currentPointer = blockEnd + 10;
    totalPlanned += duration;
  });

  return {
    planSummary: `Planned ${blocks.length} focused work blocks for today (${Math.round(totalPlanned / 60 * 10) / 10}h total work). Prioritized critical items first.`,
    totalPlannedMinutes: totalPlanned,
    availableMinutes,
    conflictWarnings: conflicts,
    scheduledBlocks: blocks,
    isManualFallback: true,
    setupMessage: setupNote,
  };
}

// Validate and sanitize AI model output to ensure safe, schema-compliant JSON
export function validateAndSanitizePlanOutput(
  raw: any,
  req: PlanGenerationRequest
): PlanGenerationResult {
  if (!raw || typeof raw !== 'object') {
    return generateManualPlan(req, 'Invalid response format from AI model.');
  }

  const startMins = timeToMinutes(req.startTime || '09:00');
  const endMins = timeToMinutes(req.endTime || '17:00');
  const availableMinutes = Math.max(30, endMins - startMins);

  const rawBlocks = Array.isArray(raw.scheduledBlocks) ? raw.scheduledBlocks : [];
  const blocks: ScheduledBlock[] = [];
  let totalPlanned = 0;
  const conflicts: string[] = Array.isArray(raw.conflictWarnings)
    ? raw.conflictWarnings.map((w: any) => String(w).slice(0, 300))
    : [];

  rawBlocks.forEach((b: any, idx: number) => {
    if (!b || typeof b !== 'object') return;
    const title = String(b.title || `Task Block ${idx + 1}`).slice(0, 150);
    const durationMinutes = Math.max(15, Math.min(240, Number(b.durationMinutes) || 30));
    const startTime = typeof b.startTime === 'string' && b.startTime.includes(':') ? b.startTime.slice(0, 5) : '09:00';
    const endTime = typeof b.endTime === 'string' && b.endTime.includes(':') ? b.endTime.slice(0, 5) : minutesToTime(timeToMinutes(startTime) + durationMinutes);

    const validPriorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
    const priority: Priority = validPriorities.includes(b.priority) ? b.priority : 'medium';

    blocks.push({
      id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 5)}`,
      title,
      startTime,
      endTime,
      durationMinutes,
      priority,
      category: String(b.category || 'Work').slice(0, 50),
      isUrgent: Boolean(b.isUrgent || priority === 'urgent'),
      reasoning: b.reasoning ? String(b.reasoning).slice(0, 300) : undefined,
    });
    totalPlanned += durationMinutes;
  });

  return {
    planSummary: String(raw.planSummary || `Scheduled ${blocks.length} focused blocks for your day.`).slice(0, 1000),
    totalPlannedMinutes: totalPlanned,
    availableMinutes,
    conflictWarnings: conflicts,
    scheduledBlocks: blocks,
    isManualFallback: Boolean(raw.isManualFallback),
    setupMessage: raw.setupMessage,
  };
}

// Accepts an approved plan: converts blocks to tasks, avoids duplicates, updates calendar times
export async function acceptAndSavePlan(
  userId: string,
  plan: PlannerPlan,
  existingTasks: Task[]
): Promise<{ createdCount: number; updatedCount: number }> {
  let createdCount = 0;
  let updatedCount = 0;

  for (const block of plan.scheduledBlocks) {
    // Check if task already exists with identical or very close title on this date
    const matchedTask = existingTasks.find(
      (t) =>
        t.dueDate === plan.date &&
        t.title.trim().toLowerCase() === block.title.trim().toLowerCase()
    );

    if (matchedTask) {
      // Update calendar time blocking on existing task without creating duplicate!
      await updateTask(userId, matchedTask.id, {
        calendarStartTime: block.startTime,
        calendarDuration: block.durationMinutes,
        priority: block.priority,
        estimatedDuration: block.durationMinutes,
      });
      updatedCount++;
    } else {
      // Create new scheduled task
      await createTask(userId, {
        title: block.title,
        description: block.reasoning ? `Scheduled via DaySpark Planner: ${block.reasoning}` : 'Scheduled via DaySpark Planner',
        completed: false,
        priority: block.priority,
        category: block.category || 'Work',
        dueDate: plan.date,
        dueTime: block.startTime,
        calendarStartTime: block.startTime,
        calendarDuration: block.durationMinutes,
        estimatedDuration: block.durationMinutes,
        isPriorityToday: block.isUrgent || block.priority === 'urgent' || block.priority === 'high',
      });
      createdCount++;
    }
  }

  // Save the plan record in Firestore
  const planDocRef = doc(db, 'users', userId, 'plans', plan.id);
  await setDoc(planDocRef, removeUndefinedFields({
    ...plan,
    status: 'accepted',
    updatedAt: new Date().toISOString(),
  }));

  return { createdCount, updatedCount };
}

export function subscribePlans(
  userId: string,
  onNext: (plans: PlannerPlan[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/plans`;
  const q = query(collection(db, 'users', userId, 'plans'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const plans: PlannerPlan[] = [];
      snapshot.forEach((docSnap) => {
        plans.push(docSnap.data() as PlannerPlan);
      });
      onNext(plans);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
