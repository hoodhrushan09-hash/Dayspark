import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconColor = '#FF7058',
  iconBgColor = 'rgba(255, 112, 88, 0.1)',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`card-lift p-8 sm:p-10 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] text-center flex flex-col items-center justify-center max-w-md mx-auto shadow-2xs ${className}`}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-110"
        style={{ backgroundColor: iconBgColor, color: iconColor }}
      >
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1.5 max-w-xs leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="btn-press px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn-press px-3.5 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] text-xs font-medium cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
