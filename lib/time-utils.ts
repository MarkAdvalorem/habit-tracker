/**
 * Utilitaires pour la gestion du temps
 */

/**
 * Valide si une chaîne est au format HH:mm
 * @param time - La chaîne à valider (ex: "09:30")
 * @returns true si le format est valide, false sinon
 */
export function isValidTimeFormat(time: string): boolean {
  if (!time) return false;
  
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Parse une chaîne HH:mm en heures et minutes
 * @param time - La chaîne au format HH:mm
 * @returns Un objet avec hours et minutes, ou null si format invalide
 */
export function parseTime(time: string): { hours: number; minutes: number } | null {
  if (!isValidTimeFormat(time)) return null;
  
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Calcule l'heure 15 minutes avant une heure donnée
 * @param time - La chaîne au format HH:mm
 * @returns La chaîne au format HH:mm, 15 minutes avant
 */
export function getTimeMinusFifteen(time: string): string {
  const parsed = parseTime(time);
  if (!parsed) return time;
  
  let { hours, minutes } = parsed;
  minutes -= 15;
  
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
    if (hours < 0) {
      hours = 23;
    }
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convertit HH:mm en minutes depuis minuit
 * @param time - La chaîne au format HH:mm
 * @returns Nombre de minutes depuis minuit
 */
export function timeToMinutes(time: string): number {
  const parsed = parseTime(time);
  if (!parsed) return 0;
  return parsed.hours * 60 + parsed.minutes;
}

/**
 * Convertit des minutes depuis minuit en HH:mm
 * @param minutes - Nombre de minutes depuis minuit
 * @returns La chaîne au format HH:mm
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'unscheduled';

export function getTimeOfDay(time: string | undefined): TimeOfDay {
  if (!time) return 'unscheduled';
  const parsed = parseTime(time);
  if (!parsed) return 'unscheduled';

  const { hours } = parsed;
  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 18) return 'afternoon';
  if (hours >= 18 && hours < 22) return 'evening';
  return 'night';
}

export function isHabitOverdue(habitEndTime: string | undefined, isCompletedToday: boolean): boolean {
  if (!habitEndTime || isCompletedToday) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = timeToMinutes(habitEndTime);
  return currentMinutes > endMinutes;
}

export function getTimeOfDayLabel(timeOfDay: TimeOfDay, t: (key: string) => string): string {
  const key = `timeOfDay.${timeOfDay}`;
  return t(key);
}

export function getTimeOfDayIcon(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning': return 'wb-sunny';
    case 'afternoon': return 'light-mode';
    case 'evening': return 'wb-twilight';
    case 'night': return 'bedtime';
    case 'unscheduled': return 'schedule';
  }
}

export function getTimeOfDayOrder(timeOfDay: TimeOfDay): number {
  switch (timeOfDay) {
    case 'morning': return 0;
    case 'afternoon': return 1;
    case 'evening': return 2;
    case 'night': return 3;
    case 'unscheduled': return 4;
  }
}
