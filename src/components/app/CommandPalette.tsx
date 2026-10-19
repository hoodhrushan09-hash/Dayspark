import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  Target,
  Flame,
  Clock,
  Calendar,
  X,
  ArrowRight,
  Award,
  Compass,
  FileText,
  Tag,
} from 'lucide-react';
import { Task, Goal, Habit, AppView, WeeklyReview, Category } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  categories?: Category[];
  weeklyReviews?: WeeklyReview[];
  onNavigate: (view: AppView) => void;
  onOpenNewTask: () => void;
  onOpenNewGoal: () => void;
  onOpenNewHabit: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  goals,
  habits,
  categories = [],
  weeklyReviews = [],
  onNavigate,
  onOpenNewTask,
  onOpenNewGoal,
  onOpenNewHabit,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input to keep typing smooth and performant
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 120);
    return () => clearTimeout(handler);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setDebouncedQuery('');
    }
  }, [isOpen]);

  // Handle escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = debouncedQuery.trim().toLowerCase();

  const filteredTasks = trimmed
    ? tasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(trimmed) ||
            t.description?.toLowerCase().includes(trimmed) ||
            t.category?.toLowerCase().includes(trimmed)
        )
        .slice(0, 5)
    : [];

  const filteredGoals = trimmed
    ? goals
        .filter(
          (g) =>
            g.title.toLowerCase().includes(trimmed) ||
            g.description?.toLowerCase().includes(trimmed) ||
            g.category?.toLowerCase().includes(trimmed)
        )
        .slice(0, 3)
    : [];

  const filteredHabits = trimmed
    ? habits
        .filter(
          (h) =>
            h.name.toLowerCase().includes(trimmed) ||
            h.description?.toLowerCase().includes(trimmed) ||
            h.category?.toLowerCase().includes(trimmed)
        )
        .slice(0, 3)
    : [];

  const filteredCategories = trimmed
    ? categories
        .filter((c) => c.name.toLowerCase().includes(trimmed))
        .slice(0, 3)
    : [];

  const filteredReviews = trimmed
    ? weeklyReviews
        .filter(
          (r) =>
            r.reflectionWins?.toLowerCase().includes(trimmed) ||
            r.reflectionImprovements?.toLowerCase().includes(trimmed) ||
            r.personalNotes?.toLowerCase().includes(trimmed) ||
            r.nextWeekPriorities?.some((p) => p.toLowerCase().includes(trimmed))
        )
        .slice(0, 3)
    : [];

  const actions = [
    {
      id: 'act_task',
      label: 'Create new task',
      icon: Plus,
      color: 'text-[#FF7058]',
      action: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'act_goal',
      label: 'Create new goal',
      icon: Target,
      color: 'text-[#B8A7F9]',
      action: () => {
        onClose();
        onOpenNewGoal();
      },
    },
    {
      id: 'act_habit',
      label: 'Add new habit',
      icon: Flame,
      color: 'text-[#FFD166]',
      action: () => {
        onClose();
        onOpenNewHabit();
      },
    },
    {
      id: 'act_focus',
      label: 'Start focus timer',
      icon: Clock,
      color: 'text-[#8EDCC0]',
      action: () => {
        onClose();
        onNavigate('focus');
      },
    },
    {
      id: 'act_review',
      label: 'Weekly review & planning',
      icon: Compass,
      color: 'text-[#8BCBFA]',
      action: () => {
        onClose();
        onNavigate('reviews');
      },
    },
    {
      id: 'act_achievements',
      label: 'View achievements & badges',
      icon: Award,
      color: 'text-[#FFD166]',
      action: () => {
        onClose();
        onNavigate('achievements');
      },
    },
    {
      id: 'act_calendar',
      label: 'View calendar',
      icon: Calendar,
      color: 'text-[#8BCBFA]',
      action: () => {
        onClose();
        onNavigate('calendar');
      },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#20221F] rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] shadow-2xl overflow-hidden"
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 border-b border-[#E8E7E0] dark:border-[#2E302B]">
          <Search className="w-5 h-5 text-[#747474] dark:text-[#A0A09B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, goals, habits, reviews, or actions..."
            className="w-full px-3 py-4 text-sm bg-transparent text-[#262626] dark:text-[#F3F3F0] focus:outline-hidden placeholder-[#A0A09B]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#747474] hover:text-[#262626] dark:hover:text-[#F3F3F0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F2] dark:bg-[#2E302B] text-[#747474] dark:text-[#A0A09B] font-mono">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions (when query is empty) */}
          {!trimmed && (
            <div>
              <p className="px-3 py-1 font-semibold text-[#A0A09B] uppercase tracking-wider text-[10px]">
                Quick Actions & Navigation
              </p>
              <div className="space-y-1 mt-1">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] text-left transition-all duration-150 hover:translate-x-1 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${act.color} transition-transform duration-200 group-hover:scale-115`} />
                        <span className="text-sm font-medium text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#FF7058]">
                          {act.label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A0A09B] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#FF7058]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search results */}
          {trimmed && (
            <>
              {/* Tasks */}
              {filteredTasks.length > 0 && (
                <div>
                  <p className="px-3 py-1 font-semibold text-[#A0A09B] uppercase tracking-wider text-[10px]">
                    Tasks ({filteredTasks.length})
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          onClose();
                          onNavigate('tasks');
                        }}
                        className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] text-left transition-all duration-150 hover:translate-x-1 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <CheckCircle2
                            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-115 ${
                              task.completed ? 'text-[#8EDCC0]' : 'text-[#747474] group-hover:text-[#FF7058]'
                            }`}
                          />
                          <span
                            className={`text-sm truncate transition-colors ${
                              task.completed ? 'line-through text-[#747474]' : 'text-[#262626] dark:text-[#F3F3F0] group-hover:text-[#FF7058]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5F5F2] dark:bg-[#323530] text-[#747474] transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                          {task.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {filteredGoals.length > 0 && (
                <div>
                  <p className="px-3 py-1 font-semibold text-[#A0A09B] uppercase tracking-wider text-[10px]">
                    Goals ({filteredGoals.length})
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredGoals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => {
                          onClose();
                          onNavigate('goals');
                        }}
                        className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] text-left transition-all duration-150 hover:translate-x-1 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Target className="w-4 h-4 text-[#B8A7F9] flex-shrink-0 transition-transform duration-200 group-hover:scale-115" />
                          <span className="text-sm font-medium text-[#262626] dark:text-[#F3F3F0] truncate transition-colors group-hover:text-[#B8A7F9]">
                            {goal.title}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#B8A7F9]/20 text-[#6B50CA] dark:text-[#B8A7F9] font-bold">
                          {goal.progress}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Habits */}
              {filteredHabits.length > 0 && (
                <div>
                  <p className="px-3 py-1 font-semibold text-[#A0A09B] uppercase tracking-wider text-[10px]">
                    Habits ({filteredHabits.length})
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredHabits.map((habit) => (
                      <button
                        key={habit.id}
                        onClick={() => {
                          onClose();
                          onNavigate('habits');
                        }}
                        className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] text-left transition-all duration-150 hover:translate-x-1 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Flame className="w-4 h-4 text-[#FF7058] flex-shrink-0 transition-transform duration-200 group-hover:scale-115" />
                          <span className="text-sm font-medium text-[#262626] dark:text-[#F3F3F0] truncate transition-colors group-hover:text-[#FF7058]">
                            {habit.name}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5F5F2] dark:bg-[#323530] text-[#747474]">
                          {habit.frequency}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Reviews */}
              {filteredReviews.length > 0 && (
                <div>
                  <p className="px-3 py-1 font-semibold text-[#A0A09B] uppercase tracking-wider text-[10px]">
                    Weekly Reviews ({filteredReviews.length})
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredReviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => {
                          onClose();
                          onNavigate('reviews');
                        }}
                        className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] text-left transition-all duration-150 hover:translate-x-1 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Compass className="w-4 h-4 text-[#8BCBFA] flex-shrink-0 transition-transform duration-200 group-hover:scale-115" />
                          <span className="text-sm font-medium text-[#262626] dark:text-[#F3F3F0] truncate transition-colors group-hover:text-[#8BCBFA]">
                            Review: {review.weekStart} to {review.weekEnd}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#8BCBFA]/10 text-[#1A4F78] dark:text-[#8BCBFA] font-semibold">
                          Score: {review.avgDailyScore}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {filteredCategories.length > 0 && (
                <div>
                  <p className="px-3 py-1 font-semibold text-[#A0A09B] uppercase tracking-wider text-[10px]">
                    Categories ({filteredCategories.length})
                  </p>
                  <div className="space-y-1 mt-1">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onClose();
                          onNavigate('tasks');
                        }}
                        className="group w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] text-left transition-all duration-150 hover:translate-x-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Tag className="w-4 h-4 text-[#747474]" />
                          <span className="text-sm font-medium text-[#262626] dark:text-[#F3F3F0]">
                            {cat.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty Search State */}
              {filteredTasks.length === 0 &&
                filteredGoals.length === 0 &&
                filteredHabits.length === 0 &&
                filteredReviews.length === 0 &&
                filteredCategories.length === 0 && (
                  <div className="py-8 text-center text-[#747474] dark:text-[#A0A09B]">
                    <p className="text-sm">No items found matching "{query}"</p>
                    <p className="text-xs mt-1">Try another search term or create a new item.</p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
