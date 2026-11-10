import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useLanguageInit } from '@/lib/language-init-context';
import { useColors } from '@/hooks/use-colors';
import { Language } from '@/lib/types';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { setLanguage } = useLanguageInit();
  const colors = useColors();

  const handleSelect = async (lang: Language) => {
    await setLanguage(lang);
    router.replace('/onboarding');
  };

  return (
    <ScreenContainer className="flex-1 bg-background justify-center px-6">
      <View className="items-center mb-10">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: `${colors.primary}20` }}
        >
          <Text style={{ fontSize: 40 }}>🌐</Text>
        </View>
        <Text className="text-3xl font-bold text-foreground text-center mb-2">
          Welcome
        </Text>
        <Text className="text-base text-muted text-center">
          Choose your language
        </Text>
      </View>

      <View className="gap-3">
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleSelect(lang.code)}
            className="flex-row items-center bg-surface rounded-xl p-4 border border-border"
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 32 }}>{lang.flag}</Text>
            <Text className="text-lg font-semibold text-foreground ml-4">
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}
