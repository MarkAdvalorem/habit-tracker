import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from './types';

const TUTORIAL_KEY = 'tutorial_completed';
const TUTORIAL_INDEX_KEY = 'tutorial_step_index';

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  goNext: () => void;
  skip: () => void;
  reset: () => void;
  totalSteps: number;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({
  children,
  habits,
}: {
  children: React.ReactNode;
  habits: Habit[];
}) {
  const [completed, setCompleted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const val = await AsyncStorage.getItem(TUTORIAL_KEY);
        if (val === 'true') {
          setCompleted(true);
        }
        const savedIndex = await AsyncStorage.getItem(TUTORIAL_INDEX_KEY);
        if (savedIndex) {
          setCurrentStepIndex(parseInt(savedIndex, 10));
        }
      } catch {
        setCompleted(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isActive = useMemo(() => {
    if (loading) return false;
    if (completed) return false;
    if (habits.length > 0) return false;
    return true;
  }, [loading, completed, habits.length]);

  const goNext = useCallback(async () => {
    const next = currentStepIndex + 1;
    if (next >= 7) {
      setCompleted(true);
      await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
      await AsyncStorage.removeItem(TUTORIAL_INDEX_KEY);
    } else {
      setCurrentStepIndex(next);
      await AsyncStorage.setItem(TUTORIAL_INDEX_KEY, String(next));
    }
  }, [currentStepIndex]);

  const skip = useCallback(async () => {
    setCompleted(true);
    setCurrentStepIndex(0);
    await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
    await AsyncStorage.removeItem(TUTORIAL_INDEX_KEY);
  }, []);

  const reset = useCallback(async () => {
    setCompleted(false);
    setCurrentStepIndex(0);
    await AsyncStorage.removeItem(TUTORIAL_KEY);
    await AsyncStorage.removeItem(TUTORIAL_INDEX_KEY);
  }, []);

  return (
    <TutorialContext.Provider value={{ isActive, currentStepIndex, goNext, skip, reset, totalSteps: 7 }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) throw new Error('useTutorial must be used within TutorialProvider');
  return context;
}
