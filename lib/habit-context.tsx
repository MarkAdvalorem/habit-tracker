import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitStats, AppSettings } from './types';
import {
  scheduleHabitNotification,
  scheduleHabitEndNotification,
  cancelHabitNotification,
  cancelAllNotifications,
  scheduleAllHabitNotifications,
  scheduleVacationEndReminder,
  cancelVacationEndReminder,
} from './notification-scheduler';
import { calculateStreaks } from './streak-utils';
import { isValidTimeFormat } from './time-utils';

interface HabitContextType {
  habits: Habit[];
  archivedHabits: Habit[];
  settings: AppSettings;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'orderIndex'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date?: number) => Promise<void>;
  updateCompletionNote: (habitId: string, date: number, note: string) => Promise<void>;
  getHabitStats: (habitId: string) => HabitStats;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  refreshHabits: () => Promise<void>;
  resetAllData: () => Promise<void>;
  isLoading: boolean;
  isReordering: boolean;
  setIsReordering: (value: boolean) => void;
  reorderHabits: (orderedIds: string[]) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HABITS_STORAGE_KEY = 'habits';
export const SETTINGS_STORAGE_KEY = 'settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  language: 'fr',
  notificationsEnabled: true,
  reminderTime: '09:00',
  vacationMode: { enabled: false },
};

const hasInvalidTimes = (h: Partial<Habit>) =>
  (h.habitStartTime != null && !isValidTimeFormat(h.habitStartTime)) ||
  (h.habitEndTime != null && !isValidTimeFormat(h.habitEndTime));

export function HabitProvider({ children }: { children: React.ReactNode }) {
  // All habits, active and archived; the single source of truth persisted to AsyncStorage.
  const [allHabits, setAllHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const loadedRef = useRef(false);

  const loadFromStorage = useCallback(async () => {
    try {
      const [habitsData, settingsData, appLanguage] = await Promise.all([
        AsyncStorage.getItem(HABITS_STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_STORAGE_KEY),
        AsyncStorage.getItem('app_language'),
      ]);
      const stored: Habit[] = habitsData ? JSON.parse(habitsData) : [];
      setAllHabits(stored);
      if (settingsData) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
      } else if (appLanguage && ['fr', 'en', 'it', 'de', 'ru', 'es'].includes(appLanguage)) {
        setSettings(prev => ({ ...prev, language: appLanguage as AppSettings['language'] }));
      }
      return stored;
    } catch (error) {
      console.error('[Storage] Error loading data:', error);
      return [];
    } finally {
      loadedRef.current = true;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromStorage().then(stored => scheduleAllHabitNotifications(stored.filter(h => !h.archivedAt)));
  }, [loadFromStorage]);

  // Persist every change once the initial load is done (so we never overwrite storage with []).
  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(allHabits)).catch(err =>
      console.error('[Storage] Error saving habits:', err)
    );
  }, [allHabits]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings)).catch(err =>
        console.error('[Settings] Error saving settings:', err)
      );
      return updatedSettings;
    });
  }, []);

  // Auto-désactivation du mode vacances + notification J-1
  useEffect(() => {
    const vm = settings.vacationMode;
    if (vm?.enabled && vm?.endsAt) {
      if (vm.endsAt <= Date.now()) {
        updateSettings({ vacationMode: { enabled: false } });
      } else {
        scheduleVacationEndReminder(vm.endsAt, settings.language);
      }
    } else {
      cancelVacationEndReminder();
    }
  }, [settings.vacationMode?.enabled, settings.vacationMode?.endsAt, settings.language, updateSettings]);

  const refreshHabits = async () => {
    await loadFromStorage();
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'orderIndex'>) => {
    if (hasInvalidTimes(habitData)) {
      console.error('[addHabit] Invalid time format:', habitData.habitStartTime, habitData.habitEndTime);
      return;
    }
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      completedDates: [],
      orderIndex: allHabits.filter(h => !h.archivedAt).length,
    };
    setAllHabits(prev => [...prev, newHabit]);
    await scheduleHabitNotification(newHabit);
    await scheduleHabitEndNotification(newHabit);
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (hasInvalidTimes(updates)) {
      console.error('[updateHabit] Invalid time format:', updates.habitStartTime, updates.habitEndTime);
      return;
    }
    const current = allHabits.find(h => h.id === id);
    if (!current) return;
    const updatedHabit = { ...current, ...updates };
    setAllHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
    if (!updatedHabit.archivedAt) {
      await scheduleHabitNotification(updatedHabit);
      await scheduleHabitEndNotification(updatedHabit);
    }
  };

  const deleteHabit = async (id: string) => {
    setAllHabits(prev => prev.filter(h => h.id !== id));
    await cancelHabitNotification(id);
  };

  const archiveHabit = async (id: string) => {
    const archivedAt = Date.now();
    setAllHabits(prev => prev.map(h => (h.id === id ? { ...h, archivedAt } : h)));
    await cancelHabitNotification(id);
  };

  const restoreHabit = async (id: string) => {
    const habit = allHabits.find(h => h.id === id);
    if (!habit) return;
    const restored = { ...habit, archivedAt: undefined, orderIndex: allHabits.filter(h => !h.archivedAt).length };
    setAllHabits(prev => prev.map(h => (h.id === id ? restored : h)));
    await scheduleHabitNotification(restored);
    await scheduleHabitEndNotification(restored);
  };

  const toggleHabitCompletion = async (habitId: string, date?: number) => {
    const targetDate = date || new Date().setHours(0, 0, 0, 0);
    setAllHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const isAlreadyCompleted = h.completedDates.includes(targetDate);
      const completedDates = isAlreadyCompleted
        ? h.completedDates.filter(d => d !== targetDate)
        : [...h.completedDates, targetDate];

      // Supprimer la note si on démarque
      let completionNotes = h.completionNotes;
      if (isAlreadyCompleted && completionNotes) {
        completionNotes = { ...completionNotes };
        delete completionNotes[String(targetDate)];
        if (Object.keys(completionNotes).length === 0) completionNotes = undefined;
      }
      return { ...h, completedDates, completionNotes };
    }));
  };

  const updateCompletionNote = async (habitId: string, date: number, note: string) => {
    setAllHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const completionNotes = { ...(h.completionNotes || {}) };
      if (note.trim()) {
        completionNotes[String(date)] = note.trim();
      } else {
        delete completionNotes[String(date)];
      }
      return { ...h, completionNotes: Object.keys(completionNotes).length > 0 ? completionNotes : undefined };
    }));
  };

  const resetAllData = async () => {
    await cancelAllNotifications();
    await AsyncStorage.multiRemove([HABITS_STORAGE_KEY, SETTINGS_STORAGE_KEY]);
    setAllHabits([]);
    setSettings(prev => ({ ...DEFAULT_SETTINGS, language: prev.language }));
  };

  const getHabitStats = useCallback((habitId: string): HabitStats => {
    const habit = allHabits.find((h) => h.id === habitId);
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

    const completedThisMonth = habit.completedDates.filter((date) => {
      const d = new Date(date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const sortedDates = [...habit.completedDates].sort((a, b) => a - b);

    const vacationEnabled = settings.vacationMode?.enabled;
    const vacationEndsAt = settings.vacationMode?.endsAt;
    const isVacationActive = vacationEnabled && (!vacationEndsAt || vacationEndsAt > Date.now());

    const { currentStreak, bestStreak } = calculateStreaks(sortedDates, isVacationActive);

    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const completionPercentage = Math.round((completedThisMonth / daysInMonth) * 100);

    return {
      totalCompleted: habit.completedDates.length,
      currentStreak,
      bestStreak,
      completionPercentage,
      completedThisMonth,
    };
  }, [allHabits, settings.vacationMode?.enabled, settings.vacationMode?.endsAt]);

  const reorderHabits = async (orderedIds: string[]) => {
    const order = new Map(orderedIds.map((id, index) => [id, index]));
    setAllHabits(prev => prev.map(h => (order.has(h.id) ? { ...h, orderIndex: order.get(h.id)! } : h)));
  };

  const sortedHabits = useMemo(() => {
    return allHabits
      .filter(h => !h.archivedAt)
      .sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
        return a.createdAt - b.createdAt;
      });
  }, [allHabits]);

  const archivedHabits = useMemo(
    () => allHabits.filter(h => h.archivedAt).sort((a, b) => b.archivedAt! - a.archivedAt!),
    [allHabits]
  );

  const value = {
    habits: sortedHabits,
    archivedHabits,
    settings,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    toggleHabitCompletion,
    updateCompletionNote,
    getHabitStats,
    updateSettings,
    refreshHabits,
    resetAllData,
    isLoading,
    isReordering,
    setIsReordering,
    reorderHabits,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
