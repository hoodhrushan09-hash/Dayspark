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
import { Habit, HabitRecord } from '../types';

export function subscribeHabits(
  userId: string,
  onUpdate: (habits: Habit[]) => void,
  onError: (error: Error) => void
): () => void {
  const path = `users/${userId}/habits`;
  const habitsRef = collection(db, 'users', userId, 'habits');
  const q = query(habitsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const habits: Habit[] = [];
      snapshot.forEach((d) => {
        habits.push(d.data() as Habit);
      });
      habits.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      onUpdate(habits);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export function subscribeHabitRecords(
  userId: string,
  onUpdate: (records: HabitRecord[]) => void,
  onError: (error: Error) => void
): () => void {
  const path = `users/${userId}/habitRecords`;
  const recordsRef = collection(db, 'users', userId, 'habitRecords');
  const q = query(recordsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const records: HabitRecord[] = [];
      snapshot.forEach((d) => {
        records.push(d.data() as HabitRecord);
      });
      onUpdate(records);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export async function createHabit(
  userId: string,
  input: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const habitId = `habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/habits/${habitId}`;
  const now = new Date().toISOString();

  const habit: Habit = {
    ...input,
    id: habitId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await setDoc(habitRef, removeUndefinedFields(habit));
    return habitId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleHabitDay(
  userId: string,
  habitId: string,
  date: string,
  currentlyCompleted: boolean
): Promise<void> {
  const recordId = `rec_${habitId}_${date}`;
  const path = `users/${userId}/habitRecords/${recordId}`;
  const recordRef = doc(db, 'users', userId, 'habitRecords', recordId);

  try {
    if (currentlyCompleted) {
      await deleteDoc(recordRef);
    } else {
      const record: HabitRecord = {
        id: recordId,
        userId,
        habitId,
        date,
        completed: true,
        count: 1,
        createdAt: new Date().toISOString(),
      };
      await setDoc(recordRef, record);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateHabit(
  userId: string,
  habitId: string,
  updates: Partial<Habit>
): Promise<void> {
  const path = `users/${userId}/habits/${habitId}`;
  const habitRef = doc(db, 'users', userId, 'habits', habitId);
  try {
    await updateDoc(habitRef, removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const path = `users/${userId}/habits/${habitId}`;
  const habitRef = doc(db, 'users', userId, 'habits', habitId);
  try {
    await deleteDoc(habitRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
