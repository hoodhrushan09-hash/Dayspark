import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertTriangle,
  RotateCw,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Task, Reminder } from '../../types';
import {
  getCalendarDaysForMonth,
  getTodayString,
  formatDate,
  getWeekRange,
} from '../../lib/dates';
import { useAuth } from '../../contexts/AuthContext';
import { updateTask } from '../../services/taskService';

interface CalendarViewProps {
  tasks: Task[];
  reminders?: Reminder[];
  onToggleTask: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: (defaultDate?: string) => void;
  onRescheduleTask?: (taskId: string, newDate: string, newTime?: string) => Promise<void>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  reminders = [],
  onToggleTask,
  onEditTask,
  onOpenNewTaskModal,
  onRescheduleTask,
}) => {
  const { userProfile, currentUser } = useAuth();
  const today = new Date();
  const todayStr = getTodayString(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('week');
  const [selectedDayDate, setSelectedDayDate] = useState(todayStr);

  const [rescheduleMessage, setRescheduleMessage] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDayLabels = userProfile?.weekStart === 'sunday'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const prevPeriod = () => {
    if (calendarMode === 'month') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      const d = new Date(selectedDayDate + 'T00:00:00');
      d.setDate(d.getDate() - (calendarMode === 'week' ? 7 : 1));
      setSelectedDayDate(getTodayString(d));
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    }
  };

  const nextPeriod = () => {
    if (calendarMode === 'month') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      const d = new Date(selectedDayDate + 'T00:00:00');
      d.setDate(d.getDate() + (calendarMode === 'week' ? 7 : 1));
      setSelectedDayDate(getTodayString(d));
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    }
  };

  const jumpToToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDayDate(todayStr);
  };

  // Calendar month days
  const calendarDays = getCalendarDaysForMonth(
    currentYear,
    currentMonth,
    tasks,
    userProfile?.weekStart || 'monday',
    todayStr
  );

  // Time grid hours: 07:00 to 21:00
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  // Helper to get 7 days for current week view
  const currentSelectedDate = new Date(selectedDayDate + 'T00:00:00');
  const weekStartPref = userProfile?.weekStart || 'monday';
  const dayOfWeek = currentSelectedDate.getDay();
  const startOffset = weekStartPref === 'sunday' ? dayOfWeek : (dayOfWeek + 6) % 7;
  const weekStartDate = new Date(currentSelectedDate);
  weekStartDate.setDate(currentSelectedDate.getDate() - startOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    const dateKey = getTodayString(d);
    return {
      dateKey,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: dateKey === todayStr,
      isSelected: dateKey === selectedDayDate,
      tasks: tasks.filter((t) => t.dueDate === dateKey),
    };
  });

  // Tasks for day view
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDayDate);
  const scheduledTimeTasks = selectedDayTasks.filter((t) => t.calendarStartTime || t.dueTime);
  const unscheduledDayTasks = selectedDayTasks.filter((t) => !t.calendarStartTime && !t.dueTime);

  // Overdue / Unfinished Tasks that can be rescheduled
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);

  const handleRescheduleAllOverdue = async () => {
    if (!currentUser || overdueTasks.length === 0) return;
    try {
      for (const t of overdueTasks) {
        if (onRescheduleTask) {
          await onRescheduleTask(t.id, todayStr);
        } else {
          await updateTask(currentUser.uid, t.id, { dueDate: todayStr });
        }
      }
      setRescheduleMessage(`Moved ${overdueTasks.length} overdue task(s) to today.`);
      setTimeout(() => setRescheduleMessage(null), 4000);
    } catch (err) {
      console.error('Error rescheduling overdue tasks:', err);
    }
  };

  // Detect conflicts: check if any two scheduled tasks on selected day overlap
  const conflicts: string[] = [];
  scheduledTimeTasks.forEach((t1, i) => {
    const t1Time = t1.calendarStartTime || t1.dueTime || '09:00';
    const [h1, m1] = t1Time.split(':').map(Number);
    const start1 = h1 * 60 + m1;
    const dur1 = t1.calendarDuration || t1.estimatedDuration || 30;
    const end1 = start1 + dur1;

    scheduledTimeTasks.slice(i + 1).forEach((t2) => {
      const t2Time = t2.calendarStartTime || t2.dueTime || '09:00';
      const [h2, m2] = t2Time.split(':').map(Number);
      const start2 = h2 * 60 + m2;
      const dur2 = t2.calendarDuration || t2.estimatedDuration || 30;
      const end2 = start2 + dur2;

      if (start1 < end2 && start2 < end1) {
        conflicts.push(`"${t1.title}" overlaps with "${t2.title}"`);
      }
    });
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#8BCBFA]/15 text-[#1A4F78] dark:text-[#8BCBFA]">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Calendar & Time Blocking
            </h1>
          </div>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Schedule, visualize, and block out dedicated focus hours with zero friction.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  calendarMode === mode
                    ? 'bg-white dark:bg-[#20221F] text-[#FF7058] font-bold shadow-2xs'
                    : 'text-[#747474] hover:text-[#262626] dark:hover:text-[#F3F3F0]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* New Task Button */}
          <button
            onClick={() => onOpenNewTaskModal(selectedDayDate)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF7058] hover:bg-[#e65e47] text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className="p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="p-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-sm font-black text-[#262626] dark:text-[#F3F3F0] ml-2">
            {calendarMode === 'month'
              ? `${monthNames[currentMonth]} ${currentYear}`
              : calendarMode === 'week'
              ? `Week of ${weekDays[0]?.dayName} ${weekDays[0]?.dayNumber} – ${weekDays[6]?.dayNumber} ${monthNames[currentMonth]}`
              : `${formatDate(selectedDayDate)}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {overdueTasks.length > 0 && (
            <button
              onClick={handleRescheduleAllOverdue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Carry {overdueTasks.length} Overdue to Today</span>
            </button>
          )}

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Reschedule Message Banner */}
      {rescheduleMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{rescheduleMessage}</span>
        </div>
      )}

      {/* Conflict Detection Banner */}
      {conflicts.length > 0 && calendarMode !== 'month' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold">
              Time conflict detected: {conflicts[0]}
              {conflicts.length > 1 ? ` (+${conflicts.length - 1} more)` : ''}
            </span>
          </div>
        </div>
      )}

      {/* VIEW: MONTH VIEW */}
      {calendarMode === 'month' && (
        <div className="rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2]/50 dark:bg-[#282A26]/50">
            {weekDayLabels.map((day) => (
              <div
                key={day}
                className="py-2.5 text-center text-[11px] font-bold text-[#747474] dark:text-[#A0A09B]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8E7E0] dark:divide-[#2E302B]">
            {calendarDays.map((d, index) => {
              const isSelected = d.dateString === selectedDayDate;
              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDayDate(d.dateString);
                    setCalendarMode('day');
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer ${
                    !d.isCurrentMonth
                      ? 'bg-[#F9F9F7]/40 dark:bg-[#1C1D1A]/40 text-[#A0A09B] opacity-60'
                      : 'hover:bg-[#F5F5F2]/80 dark:hover:bg-[#262824]'
                  } ${isSelected ? 'ring-2 ring-inset ring-[#FF7058]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        d.isToday
                          ? 'bg-[#FF7058] text-white shadow-2xs'
                          : 'text-[#262626] dark:text-[#F3F3F0]'
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                    {d.tasks.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474]">
                        {d.tasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {d.tasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(t);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                          t.completed
                            ? 'line-through opacity-50 bg-[#F5F5F2] dark:bg-[#282A26]'
                            : t.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-[#FF7058]/10 text-[#FF7058]'
                        }`}
                      >
                        {t.calendarStartTime && (
                          <span className="font-mono text-[9px] shrink-0">{t.calendarStartTime}</span>
                        )}
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {d.tasks.length > 2 && (
                      <div className="text-[9px] text-[#747474] font-medium pl-1">
                        +{d.tasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK VIEW WITH HOURLY GRID */}
      {calendarMode === 'week' && (
        <div className="rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Week Header Row */}
            <div className="grid grid-cols-8 border-b border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2]/60 dark:bg-[#282A26]/60 sticky top-0 z-10">
              <div className="p-3 text-[11px] font-bold text-[#747474] text-center">Time</div>
              {weekDays.map((wd) => (
                <div
                  key={wd.dateKey}
                  onClick={() => {
                    setSelectedDayDate(wd.dateKey);
                    setCalendarMode('day');
                  }}
                  className={`p-3 text-center border-l border-[#E8E7E0] dark:border-[#2E302B] cursor-pointer transition-colors ${
                    wd.isToday
                      ? 'bg-[#FF7058]/10 font-bold text-[#FF7058]'
                      : 'hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-[#747474]">{wd.dayName}</div>
                  <div className="text-sm font-mono font-bold mt-0.5">{wd.dayNumber}</div>
                </div>
              ))}
            </div>

            {/* Hourly Row Grid */}
            <div className="divide-y divide-[#E8E7E0]/60 dark:divide-[#2E302B]/60">
              {hours.map((hour) => {
                const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[52px]">
                    <div className="p-2 text-[10px] font-mono text-[#747474] text-right pr-3 select-none">
                      {hourStr}
                    </div>

                    {weekDays.map((wd) => {
                      // Find tasks matching this hour block
                      const matchingTasks = wd.tasks.filter((t) => {
                        const time = t.calendarStartTime || t.dueTime;
                        if (!time) return false;
                        const taskHour = parseInt(time.split(':')[0], 10);
                        return taskHour === hour;
                      });

                      return (
                        <div
                          key={wd.dateKey}
                          onClick={() => {
                            setSelectedDayDate(wd.dateKey);
                            onOpenNewTaskModal(wd.dateKey);
                          }}
                          className="border-l border-[#E8E7E0]/60 dark:border-[#2E302B]/60 p-1 relative hover:bg-[#F5F5F2]/40 dark:hover:bg-[#282A26]/40 cursor-pointer"
                        >
                          {matchingTasks.map((t) => (
                            <div
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTask(t);
                              }}
                              className={`p-1.5 rounded-lg text-xs font-semibold shadow-2xs mb-1 truncate transition-transform hover:scale-[1.02] ${
                                t.completed
                                  ? 'bg-neutral-100 dark:bg-neutral-800 text-[#747474] line-through'
                                  : t.priority === 'urgent'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-[#FF7058] text-white'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span className="font-mono text-[9px]">
                                  {t.calendarStartTime || t.dueTime}
                                </span>
                              </div>
                              <div className="truncate text-[10px] mt-0.5">{t.title}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: DAY VIEW WITH HOURLY TIME BLOCKING & SIDEBAR */}
      {calendarMode === 'day' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Hourly Timeline */}
          <div className="md:col-span-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF7058]">
                {formatDate(selectedDayDate)} Timeline
              </span>
              <button
                onClick={() => onOpenNewTaskModal(selectedDayDate)}
                className="text-xs font-bold text-[#FF7058] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Block</span>
              </button>
            </div>

            <div className="divide-y divide-[#E8E7E0]/60 dark:divide-[#2E302B]/60">
              {hours.map((hour) => {
                const hourPrefix = `${hour.toString().padStart(2, '0')}:`;
                const blocksThisHour = scheduledTimeTasks.filter((t) => {
                  const tTime = t.calendarStartTime || t.dueTime || '';
                  return tTime.startsWith(hourPrefix);
                });

                return (
                  <div key={hour} className="py-2.5 flex items-start gap-4 min-h-[58px]">
                    <span className="w-12 text-xs font-mono font-bold text-[#747474] pt-1 select-none">
                      {hour.toString().padStart(2, '0')}:00
                    </span>

                    <div className="flex-1 space-y-1.5">
                      {blocksThisHour.length === 0 ? (
                        <div
                          onClick={() => onOpenNewTaskModal(selectedDayDate)}
                          className="h-8 rounded-xl border border-dashed border-transparent hover:border-[#E8E7E0] dark:hover:border-[#2E302B] hover:bg-[#F5F5F2]/40 transition-colors cursor-pointer flex items-center px-3 text-[11px] text-[#A0A09B]"
                        >
                          + Click to block time
                        </div>
                      ) : (
                        blocksThisHour.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => onEditTask(task)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              task.completed
                                ? 'bg-[#F5F5F2] dark:bg-[#282A26] border-transparent text-[#747474]'
                                : task.priority === 'urgent'
                                ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30'
                                : 'border-[#FF7058]/30 bg-[#FF7058]/8'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleTask(task);
                                }}
                                className="text-[#FF7058] shrink-0"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-5 h-5 fill-[#FF7058] text-white" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-[#FF7058]" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <h4
                                  className={`text-xs font-bold truncate ${
                                    task.completed ? 'line-through text-[#A0A09B]' : 'text-[#262626] dark:text-[#F3F3F0]'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[10px] text-[#747474] mt-0.5 font-mono">
                                  <span>
                                    {task.calendarStartTime || task.dueTime}
                                  </span>
                                  {task.calendarDuration && <span>· {task.calendarDuration}m</span>}
                                  <span className="capitalize">· {task.category}</span>
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-[#FF7058]/10 text-[#FF7058]'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Unscheduled Tasks Drawer for this day */}
          <div className="md:col-span-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                Unscheduled for this Day
              </h3>
              <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
                Tasks due on this day that do not yet have a designated time block.
              </p>
            </div>

            <div className="space-y-2">
              {unscheduledDayTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#747474] rounded-2xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B]">
                  All tasks for this day have assigned focus times!
                </div>
              ) : (
                unscheduledDayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/50 bg-white dark:bg-[#282A26] transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                        {t.title}
                      </h5>
                      <span className="text-[10px] text-[#747474] capitalize">{t.category}</span>
                    </div>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (currentUser) {
                          await updateTask(currentUser.uid, t.id, {
                            calendarStartTime: '10:00',
                            calendarDuration: t.estimatedDuration || 30,
                          });
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#FF7058]/10 text-[#FF7058] hover:bg-[#FF7058] hover:text-white transition-colors shrink-0"
                    >
                      Block at 10am
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
