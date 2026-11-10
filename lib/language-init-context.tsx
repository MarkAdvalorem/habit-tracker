import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from './types';

const APP_LANGUAGE_KEY = 'app_language';

interface LanguageInitContextType {
  hasSelectedLanguage: boolean;
  languageValue: Language | null;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageInitContext = createContext<LanguageInitContextType | undefined>(undefined);

export function LanguageInitProvider({ children }: { children: React.ReactNode }) {
  const [languageValue, setLanguageValue] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(APP_LANGUAGE_KEY);
        if (stored && ['fr', 'en', 'it', 'de', 'ru', 'es'].includes(stored)) {
          setLanguageValue(stored as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(APP_LANGUAGE_KEY, lang);
      setLanguageValue(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageInitContext.Provider
      value={{
        hasSelectedLanguage: languageValue !== null,
        languageValue,
        setLanguage,
        isLoading,
      }}
    >
      {children}
    </LanguageInitContext.Provider>
  );
}

export function useLanguageInit() {
  const context = useContext(LanguageInitContext);
  if (context === undefined) {
    throw new Error('useLanguageInit must be used within LanguageInitProvider');
  }
  return context;
}
