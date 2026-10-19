import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingScreenProps {
  message?: string;
  error?: string | null;
  onRetry?: () => void;
  fullscreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Getting your day ready...',
  error = null,
  onRetry,
  fullscreen = true,
}) => {
  const { reducedMotion } = useTheme();
  const [activeMessage, setActiveMessage] = useState(message);
  const [timedOut, setTimedOut] = useState(false);

  // Progressive messages if loading takes longer than a second
  useEffect(() => {
    setActiveMessage(message);

    const timer1 = setTimeout(() => {
      setActiveMessage('Lighting up your morning...');
    }, 2200);

    const timer2 = setTimeout(() => {
      setActiveMessage('Syncing your planner & habits...');
    }, 4500);

    // If it takes more than 12 seconds, present a friendly connection notice with retry
    const timeoutTimer = setTimeout(() => {
      setTimedOut(true);
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timeoutTimer);
    };
  }, [message]);

  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#FFFDF9] dark:bg-[#161715] text-[#262626] dark:text-[#F3F3F0] transition-colors duration-300'
    : 'min-h-[60vh] w-full flex flex-col items-center justify-center p-6 bg-[#FFFDF9] dark:bg-[#161715] text-[#262626] dark:text-[#F3F3F0] transition-colors duration-300';

  const showErrorState = Boolean(error || timedOut);

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* Ambient Sunrise Aura Background */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className={`w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full bg-gradient-to-tr from-[#FF7058]/15 via-[#FFD166]/10 to-[#B8A7F9]/10 dark:from-[#FF7058]/20 dark:via-[#4C2889]/25 dark:to-transparent blur-3xl ${
            reducedMotion ? 'opacity-50' : 'animate-sunrise-glow'
          }`}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Prominent DaySpark App Icon with Sunrise Glow */}
        <div className="relative mb-6 select-none">
          {/* Subtle Outer Glow Halo */}
          <div
            className={`absolute -inset-4 sm:-inset-6 rounded-3xl sm:rounded-[32px] bg-gradient-to-tr from-[#FF7058]/35 via-[#FFD166]/25 to-[#8BCBFA]/20 blur-xl ${
              reducedMotion ? 'opacity-60' : 'animate-sunrise-glow'
            }`}
            aria-hidden="true"
          />

          {/* App Icon Container */}
          <div
            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl sm:rounded-[28px] overflow-hidden shadow-2xl shadow-[#FF7058]/25 ring-1 ring-black/10 dark:ring-white/15 bg-gradient-to-br from-[#101239] via-[#211a58] to-[#FF7058] flex items-center justify-center ${
              reducedMotion ? '' : 'animate-sunrise-float'
            }`}
          >
            <img
              src="/app-icon.png"
              alt="DaySpark"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Inline fallback if image asset is unavailable
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Soft glass reflection sheen */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#262626] dark:text-[#F3F3F0] mb-1.5 flex items-center justify-center gap-1.5">
          <span>Day</span>
          <span className="text-[#FF7058]">Spark</span>
        </h1>

        {/* Brand Tagline */}
        <p className="text-xs sm:text-sm font-medium text-[#747474] dark:text-[#A0A09B] mb-7 tracking-wide">
          Make today count, your way
        </p>

        {/* Loading vs Error/Timeout State */}
        {showErrorState ? (
          <div className="flex flex-col items-center gap-3 w-full animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/60">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error || 'Taking longer than usual to connect'}</span>
            </div>

            <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-xs leading-relaxed">
              Please check your connection or reload to refresh your session.
            </p>

            <button
              onClick={() => {
                if (onRetry) {
                  onRetry();
                } else {
                  window.location.reload();
                }
              }}
              className="btn-press mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F25F45] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#FF7058]/25 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            {/* Elegant Slim Sunrise Progress Bar */}
            <div className="w-44 sm:w-52 h-1.5 bg-[#E8E7E0] dark:bg-[#2E302B] rounded-full overflow-hidden relative shadow-inner">
              <div
                className={`h-full w-full bg-gradient-to-r from-[#FF7058] via-[#FFD166] to-[#FF7058] rounded-full ${
                  reducedMotion ? 'opacity-80' : 'animate-shimmer-beam'
                }`}
                style={{ width: reducedMotion ? '100%' : '50%' }}
              />
            </div>

            {/* Dynamic Status Message */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#747474] dark:text-[#A0A09B]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7058] flex-shrink-0" />
              <span className="transition-opacity duration-300">{activeMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
