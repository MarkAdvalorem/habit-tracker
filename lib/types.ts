/**
 * Types pour l'application Habit Tracker
 */

export type HabitCategory =
  | 'health-sport'
  | 'learning'
  | 'work'
  | 'wellbeing'
  | 'social-leisure'
  | 'organization'
  | 'finances'
  | 'other';

export type HabitFrequency = 'daily' | '2-per-week' | '3-per-week' | '4-per-week' | '5-per-week' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  color: string;
  icon: string;
  description?: string;
  createdAt: number;
  completedDates: number[]; // Array of timestamps of completed dates
  completionNotes?: Record<string, string>; // Map of date timestamp -> note
  archivedAt?: number; // Timestamp when habit was archived, undefined if active
  orderIndex: number; // Position for drag & drop reordering
  habitStartTime?: string; // HH:mm format - when the habit should be done
  habitEndTime?: string; // HH:mm format - end time of the habit window
}

export interface HabitStats {
  totalCompleted: number;
  currentStreak: number;
  bestStreak: number;
  completionPercentage: number;
  completedThisMonth: number;
}

export type Language = 'fr' | 'en' | 'it' | 'de' | 'ru' | 'es';

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: Language;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:mm format
  vacationMode: { enabled: boolean; endsAt?: number };
}

export const HABIT_CATEGORIES: Record<HabitCategory, { translationKey: string; color: string }> = {
  'health-sport': { translationKey: 'categories.health-sport', color: '#10B981' },
  learning: { translationKey: 'categories.learning', color: '#8B5CF6' },
  work: { translationKey: 'categories.work', color: '#3B82F6' },
  wellbeing: { translationKey: 'categories.wellbeing', color: '#EC4899' },
  'social-leisure': { translationKey: 'categories.social-leisure', color: '#F59E0B' },
  organization: { translationKey: 'categories.organization', color: '#06B6D4' },
  finances: { translationKey: 'categories.finances', color: '#22C55E' },
  other: { translationKey: 'categories.other', color: '#6B7280' },
};

export const HABIT_FREQUENCIES: Record<HabitFrequency, string> = {
  daily: 'frequencies.daily',
  '2-per-week': 'frequencies.2_per_week',
  '3-per-week': 'frequencies.3_per_week',
  '4-per-week': 'frequencies.4_per_week',
  '5-per-week': 'frequencies.5_per_week',
  weekly: 'frequencies.weekly',
  monthly: 'frequencies.monthly',
};

export const HABIT_ICONS = [
  'favorite',
  'book',
  'fitness-center',
  'self-improvement',
  'local-cafe',
  'directions-run',
  'local-drink',
  'nightlight',
  'wb-sunny',
  'psychology',
  'music-note',
  'brush',
  'work',
  'group',
  'emoji-events',
  'star',
  'flag',
  'check-circle',
  'attach-money',
  'timer',
  'restaurant',
  'bedtime',
  'pets',
  'code',
];

export const CATEGORY_DEFAULT_ICONS: Record<HabitCategory, string> = {
  'health-sport': 'fitness-center',
  learning: 'book',
  work: 'work',
  wellbeing: 'self-improvement',
  'social-leisure': 'group',
  organization: 'check-circle',
  finances: 'attach-money',
  other: 'star',
};

export interface HabitTemplate {
  nameKey: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  icon: string;
  descriptionKey: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  { nameKey: 'templates.read30min', category: 'learning', frequency: 'daily', icon: 'book', descriptionKey: 'templates.read30minDesc' },
  { nameKey: 'templates.meditate', category: 'wellbeing', frequency: 'daily', icon: 'self-improvement', descriptionKey: 'templates.meditateDesc' },
  { nameKey: 'templates.sport', category: 'health-sport', frequency: '3-per-week', icon: 'fitness-center', descriptionKey: 'templates.sportDesc' },
  { nameKey: 'templates.drinkWater', category: 'health-sport', frequency: 'daily', icon: 'local-drink', descriptionKey: 'templates.drinkWaterDesc' },
  { nameKey: 'templates.journal', category: 'wellbeing', frequency: 'daily', icon: 'brush', descriptionKey: 'templates.journalDesc' },
  { nameKey: 'templates.code', category: 'work', frequency: 'daily', icon: 'code', descriptionKey: 'templates.codeDesc' },
  { nameKey: 'templates.walk', category: 'health-sport', frequency: 'daily', icon: 'directions-run', descriptionKey: 'templates.walkDesc' },
  { nameKey: 'templates.sleep', category: 'wellbeing', frequency: 'daily', icon: 'bedtime', descriptionKey: 'templates.sleepDesc' },
  { nameKey: 'templates.music', category: 'social-leisure', frequency: '3-per-week', icon: 'music-note', descriptionKey: 'templates.musicDesc' },
  { nameKey: 'templates.budget', category: 'finances', frequency: 'weekly', icon: 'attach-money', descriptionKey: 'templates.budgetDesc' },
];
