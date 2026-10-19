import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
} from 'lucide-react';

export const InteractivePreview: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'habits' | 'focus'>('today');

  // Demo state for Today view
  const [demoTasks, setDemoTasks] = useState([
    { id: '1', title: 'Review weekly roadmap priorities', category: 'Work', priority: 'high', completed: true, time: '09:30' },
    { id: '2', title: 'Prepare slide deck for sprint kickoff', category: 'Work', priority: 'urgent', completed: false, time: '11:00' },
    { id: '3', title: '30-minute afternoon walk & hydrate', category: 'Health', priority: 'medium', completed: false, time: '14:30' },
    { id: '4', title: 'Read chapter 4 of Designing Data Systems', category: 'Study', priority: 'low', completed: false, time: '19:00' },
  ]);
  const [newDemoTitle, setNewDemoTitle] = useState('');

  const toggleDemoTask = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addDemoTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemoTitle.trim()) return;
    setDemoTasks((prev) => [
      ...prev,
      {
        id: `demo_${Date.now()}`,
        title: newDemoTitle.trim(),
        category: 'Personal',
        priority: 'medium',
        completed: false,
        time: '16:00',
      },
    ]);
    setNewDemoTitle('');
  };

  const completedCount = demoTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / demoTasks.length) * 100);

  // Demo state for Focus timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(timerMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchTimerMode = (mode: 'focus' | 'break') => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatDemoTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Demo habits state
  const [demoHabits, setDemoHabits] = useState([
    { id: 'h1', name: 'Morning meditation (10 min)', streak: 12, days: [true, true, true, true, true, false, true] },
    { id: 'h2', name: 'Drink 2.5L water', streak: 21, days: [true, true, true, true, true, true, true] },
    { id: 'h3', name: 'Write daily reflections', streak: 6, days: [true, true, false, true, true, true, false] },
    { id: 'h4', name: 'No screen 30m before sleep', streak: 4, days: [false, true, true, true, true, false, false] },
  ]);

  const toggleDemoHabitDay = (habitId: string, dayIdx: number) => {
    setDemoHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newDays = [...h.days];
        newDays[dayIdx] = !newDays[dayIdx];
        const newStreak = newDays[dayIdx] ? h.streak + 1 : Math.max(0, h.streak - 1);
        return { ...h, days: newDays, streak: newStreak };
      })
    );
  };

  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div id="preview" className="w-full">
      {/* Outer Card Shell */}
      <div className="bg-white dark:bg-[#20221F] rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] shadow-xl overflow-hidden transition-all duration-300">
        {/* Top Header / Browser-like Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1A1B19] px-5 py-3.5 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF7058]/80 transition-transform duration-150 hover:scale-125"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFD166]/80 transition-transform duration-150 hover:scale-125"></span>
            <span className="w-3 h-3 rounded-full bg-[#8EDCC0]/80 transition-transform duration-150 hover:scale-125"></span>
            <span className="ml-2 text-xs font-medium text-[#747474] dark:text-[#A0A09B] flex items-center gap-1.5 select-none">
              <Sparkles className="w-3 h-3 text-[#FF7058]" />
              Interactive Workspace Sandbox (Click to interact)
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#F5F5F2] dark:bg-[#292B28] p-1 rounded-xl">
            {(
              [
                { id: 'today', label: 'Today', icon: CheckCircle2 },
                { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
                { id: 'habits', label: 'Habits', icon: Flame },
                { id: 'focus', label: 'Focus Timer', icon: Clock },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] shadow-xs scale-[1.02]'
                      : 'text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-8 min-h-[420px] flex flex-col justify-between">
          {activeTab === 'today' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header and Progress Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div>
                  <h4 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0]">
                    Today's Plan
                  </h4>
                  <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
                    {completedCount} of {demoTasks.length} tasks completed ({progressPercent}%)
                  </p>
                </div>
                {/* Visual Progress Bar with hover tooltip effect */}
                <div
                  className="w-full sm:w-48 bg-[#F5F5F2] dark:bg-[#292B28] h-2.5 rounded-full overflow-hidden transition-all duration-300 hover:h-3"
                  title={`${progressPercent}% completed`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-[#FF7058] to-[#8EDCC0] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Priority Highlight Card */}
              <div className="card-lift p-3.5 rounded-2xl bg-[#FF7058]/8 dark:bg-[#FF7058]/12 border border-[#FF7058]/20 flex items-center justify-between gap-3 group cursor-default">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#FF7058] text-white shadow-2xs">
                    Priority Focus
                  </span>
                  <span className="text-sm font-semibold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#FF7058]">
                    Prepare slide deck for sprint kickoff
                  </span>
                </div>
                <span className="text-xs font-medium text-[#FF7058] flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" /> 11:00 AM
                </span>
              </div>

              {/* Task list with live interactive check & lift */}
              <div className="space-y-2.5">
                {demoTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleDemoTask(t.id)}
                    className={`task-card group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      t.completed
                        ? 'bg-[#F9F9F7] dark:bg-[#232522] border-[#E8E7E0] dark:border-[#2E302B] opacity-65 hover:opacity-85'
                        : 'bg-white dark:bg-[#262824] border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        className="text-[#FF7058] transition-transform duration-200 group-hover:scale-115 active:scale-90 cursor-pointer"
                        aria-label={t.completed ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {t.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#8EDCC0] transition-colors" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#A0A09B] group-hover:text-[#FF7058] transition-colors" />
                        )}
                      </button>
                      <span
                        className={`text-sm font-medium truncate transition-colors duration-200 ${
                          t.completed
                            ? 'line-through text-[#747474] dark:text-[#A0A09B]'
                            : 'text-[#262626] dark:text-[#F3F3F0] group-hover:text-[#FF7058]'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#323530] text-[#747474] dark:text-[#A0A09B] font-medium transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                        {t.category}
                      </span>
                      {t.priority === 'urgent' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold transition-transform group-hover:scale-105">
                          Urgent
                        </span>
                      )}
                      {t.priority === 'high' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium transition-transform group-hover:scale-105">
                          High
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Add Demo Input */}
              <form onSubmit={addDemoTask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newDemoTitle}
                  onChange={(e) => setNewDemoTitle(e.target.value)}
                  placeholder="Try typing a new task here... (e.g. Schedule team sync)"
                  className="input-smooth flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
                />
                <button
                  type="submit"
                  className="btn-press px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-90" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div>
                  <h4 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0]">
                    October 2026
                  </h4>
                  <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
                    Clean monthly perspective with scheduled tasks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#8BCBFA]/20 text-[#3078B4] dark:text-[#8BCBFA] text-xs font-semibold transition-transform duration-200 hover:scale-105">
                    Month View
                  </span>
                </div>
              </div>

              {/* Interactive mini grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="font-semibold text-[#747474] dark:text-[#A0A09B] py-1 select-none">
                    {d}
                  </div>
                ))}

                {Array.from({ length: 28 }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCurrentDay = dayNum === 18;
                  const hasTasks = [5, 12, 18, 19, 24].includes(dayNum);
                  return (
                    <div
                      key={dayNum}
                      className={`min-h-[52px] p-1.5 rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                        isCurrentDay
                          ? 'border-[#FF7058] bg-[#FF7058]/5 dark:bg-[#FF7058]/10 font-bold hover:shadow-xs'
                          : 'border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#232522] hover:border-[#FF7058]/40 hover:-translate-y-0.5 hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-[11px] ${
                            isCurrentDay
                              ? 'w-5 h-5 rounded-full bg-[#FF7058] text-white flex items-center justify-center'
                              : 'text-[#262626] dark:text-[#F3F3F0]'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>
                      {hasTasks && (
                        <div className="mt-1">
                          <span
                            className={`block truncate text-[9px] px-1 py-0.5 rounded transition-transform duration-150 hover:scale-105 ${
                              dayNum === 18
                                ? 'bg-[#8EDCC0]/30 text-emerald-800 dark:text-emerald-200 font-semibold'
                                : 'bg-[#8BCBFA]/30 text-sky-800 dark:text-sky-200'
                            }`}
                          >
                            {dayNum === 18 ? 'Sprint Kickoff' : 'Review Doc'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'habits' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div>
                  <h4 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0]">
                    Habit Matrix
                  </h4>
                  <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
                    Build lasting routines through simple daily check-ins
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#FF7058] font-bold transition-transform duration-200 hover:scale-105">
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>21 Day Best Streak</span>
                </div>
              </div>

              <div className="space-y-3">
                {demoHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className="card-lift p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#242622] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#FF7058]">
                        {habit.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
                        <Flame className="w-3.5 h-3.5 text-[#FF7058] fill-current" />
                        <span>{habit.streak} days current streak</span>
                      </div>
                    </div>

                    {/* 7-day checkboxes with spring-like hover & active feel */}
                    <div className="flex items-center gap-2">
                      {habit.days.map((checked, dIdx) => (
                        <div key={dIdx} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-[#A0A09B]">{weekDayLabels[dIdx]}</span>
                          <button
                            type="button"
                            onClick={() => toggleDemoHabitDay(habit.id, dIdx)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                              checked
                                ? 'bg-[#8EDCC0] text-[#1E4D3E] font-bold shadow-2xs hover:scale-110 active:scale-90 hover:brightness-105'
                                : 'border border-[#E8E7E0] dark:border-[#383A35] hover:border-[#8EDCC0] hover:scale-110 active:scale-90 bg-white dark:bg-[#20221F]'
                            }`}
                            aria-label={`Toggle ${habit.name} on ${weekDayLabels[dIdx]}`}
                          >
                            {checked ? '✓' : ''}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => switchTimerMode('focus')}
                  className={`btn-press px-3.5 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    timerMode === 'focus'
                      ? 'bg-[#FF7058] text-white shadow-xs'
                      : 'bg-[#F5F5F2] dark:bg-[#292B28] text-[#747474] hover:text-[#262626] dark:hover:text-white'
                  }`}
                >
                  25m Focus
                </button>
                <button
                  onClick={() => switchTimerMode('break')}
                  className={`btn-press px-3.5 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    timerMode === 'break'
                      ? 'bg-[#8EDCC0] text-[#184435] shadow-xs'
                      : 'bg-[#F5F5F2] dark:bg-[#292B28] text-[#747474] hover:text-[#262626] dark:hover:text-white'
                  }`}
                >
                  5m Short Break
                </button>
              </div>

              {/* Working animated timer ring with subtle hover scale */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-105 select-none">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-[#E8E7E0] dark:text-[#2E302B]"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#FF7058"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={
                      264 - (264 * (timerMode === 'focus' ? timerSeconds / 1500 : timerSeconds / 300))
                    }
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] font-mono tracking-tight">
                    {formatDemoTime(timerSeconds)}
                  </span>
                  <span className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1 font-medium capitalize">
                    {timerMode === 'focus' ? 'Deep Work' : 'Rest & Reset'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleTimer}
                  className="btn-press flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white font-medium text-sm transition shadow-xs hover:shadow-md cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{timerRunning ? 'Pause' : 'Start Focus'}</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="btn-press p-2.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#2E302B] cursor-pointer"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-4 h-4 transition-transform duration-200 hover:-rotate-45" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom callout inside preview */}
          <div className="mt-8 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#747474] dark:text-[#A0A09B]">
            <span>This is an interactive demo preview. Ready to personalize your workspace?</span>
            <button
              onClick={onGetStarted}
              className="font-bold text-[#FF7058] hover:text-[#F06148] flex items-center gap-1 cursor-pointer transition-all duration-150 hover:underline group"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
