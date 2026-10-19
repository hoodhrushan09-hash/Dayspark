import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp, CheckCircle2, Flame, Target, Clock } from 'lucide-react';
import { DailyScore } from '../../types';

interface ProductivityScoreCardProps {
  todayScore: DailyScore;
  yesterdayScore?: DailyScore;
  weeklyScores: DailyScore[];
  isLoading?: boolean;
}

export const ProductivityScoreCard: React.FC<ProductivityScoreCardProps> = ({
  todayScore,
  yesterdayScore,
  weeklyScores,
  isLoading = false,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const score = todayScore.score;
  const yesterdayVal = yesterdayScore?.score;
  const hasYesterday = yesterdayVal !== undefined;
  const delta = hasYesterday ? score - yesterdayVal : 0;

  // Circular progress math (radius 40, circumference ~251.3)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  // Determine score color theme
  let strokeColor = '#FF7058';
  let badgeBg = 'bg-[#FF7058]/10 text-[#FF7058]';
  if (score >= 80) {
    strokeColor = '#8EDCC0';
    badgeBg = 'bg-[#8EDCC0]/20 text-[#1E4D3E] dark:text-[#8EDCC0]';
  } else if (score >= 60) {
    strokeColor = '#FFD166';
    badgeBg = 'bg-[#FFD166]/20 text-[#9E6D00] dark:text-[#FFD166]';
  } else if (score >= 40) {
    strokeColor = '#8BCBFA';
    badgeBg = 'bg-[#8BCBFA]/20 text-[#1A4F78] dark:text-[#8BCBFA]';
  }

  // Last 7 days sequence
  const last7Scores = [...weeklyScores].reverse().slice(-7);

  return (
    <div className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
              Productivity Score
            </h3>
            <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
              Daily momentum snapshot
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowBreakdown((prev) => !prev)}
          className="btn-press flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showBreakdown ? 'Hide Breakdown' : 'Breakdown'}</span>
          {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Score & Circular Indicator */}
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between pt-1">
        {/* Animated Circle */}
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-[#E8E7E0] dark:text-[#2E302B]"
            />
            {/* Value ring with animated offset */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-3xl font-black text-[#262626] dark:text-[#F3F3F0] font-mono tracking-tight">
              {score}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#747474] dark:text-[#A0A09B]">
              / 100
            </span>
          </div>
        </div>

        {/* Narrative & Delta */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeBg}`}>
              {score >= 80 ? 'Optimal Flow' : score >= 60 ? 'Solid Momentum' : score >= 40 ? 'Gaining Traction' : 'Calm Starting'}
            </span>

            {/* Yesterday comparison */}
            {hasYesterday ? (
              <span
                className={`text-xs font-semibold flex items-center gap-1 ${
                  delta > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : delta < 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-[#747474]'
                }`}
              >
                {delta > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : delta < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                <span>
                  {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '0'} pts vs yesterday ({yesterdayVal})
                </span>
              </span>
            ) : (
              <span className="text-xs text-[#747474] dark:text-[#A0A09B]">
                First tracked day
              </span>
            )}
          </div>

          <p className="text-xs text-[#747474] dark:text-[#A0A09B] leading-relaxed">
            {todayScore.encouragement}
          </p>

          {/* 7-Day Mini Sparkline / History */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[10px] text-[#A0A09B] font-semibold mb-1">
              <span>7-Day Trend</span>
              <span>
                Avg: {weeklyScores.length > 0 ? Math.round(weeklyScores.reduce((acc, s) => acc + s.score, 0) / weeklyScores.length) : score} pts
              </span>
            </div>
            <div className="flex items-end gap-1.5 h-8">
              {Array.from({ length: 7 }).map((_, idx) => {
                const s = last7Scores[idx];
                const barHeight = s ? Math.max(15, Math.round((s.score / 100) * 100)) : 10;
                const isTodayBar = idx === last7Scores.length - 1;

                return (
                  <div
                    key={idx}
                    className="flex-1 h-full flex flex-col justify-end group/bar relative cursor-pointer"
                    title={s ? `${s.date}: ${s.score} pts` : 'No record'}
                  >
                    {/* Hover tooltip */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none bg-[#262626] dark:bg-white text-white dark:text-[#262626] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-20">
                      {s ? `${s.score} pts` : '-'}
                    </div>

                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isTodayBar
                          ? 'bg-[#FF7058]'
                          : s
                          ? 'bg-[#E8E7E0] dark:bg-[#383A35] group-hover/bar:bg-[#FF7058]/70'
                          : 'bg-[#F2F2EE] dark:bg-[#282A26]'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Breakdown Panel */}
      {showBreakdown && (
        <div className="pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] flex items-center justify-between">
            <span>Score Composition</span>
            <span className="text-[10px] text-[#747474] font-normal">Transparent, healthy-balance rules</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Tasks */}
            <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF7058]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </div>
              <div className="text-base font-black text-[#262626] dark:text-[#F3F3F0] font-mono">
                {todayScore.breakdown.taskPoints} <span className="text-xs font-normal text-[#747474]">/ 40</span>
              </div>
              <p className="text-[10px] text-[#747474] dark:text-[#A0A09B]">
                {todayScore.breakdown.tasksCompleted} completed
              </p>
            </div>

            {/* Habits */}
            <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8EDCC0]">
                <Flame className="w-3.5 h-3.5" />
                <span>Habits</span>
              </div>
              <div className="text-base font-black text-[#262626] dark:text-[#F3F3F0] font-mono">
                {todayScore.breakdown.habitPoints} <span className="text-xs font-normal text-[#747474]">/ 25</span>
              </div>
              <p className="text-[10px] text-[#747474] dark:text-[#A0A09B]">
                {todayScore.breakdown.habitsCompleted} logged today
              </p>
            </div>

            {/* Goals */}
            <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B8A7F9]">
                <Target className="w-3.5 h-3.5" />
                <span>Goals</span>
              </div>
              <div className="text-base font-black text-[#262626] dark:text-[#F3F3F0] font-mono">
                {todayScore.breakdown.goalPoints} <span className="text-xs font-normal text-[#747474]">/ 15</span>
              </div>
              <p className="text-[10px] text-[#747474] dark:text-[#A0A09B]">
                Milestone traction
              </p>
            </div>

            {/* Focus */}
            <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8BCBFA]">
                <Clock className="w-3.5 h-3.5" />
                <span>Focus</span>
              </div>
              <div className="text-base font-black text-[#262626] dark:text-[#F3F3F0] font-mono">
                {todayScore.breakdown.focusPoints} <span className="text-xs font-normal text-[#747474]">/ 20</span>
              </div>
              <p className="text-[10px] text-[#747474] dark:text-[#A0A09B]">
                {todayScore.breakdown.focusMinutes}m logged
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
