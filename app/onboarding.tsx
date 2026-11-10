import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useOnboarding } from '@/lib/onboarding-context';
import { useTranslation } from '@/hooks/use-translation';
import { useColors } from '@/hooks/use-colors';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

export default function OnboardingScreen() {
  const { setHasCompletedOnboarding } = useOnboarding();
  const t = useTranslation();
  const colors = useColors();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const slides: OnboardingSlide[] = [
    {
      id: 'welcome',
      icon: 'checkmark-circle',
      title: t('onboarding.slide1Title') || 'Bienvenue',
      description: t('onboarding.slide1Description') || 'Commencez à suivre vos habitudes et transformez votre vie',
      color: colors.primary,
    },
    {
      id: 'create',
      icon: 'add-circle',
      title: t('onboarding.slide2Title') || 'Créer une habitude',
      description: t('onboarding.slide2Description') || 'Ajoutez une habitude avec un nom, une catégorie, une icône et une plage horaire',
      color: '#3B82F6',
    },
    {
      id: 'track',
      icon: 'check-circle',
      title: t('onboarding.slide3Title') || 'Suivre votre progression',
      description: t('onboarding.slide3Description') || 'Marquez vos habitudes comme complétées chaque jour et regardez votre streak augmenter',
      color: '#10B981',
    },
    {
      id: 'statistics',
      icon: 'bar-chart',
      title: t('onboarding.slide4Title') || 'Visualiser vos statistiques',
      description: t('onboarding.slide4Description') || 'Consultez des graphiques détaillés, une heatmap annuelle et suivez vos streaks',
      color: '#F59E0B',
    },
    {
      id: 'badges',
      icon: 'emoji-events',
      title: t('onboarding.slide5Title') || 'Débloquer des badges',
      description: t('onboarding.slide5Description') || 'Gagnez des badges en atteignant vos objectifs et célébrez chaque réussite',
      color: '#EC4899',
    },
    {
      id: 'reminders',
      icon: 'notifications-active',
      title: t('onboarding.slide6Title') || 'Notifications & Rappels',
      description: t('onboarding.slide6Description') || 'Recevez des rappels personnalisés avant chaque habitude et restez sur la bonne voie',
      color: '#8B5CF6',
    },
    {
      id: 'sync',
      icon: 'cloud-sync',
      title: t('onboarding.slide7Title') || '100% hors-ligne & privé',
      description: t('onboarding.slide7Description') || 'Vos données restent sur votre téléphone. Aucun compte, aucune connexion requise.',
      color: '#06B6D4',
    },
    {
      id: 'customize',
      icon: 'palette',
      title: t('onboarding.slide8Title') || 'Personnalisation totale',
      description: t('onboarding.slide8Description') || 'Thème clair/sombre, 6 langues disponibles, catégories et icônes personnalisables',
      color: '#F97316',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentSlide(currentSlide + 1);
      scrollViewRef.current?.scrollTo({
        x: (currentSlide + 1) * width,
        animated: true,
      });
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentSlide(currentSlide - 1);
      scrollViewRef.current?.scrollTo({
        x: (currentSlide - 1) * width,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setHasCompletedOnboarding(true);
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setHasCompletedOnboarding(true);
  };

  const progress = (currentSlide + 1) / slides.length;

  return (
    <ScreenContainer className="flex-1 bg-background">
      {/* Skip Button */}
      <View className="flex-row justify-end p-4">
        <TouchableOpacity
          onPress={handleSkip}
          className="px-4 py-2 rounded-full"
        >
          <Text className="text-muted font-semibold">{t('common.skip') || 'Passer'}</Text>
        </TouchableOpacity>
      </View>

      {/* Slides Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        className="flex-1"
      >
        {slides.map((s, index) => (
          <View key={s.id} className="w-full flex-1 items-center justify-center px-6" style={{ width }}>
            {/* Icon */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: `${s.color}20` }}
            >
              <MaterialIcons name={s.icon as any} size={56} color={s.color} />
            </View>

            {/* Title */}
            <Text className="text-3xl font-bold text-foreground text-center mb-4">{s.title}</Text>

            {/* Description */}
            <Text className="text-base text-muted text-center leading-relaxed mb-8">
              {s.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Progress Bar */}
      <View className="h-1 bg-border mx-6 rounded-full overflow-hidden mb-6">
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      {/* Dots Indicator */}
      <View className="flex-row justify-center gap-2 mb-6">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`rounded-full ${
              index === currentSlide ? 'bg-primary' : 'bg-border'
            }`}
            style={{
              width: index === currentSlide ? 32 : 8,
              height: 8,
            }}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View className="flex-row gap-3 px-6 pb-6">
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentSlide === 0}
          className={`flex-1 py-3 rounded-lg border ${
            currentSlide === 0
              ? 'bg-border border-border opacity-50'
              : 'bg-surface border-border'
          }`}
        >
          <Text className="text-center text-foreground font-semibold">
            {t('common.back') || 'Retour'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={currentSlide === slides.length - 1 ? handleFinish : handleNext}
          className="flex-1 py-3 rounded-lg bg-primary"
        >
          <Text className="text-center text-white font-semibold">
            {currentSlide === slides.length - 1
              ? t('onboarding.finish') || 'Commencer'
              : t('common.next') || 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
