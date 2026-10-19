import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import {
  DailyScore,
  XPTransaction,
  UserAchievement,
  WeeklyReview,
  AchievementKey,
} from '../types';
import { getLevelInfo } from '../lib/gamification';

// -------------------------------------------------------------
// Daily Scores
// -------------------------------------------------------------

export function subscribeDailyScores(
  userId: string,
  onUpdate: (scores: DailyScore[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = `users/${userId}/dailyScores`;
  try {
    const q = query(collection(db, path), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const scores = snapshot.docs.map((docSnap) => docSnap.data() as DailyScore);
        onUpdate(scores);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        onError?.(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveDailyScore(userId: string, score: DailyScore): Promise<void> {
  const path = `users/${userId}/dailyScores/${score.date}`;
  try {
    const cleanScore = removeUndefinedFields(score);
    await setDoc(doc(db, 'users', userId, 'dailyScores', score.date), cleanScore, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// XP, Levels & Progression (Reliable & Idempotent)
// -------------------------------------------------------------

export function subscribeXPTransactions(
  userId: string,
  onUpdate: (txs: XPTransaction[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = `users/${userId}/xpTransactions`;
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const txs = snapshot.docs.map((docSnap) => docSnap.data() as XPTransaction);
        onUpdate(txs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        onError?.(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export interface AwardXPResult {
  awarded: boolean;
  amount: number;
  newTotalXP: number;
  newLevel: number;
  leveledUp: boolean;
  oldLevel: number;
}

export async function awardXP(
  userId: string,
  actionKey: string,
  amount: number,
  reason: string
): Promise<AwardXPResult> {
  const txPath = `users/${userId}/xpTransactions/${actionKey}`;
  const userPath = `users/${userId}`;

  try {
    // 1. Check idempotency: Has this action already been awarded?
    const txDocRef = doc(db, 'users', userId, 'xpTransactions', actionKey);
    const txSnapshot = await getDoc(txDocRef);

    if (txSnapshot.exists()) {
      // Already awarded, return without duplicate
      return {
        awarded: false,
        amount: 0,
        newTotalXP: 0,
        newLevel: 1,
        leveledUp: false,
        oldLevel: 1,
      };
    }

    // 2. Fetch current user totalXP
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    const userData = userSnapshot.data();
    const currentTotalXP = (userData?.totalXP as number) || 0;
    const oldLevel = getLevelInfo(currentTotalXP).level;

    const newTotalXP = currentTotalXP + amount;
    const newLevelInfo = getLevelInfo(newTotalXP);
    const leveledUp = newLevelInfo.level > oldLevel;

    // 3. Store transaction document
    const newTx: XPTransaction = {
      id: actionKey,
      userId,
      actionKey,
      amount,
      reason,
      createdAt: new Date().toISOString(),
    };
    await setDoc(txDocRef, newTx);

    // 4. Update user profile totalXP and level
    await updateDoc(userDocRef, {
      totalXP: newTotalXP,
      level: newLevelInfo.level,
      updatedAt: new Date().toISOString(),
    });

    return {
      awarded: true,
      amount,
      newTotalXP,
      newLevel: newLevelInfo.level,
      leveledUp,
      oldLevel,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, txPath || userPath);
    throw error;
  }
}

// -------------------------------------------------------------
// Achievements
// -------------------------------------------------------------

export function subscribeAchievements(
  userId: string,
  onUpdate: (achievements: UserAchievement[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = `users/${userId}/achievements`;
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const achs = snapshot.docs.map((docSnap) => docSnap.data() as UserAchievement);
        onUpdate(achs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        onError?.(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncUserAchievements(
  userId: string,
  evaluatedList: { key: AchievementKey; unlocked: boolean; progress: number; maxProgress: number }[],
  existingAchievements: UserAchievement[]
): Promise<AchievementKey[]> {
  const newlyUnlocked: AchievementKey[] = [];
  const existingMap = new Map(existingAchievements.map((a) => [a.achievementKey, a]));

  for (const item of evaluatedList) {
    const existing = existingMap.get(item.key);
    const wasUnlocked = existing?.unlocked || false;

    if (item.unlocked && !wasUnlocked) {
      newlyUnlocked.push(item.key);
      const achievementData: Record<string, unknown> = {
        id: item.key,
        userId,
        achievementKey: item.key,
        unlocked: true,
        progress: item.maxProgress,
        maxProgress: item.maxProgress,
        unlockedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', userId, 'achievements', item.key), achievementData, {
        merge: true,
      });
    } else if (!existing || existing.progress !== item.progress) {
      // Update progress without overwriting unlockedAt with undefined
      const achievementData: Record<string, unknown> = {
        id: item.key,
        userId,
        achievementKey: item.key,
        unlocked: wasUnlocked,
        progress: item.progress,
        maxProgress: item.maxProgress,
      };
      if (existing?.unlockedAt) {
        achievementData.unlockedAt = existing.unlockedAt;
      }
      await setDoc(doc(db, 'users', userId, 'achievements', item.key), achievementData, {
        merge: true,
      });
    }
  }

  return newlyUnlocked;
}

// -------------------------------------------------------------
// Weekly Reviews
// -------------------------------------------------------------

export function subscribeWeeklyReviews(
  userId: string,
  onUpdate: (reviews: WeeklyReview[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = `users/${userId}/weeklyReviews`;
  try {
    const q = query(collection(db, path), orderBy('weekStart', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const reviews = snapshot.docs.map((docSnap) => docSnap.data() as WeeklyReview);
        onUpdate(reviews);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        onError?.(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveWeeklyReview(
  userId: string,
  review: Omit<WeeklyReview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  reviewId?: string
): Promise<string> {
  const id = reviewId || `review_${review.weekStart}_${review.weekEnd}`;
  const path = `users/${userId}/weeklyReviews/${id}`;
  try {
    const fullReview: WeeklyReview = {
      ...review,
      id,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId, 'weeklyReviews', id), removeUndefinedFields(fullReview), { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
