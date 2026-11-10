import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/use-translation';
import { TutorialStep } from '@/lib/tutorial-steps';
import { MaterialIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CoachMarkOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
}

function getTooltipPosition(anchor: TutorialStep['anchor'], insets: { top: number; bottom: number }) {
  switch (anchor) {
    case 'top-right':
      return { top: insets.top + 20, right: 20 };
    case 'center':
      return { top: SCREEN_HEIGHT * 0.35, left: 20, right: 20 };
    case 'bottom-center':
      return { bottom: 160, left: 20, right: 20 };
    case 'bottom-left':
      return { bottom: 160, left: 20 };
    case 'bottom-tabs':
      return { bottom: 100, left: 20, right: 20 };
    default:
      return { top: SCREEN_HEIGHT * 0.3, left: 20, right: 20 };
  }
}

function getArrowStyle(anchor: TutorialStep['anchor']) {
  switch (anchor) {
    case 'top-right':
      return { alignItems: 'flex-end' as const };
    case 'center':
      return { alignItems: 'center' as const };
    case 'bottom-center':
      return { alignItems: 'center' as const };
    case 'bottom-left':
      return { alignItems: 'flex-start' as const };
    case 'bottom-tabs':
      return { alignItems: 'center' as const };
    default:
      return { alignItems: 'center' as const };
  }
}

export default function CoachMarkOverlay({ step, onNext, onSkip, isLastStep }: CoachMarkOverlayProps) {
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const pulse = useSharedValue(1);

  useEffect(() => {
    const animate = () => {
      pulse.value = withTiming(1.15, { duration: 800 });
      setTimeout(() => { pulse.value = withTiming(1, { duration: 800 }); }, 800);
    };
    animate();
    const id = setInterval(() => {
      pulse.value = withTiming(1.15, { duration: 800 });
      setTimeout(() => { pulse.value = withTiming(1, { duration: 800 }); }, 800);
    }, 1600);
    return () => clearInterval(id);
  }, [step.id, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const tooltipPos = useMemo(() => getTooltipPosition(step.anchor, insets), [step.anchor, insets]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 100,
      }}
    >
      {/* Arrow indicator */}
      <View style={[{ position: 'absolute', ...tooltipPos }, getArrowStyle(step.anchor)]}>
        <Animated.View style={[{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }, pulseStyle]}>
          <MaterialIcons name="touch-app" size={36} color="white" />
        </Animated.View>
      </View>

      {/* Tooltip card */}
      <View
        style={{
          position: 'absolute',
          ...tooltipPos,
          marginTop: step.anchor === 'top-right' ? 60 : 0,
          marginBottom: step.anchor === 'bottom-tabs' || step.anchor === 'bottom-center' || step.anchor === 'bottom-left' ? 60 : 0,
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            marginHorizontal: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 16, lineHeight: 22, color: '#111827', textAlign: 'center', marginBottom: 16 }}>
            {t(step.messageKey)}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onSkip}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280' }}>{t('tutorial.skip')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNext}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: '#0A7EA4',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                {isLastStep ? t('tutorial.done') : t('common.next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
