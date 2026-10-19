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
import { Expense, Budget } from '../types';

export function subscribeExpenses(
  userId: string,
  onNext: (expenses: Expense[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/expenses`;
  const q = query(collection(db, 'users', userId, 'expenses'), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.forEach((docSnap) => {
        expenses.push(docSnap.data() as Expense);
      });
      onNext(expenses);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createExpense(
  userId: string,
  data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'users', userId, 'expenses', id);
  const now = new Date().toISOString();

  // Round amount to 2 decimal places to prevent floating point inaccuracies
  const sanitizedAmount = Math.round(data.amount * 100) / 100;

  const expense: Expense = {
    ...data,
    amount: sanitizedAmount,
    id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, removeUndefinedFields(expense));
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/expenses/${id}`);
  }
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'expenses', expenseId);
  const sanitizedUpdates: any = { ...updates };
  if (typeof updates.amount === 'number') {
    sanitizedUpdates.amount = Math.round(updates.amount * 100) / 100;
  }

  try {
    await updateDoc(
      docRef,
      removeUndefinedFields({
        ...sanitizedUpdates,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/expenses/${expenseId}`);
  }
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'expenses', expenseId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/expenses/${expenseId}`);
  }
}

export function subscribeBudget(
  userId: string,
  month: string, // YYYY-MM
  onNext: (budget: Budget | null) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/budgets/${month}`;
  const docRef = doc(db, 'users', userId, 'budgets', month);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onNext(snapshot.data() as Budget);
      } else {
        onNext(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveBudget(
  userId: string,
  month: string,
  monthlyLimit: number,
  currency: string = 'USD',
  categoryBudgets?: Record<string, number>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'budgets', month);
  const budget: Budget = {
    id: month,
    userId,
    month,
    monthlyLimit: Math.round(monthlyLimit * 100) / 100,
    categoryBudgets: categoryBudgets || {},
    currency,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, removeUndefinedFields(budget));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/budgets/${month}`);
  }
}

export function subscribeBudgets(
  userId: string,
  onNext: (budgets: Budget[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/budgets`;
  const q = query(collection(db, 'users', userId, 'budgets'));

  return onSnapshot(
    q,
    (snapshot) => {
      const budgets: Budget[] = [];
      snapshot.forEach((docSnap) => {
        budgets.push(docSnap.data() as Budget);
      });
      onNext(budgets);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
