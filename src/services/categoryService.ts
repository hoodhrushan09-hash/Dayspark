import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Category } from '../types';

export function subscribeCategories(
  userId: string,
  onUpdate: (categories: Category[]) => void,
  onError: (error: Error) => void
): () => void {
  const path = `users/${userId}/categories`;
  const catsRef = collection(db, 'users', userId, 'categories');
  const q = query(catsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((d) => {
        cats.push(d.data() as Category);
      });
      cats.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(cats);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export async function createCategory(
  userId: string,
  input: Omit<Category, 'id' | 'userId'>
): Promise<string> {
  const catId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/categories/${catId}`;

  const cat: Category = {
    ...input,
    id: catId,
    userId,
  };

  try {
    const catRef = doc(db, 'users', userId, 'categories', catId);
    await setDoc(catRef, cat);
    return catId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const path = `users/${userId}/categories/${categoryId}`;
  const catRef = doc(db, 'users', userId, 'categories', categoryId);
  try {
    await deleteDoc(catRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
