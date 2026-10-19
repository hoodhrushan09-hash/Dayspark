export interface TimerConfig {
  focusDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

export function formatSecondsToTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function calculateProgressPercentage(currentSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 100;
  const elapsed = totalSeconds - currentSeconds;
  return Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100));
}
