import { describe, it, expect } from 'vitest';
import { checkBadgeUnlock, getBadgeProgress, BADGES } from '../badges';

describe('Badge System', () => {
  const mockStats = {
    currentStreak: 0,
    bestStreak: 0,
    totalCompleted: 0,
    completionPercentage: 0,
    completedThisMonth: 0,
    totalHabits: 0,
    completedTodayCount: 0,
  };

  describe('Badge Unlock Conditions', () => {
    it('should unlock streak badge at 30 consecutive days', () => {
      const stats = { ...mockStats, bestStreak: 30 };
      expect(checkBadgeUnlock('streak', stats)).toBe(true);
    });

    it('should not unlock streak badge below 30 days', () => {
      const stats = { ...mockStats, bestStreak: 29 };
      expect(checkBadgeUnlock('streak', stats)).toBe(false);
    });

    it('should unlock consistency badge at 80% completion', () => {
      const stats = { ...mockStats, completionPercentage: 80 };
      expect(checkBadgeUnlock('consistency', stats)).toBe(true);
    });

    it('should not unlock consistency badge below 80%', () => {
      const stats = { ...mockStats, completionPercentage: 79 };
      expect(checkBadgeUnlock('consistency', stats)).toBe(false);
    });

    it('should unlock milestone badge at 100 total completed', () => {
      const stats = { ...mockStats, totalCompleted: 100 };
      expect(checkBadgeUnlock('milestone', stats)).toBe(true);
    });

    it('should not unlock milestone badge below 100', () => {
      const stats = { ...mockStats, totalCompleted: 99 };
      expect(checkBadgeUnlock('milestone', stats)).toBe(false);
    });

    it('should unlock perfect day badge when all habits completed', () => {
      const stats = { ...mockStats, completedTodayCount: 5, totalHabits: 5 };
      expect(checkBadgeUnlock('perfect_day', stats)).toBe(true);
    });

    it('should not unlock perfect day badge with 0 habits', () => {
      const stats = { ...mockStats, completedTodayCount: 0, totalHabits: 0 };
      expect(checkBadgeUnlock('perfect_day', stats)).toBe(false);
    });

    it('should unlock week warrior badge at 7 consecutive days', () => {
      const stats = { ...mockStats, bestStreak: 7 };
      expect(checkBadgeUnlock('week_warrior', stats)).toBe(true);
    });

    it('should unlock month master badge at 25 days this month', () => {
      const stats = { ...mockStats, completedThisMonth: 25 };
      expect(checkBadgeUnlock('month_master', stats)).toBe(true);
    });
  });

  describe('Badge Progress Calculation', () => {
    it('should calculate streak progress correctly', () => {
      const stats = { ...mockStats, bestStreak: 3 };
      const progress = getBadgeProgress('streak', stats);

      expect(progress.current).toBe(3);
      expect(progress.target).toBe(30);
      expect(progress.percentage).toBe((3 / 30) * 100);
    });

    it('should cap streak progress at 100%', () => {
      const stats = { ...mockStats, bestStreak: 35 };
      const progress = getBadgeProgress('streak', stats);

      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should calculate consistency progress correctly', () => {
      const stats = { ...mockStats, completionPercentage: 60 };
      const progress = getBadgeProgress('consistency', stats);

      expect(progress.current).toBe(60);
      expect(progress.target).toBe(80);
      expect(progress.percentage).toBe((60 / 80) * 100);
    });

    it('should calculate milestone progress correctly', () => {
      const stats = { ...mockStats, totalCompleted: 50 };
      const progress = getBadgeProgress('milestone', stats);

      expect(progress.current).toBe(50);
      expect(progress.target).toBe(100);
      expect(progress.percentage).toBe((50 / 100) * 100);
    });

    it('should calculate perfect day progress correctly', () => {
      const stats = { ...mockStats, completedTodayCount: 3, totalHabits: 5 };
      const progress = getBadgeProgress('perfect_day', stats);

      expect(progress.current).toBe(3);
      expect(progress.target).toBe(5);
      expect(progress.percentage).toBe((3 / 5) * 100);
    });

    it('should handle perfect day with 0 habits', () => {
      const stats = { ...mockStats, completedTodayCount: 0, totalHabits: 0 };
      const progress = getBadgeProgress('perfect_day', stats);

      expect(progress.percentage).toBe(0);
    });

    it('should calculate month master progress correctly', () => {
      const stats = { ...mockStats, completedThisMonth: 15 };
      const progress = getBadgeProgress('month_master', stats);

      expect(progress.current).toBe(15);
      expect(progress.target).toBe(25);
      expect(progress.percentage).toBe((15 / 25) * 100);
    });
  });

  describe('Badge Data', () => {
    it('should have all required badge properties', () => {
      Object.values(BADGES).forEach((badge) => {
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('icon');
        expect(badge).toHaveProperty('color');
        expect(badge).toHaveProperty('requirement');
      });
    });

    it('should have unique badge IDs', () => {
      const ids = Object.keys(BADGES);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have valid color codes', () => {
      Object.values(BADGES).forEach((badge) => {
        expect(badge.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Multiple Badge Unlock', () => {
    it('should unlock multiple badges when conditions are met', () => {
      const stats = {
        currentStreak: 10,
        bestStreak: 30,
        totalCompleted: 150,
        completionPercentage: 90,
        completedThisMonth: 30,
        totalHabits: 5,
        completedTodayCount: 5,
      };

      const unlockedBadges = [
        'streak',
        'consistency',
        'milestone',
        'perfect_day',
        'week_warrior',
        'month_master',
      ];

      unlockedBadges.forEach((badgeId) => {
        expect(checkBadgeUnlock(badgeId as any, stats)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero habits correctly', () => {
      const stats = { ...mockStats, totalHabits: 0 };
      expect(checkBadgeUnlock('perfect_day', stats)).toBe(false);
    });

    it('should handle maximum values correctly', () => {
      const stats = {
        currentStreak: 365,
        bestStreak: 365,
        totalCompleted: 10000,
        completionPercentage: 100,
        completedThisMonth: 31,
        totalHabits: 100,
        completedTodayCount: 100,
      };

      const progress = getBadgeProgress('streak', stats);
      expect(progress.percentage).toBeLessThanOrEqual(100);
    });

    it('should handle negative values gracefully', () => {
      const stats = { ...mockStats, bestStreak: -1 };
      expect(checkBadgeUnlock('streak', stats)).toBe(false);
    });
  });
});
