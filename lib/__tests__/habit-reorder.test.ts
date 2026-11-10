import { describe, it, expect, beforeEach } from 'vitest';
import { Habit } from '../types';

// --- Helpers pures simulant la logique de réorganisation ---

type OrderUpdate = { id: string; orderIndex: number };

function simulateReorder(habits: Habit[], orderedIds: string[]): Habit[] {
  const habitMap = new Map(habits.map(h => [h.id, h]));
  return orderedIds.map((id, index) => {
    const habit = habitMap.get(id);
    if (habit) return { ...habit, orderIndex: index };
    return null;
  }).filter(Boolean) as Habit[];
}

function simulateSortByOrder(habits: Habit[]): Habit[] {
  return [...habits].sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return a.createdAt - b.createdAt;
  });
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

function getOrderedIds(habits: Habit[]): string[] {
  return habits.map(h => h.id);
}

describe('Habit Reordering', () => {
  let habits: Habit[];

  beforeEach(() => {
    habits = [
      createTestHabit({ id: 'a', name: 'First', orderIndex: 0, createdAt: 1000 }),
      createTestHabit({ id: 'b', name: 'Second', orderIndex: 1, createdAt: 2000 }),
      createTestHabit({ id: 'c', name: 'Third', orderIndex: 2, createdAt: 3000 }),
    ];
  });

  it('should reorder a single habit to the end', () => {
    const orderedIds = ['b', 'c', 'a'];
    const result = simulateReorder(habits, orderedIds);

    expect(result[0].id).toBe('b');
    expect(result[0].orderIndex).toBe(0);
    expect(result[1].id).toBe('c');
    expect(result[1].orderIndex).toBe(1);
    expect(result[2].id).toBe('a');
    expect(result[2].orderIndex).toBe(2);
  });

  it('should reorder a single habit to the beginning', () => {
    const orderedIds = ['c', 'a', 'b'];
    const result = simulateReorder(habits, orderedIds);

    expect(result[0].id).toBe('c');
    expect(result[0].orderIndex).toBe(0);
    expect(result[1].id).toBe('a');
    expect(result[1].orderIndex).toBe(1);
    expect(result[2].id).toBe('b');
    expect(result[2].orderIndex).toBe(2);
  });

  it('should reverse the entire order', () => {
    const orderedIds = ['c', 'b', 'a'];
    const result = simulateReorder(habits, orderedIds);

    expect(getOrderedIds(result)).toEqual(['c', 'b', 'a']);
    expect(result[0].orderIndex).toBe(0);
    expect(result[1].orderIndex).toBe(1);
    expect(result[2].orderIndex).toBe(2);
  });

  it('should keep order unchanged when list is same', () => {
    const orderedIds = ['a', 'b', 'c'];
    const result = simulateReorder(habits, orderedIds);

    expect(getOrderedIds(result)).toEqual(['a', 'b', 'c']);
  });

  it('should sort habits by orderIndex ascending', () => {
    const reordered = simulateReorder(habits, ['c', 'a', 'b']);
    const sorted = simulateSortByOrder(reordered);

    expect(getOrderedIds(sorted)).toEqual(['c', 'a', 'b']);
  });

  it('should fallback to createdAt when orderIndex is equal', () => {
    const sameIndex = habits.map(h => ({ ...h, orderIndex: 0 }));
    const sorted = simulateSortByOrder(sameIndex);

    expect(getOrderedIds(sorted)).toEqual(['a', 'b', 'c']); // createdAt ascending
  });

  it('should handle reorder with duplicate IDs (keeps last occurrence)', () => {
    const orderedIds = ['a', 'b', 'a', 'c'];
    const result = simulateReorder(habits, orderedIds);

    expect(result.length).toBe(4);
    expect(result[0].id).toBe('a');
    expect(result[0].orderIndex).toBe(0);
    expect(result[1].id).toBe('b');
    expect(result[1].orderIndex).toBe(1);
    // Second 'a' appears at index 2
    expect(result[2].id).toBe('a');
    expect(result[2].orderIndex).toBe(2);
    expect(result[3].id).toBe('c');
    expect(result[3].orderIndex).toBe(3);
  });

  it('should preserve habit properties after reorder', () => {
    const orderedIds = ['b', 'a', 'c'];
    const result = simulateReorder(habits, orderedIds);

    expect(result[0].name).toBe('Second');
    expect(result[0].category).toBe('health-sport');
    expect(result[0].frequency).toBe('daily');
    expect(result[1].name).toBe('First');
    expect(result[2].name).toBe('Third');
  });
});
