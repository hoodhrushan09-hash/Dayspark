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
  Folder,
  BookOpen,
  DollarSign,
  Bell,
  Sparkles,
} from 'lucide-react';
import {
  Task,
  Goal,
  Habit,
  AppView,
  WeeklyReview,
  Category,
  Project,
  Note,
  Expense,
} from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  projects?: Project[];
  notes?: Note[];
  expenses?: Expense[];
  categories?: Category[];
  weeklyReviews?: WeeklyReview[];
  onNavigate: (view: AppView) => void;
  onOpenNewTask: () => void;
  onOpenNewGoal: () => void;
  onOpenNewHabit: () => void;
  onOpenNewProject?: () => void;
  onOpenNewNote?: () => void;
  onOpenNewExpense?: () => void;
  onOpenNewReminder?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  goals,
  habits,
  projects = [],
  notes = [],
  expenses = [],
  categories = [],
  weeklyReviews = [],
  onNavigate,
  onOpenNewTask,
  onOpenNewGoal,
  onOpenNewHabit,
  onOpenNewProject,
  onOpenNewNote,
  onOpenNewExpense,
  onOpenNewReminder,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce input to keep typing smooth and performant
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 100);
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
        .slice(0, 4)
    : [];

  const filteredProjects = trimmed
    ? projects
        .filter(
          (p) =>
            p.name.toLowerCase().includes(trimmed) ||
            p.description?.toLowerCase().includes(trimmed)
        )
        .slice(0, 3)
    : [];

  const filteredNotes = trimmed
    ? notes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(trimmed) ||
            n.content.toLowerCase().includes(trimmed) ||
            n.tags?.some((t) => t.toLowerCase().includes(trimmed))
        )
        .slice(0, 3)
    : [];

  const filteredExpenses = trimmed
    ? expenses
        .filter(
          (e) =>
            e.description.toLowerCase().includes(trimmed) ||
            e.category.toLowerCase().includes(trimmed) ||
            e.notes?.toLowerCase().includes(trimmed)
        )
        .slice(0, 3)
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

  const actions = [
    {
      id: 'act_task',
      label: 'Add a new task',
      icon: Plus,
      color: 'text-[#FF7058]',
      action: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'act_planner',
      label: 'Open AI Daily Planner',
      icon: Sparkles,
      color: 'text-[#FF7058]',
      action: () => {
        onClose();
        onNavigate('planner');
      },
    },
    {
      id: 'act_note',
      label: 'Create a note',
      icon: BookOpen,
      color: 'text-[#8BCBFA]',
      action: () => {
        onClose();
        if (onOpenNewNote) onOpenNewNote();
        else onNavigate('notes');
      },
    },
    {
      id: 'act_project',
      label: 'Create a project',
      icon: Folder,
      color: 'text-[#B8A7F9]',
      action: () => {
        onClose();
        if (onOpenNewProject) onOpenNewProject();
        else onNavigate('projects');
      },
    },
    {
      id: 'act_expense',
      label: 'Record expense or income',
      icon: DollarSign,
      color: 'text-emerald-500',
      action: () => {
        onClose();
        if (onOpenNewExpense) onOpenNewExpense();
        else onNavigate('expenses');
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
      id: 'act_reminder',
      label: 'Set a reminder',
      icon: Bell,
      color: 'text-amber-500',
      action: () => {
        onClose();
        if (onOpenNewReminder) onOpenNewReminder();
      },
    },
  ];

  const views: { id: AppView; label: string; icon: any }[] = [
    { id: 'today', label: 'Today Dashboard', icon: Sparkles },
    { id: 'planner', label: 'AI Planner', icon: Sparkles },
    { id: 'projects', label: 'Projects & Kanban', icon: Folder },
    { id: 'notes', label: 'Knowledge Hub & Notes', icon: BookOpen },
    { id: 'calendar', label: 'Calendar & Time Blocking', icon: Calendar },
    { id: 'tasks', label: 'All Tasks', icon: CheckCircle2 },
    { id: 'expenses', label: 'Personal Expenses', icon: DollarSign },
    { id: 'goals', label: 'Goals & Milestones', icon: Target },
    { id: 'habits', label: 'Daily Habits', icon: Flame },
    { id: 'focus', label: 'Focus Room', icon: Clock },
    { id: 'reviews', label: 'Weekly Review', icon: FileText },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: ArrowRight },
  ];

  const filteredViews = trimmed
    ? views.filter((v) => v.label.toLowerCase().includes(trimmed))
    : views.slice(0, 6);

  const hasResults =
    filteredTasks.length > 0 ||
    filteredProjects.length > 0 ||
    filteredNotes.length > 0 ||
    filteredExpenses.length > 0 ||
    filteredGoals.length > 0 ||
    filteredHabits.length > 0 ||
    filteredViews.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1A1B19] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8E7E0] dark:border-[#2E302B]">
          <Search className="w-5 h-5 text-[#FF7058]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, projects, notes, expenses, goals, or jump to view..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#262626] dark:text-[#F3F3F0] outline-hidden placeholder:text-[#A0A09B]"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#747474] hover:text-[#262626] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-[#F5F5F2] dark:bg-[#282A26] rounded border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Actions (when query is empty or matches) */}
          {!trimmed && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Quick Actions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={act.action}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors text-left cursor-pointer"
                    >
                      <Icon className={`w-4 h-4 ${act.color}`} />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Tasks ({filteredTasks.length})
              </span>
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onClose();
                    onNavigate('tasks');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        t.completed ? 'text-emerald-500' : 'text-[#747474]'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold truncate ${
                        t.completed ? 'line-through text-[#A0A09B]' : 'text-[#262626] dark:text-[#F3F3F0]'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#747474] shrink-0 capitalize">
                    {t.category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Projects ({filteredProjects.length})
              </span>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onClose();
                    onNavigate('projects');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder
                      className="w-4 h-4 shrink-0"
                      style={{ color: p.color || '#B8A7F9' }}
                    />
                    <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#747474] shrink-0">Project</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes Results */}
          {filteredNotes.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Notes ({filteredNotes.length})
              </span>
              {filteredNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onClose();
                    onNavigate('notes');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className="w-4 h-4 text-[#8BCBFA] shrink-0" />
                    <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                      {n.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#747474] shrink-0">Note</span>
                </div>
              ))}
            </div>
          )}

          {/* Expenses Results */}
          {filteredExpenses.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Expenses & Transactions ({filteredExpenses.length})
              </span>
              {filteredExpenses.map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    onClose();
                    onNavigate('expenses');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                      {e.description || e.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#747474] shrink-0">
                    ${e.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Goals Results */}
          {filteredGoals.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Goals ({filteredGoals.length})
              </span>
              {filteredGoals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    onClose();
                    onNavigate('goals');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Target className="w-4 h-4 text-[#B8A7F9] shrink-0" />
                    <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                      {g.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#747474] shrink-0">Goal</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Views */}
          {filteredViews.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] px-3">
                Jump to View
              </span>
              {filteredViews.map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      onClose();
                      onNavigate(v.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#FF7058]" />
                      <span>{v.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A0A09B]" />
                  </button>
                );
              })}
            </div>
          )}

          {trimmed && !hasResults && (
            <div className="p-8 text-center text-xs text-[#747474]">
              No results found for "{query}". Try searching for a task title, project, or view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
