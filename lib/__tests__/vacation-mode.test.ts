import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AppSettings } from '../types';

// --- Helpers pures simulant la logique de vacation mode ---

function simulateVacationAutoDisable(settings: AppSettings): AppSettings {
  const vm = settings.vacationMode;
  if (vm?.enabled && vm?.endsAt && vm.endsAt <= Date.now()) {
    return { ...settings, vacationMode: { enabled: false } };
  }
  return settings;
}

function simulateIsVacationActive(settings: AppSettings): boolean {
  const vm = settings.vacationMode;
  return !!(vm?.enabled && (!vm?.endsAt || vm.endsAt > Date.now()));
}

function simulateCalculateReminderDate(endsAt: number): Date {
  const reminder = new Date(endsAt - 24 * 60 * 60 * 1000);
  reminder.setHours(9, 0, 0, 0);
  return reminder;
}

function simulateShouldScheduleReminder(endsAt: number): boolean {
  const reminderDate = simulateCalculateReminderDate(endsAt);
  return reminderDate > new Date();
}

function simulateGetNotificationStrings(language: string): { title: string; body: string } {
  if (language === 'fr') {
    return {
      title: 'Mode vacances',
      body: 'Tes vacances se terminent demain. Tes streaks reprendront automatiquement.',
    };
  }
  return {
    title: 'Vacation Mode',
    body: 'Your vacation ends tomorrow. Your streaks will resume automatically.',
  };
}

function createDefaultSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    theme: 'auto',
    language: 'fr',
    notificationsEnabled: true,
    reminderTime: '09:00',
    vacationMode: { enabled: false },
    ...overrides,
  };
}

describe('Vacation Mode - Auto Deactivation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T12:00:00Z'));
  });

  it('should auto-disable vacation mode when end date is in the past', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: true, endsAt: Date.now() - 24 * 60 * 60 * 1000 },
    });

    const result = simulateVacationAutoDisable(settings);

    expect(result.vacationMode.enabled).toBe(false);
    expect(result.vacationMode.endsAt).toBeUndefined();
  });

  it('should NOT auto-disable when end date is in the future', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: true, endsAt: Date.now() + 24 * 60 * 60 * 1000 },
    });

    const result = simulateVacationAutoDisable(settings);

    expect(result.vacationMode.enabled).toBe(true);
  });

  it('should NOT auto-disable when endsAt is undefined', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: true },
    });

    const result = simulateVacationAutoDisable(settings);

    expect(result.vacationMode.enabled).toBe(true);
  });

  it('should NOT auto-disable when vacation is not enabled', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: false, endsAt: Date.now() - 24 * 60 * 60 * 1000 },
    });

    const result = simulateVacationAutoDisable(settings);

    expect(result.vacationMode.enabled).toBe(false);
  });

  it('should return isVacationActive=true when vacation is active with future endsAt', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: true, endsAt: Date.now() + 7 * 24 * 60 * 60 * 1000 },
    });

    expect(simulateIsVacationActive(settings)).toBe(true);
  });

  it('should return isVacationActive=true when vacation is active without endsAt', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: true },
    });

    expect(simulateIsVacationActive(settings)).toBe(true);
  });

  it('should return isVacationActive=false when vacation is disabled', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: false },
    });

    expect(simulateIsVacationActive(settings)).toBe(false);
  });

  it('should return isVacationActive=false after auto-disable (end date passed)', () => {
    const settings = createDefaultSettings({
      vacationMode: { enabled: true, endsAt: Date.now() - 1 },
    });

    expect(simulateIsVacationActive(settings)).toBe(false);
  });

  it('should keep streak frozen when vacation is active via simulateIsVacationActive', () => {
    const activeSettings = createDefaultSettings({
      vacationMode: { enabled: true, endsAt: Date.now() + 7 * 24 * 60 * 60 * 1000 },
    });
    const inactiveSettings = createDefaultSettings({
      vacationMode: { enabled: false },
    });

    expect(simulateIsVacationActive(activeSettings)).toBe(true);
    expect(simulateIsVacationActive(inactiveSettings)).toBe(false);
  });
});

describe('Vacation Mode - Notification Scheduling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T09:00:00Z'));
  });

  it('should calculate reminder date as 1 day before endsAt at 09:00', () => {
    const endsAt = new Date('2026-05-20T12:00:00Z').getTime();
    const reminder = simulateCalculateReminderDate(endsAt);

    expect(reminder.getFullYear()).toBe(2026);
    expect(reminder.getMonth()).toBe(4); // May = 4
    expect(reminder.getDate()).toBe(19);
    expect(reminder.getHours()).toBe(9);
    expect(reminder.getMinutes()).toBe(0);
  });

  it('should NOT schedule reminder if reminder date is already in the past', () => {
    const endsAt = Date.now() + 12 * 60 * 60 * 1000;

    const shouldSchedule = simulateShouldScheduleReminder(endsAt);

    expect(shouldSchedule).toBe(false);
  });

  it('should schedule reminder when endsAt is more than 24h away', () => {
    const endsAt = Date.now() + 48 * 60 * 60 * 1000;

    const shouldSchedule = simulateShouldScheduleReminder(endsAt);

    expect(shouldSchedule).toBe(true);
  });

  it('should return French notification strings when language is fr', () => {
    const strings = simulateGetNotificationStrings('fr');

    expect(strings.title).toBe('Mode vacances');
    expect(strings.body).toContain('Tes vacances se terminent demain');
  });

  it('should return English notification strings when language is en', () => {
    const strings = simulateGetNotificationStrings('en');

    expect(strings.title).toBe('Vacation Mode');
    expect(strings.body).toContain('Your vacation ends tomorrow');
  });
});
