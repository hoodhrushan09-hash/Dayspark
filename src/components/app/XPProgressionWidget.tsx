import React, { useState } from 'react';
import { Award, Zap, ChevronRight, History, Sparkles, HelpCircle } from 'lucide-react';
import { XPTransaction } from '../../types';
import { getLevelInfo, XP_REWARDS } from '../../lib/gamification';

interface XPProgressionWidgetProps {
  totalXP: number;
  recentTransactions: XPTransaction[];
}

export const XPProgressionWidget: React.FC<XPProgressionWidgetProps> = ({
  totalXP,
  recentTransactions,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const levelInfo = getLevelInfo(totalXP);

  return (
    <div className="card-lift p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFD166]/20 text-[#B8870A] dark:text-[#FFD166] flex items-center justify-center">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                Level {levelInfo.level} · {levelInfo.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowInfo((prev) => !prev)}
                className="text-[#747474] hover:text-[#262626] dark:hover:text-white cursor-pointer"
                title="XP guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
              {levelInfo.totalXP.toLocaleString()} Total XP
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="btn-press flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>{showHistory ? 'Hide XP' : 'Activity'}</span>
        </button>
      </div>

      {/* Progress Bar towards Next Level */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#747474] dark:text-[#A0A09B]">
            Level {levelInfo.level}
          </span>
          <span className="text-[#262626] dark:text-[#F3F3F0] font-mono">
            {levelInfo.currentLevelXP} / {levelInfo.nextLevelXPRequired} XP ({levelInfo.progressPercent}%)
          </span>
          <span className="text-[#747474] dark:text-[#A0A09B]">
            Level {levelInfo.level + 1}
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-[#E8E7E0] dark:bg-[#2E302B] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FFD166] via-[#FF7058] to-[#B8A7F9] transition-all duration-500 ease-out"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick XP Info Popover */}
      {showInfo && (
        <div className="p-3 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] text-xs space-y-2 animate-in fade-in duration-150">
          <span className="font-bold text-[#262626] dark:text-[#F3F3F0] block">
            How to Earn XP:
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#747474] dark:text-[#A0A09B]">
            <div>• Task completed: <strong>+{XP_REWARDS.TASK_COMPLETED} XP</strong></div>
            <div>• Urgent task: <strong>+{XP_REWARDS.TASK_URGENT_COMPLETED} XP</strong></div>
            <div>• Habit check-in: <strong>+{XP_REWARDS.HABIT_COMPLETED} XP</strong></div>
            <div>• 25m Focus: <strong>+{XP_REWARDS.FOCUS_SESSION_25M} XP</strong></div>
            <div>• Goal Milestone: <strong>+{XP_REWARDS.MILESTONE_COMPLETED} XP</strong></div>
            <div>• Weekly Review: <strong>+{XP_REWARDS.WEEKLY_REVIEW_COMPLETED} XP</strong></div>
          </div>
        </div>
      )}

      {/* Recent XP Activity Log */}
      {showHistory && (
        <div className="pt-3 border-t border-[#E8E7E0] dark:border-[#2E302B] space-y-2 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] block">
            Recent XP Rewards
          </span>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-[#747474] dark:text-[#A0A09B] py-2">
              No XP records yet. Check off a task or complete a focus session!
            </p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD166] flex-shrink-0" />
                    <span className="text-[#262626] dark:text-[#F3F3F0] truncate font-medium">
                      {tx.reason}
                    </span>
                  </div>
                  <span className="font-bold text-[#FF7058] font-mono whitespace-nowrap ml-2">
                    +{tx.amount} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
