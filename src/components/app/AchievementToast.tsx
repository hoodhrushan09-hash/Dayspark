import React, { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../../lib/achievements';
import { AchievementKey } from '../../types';

interface AchievementToastProps {
  achievementKey: AchievementKey | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievementKey,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievementKey) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [achievementKey, onDismiss]);

  if (!achievementKey || !visible) return null;

  const def = ALL_ACHIEVEMENTS.find((a) => a.key === achievementKey);
  if (!def) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="card-lift p-4 rounded-2xl bg-white dark:bg-[#20221F] border border-[#FFD166] dark:border-[#FFD166]/50 shadow-xl flex items-center gap-3.5 max-w-sm">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
          style={{ backgroundColor: def.color || '#FFD166' }}
        >
          <Award className="w-5 h-5" />
        </div>

        <div className="flex-1 pr-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF7058]">
            Badge Unlocked!
          </div>
          <div className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
            {def.title}
          </div>
          <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
            {def.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="text-[#747474] hover:text-[#262626] dark:hover:text-white cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
