import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/hooks/use-translation';

interface WeeklyComparisonProps {
  currentWeekTotal: number;
  previousWeekTotal: number;
}

export function WeeklyComparison({ currentWeekTotal, previousWeekTotal }: WeeklyComparisonProps) {
  const colors = useColors();
  const t = useTranslation();
  
  const difference = currentWeekTotal - previousWeekTotal;
  const percentageChange = previousWeekTotal > 0 
    ? Math.round((difference / previousWeekTotal) * 100) 
    : 0;
  
  const isPositive = difference > 0;
  const isNeutral = difference === 0;
  
  const trendColor = isPositive ? colors.success : isNeutral ? colors.muted : colors.error;
  const trendIcon = isPositive ? 'trending-up' : isNeutral ? 'remove' : 'trending-down';

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
      <Text className="text-lg font-bold text-foreground mb-4">{t('statistics.weekComparison')}</Text>
      
      <View className="flex-row items-center justify-between">
        {/* Current Week */}
        <View className="flex-1 items-center">
          <Text className="text-xs text-muted mb-2">{t('statistics.thisWeek')}</Text>
          <Text className="text-3xl font-bold text-primary">{currentWeekTotal}</Text>
          <Text className="text-xs text-muted mt-1">{t('statistics.completed')}</Text>
        </View>
        
        {/* Comparison Indicator */}
        <View className="flex-1 items-center">
          <View 
            className="rounded-full p-3 mb-2"
            style={{ backgroundColor: `${trendColor}20` }}
          >
            <MaterialIcons 
              name={trendIcon as any} 
              size={24} 
              color={trendColor}
            />
          </View>
          <Text 
            className="text-lg font-bold"
            style={{ color: trendColor }}
          >
            {isPositive ? '+' : ''}{difference}
          </Text>
          <Text 
            className="text-xs font-semibold"
            style={{ color: trendColor }}
          >
            {isPositive ? '+' : ''}{percentageChange}%
          </Text>
        </View>
        
        {/* Previous Week */}
        <View className="flex-1 items-center">
          <Text className="text-xs text-muted mb-2">{t('statistics.lastWeek')}</Text>
          <Text className="text-3xl font-bold text-muted">{previousWeekTotal}</Text>
          <Text className="text-xs text-muted mt-1">{t('statistics.completed')}</Text>
        </View>
      </View>
    </View>
  );
}
