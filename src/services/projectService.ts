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
import { Project } from '../types';

export function subscribeProjects(
  userId: string,
  onNext: (projects: Project[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/projects`;
  const q = query(collection(db, 'users', userId, 'projects'), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const projects: Project[] = [];
      snapshot.forEach((docSnap) => {
        projects.push(docSnap.data() as Project);
      });
      onNext(projects);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createProject(
  userId: string,
  data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'users', userId, 'projects', id);
  const now = new Date().toISOString();

  const project: Project = {
    ...data,
    id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, removeUndefinedFields(project));
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/projects/${id}`);
  }
}

export async function updateProject(
  userId: string,
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'projects', projectId);
  try {
    await updateDoc(
      docRef,
      removeUndefinedFields({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/projects/${projectId}`);
  }
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'projects', projectId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/projects/${projectId}`);
  }
}
