import React from 'react';
import { Flame, Plus, Trash2, Edit2 } from 'lucide-react';
import { Habit, HabitRecord } from '../../types';
import { calculateHabitStreak, getTodayString } from '../../lib/dates';

interface HabitsViewProps {
  habits: Habit[];
  habitRecords: HabitRecord[];
  onToggleHabitDay: (habitId: string, date: string, currentlyCompleted: boolean) => Promise<void>;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onOpenNewHabitModal: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  habitRecords,
  onToggleHabitDay,
  onEditHabit,
  onDeleteHabit,
  onOpenNewHabitModal,
}) => {
  const todayStr = getTodayString();
  const [y, m, d] = todayStr.split('-').map(Number);
  const refDate = new Date(y, m - 1, d);

  // Generate last 7 days window (from 6 days ago up to today)
  const last7Days: { dateStr: string; label: string; dayNum: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const cur = new Date(refDate);
    cur.setDate(cur.getDate() - i);
    const dateStr = getTodayString(cur);
    last7Days.push({
      dateStr,
      label: dayNames[cur.getDay()],
      dayNum: cur.getDate(),
    });
  }

  // Pre-index records by `habitId_date`
  const recordMap = new Map<string, boolean>();
  for (const r of habitRecords) {
    if (r.completed) {
      recordMap.set(`${r.habitId}_${r.date}`, true);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Habit Tracker
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Build consistency with small, sustainable daily routines.
          </p>
        </div>

        <button
          onClick={onOpenNewHabitModal}
          className="btn-press group px-4 py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 self-start sm:self-auto cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>New Habit</span>
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="card-lift p-12 text-center rounded-2xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9]/50 dark:bg-[#20221F]/50">
          <div className="w-12 h-12 rounded-2xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center mx-auto mb-3 transition-transform duration-200 hover:scale-110">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
            No habits created yet
          </h3>
          <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Choose a simple habit you'd like to reinforce, like drinking water, reading, or stretching.
          </p>
          <button
            onClick={onOpenNewHabitModal}
            className="btn-press px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const hRecords = habitRecords.filter((r) => r.habitId === habit.id);
            const streakData = calculateHabitStreak(hRecords, habit.customDays, todayStr);

            return (
              <div
                key={habit.id}
                className="card-lift group p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#8EDCC0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full transition-transform duration-150 group-hover:scale-125"
                      style={{ backgroundColor: habit.color || '#8EDCC0' }}
                    />
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474] dark:text-[#A0A09B] font-semibold transition-colors group-hover:bg-[#8EDCC0]/15 group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                      {habit.category}
                    </span>
                    <span className="text-[10px] text-[#A0A09B] capitalize">
                      {habit.frequency}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#FF7058]">
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="text-[#FF7058] font-bold flex items-center gap-1 transition-transform duration-200 group-hover:scale-105">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      {streakData.currentStreak} day streak
                    </span>
                    <span className="text-[#A0A09B]">
                      Best: {streakData.longestStreak} days
                    </span>
                  </div>
                </div>

                {/* 7-day interactive checkbox matrix with tactile spring scale */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E7E0] dark:border-[#2E302B]">
                  {last7Days.map((day) => {
                    const isCompleted = Boolean(recordMap.get(`${habit.id}_${day.dateStr}`));
                    const isToday = day.dateStr === todayStr;

                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-[#A0A09B] font-semibold select-none">
                          {day.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleHabitDay(habit.id, day.dateStr, isCompleted)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
                            isCompleted
                              ? 'text-white font-bold shadow-2xs hover:scale-115 active:scale-90 hover:brightness-105'
                              : 'border border-[#E8E7E0] dark:border-[#383A35] hover:border-[#FF7058]/60 hover:scale-115 active:scale-90 bg-white dark:bg-[#262824]'
                          } ${isToday ? 'ring-2 ring-offset-1 ring-[#FF7058]' : ''}`}
                          style={{
                            backgroundColor: isCompleted ? (habit.color || '#8EDCC0') : undefined,
                            color: isCompleted ? '#1E4D3E' : undefined,
                          }}
                          aria-label={`Toggle habit ${habit.name} for ${day.dateStr}`}
                        >
                          {isCompleted ? '✓' : ''}
                        </button>
                      </div>
                    );
                  })}

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="btn-press p-1.5 rounded-lg text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#262824] transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                      aria-label="Edit habit"
                    >
                      <Edit2 className="w-3.5 h-3.5 transition-transform duration-200 hover:rotate-12" />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="btn-press p-1.5 rounded-lg text-[#747474] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 hover:scale-115 active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
