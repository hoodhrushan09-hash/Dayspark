import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import { Task, Priority, Category } from '../../types';
import { formatDate, getRelativeDateLabel } from '../../lib/dates';

interface TasksViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenNewTaskModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  categories,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'created'>('date');

  const priorityWeights: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const filteredTasks = tasks.filter((t) => {
    // Status
    if (statusFilter === 'active' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;

    // Priority
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // Category
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === 'priority') {
      return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
    }
    if (sortBy === 'created') {
      return b.createdAt.localeCompare(a.createdAt);
    }
    // Default by date
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            My Tasks
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            {activeCount} active tasks · {completedCount} completed
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="btn-press group px-4 py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 self-start sm:self-auto cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar with refined transitions */}
      <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] space-y-3 shadow-2xs transition-all duration-200 focus-within:border-[#FF7058]/40">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747474] group-focus-within:text-[#FF7058] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] focus:outline-hidden focus:ring-2 focus:ring-[#FF7058]/30 focus:border-[#FF7058] transition-all duration-200"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'completed', label: 'Completed' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] shadow-2xs scale-[1.02]'
                    : 'text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B] text-xs">
          <div className="flex items-center gap-1.5 text-[#747474] dark:text-[#A0A09B] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="px-2.5 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#747474] dark:text-[#A0A09B] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#747474] dark:text-[#A0A09B] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#747474]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'created')}
              className="px-2.5 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#747474] dark:text-[#A0A09B] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
            >
              <option value="date">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="created">Sort by Date Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="card-lift p-12 text-center rounded-2xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9]/50 dark:bg-[#20221F]/50">
          <p className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">No tasks match your criteria</p>
          <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1">
            Try adjusting your search or active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
            }}
            className="btn-press mt-4 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-card group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                task.completed
                  ? 'bg-[#F9F9F7] dark:bg-[#222421] border-[#E8E7E0] dark:border-[#2E302B] opacity-65 hover:opacity-85'
                  : 'bg-white dark:bg-[#20221F] border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/50 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task)}
                  className="cursor-pointer transition-transform duration-150 hover:scale-115 active:scale-90 flex-shrink-0"
                  aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#8EDCC0] transition-colors" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#A0A09B] group-hover:text-[#FF7058] transition-colors" />
                  )}
                </button>

                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEditTask(task)}>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate transition-colors duration-150 ${
                        task.completed
                          ? 'line-through text-[#747474] dark:text-[#A0A09B]'
                          : 'text-[#262626] dark:text-[#F3F3F0] group-hover:text-[#FF7058]'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.isPriorityToday && (
                      <Star className="w-3.5 h-3.5 text-[#FFD166] fill-current flex-shrink-0 transition-transform duration-200 group-hover:scale-115" />
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B] truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {task.dueDate && (
                  <span className="text-[11px] text-[#747474] dark:text-[#A0A09B] transition-colors group-hover:text-[#262626] dark:group-hover:text-white">
                    {getRelativeDateLabel(task.dueDate)}
                  </span>
                )}
                {task.dueTime && (
                  <span className="text-[11px] text-[#747474] dark:text-[#A0A09B] flex items-center gap-1 transition-colors group-hover:text-[#262626] dark:group-hover:text-white">
                    <Clock className="w-3 h-3" />
                    {task.dueTime}
                  </span>
                )}
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#2E302B] text-[#747474] dark:text-[#A0A09B] font-medium transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                  {task.category}
                </span>

                {task.priority === 'urgent' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold transition-transform duration-150 group-hover:scale-105">
                    Urgent
                  </span>
                )}
                {task.priority === 'high' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium transition-transform duration-150 group-hover:scale-105">
                    High
                  </span>
                )}

                <button
                  onClick={() => onEditTask(task)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                  aria-label="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#747474] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
