import { describe, it, expect } from 'vitest';

describe('Statistics Calculations', () => {
  describe('Weekly Data Calculation', () => {
    it('should calculate weekly completion data correctly', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const oneDayMs = 24 * 60 * 60 * 1000;

      const completedDates = [
        today - 6 * oneDayMs,
        today - 5 * oneDayMs,
        today - 3 * oneDayMs,
        today,
      ];

      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = today - i * oneDayMs;
        const count = completedDates.filter((d) => d === date).length;
        weeklyData.push(count);
      }

      expect(weeklyData).toHaveLength(7);
      expect(weeklyData[0]).toBe(1); // 6 days ago
      expect(weeklyData[6]).toBe(1); // Today
    });
  });

  describe('Monthly Data Calculation', () => {
    it('should calculate monthly completion data for all days', () => {
      const year = 2026;
      const month = 3; // April
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthlyData = Array.from({ length: daysInMonth }, () => 0);

      expect(monthlyData).toHaveLength(daysInMonth);
      expect(monthlyData.length).toBeGreaterThan(0);
    });

    it('should handle different months with different day counts', () => {
      const months = [
        { month: 0, days: 31 }, // January
        { month: 1, days: 28 }, // February (non-leap)
        { month: 3, days: 30 }, // April
      ];

      months.forEach(({ month, days }) => {
        const daysInMonth = new Date(2026, month + 1, 0).getDate();
        expect(daysInMonth).toBe(days);
      });
    });
  });

  describe('Completion Percentage', () => {
    it('should calculate completion percentage correctly', () => {
      const completedThisMonth = 15;
      const daysInMonth = 30;
      const percentage = Math.round((completedThisMonth / daysInMonth) * 100);

      expect(percentage).toBe(50);
    });

    it('should handle edge cases for percentage calculation', () => {
      // All completed
      expect(Math.round((30 / 30) * 100)).toBe(100);

      // None completed
      expect(Math.round((0 / 30) * 100)).toBe(0);

      // Partial completion
      expect(Math.round((7 / 30) * 100)).toBe(23);
    });
  });

  describe('Habit Ranking', () => {
    it('should rank habits by completion percentage', () => {
      const habits = [
        { name: 'Exercise', completionPercentage: 80 },
        { name: 'Reading', completionPercentage: 60 },
        { name: 'Meditation', completionPercentage: 90 },
      ];

      const ranked = [...habits].sort((a, b) => b.completionPercentage - a.completionPercentage);

      expect(ranked[0].name).toBe('Meditation');
      expect(ranked[1].name).toBe('Exercise');
      expect(ranked[2].name).toBe('Reading');
    });

    it('should handle habits with same completion percentage', () => {
      const habits = [
        { name: 'Habit A', completionPercentage: 75 },
        { name: 'Habit B', completionPercentage: 75 },
        { name: 'Habit C', completionPercentage: 50 },
      ];

      const ranked = [...habits].sort((a, b) => b.completionPercentage - a.completionPercentage);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].completionPercentage).toBe(75);
      expect(ranked[2].completionPercentage).toBe(50);
    });
  });

  describe('Global Statistics', () => {
    it('should calculate global best streak', () => {
      const habits = [
        { name: 'Habit 1', bestStreak: 15 },
        { name: 'Habit 2', bestStreak: 8 },
        { name: 'Habit 3', bestStreak: 20 },
      ];

      const bestStreakGlobal = Math.max(...habits.map((h) => h.bestStreak));
      expect(bestStreakGlobal).toBe(20);
    });

    it('should count total completed days across all habits', () => {
      const habits = [
        { totalCompleted: 50 },
        { totalCompleted: 30 },
        { totalCompleted: 20 },
      ];

      const totalCompleted = habits.reduce((sum, h) => sum + h.totalCompleted, 0);
      expect(totalCompleted).toBe(100);
    });

    it('should count completed habits today', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const habits = [
        { completedDates: [today] },
        { completedDates: [] },
        { completedDates: [today] },
      ];

      const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
      expect(completedToday).toBe(2);
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to previous month correctly', () => {
      let month = 0; // January
      let year = 2026;

      // Go to previous month (should wrap to December of previous year)
      if (month === 0) {
        month = 11;
        year = year - 1;
      } else {
        month = month - 1;
      }

      expect(month).toBe(11);
      expect(year).toBe(2025);
    });

    it('should navigate to next month correctly', () => {
      let month = 11; // December
      let year = 2025;

      // Go to next month (should wrap to January of next year)
      if (month === 11) {
        month = 0;
        year = year + 1;
      } else {
        month = month + 1;
      }

      expect(month).toBe(0);
      expect(year).toBe(2026);
    });

    it('should not navigate beyond current month', () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let month = currentMonth;
      let year = currentYear;

      // Try to go to next month (should not change)
      if (month < currentMonth || year < currentYear) {
        month = month + 1;
      }

      expect(month).toBe(currentMonth);
      expect(year).toBe(currentYear);
    });
  });
});
