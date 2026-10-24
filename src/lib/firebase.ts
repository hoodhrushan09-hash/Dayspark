import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const resolvedFirebaseConfig = {
  ...firebaseConfig,
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID ? { projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID } : {}),
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY ? { apiKey: import.meta.env.VITE_FIREBASE_API_KEY } : {}),
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID ? { appId: import.meta.env.VITE_FIREBASE_APP_ID } : {}),
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ? { authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN } : {}),
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DATABASE_ID ? { firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID } : {}),
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ? { storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET } : {}),
  ...(typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ? { messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID } : {}),
};

const app = initializeApp(resolvedFirebaseConfig);
export const auth = getAuth(app);

// Explicitly configure browserLocalPersistence immediately so all authentication flows persist
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Failed to configure browserLocalPersistence on initial setup:', err);
  });
}

export const db = initializeFirestore(app, { ignoreUndefinedProperties: true }, resolvedFirebaseConfig.firestoreDatabaseId);

export function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = removeUndefinedFields(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited.');
    }
    return false;
  }
}
