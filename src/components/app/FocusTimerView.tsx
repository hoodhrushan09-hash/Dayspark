import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { Task, FocusSession, FocusSessionType } from '../../types';
import { formatSecondsToTime, calculateProgressPercentage } from '../../lib/focus';
import { getTodayString } from '../../lib/dates';

interface FocusTimerViewProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  onSaveSession: (session: Omit<FocusSession, 'id' | 'userId'>) => Promise<void>;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  tasks,
  focusSessions,
  onSaveSession,
}) => {
  const [sessionType, setSessionType] = useState<FocusSessionType>('focus');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const sessionStartIsoRef = useRef<string | null>(null);
  const expectedEndRef = useRef<number | null>(null);

  const todayStr = getTodayString();
  const todaySessions = focusSessions.filter(
    (s) => s.completedAt && s.completedAt.startsWith(todayStr)
  );
  const todayFocusMinutes = todaySessions
    .filter((s) => s.sessionType === 'focus')
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // Set mode presets
  const selectMode = (mode: FocusSessionType, minutes: number) => {
    setIsRunning(false);
    setSessionType(mode);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    startTimeRef.current = null;
    sessionStartIsoRef.current = null;
  };

  // Timestamp-based accurate interval to prevent background tab drift
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        sessionStartIsoRef.current = new Date().toISOString();
        expectedEndRef.current = Date.now() + secondsRemaining * 1000;
      }

      timer = setInterval(() => {
        if (!expectedEndRef.current) return;
        const now = Date.now();
        const diff = Math.round((expectedEndRef.current - now) / 1000);

        if (diff <= 0) {
          setSecondsRemaining(0);
          setIsRunning(false);
          handleSessionComplete();
        } else {
          setSecondsRemaining(diff);
        }
      }, 500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsRemaining]);

  const handleSessionComplete = async () => {
    const durationMins = Math.round(totalSeconds / 60);
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);

    await onSaveSession({
      taskId: selectedTask?.id,
      taskTitle: selectedTask?.title,
      durationMinutes: durationMins,
      sessionType,
      startedAt: sessionStartIsoRef.current || new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    // Reset references
    startTimeRef.current = null;
    sessionStartIsoRef.current = null;
    expectedEndRef.current = null;

    // Optional audio chime or notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('DaySpark Timer', {
        body: `${sessionType === 'focus' ? 'Focus session' : 'Break'} complete! Great job!`,
      });
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      expectedEndRef.current = Date.now() + secondsRemaining * 1000;
      setIsRunning(true);
    } else {
      setIsRunning(false);
      startTimeRef.current = null;
      expectedEndRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(totalSeconds);
    startTimeRef.current = null;
    sessionStartIsoRef.current = null;
    expectedEndRef.current = null;
  };

  const skipTimer = async () => {
    resetTimer();
  };

  const applyCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    const clamped = Math.max(1, Math.min(120, customMinutes));
    selectMode('focus', clamped);
    setShowCustomInput(false);
  };

  const progressPercent = calculateProgressPercentage(secondsRemaining, totalSeconds);
  const activeTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
          Focus Timer
        </h1>
        <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
          Eliminate distractions and cultivate deep focus with steady intervals.
        </p>
      </div>

      {/* Mode selectors with tactile feedback */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => selectMode('focus', 25)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'focus' && totalSeconds === 25 * 60
              ? 'bg-[#FF7058] text-white shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#262824]'
          }`}
        >
          25m Focus
        </button>

        <button
          onClick={() => selectMode('short_break', 5)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'short_break'
              ? 'bg-[#8EDCC0] text-[#1E4D3E] shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#262824]'
          }`}
        >
          5m Short Break
        </button>

        <button
          onClick={() => selectMode('long_break', 15)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'long_break'
              ? 'bg-[#8BCBFA] text-[#1A4F78] shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#262824]'
          }`}
        >
          15m Long Break
        </button>

        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="btn-press px-3.5 py-2 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#20221F] cursor-pointer"
        >
          Custom...
        </button>
      </div>

      {/* Custom Duration Input Popover */}
      {showCustomInput && (
        <form
          onSubmit={applyCustomDuration}
          className="max-w-xs mx-auto p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] flex items-center gap-2 shadow-sm animate-in fade-in duration-150"
        >
          <input
            type="number"
            min={1}
            max={120}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] focus:ring-1 focus:ring-[#FF7058]"
          />
          <span className="text-xs text-[#747474]">minutes</span>
          <button
            type="submit"
            className="btn-press px-3 py-1.5 rounded-lg bg-[#FF7058] text-white text-xs font-semibold shadow-xs"
          >
            Set
          </button>
        </form>
      )}

      {/* Main Circular Countdown Timer Ring with subtle hover scale */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-[1.03] select-none">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-[#E8E7E0] dark:text-[#2E302B]"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={sessionType === 'focus' ? '#FF7058' : '#8EDCC0'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="276.46"
            strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
            className="transition-all duration-300"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <span className="text-4xl sm:text-5xl font-black text-[#262626] dark:text-[#F3F3F0] font-mono tracking-tight">
            {formatSecondsToTime(secondsRemaining)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#747474] dark:text-[#A0A09B] mt-2">
            {sessionType === 'focus' ? 'Deep Focus' : 'Recovery Break'}
          </span>
        </div>
      </div>

      {/* Task Association Dropdown */}
      <div className="max-w-sm mx-auto">
        <label className="block text-center text-xs font-semibold text-[#747474] dark:text-[#A0A09B] mb-1.5">
          Attach to active task (optional)
        </label>
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] focus:outline-hidden focus:ring-2 focus:ring-[#FF7058]/30 focus:border-[#FF7058] transition-all duration-200 cursor-pointer"
        >
          <option value="">No task selected (general focus)</option>
          {activeTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Controls with tactile hover lift and scale */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={resetTimer}
          className="btn-press p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-5 h-5 transition-transform duration-200 group-hover:-rotate-45" />
        </button>

        <button
          onClick={toggleTimer}
          className={`btn-press flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-bold text-base shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
            isRunning
              ? 'bg-[#262626] dark:bg-white dark:text-[#262626] hover:bg-black dark:hover:bg-gray-100'
              : 'bg-[#FF7058] hover:bg-[#F06148] shadow-[#FF7058]/25 hover:shadow-[#FF7058]/40'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current transition-transform duration-150 group-hover:scale-110" />}
          <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
        </button>

        <button
          onClick={skipTimer}
          className="btn-press p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          aria-label="Skip session"
        >
          <SkipForward className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Daily Focus Summary Card with card-lift */}
      <div className="card-lift p-5 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] max-w-xl mx-auto flex items-center justify-between shadow-2xs hover:border-[#FF7058]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center transition-transform duration-200 hover:scale-110">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
              Today's Focus Log
            </div>
            <div className="text-xs text-[#747474] dark:text-[#A0A09B]">
              {todaySessions.length} sessions logged today
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-[#FF7058] font-mono">
            {todayFocusMinutes}
          </span>
          <span className="text-xs text-[#747474] ml-1">minutes</span>
        </div>
      </div>
    </div>
  );
};
