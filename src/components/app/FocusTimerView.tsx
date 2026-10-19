import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Minimize2,
  Flame,
  Coffee,
  HelpCircle,
  Folder,
  Check,
  Shield,
  Zap,
} from 'lucide-react';
import { Task, FocusSession, FocusSessionType, Project } from '../../types';
import { formatSecondsToTime, calculateProgressPercentage } from '../../lib/focus';
import { getTodayString } from '../../lib/dates';

interface FocusTimerViewProps {
  tasks: Task[];
  projects?: Project[];
  focusSessions: FocusSession[];
  onSaveSession: (session: Omit<FocusSession, 'id' | 'userId'>) => Promise<void>;
}

type AmbientEffect = 'none' | 'ember' | 'zen' | 'aurora';

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  tasks,
  projects = [],
  focusSessions,
  onSaveSession,
}) => {
  const [sessionType, setSessionType] = useState<FocusSessionType>('focus');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Focus Room Enhancements
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [ambientEffect, setAmbientEffect] = useState<AmbientEffect>('ember');
  const [interruptionModalOpen, setInterruptionModalOpen] = useState(false);
  const [interruptionReason, setInterruptionReason] = useState('');
  const [interruptionsCount, setInterruptionsCount] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const sessionStartIsoRef = useRef<string | null>(null);
  const expectedEndRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const todayStr = getTodayString();
  const todaySessions = focusSessions.filter(
    (s) => s.completedAt && s.completedAt.startsWith(todayStr)
  );
  const todayFocusMinutes = todaySessions
    .filter((s) => s.sessionType === 'focus')
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // Calculate past 7 days focus minutes
  const pastWeekDate = new Date();
  pastWeekDate.setDate(pastWeekDate.getDate() - 7);
  const pastWeekStr = pastWeekDate.toISOString().split('T')[0];
  const weeklyFocusMinutes = focusSessions
    .filter((s) => s.completedAt && s.completedAt >= pastWeekStr && s.sessionType === 'focus')
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
    expectedEndRef.current = null;
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
    const selectedProj = projects.find((p) => p.id === selectedProjectId);

    const taskTitleLabel = selectedTask
      ? selectedTask.title
      : selectedProj
      ? `Project: ${selectedProj.name}`
      : undefined;

    await onSaveSession({
      taskId: selectedTask?.id,
      taskTitle: taskTitleLabel,
      durationMinutes: durationMins,
      sessionType,
      startedAt: sessionStartIsoRef.current || new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    // Reset references
    startTimeRef.current = null;
    sessionStartIsoRef.current = null;
    expectedEndRef.current = null;

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('DaySpark Focus Room', {
          body: `${sessionType === 'focus' ? 'Focus block' : 'Break'} complete! Excellent job!`,
          icon: '/app-icon.png',
        });
      } catch (e) {
        console.warn('Notification error:', e);
      }
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

  const handleLogInterruption = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    expectedEndRef.current = null;
    setInterruptionsCount((prev) => prev + 1);
    setInterruptionModalOpen(false);
    setInterruptionReason('');
  };

  // Ambient Canvas Visual Effects
  useEffect(() => {
    if (ambientEffect === 'none' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle state
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (ambientEffect === 'ember') {
        // Floating gentle warm ember specks
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 112, 88, ${p.opacity * (isRunning ? 0.9 : 0.4)})`;
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        });
      } else if (ambientEffect === 'zen') {
        // Subtle rhythmic concentric breathing rings
        pulse += 0.015;
        const radius = (Math.sin(pulse) * 0.5 + 0.5) * 50 + 120;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(142, 220, 192, ${isRunning ? 0.25 : 0.12})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 203, 250, ${isRunning ? 0.2 : 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (ambientEffect === 'aurora') {
        // Soft gradient drift
        pulse += 0.01;
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, `rgba(255, 112, 88, ${0.05 + Math.sin(pulse) * 0.03})`);
        grad.addColorStop(0.5, `rgba(184, 167, 249, ${0.05 + Math.cos(pulse) * 0.03})`);
        grad.addColorStop(1, `rgba(142, 220, 192, 0.05)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [ambientEffect, isRunning]);

  const progressPercent = calculateProgressPercentage(secondsRemaining, totalSeconds);
  const activeTasks = tasks.filter((t) => !t.completed);

  return (
    <div
      className={`space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-200 transition-all ${
        isDistractionFree
          ? 'fixed inset-0 z-50 bg-[#FFFDF9] dark:bg-[#161715] max-w-none p-6 sm:p-12 overflow-y-auto flex flex-col justify-between'
          : ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FF7058]/10 text-[#FF7058] dark:bg-[#FF7058]/20">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Focus Room
            </h1>
          </div>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Eliminate distractions, lock into deep work, and track steady progress.
          </p>
        </div>

        {/* Controls: Ambient Effect & Distraction Free Mode */}
        <div className="flex items-center gap-2">
          {/* Ambient selector */}
          <div className="flex items-center gap-1 bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl text-xs">
            {(['none', 'ember', 'zen', 'aurora'] as AmbientEffect[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setAmbientEffect(mode)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  ambientEffect === mode
                    ? 'bg-white dark:bg-[#20221F] text-[#FF7058] font-bold shadow-2xs'
                    : 'text-[#747474] hover:text-[#262626] dark:hover:text-white'
                }`}
              >
                {mode === 'none' ? 'Clean' : mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#282A26] text-xs font-semibold text-[#747474] hover:text-[#262626] dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
            title={isDistractionFree ? 'Exit Distraction-Free Mode' : 'Enter Distraction-Free Mode'}
          >
            {isDistractionFree ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#FF7058]" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#FF7058]" />
                <span className="hidden sm:inline">Focus Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => selectMode('focus', 25)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'focus' && totalSeconds === 25 * 60
              ? 'bg-[#FF7058] text-white shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white'
          }`}
        >
          25m Pomodoro
        </button>

        <button
          onClick={() => selectMode('focus', 50)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'focus' && totalSeconds === 50 * 60
              ? 'bg-[#FF7058] text-white shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white'
          }`}
        >
          50m Deep Work
        </button>

        <button
          onClick={() => selectMode('focus', 90)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'focus' && totalSeconds === 90 * 60
              ? 'bg-[#FF7058] text-white shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white'
          }`}
        >
          90m Ultradian Sprint
        </button>

        <button
          onClick={() => selectMode('short_break', 5)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'short_break'
              ? 'bg-[#8EDCC0] text-[#1E4D3E] shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white'
          }`}
        >
          5m Break
        </button>

        <button
          onClick={() => selectMode('long_break', 15)}
          className={`btn-press px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            sessionType === 'long_break'
              ? 'bg-[#8BCBFA] text-[#1A4F78] shadow-xs scale-[1.02]'
              : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white'
          }`}
        >
          15m Long Break
        </button>

        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="btn-press px-3.5 py-2 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white cursor-pointer"
        >
          Custom...
        </button>
      </div>

      {showCustomInput && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            selectMode('focus', Math.max(1, Math.min(180, customMinutes)));
            setShowCustomInput(false);
          }}
          className="max-w-xs mx-auto p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] flex items-center gap-2 shadow-xs"
        >
          <input
            type="number"
            min={1}
            max={180}
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10) || 25)}
            className="w-20 px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-center font-bold text-sm bg-[#F5F5F2] dark:bg-[#282A26] text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
          />
          <span className="text-xs text-[#747474]">minutes</span>
          <button
            type="submit"
            className="ml-auto px-3 py-1.5 rounded-xl bg-[#FF7058] text-white text-xs font-bold hover:bg-[#e65e47] transition-colors"
          >
            Apply
          </button>
        </form>
      )}

      {/* Main Focus Dial Card with ambient canvas overlay */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] p-8 sm:p-12 shadow-2xs flex flex-col items-center justify-center text-center">
        {/* Background Canvas for Ambient Effects */}
        {ambientEffect !== 'none' && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none w-full h-full opacity-60"
          />
        )}

        <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-6">
          {/* Associated Task or Project Selector */}
          <div className="w-full flex items-center justify-center gap-2">
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                if (e.target.value) setSelectedProjectId('');
              }}
              className="max-w-xs px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
            >
              <option value="">Link to task (optional)...</option>
              {activeTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            {projects.length > 0 && !selectedTaskId && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="max-w-xs px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
              >
                <option value="">Link to project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Big Circular Display */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-[#E8E7E0] dark:stroke-[#2E302B] fill-transparent"
                strokeWidth="5"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`fill-transparent transition-all duration-500 ease-linear ${
                  sessionType === 'focus'
                    ? 'stroke-[#FF7058]'
                    : sessionType === 'short_break'
                    ? 'stroke-[#8EDCC0]'
                    : 'stroke-[#8BCBFA]'
                }`}
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>

            {/* Centered Timer Text */}
            <div className="absolute flex flex-col items-center justify-center select-none">
              <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-[#262626] dark:text-[#F3F3F0]">
                {formatSecondsToTime(secondsRemaining)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#747474] dark:text-[#A0A09B] mt-1">
                {sessionType === 'focus'
                  ? 'Deep Focus'
                  : sessionType === 'short_break'
                  ? 'Short Rest'
                  : 'Extended Rest'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-[#FF7058] hover:bg-[#e65e47]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSessionComplete()}
              className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-all cursor-pointer"
              title="Finish & Log Session Early"
            >
              <Check className="w-4 h-4" />
            </button>

            {isRunning && (
              <button
                onClick={() => setInterruptionModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition-colors"
                title="Pause & note distraction"
              >
                Log Distraction
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <Clock className="w-4 h-4 text-[#FF7058]" />
            <span>Today's Focus</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#262626] dark:text-[#F3F3F0]">
            {todayFocusMinutes} <span className="text-sm font-normal text-[#747474]">mins</span>
          </div>
          <div className="text-[11px] text-[#747474] dark:text-[#A0A09B] mt-0.5">
            {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} logged today
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Past 7 Days Focus</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#262626] dark:text-[#F3F3F0]">
            {Math.round((weeklyFocusMinutes / 60) * 10) / 10}{' '}
            <span className="text-sm font-normal text-[#747474]">hours</span>
          </div>
          <div className="text-[11px] text-[#747474] dark:text-[#A0A09B] mt-0.5">
            Consistent focus drives momentum
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747474] dark:text-[#A0A09B]">
            <Shield className="w-4 h-4 text-[#8EDCC0]" />
            <span>Interruptions Handled</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#262626] dark:text-[#F3F3F0]">
            {interruptionsCount}{' '}
            <span className="text-sm font-normal text-[#747474]">logged</span>
          </div>
          <div className="text-[11px] text-[#747474] dark:text-[#A0A09B] mt-0.5">
            Awareness reduces future distraction
          </div>
        </div>
      </div>

      {/* Interruption Modal */}
      {interruptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              Pause Session & Log Distraction
            </h3>
            <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
              Acknowledging interruptions without guilt keeps your focus disciplined.
            </p>

            <div className="space-y-1.5">
              {['Incoming call or message', 'Colleague request', 'Mind wandering / Fatigue', 'Quick errand'].map(
                (reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setInterruptionReason(reason)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      interruptionReason === reason
                        ? 'border-[#FF7058] bg-[#FF7058]/10 text-[#FF7058]'
                        : 'border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]'
                    }`}
                  >
                    {reason}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInterruptionModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#747474]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogInterruption}
                className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                Pause & Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
