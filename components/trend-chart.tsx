import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface TrendChartProps {
  data: number[];
  labels: string[];
  title: string;
  maxValue?: number;
  showLabelsAtBottom?: boolean;
}

function TrendBar({ value, percentage, isToday, colors }: { value: number; percentage: number; isToday: boolean; colors: any }) {
  const pulseScale = useSharedValue(1);
  
  if (isToday) {
    pulseScale.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }

  return (
    <View className="items-center flex-1 justify-end">
      {isToday ? (
        <Animated.View
          style={{
            width: '100%',
            height: `${percentage}%`,
            minHeight: value > 0 ? 4 : 0,
            borderRadius: 6,
            backgroundColor: colors.primary,
            transform: [{ scale: pulseScale }],
          }}
        />
      ) : (
        <View
          className="w-full bg-primary rounded-t-lg"
          style={{
            height: `${percentage}%`,
            minHeight: value > 0 ? 4 : 0,
          }}
        />
      )}
      <Text className="text-xs font-semibold text-foreground mt-1">{value}</Text>
    </View>
  );
}

export function TrendChart({ data, labels, title, maxValue }: TrendChartProps) {
  const colors = useColors();
  const max = maxValue || Math.max(...data, 1);
  
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const todayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <Text className="text-lg font-bold text-foreground mb-6">{title}</Text>

      <View className="flex-row items-flex-end justify-between gap-2" style={{ height: 200, marginTop: 16 }}>
        {data.map((value, idx) => {
          const percentage = (value / max) * 100;
          const isToday = idx === todayIndex;

          return (
            <TrendBar key={idx} value={value} percentage={percentage} isToday={isToday} colors={colors} />
          );
        })}
      </View>
    </View>
  );
}
