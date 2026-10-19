import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, Zap, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { getLevelInfo } from '../../lib/gamification';
import { useTheme } from '../../contexts/ThemeContext';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  totalXP: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  totalXP,
}) => {
  const { reducedMotion } = useTheme();
  const levelInfo = getLevelInfo(totalXP);

  useEffect(() => {
    if (isOpen && !reducedMotion) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF7058', '#FFD166', '#8EDCC0', '#8BCBFA', '#B8A7F9'],
        });
      } catch (err) {
        // Safe fallback if canvas not available
      }
    }
  }, [isOpen, reducedMotion]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center py-4 space-y-4">
        {/* Animated Badge Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FFD166] to-[#FF7058] opacity-20 blur-md" />
          <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFD166] to-[#FF7058] text-white flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            <Zap className="w-8 h-8 fill-current" />
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF7058]">
            Level Up!
          </span>
          <h2 className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] tracking-tight mt-1">
            Level {newLevel} Reached!
          </h2>
          <p className="text-sm font-semibold text-[#747474] dark:text-[#A0A09B] mt-0.5">
            Title Unlocked: <span className="text-[#262626] dark:text-[#F3F3F0] font-bold">{levelInfo.title}</span>
          </p>
        </div>

        <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-xs mx-auto leading-relaxed">
          Your steady discipline and consistent completions are paying off. Keep building daily momentum!
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-press w-full py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-sm font-bold shadow-md hover:shadow-lg hover:shadow-[#FF7058]/25 cursor-pointer"
          >
            Claim & Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};
