import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  deleteField,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import { Task } from '../types';

export function subscribeTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError: (error: Error) => void
): () => void {
  const path = `users/${userId}/tasks`;
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((d) => {
        tasks.push(d.data() as Task);
      });
      // Sort in memory: uncompleted first, then by priority/due date
      tasks.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (a.dueDate && b.dueDate) {
          return a.dueDate.localeCompare(b.dueDate);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
      onUpdate(tasks);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export async function createTask(
  userId: string,
  taskInput: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/tasks/${taskId}`;
  const now = new Date().toISOString();

  const task: Task = {
    ...taskInput,
    id: taskId,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await setDoc(taskRef, removeUndefinedFields(task));
    return taskId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  try {
    await updateDoc(taskRef, removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleTaskCompletion(userId: string, task: Task): Promise<void> {
  const nowCompleted = !task.completed;
  if (nowCompleted) {
    await updateTask(userId, task.id, {
      completed: true,
      completedAt: new Date().toISOString(),
    });
  } else {
    const path = `users/${userId}/tasks/${task.id}`;
    const taskRef = doc(db, 'users', userId, 'tasks', task.id);
    try {
      await updateDoc(taskRef, {
        completed: false,
        completedAt: deleteField(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
