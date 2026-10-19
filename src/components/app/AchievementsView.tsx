import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Flame,
  Clock,
  Zap,
  Target,
  Compass,
  Sparkles,
  ShieldCheck,
  Timer,
  Lock,
  Unlock,
  Filter,
} from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../../lib/achievements';
import { UserAchievement } from '../../types';
import { formatDate } from '../../lib/dates';
import { useAuth } from '../../contexts/AuthContext';
import { EmptyState } from '../common/EmptyState';

interface AchievementsViewProps {
  userAchievements: UserAchievement[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ userAchievements }) => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const userAchMap = new Map(userAchievements.map((a) => [a.achievementKey, a]));

  const iconMap: { [name: string]: React.FC<{ className?: string }> } = {
    CheckCircle2,
    Award,
    Flame,
    Clock,
    Zap,
    Target,
    Compass,
    Sparkles,
    ShieldCheck,
    Timer,
  };

  const categories = [
    { id: 'all', label: 'All Badges' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'habits', label: 'Habits' },
    { id: 'focus', label: 'Focus' },
    { id: 'goals', label: 'Goals' },
    { id: 'reviews', label: 'Reviews' },
  ];

  const filteredAchievements = ALL_ACHIEVEMENTS.filter((ach) => {
    if (selectedCategory === 'all') return true;
    return ach.category === selectedCategory;
  });

  const totalUnlocked = ALL_ACHIEVEMENTS.filter((ach) => userAchMap.get(ach.key)?.unlocked).length;
  const completionPercentage = Math.round((totalUnlocked / ALL_ACHIEVEMENTS.length) * 100);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Achievements & Badges
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Earn distinct badges as you cultivate consistency and focus over time.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="card-lift flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] self-start sm:self-auto shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#FFD166]/20 text-[#B8870A] dark:text-[#FFD166] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
              {totalUnlocked} of {ALL_ACHIEVEMENTS.length} Unlocked
            </div>
            <div className="text-[10px] text-[#747474] dark:text-[#A0A09B]">
              {completionPercentage}% total completed
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F5F5F2] dark:bg-[#282A26] max-w-fit">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn-press px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] shadow-2xs'
                : 'text-[#747474] hover:text-[#262626] dark:hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Badges */}
      {filteredAchievements.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No achievements in this category"
          description="Try selecting another category or view all badges."
          actionLabel="View All Badges"
          onAction={() => setSelectedCategory('all')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const userAch = userAchMap.get(ach.key);
            const isUnlocked = Boolean(userAch?.unlocked);
            const progress = userAch?.progress || 0;
            const maxProgress = ach.targetCount;
            const progressPercent = Math.min(100, Math.round((progress / maxProgress) * 100));

            const IconComponent = iconMap[ach.iconName] || Award;

            return (
              <div
                key={ach.key}
                className={`card-lift group relative p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#FFFDF9] dark:bg-[#20221F] border-[#E8E7E0] dark:border-[#2E302B] shadow-2xs hover:border-[#FF7058]/40'
                    : 'bg-[#F9F9F6] dark:bg-[#1A1B19] border-[#EAEAE5] dark:border-[#282A26] opacity-80 hover:opacity-100'
                }`}
              >
                {/* Status indicator pill */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-2xs ${
                      isUnlocked
                        ? 'text-white'
                        : 'bg-[#E8E7E0] dark:bg-[#2E302B] text-[#A0A09B]'
                    }`}
                    style={{
                      backgroundColor: isUnlocked ? ach.color : undefined,
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUnlocked
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[#E8E7E0] dark:bg-[#2E302B] text-[#747474]'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3" /> Unlocked
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Locked
                      </>
                    )}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 my-3">
                  <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-[#747474] dark:text-[#A0A09B] leading-relaxed">
                    {ach.description}
                  </p>
                  <p className="text-[11px] text-[#A0A09B] italic">
                    {ach.howToEarn}
                  </p>
                </div>

                {/* Progress bar & Unlock date */}
                <div className="pt-3 border-t border-[#E8E7E0] dark:border-[#2E302B] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-[#747474]">Progress</span>
                    <span className="text-[#262626] dark:text-[#F3F3F0] font-mono">
                      {progress} / {maxProgress}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#E8E7E0] dark:bg-[#2E302B] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: isUnlocked ? ach.color : '#A0A09B',
                      }}
                    />
                  </div>

                  {isUnlocked && userAch?.unlockedAt && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                      Earned {formatDate(userAch.unlockedAt.split('T')[0], userProfile?.dateFormat)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
