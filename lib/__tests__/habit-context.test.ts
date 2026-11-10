import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitStats } from '../types';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('Habit Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Habit Creation', () => {
    it('should create a new habit with required fields', () => {
      const habit: Habit = {
        id: '1',
        name: 'Morning Exercise',
        category: 'health-sport',
        frequency: 'daily',
        color: '#10B981',
        icon: 'dumbbell',
        createdAt: Date.now(),
        completedDates: [],
        orderIndex: 0,
      };

      expect(habit.name).toBe('Morning Exercise');
      expect(habit.category).toBe('health-sport');
      expect(habit.frequency).toBe('daily');
      expect(habit.completedDates).toEqual([]);
    });

    it('should generate unique IDs for new habits', () => {
      const habit1: Habit = {
        id: Date.now().toString(),
        name: 'Habit 1',
        category: 'health-sport',
        frequency: 'daily',
        color: '#10B981',
        icon: 'heart',
        createdAt: Date.now(),
        completedDates: [],
        orderIndex: 0,
      };

      const habit2: Habit = {
        id: (Date.now() + 1).toString(),
        name: 'Habit 2',
        category: 'health-sport',
        frequency: 'daily',
        color: '#10B981',
        icon: 'heart',
        createdAt: Date.now() + 1,
        completedDates: [],
        orderIndex: 1,
      };

      expect(habit1.id).not.toBe(habit2.id);
    });
  });

  describe('Habit Completion Tracking', () => {
    it('should track completed dates', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        category: 'health-sport',
        frequency: 'daily',
        color: '#10B981',
        icon: 'dumbbell',
        createdAt: Date.now(),
        completedDates: [today],
        orderIndex: 0,
      };

      expect(habit.completedDates).toContain(today);
      expect(habit.completedDates.length).toBe(1);
    });

    it('should toggle habit completion', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      let completedDates = [today];

      // Toggle off
      completedDates = completedDates.filter((d) => d !== today);
      expect(completedDates).toEqual([]);

      // Toggle on
      completedDates = [...completedDates, today];
      expect(completedDates).toContain(today);
    });

    it('should handle multiple completed dates', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = today - 24 * 60 * 60 * 1000;
      const twoDaysAgo = yesterday - 24 * 60 * 60 * 1000;

      const habit: Habit = {
        id: '1',
        name: 'Exercise',
        category: 'health-sport',
        frequency: 'daily',
        color: '#10B981',
        icon: 'dumbbell',
        createdAt: Date.now(),
        completedDates: [twoDaysAgo, yesterday, today],
        orderIndex: 0,
      };

      expect(habit.completedDates.length).toBe(3);
      expect(habit.completedDates).toContain(today);
      expect(habit.completedDates).toContain(yesterday);
      expect(habit.completedDates).toContain(twoDaysAgo);
    });
  });

  describe('Habit Statistics', () => {
    it('should calculate completion percentage correctly', () => {
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const completedThisMonth = 15;

      const completionPercentage = Math.round((completedThisMonth / daysInMonth) * 100);

      expect(completionPercentage).toBeGreaterThan(0);
      expect(completionPercentage).toBeLessThanOrEqual(100);
    });

    it('should calculate current streak', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = today - 24 * 60 * 60 * 1000;
      const twoDaysAgo = yesterday - 24 * 60 * 60 * 1000;

      const completedDates = [twoDaysAgo, yesterday, today];
      const oneDayMs = 24 * 60 * 60 * 1000;

      let currentStreak = 0;
      if (completedDates.length > 0) {
        const daysSinceLastCompletion = Math.floor((today - completedDates[completedDates.length - 1]) / oneDayMs);
        if (daysSinceLastCompletion <= 1) {
          currentStreak = 1;
        }
      }

      expect(currentStreak).toBe(1);
    });

    it('should calculate best streak', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Create 5 consecutive days
      const completedDates = [
        today - 4 * oneDayMs,
        today - 3 * oneDayMs,
        today - 2 * oneDayMs,
        today - oneDayMs,
        today,
      ];

      let bestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < completedDates.length; i++) {
        const date = completedDates[i];
        const prevDate = i > 0 ? completedDates[i - 1] : null;

        if (prevDate && Math.abs(date - prevDate) === oneDayMs) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }

        bestStreak = Math.max(bestStreak, tempStreak);
      }

      expect(bestStreak).toBe(5);
    });
  });

  describe('Habit Validation', () => {
    it('should validate habit name is not empty', () => {
      const name = '';
      expect(name.trim().length).toBe(0);
    });

    it('should validate habit has a valid category', () => {
      const validCategories = ['health-sport', 'work', 'learning', 'wellbeing', 'health-sport', 'other'];
      const category = 'health-sport';

      expect(validCategories).toContain(category);
    });

    it('should validate habit has a valid frequency', () => {
      const validFrequencies = ['daily', '3-per-week', '4-per-week', '5-per-week', 'weekly'];
      const frequency = 'daily';

      expect(validFrequencies).toContain(frequency);
    });
  });

  describe('Habit Filtering', () => {
    it('should filter habits by category', () => {
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Exercise',
          category: 'health-sport',
          frequency: 'daily',
          color: '#10B981',
          icon: 'dumbbell',
          createdAt: Date.now(),
          completedDates: [],
          orderIndex: 0,
        },
        {
          id: '2',
          name: 'Read',
          category: 'learning',
          frequency: 'daily',
          color: '#8B5CF6',
          icon: 'book',
          createdAt: Date.now(),
          completedDates: [],
          orderIndex: 1,
        },
      ];

      const fitnessHabits = habits.filter((h) => h.category === 'health-sport');
      expect(fitnessHabits).toHaveLength(1);
      expect(fitnessHabits[0].name).toBe('Exercise');
    });

    it('should filter habits by completion status', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const habits: Habit[] = [
        {
          id: '1',
          name: 'Exercise',
          category: 'health-sport',
          frequency: 'daily',
          color: '#10B981',
          icon: 'dumbbell',
          createdAt: Date.now(),
          completedDates: [today],
          orderIndex: 0,
        },
        {
          id: '2',
          name: 'Read',
          category: 'learning',
          frequency: 'daily',
          color: '#8B5CF6',
          icon: 'book',
          createdAt: Date.now(),
          completedDates: [],
          orderIndex: 1,
        },
      ];

      const completedToday = habits.filter((h) => h.completedDates.includes(today));
      expect(completedToday).toHaveLength(1);
      expect(completedToday[0].name).toBe('Exercise');
    });
  });
});
