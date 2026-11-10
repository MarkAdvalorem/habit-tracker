import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding status on mount
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('onboarding_completed');
        setHasCompletedOnboardingState(status === 'true');
      } catch (error) {
        console.error('Error loading onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingStatus();
  }, []);

  const setHasCompletedOnboarding = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('onboarding_completed', String(value));
      setHasCompletedOnboardingState(value);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
