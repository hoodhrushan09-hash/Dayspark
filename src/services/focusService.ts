import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import { FocusSession } from '../types';

export function subscribeFocusSessions(
  userId: string,
  onUpdate: (sessions: FocusSession[]) => void,
  onError: (error: Error) => void
): () => void {
  const path = `users/${userId}/focusSessions`;
  const sessionsRef = collection(db, 'users', userId, 'focusSessions');
  const q = query(sessionsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions: FocusSession[] = [];
      snapshot.forEach((d) => {
        sessions.push(d.data() as FocusSession);
      });
      sessions.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
      onUpdate(sessions);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export async function saveFocusSession(
  userId: string,
  input: Omit<FocusSession, 'id' | 'userId'>
): Promise<string> {
  const sessionId = `focus_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/focusSessions/${sessionId}`;

  const session: FocusSession = {
    ...input,
    id: sessionId,
    userId,
  };

  try {
    const sessionRef = doc(db, 'users', userId, 'focusSessions', sessionId);
    await setDoc(sessionRef, removeUndefinedFields(session));
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
