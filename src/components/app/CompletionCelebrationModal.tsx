import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, X, Award, Flame } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTheme } from '../../contexts/ThemeContext';

interface CompletionCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasksCount: number;
}

export const CompletionCelebrationModal: React.FC<CompletionCelebrationModalProps> = ({
  isOpen,
  onClose,
  completedTasksCount,
}) => {
  const { reducedMotion } = useTheme();

  useEffect(() => {
    if (isOpen && !reducedMotion) {
      try {
        // Tasteful subtle burst from the sides and center
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#8EDCC0', '#FF7058', '#FFD166', '#8BCBFA'],
          disableForReducedMotion: true,
        });
      } catch {
        // Fallback gracefully if canvas unavailable
      }
    }
  }, [isOpen, reducedMotion]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center py-3 space-y-4">
        {/* Glow & Animated Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#8EDCC0] to-[#FFD166] opacity-25 blur-lg animate-pulse" />
          <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#8EDCC0] to-[#54BE97] text-white flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-105">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
        </div>

        {/* Congratulatory Text */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1E4D3E] dark:text-[#8EDCC0] bg-[#8EDCC0]/20 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            100% Day Complete
          </span>

          <h2 className="text-2xl font-black text-[#262626] dark:text-[#F3F3F0] tracking-tight pt-1">
            All Done for Today!
          </h2>

          <p className="text-sm font-medium text-[#747474] dark:text-[#A0A09B]">
            You've completed all <strong className="text-[#262626] dark:text-[#F3F3F0]">{completedTasksCount}</strong> task{completedTasksCount > 1 ? 's' : ''} on today's schedule.
          </p>
        </div>

        {/* Motivational Card */}
        <div className="p-3.5 rounded-2xl bg-[#F8F8F5] dark:bg-[#262824] border border-[#E8E7E0] dark:border-[#2E302B] text-xs text-[#747474] dark:text-[#A0A09B] leading-relaxed">
          <p>
            Your steady focus makes every day count. Take a well-earned breather, reflect on your accomplishments, or take it easy for the rest of the day.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-press w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF7058] to-[#FF8B77] hover:from-[#F06148] hover:to-[#FF7058] text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-[#FF7058]/25 cursor-pointer transition-all duration-150"
          >
            Keep Glowing ✨
          </button>
        </div>
      </div>
    </Modal>
  );
};
