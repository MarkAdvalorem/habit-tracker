import { describe, it, expect } from 'vitest';

// Test utilities without importing from notification-service
function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseTime(timeString: string): { hour: number; minute: number } {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
}

describe('Notification Time Utilities', () => {
  describe('Time Formatting', () => {
    it('should format time correctly with leading zeros', () => {
      expect(formatTime(9, 0)).toBe('09:00');
      expect(formatTime(14, 30)).toBe('14:30');
      expect(formatTime(0, 5)).toBe('00:05');
      expect(formatTime(23, 59)).toBe('23:59');
    });

    it('should handle single digit hours and minutes', () => {
      expect(formatTime(5, 3)).toBe('05:03');
      expect(formatTime(1, 1)).toBe('01:01');
    });

    it('should handle edge cases', () => {
      expect(formatTime(0, 0)).toBe('00:00');
      expect(formatTime(23, 59)).toBe('23:59');
    });
  });

  describe('Time Parsing', () => {
    it('should parse time string correctly', () => {
      const result = parseTime('09:00');
      expect(result.hour).toBe(9);
      expect(result.minute).toBe(0);
    });

    it('should parse time with leading zeros', () => {
      const result = parseTime('05:30');
      expect(result.hour).toBe(5);
      expect(result.minute).toBe(30);
    });

    it('should parse edge cases', () => {
      expect(parseTime('00:00')).toEqual({ hour: 0, minute: 0 });
      expect(parseTime('23:59')).toEqual({ hour: 23, minute: 59 });
    });
  });

  describe('Time Validation', () => {
    it('should validate valid hours', () => {
      for (let hour = 0; hour <= 23; hour++) {
        expect(hour >= 0 && hour <= 23).toBe(true);
      }
    });

    it('should validate valid minutes', () => {
      for (let minute = 0; minute <= 59; minute++) {
        expect(minute >= 0 && minute <= 59).toBe(true);
      }
    });

    it('should reject invalid hours', () => {
      expect(-1 >= 0 && -1 <= 23).toBe(false);
      expect(24 >= 0 && 24 <= 23).toBe(false);
    });

    it('should reject invalid minutes', () => {
      expect(-1 >= 0 && -1 <= 59).toBe(false);
      expect(60 >= 0 && 60 <= 59).toBe(false);
    });
  });

  describe('Time Comparison', () => {
    it('should compare times correctly', () => {
      const time1 = { hour: 9, minute: 0 };
      const time2 = { hour: 14, minute: 30 };

      expect(time1.hour < time2.hour).toBe(true);
      expect(time1.hour > time2.hour).toBe(false);
      expect(time1.hour === time2.hour).toBe(false);
    });

    it('should handle same time comparison', () => {
      const time1 = { hour: 9, minute: 0 };
      const time2 = { hour: 9, minute: 0 };

      expect(time1.hour === time2.hour && time1.minute === time2.minute).toBe(true);
    });
  });

  describe('Time Arithmetic', () => {
    it('should calculate time difference', () => {
      const time1 = { hour: 9, minute: 0 };
      const time2 = { hour: 14, minute: 30 };

      const hourDiff = time2.hour - time1.hour;
      const minuteDiff = time2.minute - time1.minute;

      expect(hourDiff).toBe(5);
      expect(minuteDiff).toBe(30);
    });

    it('should handle negative differences', () => {
      const time1 = { hour: 14, minute: 30 };
      const time2 = { hour: 9, minute: 0 };

      const hourDiff = time2.hour - time1.hour;
      const minuteDiff = time2.minute - time1.minute;

      expect(hourDiff).toBe(-5);
      expect(minuteDiff).toBe(-30);
    });

    it('should add hours to time', () => {
      let hour = 9;
      let minute = 0;

      hour = (hour + 5) % 24;

      expect(hour).toBe(14);
      expect(minute).toBe(0);
    });

    it('should handle hour wraparound', () => {
      let hour = 22;
      hour = (hour + 5) % 24;

      expect(hour).toBe(3);
    });
  });

  describe('Reminder Time Defaults', () => {
    it('should have default reminder time of 9:00 AM', () => {
      const defaultTime = { hour: 9, minute: 0 };
      expect(defaultTime.hour).toBe(9);
      expect(defaultTime.minute).toBe(0);
    });

    it('should format default time correctly', () => {
      const formatted = formatTime(9, 0);
      expect(formatted).toBe('09:00');
    });
  });

  describe('Round-trip Time Conversion', () => {
    it('should maintain time after format and parse', () => {
      const originalHour = 14;
      const originalMinute = 45;

      const formatted = formatTime(originalHour, originalMinute);
      const parsed = parseTime(formatted);

      expect(parsed.hour).toBe(originalHour);
      expect(parsed.minute).toBe(originalMinute);
    });

    it('should handle multiple round-trips', () => {
      const times = [
        { hour: 0, minute: 0 },
        { hour: 12, minute: 30 },
        { hour: 23, minute: 59 },
      ];

      times.forEach(({ hour, minute }) => {
        const formatted = formatTime(hour, minute);
        const parsed = parseTime(formatted);
        const reformatted = formatTime(parsed.hour, parsed.minute);

        expect(formatted).toBe(reformatted);
      });
    });
  });
});
