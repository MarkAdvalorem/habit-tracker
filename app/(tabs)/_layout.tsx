import React from "react";
import { Tabs, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/hooks/use-translation";
import { useHabits } from "@/lib/habit-context";
import { TutorialProvider, useTutorial } from "@/lib/tutorial-context";
import { TUTORIAL_STEPS } from "@/lib/tutorial-steps";
import CoachMarkOverlay from "@/components/coach-mark-overlay";

function TabLayoutInner() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];
  const { isActive, currentStepIndex, goNext, skip, totalSteps } = useTutorial();

  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  const currentStep = isActive ? TUTORIAL_STEPS[currentStepIndex] : undefined;
  const showCoachMark = currentStep && currentStep.screen === currentScreen;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: t('tabs.statistics'),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="badges"
          options={{
            title: t('tabs.badges'),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="star.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('tabs.settings'),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>

      {showCoachMark && (
        <CoachMarkOverlay
          step={currentStep}
          onNext={goNext}
          onSkip={skip}
          isLastStep={currentStepIndex >= totalSteps - 1}
        />
      )}
    </View>
  );
}

export default function TabLayout() {
  const { habits } = useHabits();

  return (
    <TutorialProvider habits={habits}>
      <TabLayoutInner />
    </TutorialProvider>
  );
}
