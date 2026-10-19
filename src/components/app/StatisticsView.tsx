import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Clock, Flame, PieChart, Calendar, TrendingUp } from 'lucide-react';
import { Task, Habit, HabitRecord, FocusSession } from '../../types';
import {
  calculateProductivityStats,
  calculateCategoryBreakdown,
  calculateWeeklyActivity,
} from '../../lib/stats';
import { getTodayString } from '../../lib/dates';

interface StatisticsViewProps {
  tasks: Task[];
  habits: Habit[];
  habitRecords: HabitRecord[];
  focusSessions: FocusSession[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  tasks,
  habits,
  habitRecords,
  focusSessions,
}) => {
  const [range, setRange] = useState<7 | 30 | 'month'>(7);
  const todayStr = getTodayString();

  const stats = calculateProductivityStats(
    tasks,
    habits,
    habitRecords,
    focusSessions,
    range,
    todayStr
  );

  const categoryBreakdown = calculateCategoryBreakdown(tasks);
  const weeklyActivity = calculateWeeklyActivity(tasks, focusSessions, todayStr);

  const maxDailyTasks = Math.max(1, ...weeklyActivity.map((d) => d.tasksCompleted));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header and Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Productivity & Insights
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Real performance metrics based on your actual saved activity.
          </p>
        </div>

        {/* Range Switcher */}
        <div className="flex items-center bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl self-start sm:self-auto">
          {(
            [
              { id: 7, label: 'Last 7 Days' },
              { id: 30, label: 'Last 30 Days' },
              { id: 'month', label: 'This Month' },
            ] as const
          ).map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                range === r.id
                  ? 'bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] shadow-2xs'
                  : 'text-[#747474] hover:text-[#262626] dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#8EDCC0]/60 cursor-default group">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <CheckCircle2 className="w-4 h-4 text-[#8EDCC0] transition-transform duration-200 group-hover:scale-110" />
            <span>Tasks Completed</span>
          </div>
          <div className="text-3xl font-black text-[#262626] dark:text-[#F3F3F0] mt-2 font-mono">
            {stats.rangeTasksCompleted}
          </div>
          <div className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1">
            out of {stats.rangeTasksTotal} scheduled
          </div>
        </div>

        <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#FF7058]/60 cursor-default group">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <TrendingUp className="w-4 h-4 text-[#FF7058] transition-transform duration-200 group-hover:scale-110" />
            <span>Completion Rate</span>
          </div>
          <div className="text-3xl font-black text-[#FF7058] mt-2 font-mono">
            {stats.rangeCompletionRate}%
          </div>
          <div className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1">
            average success rate
          </div>
        </div>

        <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#8BCBFA]/60 cursor-default group">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <Clock className="w-4 h-4 text-[#8BCBFA] transition-transform duration-200 group-hover:scale-110" />
            <span>Total Focus Time</span>
          </div>
          <div className="text-3xl font-black text-[#262626] dark:text-[#F3F3F0] mt-2 font-mono">
            {Math.round(stats.rangeFocusMinutes / 60 * 10) / 10}h
          </div>
          <div className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1">
            {stats.rangeFocusMinutes} minutes logged
          </div>
        </div>

        <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#FFD166]/60 cursor-default group">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <Flame className="w-4 h-4 text-[#FFD166] transition-transform duration-200 group-hover:scale-110" />
            <span>Habit Consistency</span>
          </div>
          <div className="text-3xl font-black text-[#FFD166] mt-2 font-mono">
            {stats.habitConsistencyRate}%
          </div>
          <div className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1">
            across {habits.length} habits
          </div>
        </div>
      </div>

      {/* Visual Chart: 7-Day Activity Trends with interactive hover bars and tooltips */}
      <div className="card-lift p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
          <div>
            <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              Daily Activity (Last 7 Days)
            </h3>
            <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
              Hover over columns for detailed daily metrics
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#747474] dark:text-[#A0A09B]">
              <span className="w-3 h-3 rounded-md bg-[#FF7058]" /> Tasks
            </span>
            <span className="flex items-center gap-1.5 text-[#747474] dark:text-[#A0A09B]">
              <span className="w-3 h-3 rounded-md bg-[#8EDCC0]" /> Focus Mins
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-8 items-end h-52">
          {weeklyActivity.map((day) => {
            const taskHeight = Math.max(14, Math.round((day.tasksCompleted / maxDailyTasks) * 110));
            return (
              <div
                key={day.date}
                className="group/bar relative flex flex-col items-center gap-2 h-full justify-end cursor-pointer"
              >
                {/* Floating Tooltip on Bar Hover */}
                <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none z-20 transform -translate-y-1 group-hover/bar:translate-y-0 bg-[#262626] dark:bg-white text-white dark:text-[#262626] text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap">
                  <span>{day.tasksCompleted} tasks · {day.focusMinutes}m focus</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#262626] dark:border-t-white" />
                </div>

                <div className="text-[10px] font-semibold text-[#747474] transition-colors group-hover/bar:text-[#FF7058]">
                  {day.tasksCompleted > 0 ? day.tasksCompleted : '-'}
                </div>
                <div
                  className="w-full max-w-[34px] bg-[#FF7058] rounded-t-lg transition-all duration-200 group-hover/bar:-translate-y-1 group-hover/bar:brightness-110 group-hover/bar:shadow-md group-hover/bar:shadow-[#FF7058]/30"
                  style={{ height: `${taskHeight}px` }}
                />
                <span className="text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mt-1 transition-colors group-hover/bar:text-[#FF7058]">
                  {day.dayLabel}
                </span>
                <span className="text-[10px] text-[#A0A09B] transition-colors group-hover/bar:text-[#8EDCC0] font-medium">{day.focusMinutes}m</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown with interactive row hover */}
      <div className="card-lift p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
          Task Distribution by Category
        </h3>

        {categoryBreakdown.length === 0 ? (
          <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
            No categorised tasks to display yet.
          </p>
        ) : (
          <div className="space-y-2">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.name}
                className="group/cat p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-all duration-150 space-y-1.5 cursor-default"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover/cat:text-[#FF7058]">
                    {cat.name} ({cat.count})
                  </span>
                  <span className="font-bold text-[#747474] dark:text-[#A0A09B] transition-colors group-hover/cat:text-[#262626] dark:group-hover/cat:white">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="w-full bg-[#E8E7E0] dark:bg-[#2E302B] h-2 rounded-full overflow-hidden transition-all duration-200 group-hover/cat:h-2.5">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
