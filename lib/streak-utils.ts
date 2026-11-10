/**
 * Shared streak calculation utilities
 * Used by habit-context, export-service, and statistics components
 */

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

/**
 * Calculate current and best streak from sorted completion dates
 * @param sortedDates - Array of timestamps sorted ascending
 * @param ignoreVacation - If true, count all consecutive days without break check
 */
export function calculateStreaks(
  sortedDates: number[],
  ignoreVacation: boolean = false
): StreakResult {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date().setHours(0, 0, 0, 0);

  if (sortedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 1;
  let tempStreak = 1;

  const lastDate = sortedDates[sortedDates.length - 1];
  const daysSinceLastCompletion = Math.round((todayStart - lastDate) / oneDayMs);

  if (ignoreVacation || daysSinceLastCompletion <= 1) {
    currentStreak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      if (Math.round((sortedDates[i + 1] - sortedDates[i]) / oneDayMs) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  for (let i = 1; i < sortedDates.length; i++) {
    if (Math.round((sortedDates[i] - sortedDates[i - 1]) / oneDayMs) === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, bestStreak };
}
