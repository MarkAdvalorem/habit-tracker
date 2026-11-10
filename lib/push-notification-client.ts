import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Client-side push notification management
 */

/**
 * Configure notification handler for foreground notifications
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Setup Android notification channel
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0a7ea4",
      enableVibrate: true,
      enableLights: true,
    });

    // Create a channel for habit reminders
    await Notifications.setNotificationChannelAsync("habit-reminders", {
      name: "Habit Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0a7ea4",
      enableVibrate: true,
      enableLights: true,
      sound: "default",
    });
  }
}
