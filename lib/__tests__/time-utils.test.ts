import { describe, it, expect } from 'vitest';
import {
  getTimeOfDay,
  isHabitOverdue,
  getTimeOfDayIcon,
  getTimeOfDayOrder,
  TimeOfDay,
} from '../time-utils';

describe('getTimeOfDay', () => {
  it('returns morning for 5:00-11:59', () => {
    expect(getTimeOfDay('05:00')).toBe('morning');
    expect(getTimeOfDay('08:30')).toBe('morning');
    expect(getTimeOfDay('11:59')).toBe('morning');
  });

  it('returns afternoon for 12:00-17:59', () => {
    expect(getTimeOfDay('12:00')).toBe('afternoon');
    expect(getTimeOfDay('14:30')).toBe('afternoon');
    expect(getTimeOfDay('17:59')).toBe('afternoon');
  });

  it('returns evening for 18:00-21:59', () => {
    expect(getTimeOfDay('18:00')).toBe('evening');
    expect(getTimeOfDay('20:00')).toBe('evening');
    expect(getTimeOfDay('21:59')).toBe('evening');
  });

  it('returns night for 22:00-04:59', () => {
    expect(getTimeOfDay('22:00')).toBe('night');
    expect(getTimeOfDay('23:59')).toBe('night');
    expect(getTimeOfDay('00:00')).toBe('night');
    expect(getTimeOfDay('04:59')).toBe('night');
  });

  it('returns unscheduled for undefined or invalid', () => {
    expect(getTimeOfDay(undefined)).toBe('unscheduled');
    expect(getTimeOfDay('')).toBe('unscheduled');
    expect(getTimeOfDay('invalid')).toBe('unscheduled');
  });
});

describe('isHabitOverdue', () => {
  it('returns false if habitEndTime is undefined', () => {
    expect(isHabitOverdue(undefined, false)).toBe(false);
  });

  it('returns false if habit is completed today', () => {
    expect(isHabitOverdue('10:00', true)).toBe(false);
  });

  it('returns false if current time is before end time', () => {
    const futureTime = '23:59';
    expect(isHabitOverdue(futureTime, false)).toBe(false);
  });

  it('returns true if current time is after end time and not completed', () => {
    const pastTime = '00:01';
    expect(isHabitOverdue(pastTime, false)).toBe(true);
  });
});

describe('getTimeOfDayIcon', () => {
  it('returns correct icon for each time of day', () => {
    expect(getTimeOfDayIcon('morning')).toBe('wb-sunny');
    expect(getTimeOfDayIcon('afternoon')).toBe('light-mode');
    expect(getTimeOfDayIcon('evening')).toBe('wb-twilight');
    expect(getTimeOfDayIcon('night')).toBe('bedtime');
    expect(getTimeOfDayIcon('unscheduled')).toBe('schedule');
  });
});

describe('getTimeOfDayOrder', () => {
  it('returns correct order for each time of day', () => {
    expect(getTimeOfDayOrder('morning')).toBe(0);
    expect(getTimeOfDayOrder('afternoon')).toBe(1);
    expect(getTimeOfDayOrder('evening')).toBe(2);
    expect(getTimeOfDayOrder('night')).toBe(3);
    expect(getTimeOfDayOrder('unscheduled')).toBe(4);
  });
});
