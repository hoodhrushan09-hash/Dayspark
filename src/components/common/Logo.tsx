import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-xl',
    xl: 'w-16 h-16 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* DaySpark sunrise app icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center overflow-hidden shadow-sm shadow-[#FF7058]/20 flex-shrink-0 transition-transform hover:scale-105 bg-gradient-to-br from-[#12153a] via-[#231e62] to-[#FF7058]`}
        aria-hidden="true"
      >
        <img
          src="/app-icon.png"
          alt="DaySpark"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If image fails to load, gracefully display the inline fallback sun icon
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <span className={`${textSizes[size]} text-[#262626] dark:text-[#F3F3F0] font-bold tracking-tight`}>
          Day<span className="text-[#FF7058]">Spark</span>
        </span>
      )}
    </div>
  );
};
