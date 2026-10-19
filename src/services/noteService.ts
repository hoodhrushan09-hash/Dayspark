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
import { Note } from '../types';

export function subscribeNotes(
  userId: string,
  onNext: (notes: Note[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/notes`;
  const q = query(collection(db, 'users', userId, 'notes'), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: Note[] = [];
      snapshot.forEach((docSnap) => {
        notes.push(docSnap.data() as Note);
      });
      onNext(notes);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createNote(
  userId: string,
  data: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'users', userId, 'notes', id);
  const now = new Date().toISOString();

  const note: Note = {
    ...data,
    id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, removeUndefinedFields(note));
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/notes/${id}`);
  }
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notes', noteId);
  try {
    await updateDoc(
      docRef,
      removeUndefinedFields({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/notes/${noteId}`);
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notes', noteId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/notes/${noteId}`);
  }
}

export async function toggleNotePinned(userId: string, note: Note): Promise<void> {
  await updateNote(userId, note.id, { isPinned: !note.isPinned });
}

export async function toggleNoteArchived(userId: string, note: Note): Promise<void> {
  await updateNote(userId, note.id, { isArchived: !note.isArchived });
}
