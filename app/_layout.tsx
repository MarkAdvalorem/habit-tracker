import "@/global.css";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import type { EdgeInsets, Rect } from "react-native-safe-area-context";

import { HabitProvider } from "@/lib/habit-context";
import { OnboardingProvider, useOnboarding } from "@/lib/onboarding-context";
import { LanguageInitProvider, useLanguageInit } from "@/lib/language-init-context";
import { setupNotificationHandler, setupAndroidNotificationChannel } from "@/lib/push-notification-client";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

// Suppress hydration warnings for development
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args[0]?.includes?.('Hydration mismatch')) {
      return;
    }
    originalWarn(...args);
  };
}

function RootLayoutContent() {
  const router = useRouter();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { hasSelectedLanguage, isLoading: langLoading } = useLanguageInit();

  useEffect(() => {
    if (!onboardingLoading && !langLoading) {
      if (!hasSelectedLanguage) {
        router.replace('/language-select');
      } else if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else {
        // All done, go to main app
        router.replace('/(tabs)');
      }
    }
  }, [onboardingLoading, langLoading, hasSelectedLanguage, hasCompletedOnboarding, router]);

  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  // Local notifications: foreground handler + Android channel
  useEffect(() => {
    if (hasCompletedOnboarding) {
      setupNotificationHandler();
      setupAndroidNotificationChannel();
    }
  }, [hasCompletedOnboarding]);

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HabitProvider>
        {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
        {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
        {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="language-select" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </HabitProvider>
    </GestureHandlerRootView>
  );

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>
        {content}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <LanguageInitProvider>
      <OnboardingProvider>
        <RootLayoutContent />
      </OnboardingProvider>
    </LanguageInitProvider>
  );
}
