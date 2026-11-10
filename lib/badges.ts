export type BadgeType = 'streak' | 'consistency' | 'milestone' | 'perfect_day' | 'week_warrior' | 'month_master';

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  unlockedAt?: number;
}

export const BADGES: Record<BadgeType, Badge> = {
  streak: {
    id: 'streak',
    name: 'Streak Master',
    description: 'badges.badgeDescriptions.streak',
    icon: '🔥',
    color: '#FF6B6B',
    requirement: 'badges.badgeRequirements.streak',
  },
  consistency: {
    id: 'consistency',
    name: 'badges.badgeNames.consistency',
    description: 'badges.badgeDescriptions.consistency',
    icon: '⭐',
    color: '#FFD93D',
    requirement: 'badges.badgeRequirements.consistency',
  },
  milestone: {
    id: 'milestone',
    name: 'badges.badgeNames.milestone',
    description: 'badges.badgeDescriptions.milestone',
    icon: '🏆',
    color: '#6BCB77',
    requirement: 'badges.badgeRequirements.milestone',
  },
  perfect_day: {
    id: 'perfect_day',
    name: 'badges.badgeNames.perfect_day',
    description: 'badges.badgeDescriptions.perfect_day',
    icon: '✨',
    color: '#4D96FF',
    requirement: 'badges.badgeRequirements.perfect_day',
  },
  week_warrior: {
    id: 'week_warrior',
    name: 'badges.badgeNames.week_warrior',
    description: 'badges.badgeDescriptions.week_warrior',
    icon: '💪',
    color: '#FF6B9D',
    requirement: 'badges.badgeRequirements.week_warrior',
  },
  month_master: {
    id: 'month_master',
    name: 'badges.badgeNames.month_master',
    description: 'badges.badgeDescriptions.month_master',
    icon: '👑',
    color: '#C44569',
    requirement: 'badges.badgeRequirements.month_master',
  },
};

/**
 * Check if a badge should be unlocked based on habit statistics
 */
export function checkBadgeUnlock(
  badgeId: BadgeType,
  stats: {
    currentStreak: number;
    bestStreak: number;
    totalCompleted: number;
    completionPercentage: number;
    completedThisMonth: number;
    totalHabits: number;
    completedTodayCount: number;
  }
): boolean {
  switch (badgeId) {
    case 'streak':
      return stats.bestStreak >= 30;
    case 'consistency':
      return stats.completionPercentage >= 80;
    case 'milestone':
      return stats.totalCompleted >= 100;
    case 'perfect_day':
      return stats.completedTodayCount === stats.totalHabits && stats.totalHabits > 0;
    case 'week_warrior':
      return stats.bestStreak >= 7;
    case 'month_master':
      return stats.completedThisMonth >= 25;
    default:
      return false;
  }
}

/**
 * Get all unlocked badges
 */
export function getUnlockedBadges(
  stats: {
    currentStreak: number;
    bestStreak: number;
    totalCompleted: number;
    completionPercentage: number;
    completedThisMonth: number;
    totalHabits: number;
    completedTodayCount: number;
  },
  unlockedBadgeIds: BadgeType[]
): Badge[] {
  return unlockedBadgeIds
    .map((id) => BADGES[id])
    .filter((badge) => badge !== undefined);
}

/**
 * Get next badge to unlock
 */
export function getNextBadge(
  stats: {
    currentStreak: number;
    bestStreak: number;
    totalCompleted: number;
    completionPercentage: number;
    completedThisMonth: number;
    totalHabits: number;
    completedTodayCount: number;
  },
  unlockedBadgeIds: BadgeType[]
): Badge | null {
  const allBadgeIds = Object.keys(BADGES) as BadgeType[];

  for (const badgeId of allBadgeIds) {
    if (!unlockedBadgeIds.includes(badgeId) && checkBadgeUnlock(badgeId, stats)) {
      return BADGES[badgeId];
    }
  }

  return null;
}

/**
 * Get progress towards next badge
 */
export function getBadgeProgress(
  badgeId: BadgeType,
  stats: {
    currentStreak: number;
    bestStreak: number;
    totalCompleted: number;
    completionPercentage: number;
    completedThisMonth: number;
    totalHabits: number;
    completedTodayCount: number;
  }
): { current: number; target: number; percentage: number } {
  switch (badgeId) {
    case 'streak':
      return {
        current: stats.bestStreak,
        target: 30,
        percentage: Math.min((stats.bestStreak / 30) * 100, 100),
      };
    case 'consistency':
      return {
        current: stats.completionPercentage,
        target: 80,
        percentage: Math.min((stats.completionPercentage / 80) * 100, 100),
      };
    case 'milestone':
      return {
        current: stats.totalCompleted,
        target: 100,
        percentage: Math.min((stats.totalCompleted / 100) * 100, 100),
      };
    case 'perfect_day':
      return {
        current: stats.completedTodayCount,
        target: stats.totalHabits,
        percentage: stats.totalHabits > 0 ? (stats.completedTodayCount / stats.totalHabits) * 100 : 0,
      };
    case 'week_warrior':
      return {
        current: stats.bestStreak,
        target: 7,
        percentage: Math.min((stats.bestStreak / 7) * 100, 100),
      };
    case 'month_master':
      return {
        current: stats.completedThisMonth,
        target: 25,
        percentage: Math.min((stats.completedThisMonth / 25) * 100, 100),
      };
    default:
      return { current: 0, target: 0, percentage: 0 };
  }
}
