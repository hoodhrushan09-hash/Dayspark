import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  Compass,
  Award,
  BookOpen,
  Keyboard,
  Sliders,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AppView,
  Task,
  Goal,
  Habit,
  HabitRecord,
  FocusSession,
  Category,
  DailyScore,
  XPTransaction,
  UserAchievement,
  WeeklyReview,
  AchievementKey,
  DashboardConfig,
  Priority,
} from '../../types';
import {
  subscribeTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
} from '../../services/taskService';
import {
  subscribeGoals,
  createGoal,
  updateGoal,
  toggleMilestone,
  deleteGoal,
} from '../../services/goalService';
import {
  subscribeHabits,
  subscribeHabitRecords,
  createHabit,
  toggleHabitDay,
  updateHabit,
  deleteHabit,
} from '../../services/habitService';
import {
  subscribeFocusSessions,
  saveFocusSession,
} from '../../services/focusService';
import { subscribeCategories } from '../../services/categoryService';
import {
  subscribeDailyScores,
  saveDailyScore,
  subscribeXPTransactions,
  awardXP,
  subscribeAchievements,
  syncUserAchievements,
  subscribeWeeklyReviews,
  saveWeeklyReview,
} from '../../services/progressionService';
import { updateUserProfile } from '../../services/userService';

import { calculateDailyProductivityScore } from '../../lib/score';
import { XP_REWARDS, getLevelInfo } from '../../lib/gamification';
import { evaluateAchievements } from '../../lib/achievements';
import { getTodayString } from '../../lib/dates';

import { TodayView } from './TodayView';
import { TasksView } from './TasksView';
import { UpcomingView } from './UpcomingView';
import { CalendarView } from './CalendarView';
import { GoalsView } from './GoalsView';
import { HabitsView } from './HabitsView';
import { FocusTimerView } from './FocusTimerView';
import { StatisticsView } from './StatisticsView';
import { SettingsView } from './SettingsView';
import { AchievementsView } from './AchievementsView';
import { WeeklyReviewView } from './WeeklyReviewView';

import { TaskModal } from './TaskModal';
import { GoalModal } from './GoalModal';
import { HabitModal } from './HabitModal';
import { CommandPalette } from './CommandPalette';
import { QuickAddModal } from './QuickAddModal';
import { DashboardCustomizeModal } from './DashboardCustomizeModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LevelUpModal } from './LevelUpModal';
import { AchievementToast } from './AchievementToast';
import { LoadingScreen } from '../common/LoadingScreen';

export const AppShell: React.FC = () => {
  const { currentUser, userProfile, signOut } = useAuth();
  const { effectiveTheme } = useTheme();

  const [activeView, setActiveView] = useState<AppView>('today');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Firestore persistent state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Progression state
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([]);
  const [xpTransactions, setXPTransactions] = useState<XPTransaction[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [achievementsLoaded, setAchievementsLoaded] = useState(false);
  const [coreDataLoaded, setCoreDataLoaded] = useState(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCustomizeDashboardOpen, setIsCustomizeDashboardOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Gamification celebrations
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; totalXP: number } | null>(null);
  const [unlockedToastKey, setUnlockedToastKey] = useState<AchievementKey | null>(null);

  const prevLevelRef = useRef<number | null>(null);

  const todayStr = getTodayString();

  // Subscribe to real-time collections for the authenticated user
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const unsubTasks = subscribeTasks(uid, (t) => {
      setTasks(t);
      setCoreDataLoaded(true);
    }, console.error);
    const unsubGoals = subscribeGoals(uid, setGoals, console.error);
    const unsubHabits = subscribeHabits(uid, setHabits, console.error);
    const unsubRecords = subscribeHabitRecords(uid, setHabitRecords, console.error);
    const unsubSessions = subscribeFocusSessions(uid, setFocusSessions, console.error);
    const unsubCats = subscribeCategories(uid, setCategories, console.error);

    const unsubScores = subscribeDailyScores(uid, setDailyScores, console.error);
    const unsubXP = subscribeXPTransactions(uid, setXPTransactions, console.error);
    const unsubAchs = subscribeAchievements(uid, (achs) => {
      setUserAchievements(achs);
      setAchievementsLoaded(true);
    }, console.error);
    const unsubReviews = subscribeWeeklyReviews(uid, setWeeklyReviews, console.error);

    return () => {
      unsubTasks();
      unsubGoals();
      unsubHabits();
      unsubRecords();
      unsubSessions();
      unsubCats();
      unsubScores?.();
      unsubXP?.();
      unsubAchs?.();
      unsubReviews?.();
    };
  }, [currentUser]);

  // Total XP & Level calculation
  const totalXP =
    userProfile?.totalXP !== undefined
      ? userProfile.totalXP
      : xpTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

  const currentLevelInfo = getLevelInfo(totalXP);

  // Initialize previous level ref
  useEffect(() => {
    if (prevLevelRef.current === null && currentLevelInfo.level > 0) {
      prevLevelRef.current = currentLevelInfo.level;
    }
  }, [currentLevelInfo.level]);

  // Synchronize dynamic browser title based on active view
  useEffect(() => {
    const viewTitles: Record<AppView, string> = {
      today: 'Dashboard | DaySpark',
      tasks: 'Tasks | DaySpark',
      upcoming: 'Upcoming | DaySpark',
      calendar: 'Calendar | DaySpark',
      goals: 'Goals | DaySpark',
      habits: 'Habits | DaySpark',
      focus: 'Focus Timer | DaySpark',
      reviews: 'Weekly Review | DaySpark',
      achievements: 'Achievements | DaySpark',
      statistics: 'Statistics | DaySpark',
      settings: 'Settings | DaySpark',
    };
    document.title = viewTitles[activeView] || 'DaySpark';
  }, [activeView]);

  // Synchronize Daily Productivity Score on activity changes
  useEffect(() => {
    if (!currentUser || !coreDataLoaded) return;
    const uid = currentUser.uid;

    const calculated = calculateDailyProductivityScore(
      todayStr,
      uid,
      tasks,
      habits,
      habitRecords,
      focusSessions,
      goals
    );

    // Save to Firestore dailyScores snapshot
    const timer = setTimeout(() => {
      saveDailyScore(uid, calculated).catch(console.error);
    }, 600);

    return () => clearTimeout(timer);
  }, [currentUser, coreDataLoaded, tasks, habits, habitRecords, focusSessions, goals, todayStr]);

  // Evaluate & Sync Achievements
  useEffect(() => {
    if (!currentUser || !achievementsLoaded || !coreDataLoaded) return;
    const uid = currentUser.uid;

    const evaluated = evaluateAchievements(
      tasks,
      habits,
      habitRecords,
      focusSessions,
      goals,
      dailyScores,
      weeklyReviews
    );

    syncUserAchievements(uid, evaluated, userAchievements)
      .then((newlyUnlocked) => {
        if (newlyUnlocked.length > 0) {
          setUnlockedToastKey(newlyUnlocked[0]);
        }
      })
      .catch(console.error);
  }, [
    currentUser,
    achievementsLoaded,
    coreDataLoaded,
    tasks,
    habits,
    habitRecords,
    focusSessions,
    goals,
    dailyScores,
    weeklyReviews,
    userAchievements,
  ]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        activeEl?.getAttribute('contenteditable') === 'true';

      // Cmd+K or Ctrl+K triggers command palette everywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // If user is actively typing in a field, don't trigger single-key navigation/shortcuts
      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      } else if (e.key === '1') {
        setActiveView('today');
      } else if (e.key === '2') {
        setActiveView('upcoming');
      } else if (e.key === '3') {
        setActiveView('calendar');
      } else if (e.key === '4') {
        setActiveView('tasks');
      } else if (e.key === '5') {
        setActiveView('goals');
      } else if (e.key === '6') {
        setActiveView('habits');
      } else if (e.key === '7') {
        setActiveView('focus');
      } else if (e.key === '8') {
        setActiveView('reviews');
      } else if (e.key === '9') {
        setActiveView('achievements');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const todayTasksRemaining = tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;
  const unlockedBadgesCount = userAchievements.filter((a) => a.unlocked).length;

  const navigationItems = [
    { id: 'today' as AppView, label: 'Today', icon: Sun, count: todayTasksRemaining },
    { id: 'upcoming' as AppView, label: 'Upcoming', icon: Compass },
    { id: 'calendar' as AppView, label: 'Calendar', icon: Calendar },
    { id: 'tasks' as AppView, label: 'My Tasks', icon: CheckCircle2, count: tasks.filter((t) => !t.completed).length },
    { id: 'goals' as AppView, label: 'Goals', icon: Target },
    { id: 'habits' as AppView, label: 'Habits', icon: Flame },
    { id: 'focus' as AppView, label: 'Focus Timer', icon: Clock },
    { id: 'reviews' as AppView, label: 'Weekly Review', icon: BookOpen },
    { id: 'achievements' as AppView, label: 'Achievements', icon: Award, count: unlockedBadgesCount },
    { id: 'statistics' as AppView, label: 'Statistics', icon: BarChart3 },
  ];

  // Helper to trigger Level Up modal if level increases
  const handleXPResult = (res: { newLevel: number; newTotalXP: number; awarded: boolean }) => {
    if (res.awarded && prevLevelRef.current !== null && res.newLevel > prevLevelRef.current) {
      setLevelUpData({ newLevel: res.newLevel, totalXP: res.newTotalXP });
      prevLevelRef.current = res.newLevel;
    }
  };

  // Task actions with XP award
  const handleToggleTask = async (task: Task) => {
    if (!currentUser) return;
    const wasCompleted = task.completed;
    await toggleTaskCompletion(currentUser.uid, task);

    // If marking complete, award XP
    if (!wasCompleted) {
      const xpAmount =
        task.priority === 'urgent'
          ? XP_REWARDS.TASK_URGENT_COMPLETED
          : XP_REWARDS.TASK_COMPLETED;
      const res = await awardXP(
        currentUser.uid,
        `task_${task.id}_${todayStr}`,
        xpAmount,
        `Completed task: ${task.title}`
      );
      handleXPResult(res);
    }
  };

  const handleSaveTask = async (
    data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!currentUser) return;
    if (editingTask) {
      await updateTask(currentUser.uid, editingTask.id, data);
    } else {
      await createTask(currentUser.uid, data);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;
    await deleteTask(currentUser.uid, taskId);
  };

  const handleQuickAddTask = async (
    title: string,
    priority: Priority,
    category: string
  ) => {
    if (!currentUser) return;
    await createTask(currentUser.uid, {
      title,
      completed: false,
      priority,
      category,
      dueDate: todayStr,
    });
  };

  const handleQuickAddModalSave = async (data: {
    title: string;
    description?: string;
    priority: Priority;
    category: string;
    dueDate?: string;
    estimatedDuration?: number;
  }) => {
    if (!currentUser) return;
    await createTask(currentUser.uid, {
      ...data,
      completed: false,
    });
  };

  // Goal actions with XP award
  const handleSaveGoal = async (
    data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!currentUser) return;
    if (editingGoal) {
      await updateGoal(currentUser.uid, editingGoal.id, data);
    } else {
      await createGoal(currentUser.uid, data);
    }
  };

  const handleToggleMilestone = async (goal: Goal, milestoneId: string) => {
    if (!currentUser) return;
    const m = goal.milestones.find((milestone) => milestone.id === milestoneId);
    const wasCompleted = m?.completed;

    await toggleMilestone(currentUser.uid, goal, milestoneId);

    if (!wasCompleted) {
      const res = await awardXP(
        currentUser.uid,
        `milestone_${goal.id}_${milestoneId}`,
        XP_REWARDS.MILESTONE_COMPLETED,
        `Reached milestone: ${m?.title || 'Goal Milestone'}`
      );
      handleXPResult(res);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser) return;
    await deleteGoal(currentUser.uid, goalId);
  };

  // Habit actions with XP award
  const handleSaveHabit = async (
    data: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!currentUser) return;
    if (editingHabit) {
      await updateHabit(currentUser.uid, editingHabit.id, data);
    } else {
      await createHabit(currentUser.uid, data);
    }
  };

  const handleToggleHabitDay = async (
    habitId: string,
    date: string,
    currentlyCompleted: boolean
  ) => {
    if (!currentUser) return;
    await toggleHabitDay(currentUser.uid, habitId, date, currentlyCompleted);

    if (!currentlyCompleted) {
      const res = await awardXP(
        currentUser.uid,
        `habit_${habitId}_${date}`,
        XP_REWARDS.HABIT_COMPLETED,
        `Completed habit for ${date}`
      );
      handleXPResult(res);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!currentUser) return;
    await deleteHabit(currentUser.uid, habitId);
  };

  // Focus actions with XP award
  const handleSaveFocusSession = async (
    session: Omit<FocusSession, 'id' | 'userId'>
  ) => {
    if (!currentUser) return;
    await saveFocusSession(currentUser.uid, session);

    const xpAmount = Math.max(15, session.durationMinutes);
    const res = await awardXP(
      currentUser.uid,
      `focus_${session.startedAt}`,
      xpAmount,
      `Completed ${session.durationMinutes}m focus session`
    );
    handleXPResult(res);
  };

  // Weekly review save with XP award
  const handleSaveWeeklyReview = async (
    reviewData: Omit<WeeklyReview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    if (!currentUser) throw new Error('Not logged in');
    const id = await saveWeeklyReview(currentUser.uid, reviewData);

    const res = await awardXP(
      currentUser.uid,
      `review_${reviewData.weekStart}_${reviewData.weekEnd}`,
      XP_REWARDS.WEEKLY_REVIEW_COMPLETED,
      'Completed weekly review'
    );
    handleXPResult(res);

    return id;
  };

  const handleCarryForwardTask = async (taskId: string, newDueDate: string) => {
    if (!currentUser) return;
    await updateTask(currentUser.uid, taskId, { dueDate: newDueDate });
  };

  // Save Dashboard Configuration
  const handleSaveDashboardConfig = async (newConfig: DashboardConfig) => {
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, { dashboardConfig: newConfig });
  };

  // Today's score snapshot calculation
  const todayScore =
    dailyScores.find((s) => s.date === todayStr) ||
    calculateDailyProductivityScore(
      todayStr,
      currentUser?.uid || '',
      tasks,
      habits,
      habitRecords,
      focusSessions,
      goals
    );

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
  const yesterdayScore = dailyScores.find((s) => s.date === yesterdayStr);

  if (!coreDataLoaded) {
    return (
      <LoadingScreen
        message="Loading your DaySpark workspace..."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F8F5] dark:bg-[#161715] text-[#262626] dark:text-[#F3F3F0] overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1A1B19] p-4 flex-shrink-0 justify-between select-none">
        <div className="space-y-6">
          {/* Logo & App Name with hover scale */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveView('today');
              }}
              className="cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Logo size="md" />
            </a>

            {/* Quick Add icon button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="btn-press p-1.5 rounded-xl bg-[#FF7058]/10 hover:bg-[#FF7058] text-[#FF7058] hover:text-white transition-all cursor-pointer"
              title="Quick Add Task (N)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Trigger with subtle lift & border transition */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#232522] text-xs text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white hover:border-[#FF7058]/50 hover:bg-white dark:hover:bg-[#282A26] hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 cursor-pointer shadow-2xs group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-115 group-hover:rotate-6 group-hover:text-[#FF7058]" />
              <span className="transition-colors group-hover:text-[#262626] dark:group-hover:text-white">
                Search or jump to...
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-[#2E302B] rounded border border-[#E8E7E0] dark:border-[#383A35] font-mono group-hover:border-[#FF7058]/40 transition-colors">
              ⌘K
            </kbd>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold sidebar-nav-item cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
                    isActive
                      ? 'bg-[#FF7058]/12 text-[#FF7058] dark:bg-[#FF7058]/20 font-bold shadow-2xs'
                      : 'text-[#747474] dark:text-[#A0A09B] hover:bg-[#F5F5F2] dark:hover:bg-[#262824] hover:text-[#262626] dark:hover:text-[#F3F3F0]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#FF7058] transition-all duration-200" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 ease-out ${
                        isActive
                          ? 'text-[#FF7058] scale-110'
                          : 'group-hover:text-[#FF7058] group-hover:scale-115 group-hover:translate-x-0.5'
                      }`}
                    />
                    <span className="transition-colors duration-150">
                      {item.label}
                    </span>
                  </div>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'bg-[#FF7058] text-white shadow-2xs'
                          : 'bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-[#E8E7E0] dark:border-[#2E302B] space-y-1">
          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-[#747474] dark:text-[#A0A09B] hover:bg-[#F5F5F2] dark:hover:bg-[#262824] hover:text-[#262626] dark:hover:text-[#F3F3F0] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Shortcuts</span>
            </div>
            <kbd className="text-[10px] font-mono px-1 bg-black/5 dark:bg-white/10 rounded">
              ?
            </kbd>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold sidebar-nav-item cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
              activeView === 'settings'
                ? 'bg-[#FF7058]/12 text-[#FF7058] font-bold shadow-2xs'
                : 'text-[#747474] dark:text-[#A0A09B] hover:bg-[#F5F5F2] dark:hover:bg-[#262824] hover:text-[#262626] dark:hover:text-[#F3F3F0]'
            }`}
          >
            {activeView === 'settings' && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#FF7058] transition-all duration-200" />
            )}
            <SettingsIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 group-hover:text-[#FF7058] group-hover:scale-110" />
            <span>Settings</span>
          </button>

          {/* User profile row */}
          <div className="flex items-center justify-between px-2 pt-2 group/user rounded-xl hover:bg-[#F5F5F2]/80 dark:hover:bg-[#232522] p-1.5 transition-all duration-150 hover:-translate-y-0.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF7058] to-[#FFD166] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 transition-transform duration-200 group-hover/user:scale-105 shadow-2xs">
                {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate transition-colors group-hover/user:text-[#FF7058]">
                  {userProfile?.displayName || 'DaySpark User'}
                </div>
                <div className="text-[10px] text-[#747474] dark:text-[#A0A09B] truncate">
                  Level {currentLevelInfo.level} · {totalXP.toLocaleString()} XP
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 text-[#747474] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1A1B19]">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="p-2 text-[#FF7058] hover:bg-[#FF7058]/10 rounded-lg transition-colors"
              aria-label="Quick Add"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 text-[#747474] hover:text-[#262626] dark:hover:text-white rounded-lg hover:bg-[#F5F5F2] dark:hover:bg-[#262824] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#747474] hover:text-[#262626] dark:hover:text-white rounded-lg hover:bg-[#F5F5F2] dark:hover:bg-[#262824] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1A1B19] p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[70vh] overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#FF7058]/12 text-[#FF7058] font-bold'
                      : 'text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#262824]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => {
                setActiveView('settings');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#262824] transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
          {activeView === 'today' && (
            <TodayView
              tasks={tasks}
              categories={categories}
              habits={habits}
              habitRecords={habitRecords}
              goals={goals}
              dailyScores={dailyScores}
              todayScore={todayScore}
              yesterdayScore={yesterdayScore}
              weeklyScores={dailyScores}
              totalXP={totalXP}
              recentXPTransactions={xpTransactions}
              userAchievements={userAchievements}
              dashboardConfig={userProfile?.dashboardConfig}
              onToggleTask={handleToggleTask}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
              onOpenNewTaskModal={(defaultDate) => {
                setEditingTask(null);
                setTaskModalDefaultDate(defaultDate);
                setIsTaskModalOpen(true);
              }}
              onToggleHabitDay={handleToggleHabitDay}
              onOpenCustomizeDashboard={() => setIsCustomizeDashboardOpen(true)}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              tasks={tasks}
              categories={categories}
              onToggleTask={handleToggleTask}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeView === 'upcoming' && (
            <UpcomingView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onOpenNewTaskModal={(defaultDate) => {
                setEditingTask(null);
                setTaskModalDefaultDate(defaultDate);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onEditTask={(t) => {
                setEditingTask(t);
                setIsTaskModalOpen(true);
              }}
              onOpenNewTaskModal={(defaultDate) => {
                setEditingTask(null);
                setTaskModalDefaultDate(defaultDate);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeView === 'goals' && (
            <GoalsView
              goals={goals}
              onToggleMilestone={handleToggleMilestone}
              onEditGoal={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onDeleteGoal={handleDeleteGoal}
              onOpenNewGoalModal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
            />
          )}

          {activeView === 'habits' && (
            <HabitsView
              habits={habits}
              habitRecords={habitRecords}
              onToggleHabitDay={handleToggleHabitDay}
              onEditHabit={(h) => {
                setEditingHabit(h);
                setIsHabitModalOpen(true);
              }}
              onDeleteHabit={handleDeleteHabit}
              onOpenNewHabitModal={() => {
                setEditingHabit(null);
                setIsHabitModalOpen(true);
              }}
            />
          )}

          {activeView === 'focus' && (
            <FocusTimerView
              tasks={tasks}
              focusSessions={focusSessions}
              onSaveSession={handleSaveFocusSession}
            />
          )}

          {activeView === 'reviews' && (
            <WeeklyReviewView
              tasks={tasks}
              habits={habits}
              habitRecords={habitRecords}
              focusSessions={focusSessions}
              goals={goals}
              dailyScores={dailyScores}
              userAchievements={userAchievements}
              weeklyReviews={weeklyReviews}
              onSaveReview={handleSaveWeeklyReview}
              onCarryForwardTask={handleCarryForwardTask}
            />
          )}

          {activeView === 'achievements' && (
            <AchievementsView userAchievements={userAchievements} />
          )}

          {activeView === 'statistics' && (
            <StatisticsView
              tasks={tasks}
              habits={habits}
              habitRecords={habitRecords}
              focusSessions={focusSessions}
            />
          )}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        categories={categories}
        defaultDate={taskModalDefaultDate}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onSave={handleQuickAddModalSave}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
        categories={categories}
      />

      {/* Habit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
        categories={categories}
      />

      {/* Command Palette / Global Search */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        goals={goals}
        habits={habits}
        onNavigate={setActiveView}
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNewGoal={() => {
          setEditingGoal(null);
          setIsGoalModalOpen(true);
        }}
        onOpenNewHabit={() => {
          setEditingHabit(null);
          setIsHabitModalOpen(true);
        }}
      />

      {/* Dashboard Customization Modal */}
      <DashboardCustomizeModal
        isOpen={isCustomizeDashboardOpen}
        onClose={() => setIsCustomizeDashboardOpen(false)}
        currentConfig={userProfile?.dashboardConfig}
        onSaveConfig={handleSaveDashboardConfig}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Level-Up Modal Celebration */}
      {levelUpData && (
        <LevelUpModal
          isOpen={true}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData.newLevel}
          totalXP={levelUpData.totalXP}
        />
      )}

      {/* Unlocked Achievement Toast */}
      <AchievementToast
        achievementKey={unlockedToastKey}
        onDismiss={() => setUnlockedToastKey(null)}
      />
    </div>
  );
};
