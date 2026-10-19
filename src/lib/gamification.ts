// Level threshold definitions
// Gradual curve where early levels are achievable quickly to encourage the user,
// and later levels require steady discipline.
export const XP_REWARDS = {
  TASK_COMPLETED: 20,
  TASK_URGENT_COMPLETED: 30,
  HABIT_COMPLETED: 15,
  FOCUS_SESSION_25M: 25,
  FOCUS_MINUTE: 1,
  MILESTONE_COMPLETED: 40,
  GOAL_COMPLETED: 100,
  WEEKLY_REVIEW_COMPLETED: 75,
} as const;

export interface LevelInfo {
  level: number;
  totalXP: number;
  currentLevelXP: number; // XP within current level
  nextLevelXPRequired: number; // XP needed to advance past current level
  progressPercent: number; // 0 - 100
  title: string;
}

// Progressive level tiers
const LEVEL_TITLES: { [level: number]: string } = {
  1: 'Initiate',
  2: 'Apprentice',
  3: 'Pathfinder',
  4: 'Achiever',
  5: 'Focus Master',
  6: 'Momentum Builder',
  7: 'Strategist',
  8: 'Champion',
  9: 'Grandmaster',
  10: 'Productivity Legend',
};

// Quadratic progression curve:
// Level 1: 0 - 100 XP (100)
// Level 2: 100 - 250 XP (150)
// Level 3: 250 - 450 XP (200)
// Level 4: 450 - 700 XP (250)
// Level 5: 700 - 1000 XP (300)
// Level 6: 1000 - 1350 XP (350)
// Level 7: 1350 - 1750 XP (400)
// Level 8: 1750 - 2200 XP (450)
// Level 9: 2200 - 2700 XP (500)
// Level 10: 2700+ XP
export function getLevelThresholds(maxLevel: number = 20): { level: number; minXP: number; maxXP: number }[] {
  const tiers = [];
  let currentMin = 0;
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    const span = 100 + (lvl - 1) * 50;
    const maxXP = currentMin + span;
    tiers.push({ level: lvl, minXP: currentMin, maxXP });
    currentMin = maxXP;
  }
  return tiers;
}

export function getLevelInfo(totalXP: number = 0): LevelInfo {
  const safeXP = Math.max(0, totalXP);
  const tiers = getLevelThresholds(30);

  let userTier = tiers[0];
  for (const tier of tiers) {
    if (safeXP >= tier.minXP && safeXP < tier.maxXP) {
      userTier = tier;
      break;
    }
  }

  // If beyond max tier
  if (safeXP >= tiers[tiers.length - 1].maxXP) {
    userTier = tiers[tiers.length - 1];
  }

  const currentLevelXP = safeXP - userTier.minXP;
  const levelSpan = userTier.maxXP - userTier.minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXP / levelSpan) * 100)));

  return {
    level: userTier.level,
    totalXP: safeXP,
    currentLevelXP,
    nextLevelXPRequired: levelSpan,
    progressPercent,
    title: LEVEL_TITLES[userTier.level] || `Level ${userTier.level} Veteran`,
  };
}
