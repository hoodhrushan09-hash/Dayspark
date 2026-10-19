import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import { Goal, Milestone } from '../types';

export function subscribeGoals(
  userId: string,
  onUpdate: (goals: Goal[]) => void,
  onError: (error: Error) => void
): () => void {
  const path = `users/${userId}/goals`;
  const goalsRef = collection(db, 'users', userId, 'goals');
  const q = query(goalsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const goals: Goal[] = [];
      snapshot.forEach((d) => {
        goals.push(d.data() as Goal);
      });
      goals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onUpdate(goals);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export async function createGoal(
  userId: string,
  input: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const goalId = `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/goals/${goalId}`;
  const now = new Date().toISOString();

  const goal: Goal = {
    ...input,
    id: goalId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await setDoc(goalRef, removeUndefinedFields(goal));
    return goalId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGoal(
  userId: string,
  goalId: string,
  updates: Partial<Goal>
): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  const goalRef = doc(db, 'users', userId, 'goals', goalId);
  try {
    await updateDoc(goalRef, removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleMilestone(
  userId: string,
  goal: Goal,
  milestoneId: string
): Promise<void> {
  const updatedMilestones: Milestone[] = goal.milestones.map((m) =>
    m.id === milestoneId ? { ...m, completed: !m.completed } : m
  );
  const completedCount = updatedMilestones.filter((m) => m.completed).length;
  const progress =
    updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
  const status = progress === 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status;

  await updateGoal(userId, goal.id, {
    milestones: updatedMilestones,
    progress,
    status,
  });
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  const goalRef = doc(db, 'users', userId, 'goals', goalId);
  try {
    await deleteDoc(goalRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
