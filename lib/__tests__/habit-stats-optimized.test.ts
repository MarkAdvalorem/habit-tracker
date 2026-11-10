import { describe, it, expect } from 'vitest';

// Import the getHabitStats logic inline to test the optimized algorithm
function getHabitStats(habit: any): any {
  if (!habit) {
    return {
      totalCompleted: 0,
      currentStreak: 0,
      bestStreak: 0,
      completionPercentage: 0,
      completedThisMonth: 0,
    };
  }

  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const completedThisMonth = habit.completedDates.filter((date: number) => {
    const d = new Date(date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const sortedDates = [...habit.completedDates].sort((a: number, b: number) => a - b);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const todayStart = new Date().setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  if (sortedDates.length > 0) {
    const lastDate = sortedDates[sortedDates.length - 1];
    const daysSinceLastCompletion = Math.round((todayStart - lastDate) / oneDayMs);

    if (daysSinceLastCompletion <= 1) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        if (Math.round((sortedDates[i + 1] - sortedDates[i]) / oneDayMs) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    bestStreak = 1;
    tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      if (Math.round((sortedDates[i] - sortedDates[i - 1]) / oneDayMs) === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }

  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const completionPercentage = Math.round((completedThisMonth / daysInMonth) * 100);

  return {
    totalCompleted: habit.completedDates.length,
    currentStreak,
    bestStreak,
    completionPercentage,
    completedThisMonth,
  };
}

describe('getHabitStats (optimized)', () => {
  it('should return zeros for non-existent habit', () => {
    const stats = getHabitStats(null);
    expect(stats).toEqual({
      totalCompleted: 0,
      currentStreak: 0,
      bestStreak: 0,
      completionPercentage: 0,
      completedThisMonth: 0,
    });
  });

  it('should calculate currentStreak correctly when completed today', () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 24 * 60 * 60 * 1000;
    const twoDaysAgo = yesterday - 24 * 60 * 60 * 1000;

    const habit = {
      completedDates: [twoDaysAgo, yesterday, today],
    };

    const stats = getHabitStats(habit);
    expect(stats.currentStreak).toBe(3);
  });

  it('should calculate currentStreak correctly when completed yesterday but not today', () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 24 * 60 * 60 * 1000;

    const habit = {
      completedDates: [yesterday],
    };

    const stats = getHabitStats(habit);
    expect(stats.currentStreak).toBe(1);
  });

  it('should calculate currentStreak as 0 when last completion was 2+ days ago', () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const twoDaysAgo = today - 2 * 24 * 60 * 60 * 1000;

    const habit = {
      completedDates: [twoDaysAgo],
    };

    const stats = getHabitStats(habit);
    expect(stats.currentStreak).toBe(0);
  });

  it('should calculate bestStreak correctly across gaps', () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Create dates: 5 day streak, gap, 3 day streak
    const dates = [];
    for (let i = 0; i < 5; i++) {
      dates.push(today - (10 + i) * oneDayMs);
    }
    for (let i = 0; i < 3; i++) {
      dates.push(today - (3 + i) * oneDayMs);
    }

    const habit = { completedDates: dates };
    const stats = getHabitStats(habit);
    expect(stats.bestStreak).toBe(5);
  });

  it('should handle single completion', () => {
    const today = new Date().setHours(0, 0, 0, 0);
    const habit = { completedDates: [today] };

    const stats = getHabitStats(habit);
    expect(stats.currentStreak).toBe(1);
    expect(stats.bestStreak).toBe(1);
  });

  it('should handle empty completions', () => {
    const habit = { completedDates: [] };
    const stats = getHabitStats(habit);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(0);
  });
});
