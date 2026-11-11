import * as Notifications from 'expo-notifications';
import { Habit } from './types';
import { parseTime, getTimeMinusFifteen } from './time-utils';

/**
 * Service de programmation des notifications pour les habitudes
 * Programme des notifications quotidiennes 15 minutes avant le début de chaque habitude
 */

// Configurer le gestionnaire de notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

/**
 * Demande les permissions de notification
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Vérifie si les permissions de notification sont accordées
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Calcule l'heure de notification (15 minutes avant le début)
 */
export function calculateNotificationTime(habitStartTime: string): { hours: number; minutes: number } | null {
  const reminderTime = getTimeMinusFifteen(habitStartTime);
  const parsed = parseTime(reminderTime);
  return parsed;
}

export function calculateEndNotificationTime(habitEndTime: string): { hours: number; minutes: number } | null {
  const reminderTime = getTimeMinusFifteen(habitEndTime);
  const parsed = parseTime(reminderTime);
  return parsed;
}

/**
 * Programme une notification quotidienne pour une habitude
 */
export async function scheduleHabitNotification(habit: Habit): Promise<string | null> {
  try {
    if (!habit.habitStartTime) return null;

    // Vérifier les permissions
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    // Calculer l'heure de notification (15 minutes avant)
    const notificationTime = calculateNotificationTime(habit.habitStartTime);
    if (!notificationTime) {
      console.warn('Invalid habit start time:', habit.habitStartTime);
      return null;
    }

    // Annuler les notifications précédentes pour cette habitude
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existingNotification = scheduled.find(n => n.identifier === `habit-${habit.id}`);
    if (existingNotification) {
      await (Notifications as any).cancelNotificationAsync(existingNotification.identifier);
    }

    // Programmer la notification quotidienne
    // Calculer les secondes depuis minuit pour le trigger
    const secondsFromMidnight = notificationTime.hours * 3600 + notificationTime.minutes * 60;
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📌 Rappel d\'habitude',
        body: `N'oublie pas : ${habit.name} dans 15 minutes!`,
        data: {
          habitId: habit.id,
          habitName: habit.name,
        },
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: 'daily',
        hour: notificationTime.hours,
        minute: notificationTime.minutes,
      } as any, // Type assertion pour contourner les limitations TypeScript
    });

    console.log(`Scheduled notification for habit ${habit.id} at ${notificationTime.hours}:${String(notificationTime.minutes).padStart(2, '0')}`);
    return notificationId;
  } catch (error) {
    console.error(`Error scheduling notification for habit ${habit.id}:`, error);
    return null;
  }
}

export async function scheduleHabitEndNotification(habit: Habit): Promise<string | null> {
  try {
    if (!habit.habitEndTime) return null;

    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    const notificationTime = calculateEndNotificationTime(habit.habitEndTime);
    if (!notificationTime) {
      console.warn('Invalid habit end time:', habit.habitEndTime);
      return null;
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existingNotification = scheduled.find(n => n.identifier === `habit-end-${habit.id}`);
    if (existingNotification) {
      await (Notifications as any).cancelNotificationAsync(existingNotification.identifier);
    }

    const secondsFromMidnight = notificationTime.hours * 3600 + notificationTime.minutes * 60;
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Fin de fenêtre',
        body: `Il ne reste que 15 minutes pour ${habit.name} !`,
        data: {
          habitId: habit.id,
          habitName: habit.name,
          type: 'end-reminder',
        },
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: 'daily',
        hour: notificationTime.hours,
        minute: notificationTime.minutes,
      } as any,
    });

    console.log(`Scheduled end notification for habit ${habit.id} at ${notificationTime.hours}:${String(notificationTime.minutes).padStart(2, '0')}`);
    return notificationId;
  } catch (error) {
    console.error(`Error scheduling end notification for habit ${habit.id}:`, error);
    return null;
  }
}

/**
 * Programme les notifications pour toutes les habitudes
 */
export async function scheduleAllHabitNotifications(habits: Habit[]): Promise<void> {
  try {
    // Vérifier les permissions
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    // Annuler toutes les notifications précédentes
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Programmer les notifications pour chaque habitude
    for (const habit of habits) {
      await scheduleHabitNotification(habit);
      await scheduleHabitEndNotification(habit);
    }

    console.log(`Scheduled notifications for ${habits.length} habits`);
  } catch (error) {
    console.error('Error scheduling all habit notifications:', error);
  }
}

/**
 * Annule la notification pour une habitude
 */
export async function cancelHabitNotification(habitId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    const startNotification = scheduled.find(n => n.identifier === `habit-${habitId}`);
    if (startNotification) {
      await (Notifications as any).cancelNotificationAsync(startNotification.identifier);
    }
    
    const endNotification = scheduled.find(n => n.identifier === `habit-end-${habitId}`);
    if (endNotification) {
      await (Notifications as any).cancelNotificationAsync(endNotification.identifier);
    }
    
    console.log(`Cancelled notifications for habit ${habitId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for habit ${habitId}:`, error);
  }
}

/**
 * Annule toutes les notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Obtient les notifications programmées
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

const VACATION_REMINDER_ID = 'vacation-end-reminder';

/**
 * Planifie une notification J-1 avant la fin des vacances à 09:00
 */
export async function scheduleVacationEndReminder(endsAt: number, language: string): Promise<void> {
  try {
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) return;

    const reminderDate = new Date(endsAt - 24 * 60 * 60 * 1000);
    reminderDate.setHours(9, 0, 0, 0);

    if (reminderDate <= new Date()) return;

    await cancelVacationEndReminder();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: language === 'fr' ? 'Mode vacances' : 'Vacation Mode',
        body: language === 'fr'
          ? 'Tes vacances se terminent demain. Tes streaks reprendront automatiquement.'
          : 'Your vacation ends tomorrow. Your streaks will resume automatically.',
        data: { type: 'vacation-end-reminder' },
        sound: 'default',
      },
      trigger: {
        type: 'date',
        date: reminderDate,
      } as any,
      identifier: VACATION_REMINDER_ID,
    });
  } catch (error) {
    console.error('Error scheduling vacation end reminder:', error);
  }
}

/**
 * Annule la notification de fin de vacances
 */
export async function cancelVacationEndReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(VACATION_REMINDER_ID);
  } catch {
    // Ignorer si aucune notification n'existe
  }
}
