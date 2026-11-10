import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Habit } from '../types';

// Simulate the archive logic from habit-context.tsx
function simulateArchiveHabit(habits: Habit[], id: string): Habit[] {
  const archivedAt = Date.now();
  return habits.map((h) => (h.id === id ? { ...h, archivedAt } : h));
}

function simulateRestoreHabit(habits: Habit[], id: string): Habit[] {
  return habits.map((h) => {
    if (h.id === id) {
      const { archivedAt: _, ...rest } = h;
      return rest as Habit;
    }
    return h;
  });
}

function simulateAddHabit(habits: Habit[], data: Partial<Habit>): Habit {
  const habit: Habit = {
    id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: data.name || 'Unnamed',
    category: data.category || 'other',
    frequency: data.frequency || 'daily',
    color: data.color || '#10B981',
    icon: data.icon || 'star',
    createdAt: Date.now(),
    completedDates: [],
    orderIndex: 0,
    ...data,
  };
  return habit;
}

function simulateToggleCompletion(habit: Habit, date: number): Habit {
  const isCompleted = habit.completedDates.includes(date);
  const newDates = isCompleted
    ? habit.completedDates.filter((d) => d !== date)
    : [...habit.completedDates, date];
  return { ...habit, completedDates: newDates };
}

function createTestHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: 'Test Habit',
    category: 'health-sport',
    frequency: 'daily',
    color: '#10B981',
    icon: 'fitness-center',
    createdAt: Date.now(),
    completedDates: [],
    orderIndex: 0,
    ...overrides,
  };
}

describe('Habit Archive', () => {
  let habits: Habit[];

  beforeEach(() => {
    habits = [];
  });

  describe('Archive Single Habit', () => {
    it('should mark a habit as archived with a timestamp', () => {
      const habit = createTestHabit({ name: 'Meditate 10min' });
      habits = [habit];

      expect(habits[0].archivedAt).toBeUndefined();

      habits = simulateArchiveHabit(habits, habit.id);

      expect(habits[0].archivedAt).toBeDefined();
      expect(typeof habits[0].archivedAt).toBe('number');
    });

    it('should exclude archived habits from active list (simulating home screen)', () => {
      const habit = createTestHabit({ name: 'Read 30min' });
      habits = [habit];

      const activeBefore = habits.filter((h) => !h.archivedAt);
      expect(activeBefore.length).toBe(1);

      habits = simulateArchiveHabit(habits, habit.id);

      const activeAfter = habits.filter((h) => !h.archivedAt);
      expect(activeAfter.length).toBe(0);
    });

    it('should restore an archived habit (simulating archived-habits screen)', () => {
      const habit = createTestHabit({ name: 'Drink 2L water' });
      habits = [habit];

      habits = simulateArchiveHabit(habits, habit.id);
      expect(habits[0].archivedAt).toBeDefined();

      habits = simulateRestoreHabit(habits, habit.id);

      expect(habits[0].archivedAt).toBeUndefined();
    });
  });

  describe('Multiple Habit Archive Flow', () => {
    it('should archive multiple habits and track them separately', () => {
      const habit1 = createTestHabit({ name: 'Morning Run' });
      const habit2 = createTestHabit({ name: 'Journal' });
      const habit3 = createTestHabit({ name: 'Code 1h' });
      habits = [habit1, habit2, habit3];

      expect(habits).toHaveLength(3);

      // Archive first habit
      habits = simulateArchiveHabit(habits, habit1.id);

      // Archive second habit
      habits = simulateArchiveHabit(habits, habit2.id);

      // Check that only 1 active habit remains
      const activeHabits = habits.filter((h) => !h.archivedAt);
      const archivedHabits = habits.filter((h) => h.archivedAt);

      expect(activeHabits).toHaveLength(1);
      expect(activeHabits[0].name).toBe('Code 1h');
      expect(archivedHabits).toHaveLength(2);
      expect(archivedHabits.map((h) => h.name).sort()).toEqual(['Journal', 'Morning Run'].sort());
    });

    it('should handle archive-restore-archive cycle correctly', () => {
      const habit = createTestHabit({ name: 'Stretching' });
      habits = [habit];

      // First archive
      habits = simulateArchiveHabit(habits, habit.id);
      expect(habits[0].archivedAt).toBeDefined();
      const firstArchiveTime = habits[0].archivedAt;

      // Restore
      habits = simulateRestoreHabit(habits, habit.id);
      expect(habits[0].archivedAt).toBeUndefined();

      // Archive again (should get a new timestamp)
      habits = simulateArchiveHabit(habits, habit.id);
      expect(habits[0].archivedAt).toBeDefined();
      expect(habits[0].archivedAt).toBeGreaterThanOrEqual(firstArchiveTime!);
    });

    it('should preserve completed dates when archiving and restoring', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = today - 24 * 60 * 60 * 1000;

      const habit = createTestHabit({ name: 'Meditate' });
      habits = [habit];

      // Add completions
      habits = habits.map((h) => (h.id === habit.id ? simulateToggleCompletion(h, today) : h));
      habits = habits.map((h) => (h.id === habit.id ? simulateToggleCompletion(h, yesterday) : h));

      expect(habits[0].completedDates).toContain(today);
      expect(habits[0].completedDates).toContain(yesterday);
      const originalDates = [...habits[0].completedDates];

      // Archive
      habits = simulateArchiveHabit(habits, habit.id);

      // Restore
      habits = simulateRestoreHabit(habits, habit.id);

      // Verify completions preserved
      expect(habits[0].completedDates).toContain(today);
      expect(habits[0].completedDates).toContain(yesterday);
      expect(habits[0].completedDates).toEqual(originalDates);
    });

    it('should handle complete flow: archive → view archived list → restore (simulating UI navigation)', () => {
      // Step 1: Create habits (simulating add-habit screen)
      const habit1 = createTestHabit({ name: 'Sport' });
      const habit2 = createTestHabit({ name: 'Lecture' });
      const habit3 = createTestHabit({ name: 'Cuisine' });
      habits = [habit1, habit2, habit3];

      expect(habits).toHaveLength(3);

      // Step 2: Archive habit 1 (simulating archive button in habit detail)
      habits = simulateArchiveHabit(habits, habit1.id);

      // Step 3: Return to home - should see only 2 habits
      const activeHabitsOnHome = habits.filter((h) => !h.archivedAt);
      expect(activeHabitsOnHome).toHaveLength(2);
      expect(activeHabitsOnHome.map((h) => h.name)).toContain('Lecture');
      expect(activeHabitsOnHome.map((h) => h.name)).toContain('Cuisine');

      // Step 4: Go to settings → Archived habits screen
      const archivedHabits = habits.filter((h) => h.archivedAt);
      expect(archivedHabits).toHaveLength(1);
      expect(archivedHabits[0].name).toBe('Sport');

      // Step 5: Restore the habit from archived screen
      habits = simulateRestoreHabit(habits, habit1.id);

      // Step 6: Return to home - should see all 3 habits again
      const restoredActiveHabits = habits.filter((h) => !h.archivedAt);
      expect(restoredActiveHabits).toHaveLength(3);
    });

    it('should handle multiple archives then bulk restore (simulating archived-habits screen with multiple items)', () => {
      // Create 5 habits
      const habitNames = ['Sport', 'Lecture', 'Cuisine', 'Musique', 'Yoga'];
      for (const name of habitNames) {
        habits.push(createTestHabit({ name }));
      }

      expect(habits).toHaveLength(5);

      // Archive all habits one by one
      for (const habit of habits) {
        habits = simulateArchiveHabit(habits, habit.id);
      }

      // All should be archived - home screen shows 0
      const activeAfterAllArchived = habits.filter((h) => !h.archivedAt);
      expect(activeAfterAllArchived).toHaveLength(0);

      // Archived habits screen shows all 5
      const archivedHabits = habits.filter((h) => h.archivedAt);
      expect(archivedHabits).toHaveLength(5);
      expect(archivedHabits.map((h) => h.name).sort()).toEqual(habitNames.sort());

      // Verify each has a timestamp
      archivedHabits.forEach((h) => {
        expect(h.archivedAt).toBeDefined();
        expect(typeof h.archivedAt).toBe('number');
      });

      // Simulate "restore all" from archived-habits screen
      for (const habit of archivedHabits) {
        habits = simulateRestoreHabit(habits, habit.id);
      }

      // All should be restored - home screen shows 5 again
      const restoredHabits = habits.filter((h) => !h.archivedAt);
      expect(restoredHabits).toHaveLength(5);
      expect(restoredHabits.map((h) => h.name).sort()).toEqual(habitNames.sort());

      // None should have archivedAt anymore
      restoredHabits.forEach((h) => {
        expect(h.archivedAt).toBeUndefined();
      });
    });

    it('should handle partial restore from archived list (user selects specific habits to restore)', () => {
      // Create 4 habits and archive all
      for (const name of ['Sport', 'Lecture', 'Musique', 'Yoga']) {
        habits.push(createTestHabit({ name }));
      }
      habits.forEach((h) => {
        habits = simulateArchiveHabit(habits, h.id);
      });

      expect(habits.filter((h) => h.archivedAt)).toHaveLength(4);

      // User only restores Sport and Musique
      const sportHabit = habits.find((h) => h.name === 'Sport')!;
      const musiqueHabit = habits.find((h) => h.name === 'Musique')!;

      habits = simulateRestoreHabit(habits, sportHabit.id);
      habits = simulateRestoreHabit(habits, musiqueHabit.id);

      // Home screen should show 2 active habits
      const activeHabits = habits.filter((h) => !h.archivedAt);
      expect(activeHabits).toHaveLength(2);
      expect(activeHabits.map((h) => h.name).sort()).toEqual(['Musique', 'Sport'].sort());

      // Archived screen should still show 2
      const stillArchived = habits.filter((h) => h.archivedAt);
      expect(stillArchived).toHaveLength(2);
      expect(stillArchived.map((h) => h.name).sort()).toEqual(['Lecture', 'Yoga'].sort());
    });
  });

  describe('Archive with Data Integrity', () => {
    it('should preserve all habit fields during archive/restore', () => {
      const today = new Date().setHours(0, 0, 0, 0);
      const yesterday = today - 24 * 60 * 60 * 1000;
      const twoDaysAgo = yesterday - 24 * 60 * 60 * 1000;

      const habit = createTestHabit({
        name: 'Complex Habit',
        category: 'learning',
        frequency: '3-per-week',
        color: '#8B5CF6',
        icon: 'book',
        description: 'A detailed description',
        habitStartTime: '09:00',
        habitEndTime: '10:00',
        completedDates: [today, yesterday, twoDaysAgo],
        completionNotes: {
          [today]: 'Good session',
          [yesterday]: 'mood:3|Felt great',
        },
      });
      habits = [habit];

      const originalState = JSON.parse(JSON.stringify(habit));

      // Archive
      habits = simulateArchiveHabit(habits, habit.id);

      // Restore
      habits = simulateRestoreHabit(habits, habit.id);

      // Verify all fields preserved
      const restored = habits[0];
      expect(restored.name).toBe(originalState.name);
      expect(restored.category).toBe(originalState.category);
      expect(restored.frequency).toBe(originalState.frequency);
      expect(restored.color).toBe(originalState.color);
      expect(restored.icon).toBe(originalState.icon);
      expect(restored.description).toBe(originalState.description);
      expect(restored.habitStartTime).toBe(originalState.habitStartTime);
      expect(restored.habitEndTime).toBe(originalState.habitEndTime);
      expect(restored.completedDates).toEqual(originalState.completedDates);
      expect(restored.completionNotes).toEqual(originalState.completionNotes);
      expect(restored.archivedAt).toBeUndefined();
    });
  });

  describe('Archive Statistics', () => {
    it('should correctly count archived vs active habits', () => {
      // Create 4 habits
      for (let i = 1; i <= 4; i++) {
        habits.push(createTestHabit({ name: `Habit ${i}` }));
      }

      // Archive 2
      habits = simulateArchiveHabit(habits, habits[0].id);
      habits = simulateArchiveHabit(habits, habits[1].id);

      const activeCount = habits.filter((h) => !h.archivedAt).length;
      const archivedCount = habits.filter((h) => h.archivedAt).length;

      expect(activeCount).toBe(2);
      expect(archivedCount).toBe(2);
      expect(habits).toHaveLength(4);
    });

    it('should handle edge case: archive the only active habit', () => {
      habits = [createTestHabit({ name: 'Last Habit' })];

      habits = simulateArchiveHabit(habits, habits[0].id);

      const activeCount = habits.filter((h) => !h.archivedAt).length;
      expect(activeCount).toBe(0);

      // Restore
      habits = simulateRestoreHabit(habits, habits[0].id);
      expect(habits.filter((h) => !h.archivedAt)).toHaveLength(1);
    });
  });
});
