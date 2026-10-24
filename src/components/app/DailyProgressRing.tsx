import React from 'react';
import { CheckCircle2, Sparkles, Plus, Award } from 'lucide-react';

interface DailyProgressRingProps {
  completedCount: number;
  totalCount: number;
  onOpenNewTaskModal?: () => void;
  onReplayCelebration?: () => void;
}

export const DailyProgressRing: React.FC<DailyProgressRingProps> = ({
  completedCount,
  totalCount,
  onOpenNewTaskModal,
  onReplayCelebration,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  // SVG circular geometry
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2; // 55
  const circumference = 2 * Math.PI * radius; // ~345.57
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;

  return (
    <div className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#FF7058]/40 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Animated Circular SVG Ring */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 drop-shadow-xs"
            aria-label={`Daily progress: ${percentage}% completed`}
          >
            <defs>
              {/* Progress Gradient - Warm Coral/Amber for active progress */}
              <linearGradient id="progress-gradient-active" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF7058" />
                <stop offset="100%" stopColor="#FFD166" />
              </linearGradient>

              {/* Celebration Gradient - Emerald/Mint for 100% completion */}
              <linearGradient id="progress-gradient-complete" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8EDCC0" />
                <stop offset="100%" stopColor="#43B893" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-[#E8E7E0] dark:text-[#2E302B] transition-colors"
            />

            {/* Dynamic Foreground Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isAllComplete ? 'url(#progress-gradient-complete)' : 'url(#progress-gradient-active)'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={totalCount === 0 ? circumference : strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease',
              }}
            />
          </svg>

          {/* Central Label inside the ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            {isAllComplete ? (
              <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-7 h-7 text-[#43B893] dark:text-[#8EDCC0]" />
                <span className="text-[11px] font-extrabold text-[#43B893] dark:text-[#8EDCC0] tracking-wide mt-0.5 font-mono">
                  100%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] font-mono leading-none">
                  {percentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-[#747474] dark:text-[#A0A09B] mt-1 tracking-wider">
                  Done
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content & Progress Status */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md bg-[#FF7058]/10 text-[#FF7058]">
              <Sparkles className="w-3 h-3" />
              Daily Progress Ring
            </span>

            {isAllComplete && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-[#8EDCC0]/20 text-[#1E4D3E] dark:text-[#8EDCC0] animate-pulse">
                <Award className="w-3 h-3" />
                All Completed!
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            {totalCount === 0
              ? 'No tasks scheduled for today'
              : isAllComplete
              ? `All ${totalCount} scheduled task${totalCount > 1 ? 's' : ''} completed!`
              : `${completedCount} of ${totalCount} task${totalCount > 1 ? 's' : ''} finished`}
          </h2>

          <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-xl">
            {totalCount === 0
              ? 'Add tasks to today’s schedule to start tracking your daily completion ring.'
              : isAllComplete
              ? 'Outstanding focus! You have cleared your entire schedule for today.'
              : completedCount === 0
              ? 'Choose your most important task below to get the momentum going.'
              : `${totalCount - completedCount} task${totalCount - completedCount > 1 ? 's' : ''} remaining today. Keep up the great pace!`}
          </p>

          {/* Quick interactive shortcuts */}
          <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            {onOpenNewTaskModal && (
              <button
                type="button"
                onClick={onOpenNewTaskModal}
                className="btn-press px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058] flex items-center gap-1.5 shadow-2xs hover:text-[#FF7058] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF7058]" />
                <span>Add Task</span>
              </button>
            )}

            {isAllComplete && onReplayCelebration && (
              <button
                type="button"
                onClick={onReplayCelebration}
                className="btn-press px-3 py-1.5 rounded-xl bg-[#8EDCC0]/15 hover:bg-[#8EDCC0]/25 text-[#1E4D3E] dark:text-[#8EDCC0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Celebrate today's complete schedule again"
              >
                <span>Celebrate again 🎉</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
