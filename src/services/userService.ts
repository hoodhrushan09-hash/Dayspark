import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, removeUndefinedFields } from '../lib/firebase';
import { UserProfile, DashboardConfig } from '../types';

export const DEFAULT_CATEGORIES = [
  { name: 'Work', color: '#8BCBFA', icon: 'Briefcase' },
  { name: 'Personal', color: '#FF7058', icon: 'Heart' },
  { name: 'Study', color: '#B8A7F9', icon: 'BookOpen' },
  { name: 'Health', color: '#8EDCC0', icon: 'Activity' },
  { name: 'Errands', color: '#FFD166', icon: 'ShoppingBag' },
  { name: 'Other', color: '#9CA3AF', icon: 'Tag' },
];

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  widgets: [
    { id: 'score', label: 'Productivity Score', description: "Today's score & historical trends", enabled: true, order: 1 },
    { id: 'tasks', label: "Today's Tasks", description: 'Priority tasks and daily to-do items', enabled: true, order: 2 },
    { id: 'xp', label: 'XP & Progression', description: 'Level progress and recent XP activity', enabled: true, order: 3 },
    { id: 'habits', label: 'Daily Habits', description: 'Habit check-in matrix and streak tracker', enabled: true, order: 4 },
    { id: 'focus', label: 'Focus Timer', description: 'Quick-access Pomodoro countdown', enabled: true, order: 5 },
    { id: 'goals', label: 'Active Goals', description: 'Target milestones and progress bars', enabled: true, order: 6 },
    { id: 'projects', label: 'Active Projects', description: 'Overview of projects and completion progress', enabled: true, order: 7 },
    { id: 'notes', label: 'Recent Notes', description: 'Pinned notes and quick thoughts', enabled: true, order: 8 },
    { id: 'reminders', label: 'Upcoming Reminders', description: 'Active alerts and scheduled reminders', enabled: true, order: 9 },
    { id: 'expenses', label: 'Monthly Spending', description: 'Monthly expense totals and budget progress', enabled: true, order: 10 },
    { id: 'achievements', label: 'Recent Badges', description: 'Latest unlocked productivity achievements', enabled: true, order: 11 },
    { id: 'weekly', label: 'Weekly Summary', description: 'Quick weekly snapshot and review', enabled: true, order: 12 },
  ],
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  }
}

export async function initializeUserProfile(user: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  try {
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      const data = existing.data() as UserProfile;
      // Ensure defaults if missing
      if (!data.dashboardConfig) {
        data.dashboardConfig = DEFAULT_DASHBOARD_CONFIG;
        await updateDoc(userRef, { dashboardConfig: DEFAULT_DASHBOARD_CONFIG });
      }
      return data;
    }

    const newProfile: UserProfile = {
      userId: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Friend',
      email: user.email || '',
      photoURL: user.photoURL || '',
      theme: 'system',
      accentColor: '#FF7058',
      reducedMotion: false,
      dateFormat: 'MMM D, YYYY',
      timeFormat: '12h',
      weekStart: 'monday',
      defaultTaskDuration: 30,
      totalXP: 0,
      level: 1,
      dashboardConfig: DEFAULT_DASHBOARD_CONFIG,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, removeUndefinedFields(newProfile));

    // Bootstrap default categories
    for (const cat of DEFAULT_CATEGORIES) {
      const catId = `cat_${cat.name.toLowerCase()}`;
      const catRef = doc(db, 'users', user.uid, 'categories', catId);
      await setDoc(catRef, {
        id: catId,
        userId: user.uid,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      });
    }

    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function deleteUserData(userId: string): Promise<void> {
  const subcollections = [
    'tasks',
    'goals',
    'habits',
    'habitRecords',
    'focusSessions',
    'categories',
    'dailyScores',
    'xpTransactions',
    'achievements',
    'weeklyReviews',
    'projects',
    'notes',
    'expenses',
    'budgets',
    'reminders',
    'plans',
  ];
  try {
    for (const sub of subcollections) {
      const subRef = collection(db, 'users', userId, sub);
      const snapshot = await getDocs(subRef);
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
    }
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}
