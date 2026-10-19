import React from 'react';
import { CheckCircle2, Circle, Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { groupTasksByDateRange, formatDate, getTodayString } from '../../lib/dates';

interface UpcomingViewProps {
  tasks: Task[];
  onToggleTask: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenNewTaskModal: (defaultDate?: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  const groups = groupTasksByDateRange(tasks);

  const sections: { key: keyof typeof groups; title: string; color: string; count: number }[] = [
    { key: 'overdue', title: 'Overdue', color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900', count: groups.overdue.length },
    { key: 'today', title: 'Today', color: 'text-[#FF7058] bg-[#FF7058]/10 border-[#FF7058]/20', count: groups.today.length },
    { key: 'tomorrow', title: 'Tomorrow', color: 'text-[#8BCBFA] bg-[#8BCBFA]/10 border-[#8BCBFA]/20', count: groups.tomorrow.length },
    { key: 'thisWeek', title: 'This Week', color: 'text-[#B8A7F9] bg-[#B8A7F9]/10 border-[#B8A7F9]/20', count: groups.thisWeek.length },
    { key: 'later', title: 'Later', color: 'text-[#8EDCC0] bg-[#8EDCC0]/10 border-[#8EDCC0]/20', count: groups.later.length },
    { key: 'unscheduled', title: 'No Date Set', color: 'text-[#A0A09B] bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800', count: groups.unscheduled.length },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Upcoming Timeline
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            See what lies ahead and keep your momentum organized.
          </p>
        </div>

        <button
          onClick={() => onOpenNewTaskModal(getTodayString())}
          className="btn-press group px-4 py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 self-start sm:self-auto cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>New Task</span>
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => {
          const sectionTasks = groups[sec.key];
          if (sectionTasks.length === 0 && sec.key !== 'today' && sec.key !== 'tomorrow') {
            return null;
          }

          return (
            <div key={sec.key} className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold transition-all duration-200 ${sec.color}`}>
                  {sec.title}
                </span>
                <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
                  ({sectionTasks.length})
                </span>
              </div>

              {sectionTasks.length === 0 ? (
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] italic py-2 pl-2">
                  Nothing scheduled for {sec.title.toLowerCase()}.
                </p>
              ) : (
                <div className="space-y-2">
                  {sectionTasks.map((task) => (
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
                          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#8EDCC0] transition-colors" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#A0A09B] group-hover:text-[#FF7058] transition-colors" />
                          )}
                        </button>

                        <div
                          className="min-w-0 flex-1 cursor-pointer"
                          onClick={() => onEditTask(task)}
                        >
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
                          </div>
                          {task.dueDate && (
                            <p className="text-[11px] text-[#747474] dark:text-[#A0A09B] mt-0.5 transition-colors group-hover:text-[#262626] dark:group-hover:text-white">
                              Due: {formatDate(task.dueDate)}
                              {task.dueTime ? ` at ${task.dueTime}` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#2E302B] text-[#747474] dark:text-[#A0A09B] font-medium transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                          {task.category}
                        </span>

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
        })}
      </div>
    </div>
  );
};
