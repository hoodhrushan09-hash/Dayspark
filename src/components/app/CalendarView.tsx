import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Task } from '../../types';
import { getCalendarDaysForMonth, getTodayString, formatDate } from '../../lib/dates';
import { useAuth } from '../../contexts/AuthContext';

interface CalendarViewProps {
  tasks: Task[];
  onToggleTask: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: (defaultDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onOpenNewTaskModal,
}) => {
  const { userProfile } = useAuth();
  const today = new Date();
  const todayStr = getTodayString(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDayDate, setSelectedDayDate] = useState(todayStr);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDays = userProfile?.weekStart === 'sunday'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const jumpToToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDayDate(todayStr);
  };

  const calendarDays = getCalendarDaysForMonth(
    currentYear,
    currentMonth,
    tasks,
    userProfile?.weekStart || 'monday',
    todayStr
  );

  // Day view tasks
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDayDate);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Calendar
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Schedule and visualize your days with clarity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl">
            {(['month', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all duration-200 cursor-pointer ${
                  calendarMode === mode
                    ? 'bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] shadow-2xs scale-[1.02]'
                    : 'text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenNewTaskModal(selectedDayDate)}
            className="btn-press group px-3.5 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Date Switcher Ribbon */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[#262626] dark:text-[#F3F3F0]">
            {calendarMode === 'month'
              ? `${monthNames[currentMonth]} ${currentYear}`
              : formatDate(selectedDayDate)}
          </h2>
          <button
            onClick={jumpToToday}
            className="btn-press px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors text-[#747474] dark:text-[#A0A09B] cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="btn-press p-1.5 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors text-[#747474] cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="btn-press p-1.5 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors text-[#747474] cursor-pointer group"
          >
            <ChevronRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {calendarMode === 'month' && (
        <div className="rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] overflow-hidden shadow-2xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#E8E7E0] dark:border-[#2E302B] text-center text-xs font-bold text-[#747474] dark:text-[#A0A09B] bg-[#F8F8F5] dark:bg-[#1A1B19] py-2.5 select-none">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Calendar Grid cells with smooth hover depth */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8E7E0] dark:divide-[#2E302B]">
            {calendarDays.map((day) => (
              <div
                key={day.dateString}
                onClick={() => {
                  setSelectedDayDate(day.dateString);
                }}
                className={`min-h-[96px] sm:min-h-[112px] p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
                  day.isCurrentMonth
                    ? 'bg-transparent'
                    : 'bg-[#F9F9F7]/60 dark:bg-[#1A1B19]/60 opacity-40'
                } ${
                  day.dateString === selectedDayDate
                    ? 'ring-2 ring-inset ring-[#FF7058]/50 bg-[#FF7058]/5'
                    : 'hover:bg-[#F5F5F2] dark:hover:bg-[#262824] hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold transition-transform duration-200 group-hover:scale-105 ${
                      day.isToday
                        ? 'w-6 h-6 rounded-full bg-[#FF7058] text-white flex items-center justify-center font-bold shadow-2xs'
                        : 'text-[#262626] dark:text-[#F3F3F0]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewTaskModal(day.dateString);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#747474] hover:text-[#FF7058] transition-all duration-150 hover:scale-125 active:scale-95 cursor-pointer focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                    aria-label={`Add task for ${day.dateString}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day tasks pills with hover highlight */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {day.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-all duration-150 hover:scale-[1.03] hover:brightness-105 active:scale-95 cursor-pointer ${
                        task.completed
                          ? 'line-through opacity-50 bg-[#E8E7E0] dark:bg-[#323530] text-[#747474]'
                          : 'bg-[#8BCBFA]/20 text-[#1B6194] dark:text-[#8BCBFA] hover:bg-[#8BCBFA]/30 shadow-2xs'
                      }`}
                    >
                      <span>{task.title}</span>
                    </div>
                  ))}
                  {day.tasks.length > 3 && (
                    <span className="text-[9px] font-bold text-[#747474] dark:text-[#A0A09B] block transition-colors group-hover:text-[#FF7058]">
                      +{day.tasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {calendarMode === 'day' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8E7E0] dark:border-[#2E302B]">
              <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                Tasks on {formatDate(selectedDayDate)} ({selectedDayTasks.length})
              </h3>
              <button
                onClick={() => onOpenNewTaskModal(selectedDayDate)}
                className="btn-press px-3 py-1.5 rounded-lg bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="py-12 text-center text-[#747474] dark:text-[#A0A09B]">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50 transition-transform duration-300 hover:scale-110" />
                <p className="text-sm font-medium">No tasks scheduled for this day</p>
                <button
                  onClick={() => onOpenNewTaskModal(selectedDayDate)}
                  className="mt-3 text-xs font-bold text-[#FF7058] hover:text-[#F06148] hover:underline cursor-pointer transition-colors"
                >
                  Schedule something now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="task-card group flex items-center justify-between p-3.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] hover:border-[#FF7058]/50 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleTask(t)}
                        className="cursor-pointer transition-transform duration-150 hover:scale-115 active:scale-90"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            t.completed ? 'text-[#8EDCC0]' : 'text-[#A0A09B] group-hover:text-[#FF7058]'
                          } transition-colors`}
                        />
                      </button>
                      <span
                        className={`text-sm font-medium transition-colors ${
                          t.completed ? 'line-through text-[#747474]' : 'text-[#262626] dark:text-[#F3F3F0] group-hover:text-[#FF7058]'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                    {t.dueTime && (
                      <span className="text-xs text-[#747474] flex items-center gap-1 transition-colors group-hover:text-[#262626] dark:group-hover:text-white">
                        <Clock className="w-3.5 h-3.5" /> {t.dueTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
