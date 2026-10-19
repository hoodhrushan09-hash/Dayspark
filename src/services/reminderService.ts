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
import { Reminder, ReminderStatus, ReminderAssociatedType } from '../types';

export function subscribeReminders(
  userId: string,
  onNext: (reminders: Reminder[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/reminders`;
  const q = query(collection(db, 'users', userId, 'reminders'), orderBy('remindAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const reminders: Reminder[] = [];
      snapshot.forEach((docSnap) => {
        reminders.push(docSnap.data() as Reminder);
      });
      onNext(reminders);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createReminder(
  userId: string,
  data: {
    title: string;
    remindAt: string;
    associatedType?: ReminderAssociatedType;
    associatedId?: string;
  }
): Promise<string> {
  const id = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'users', userId, 'reminders', id);
  const now = new Date().toISOString();

  const reminder: Reminder = {
    id,
    userId,
    title: data.title,
    remindAt: data.remindAt,
    associatedType: data.associatedType || 'custom',
    associatedId: data.associatedId,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, removeUndefinedFields(reminder));
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/reminders/${id}`);
  }
}

export async function updateReminder(
  userId: string,
  reminderId: string,
  updates: Partial<Omit<Reminder, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'reminders', reminderId);
  try {
    await updateDoc(
      docRef,
      removeUndefinedFields({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/reminders/${reminderId}`);
  }
}

export async function snoozeReminder(
  userId: string,
  reminderId: string,
  minutes: number
): Promise<void> {
  const snoozeDate = new Date(Date.now() + minutes * 60 * 1000);
  await updateReminder(userId, reminderId, {
    status: 'snoozed',
    snoozedUntil: snoozeDate.toISOString(),
    remindAt: snoozeDate.toISOString(),
  });
}

export async function dismissReminder(userId: string, reminderId: string): Promise<void> {
  await updateReminder(userId, reminderId, { status: 'dismissed' });
}

export async function completeReminder(userId: string, reminderId: string): Promise<void> {
  await updateReminder(userId, reminderId, { status: 'completed' });
}

export async function deleteReminder(userId: string, reminderId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'reminders', reminderId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/reminders/${reminderId}`);
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function showSystemNotification(title: string, options?: NotificationOptions): void {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification(title, {
        icon: '/app-icon.png',
        badge: '/favicon-32x32.png',
        ...options,
      });
    } catch (e) {
      console.warn('Could not display system notification:', e);
    }
  }
}
