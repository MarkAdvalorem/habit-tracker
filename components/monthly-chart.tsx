import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/hooks/use-translation';

interface MonthlyChartProps {
  completedDates: number[];
  month?: number;
  year?: number;
  allHabits?: any[]; // Optional: all habits to calculate intensity
}

export function MonthlyChart({ completedDates, month, year, allHabits = [] }: MonthlyChartProps) {
  const colors = useColors();
  const t = useTranslation();
  const now = new Date();
  const currentMonth = month ?? now.getMonth();
  const currentYear = year ?? now.getFullYear();

  // Get the number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Convert to Monday-based index (0 = Monday, 6 = Sunday)
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Create array of days with completion status and intensity
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayDate = new Date(currentYear, currentMonth, i + 1).setHours(0, 0, 0, 0);
    const isCompleted = completedDates.includes(dayDate);
    
    // Calculate intensity: count how many habits are completed on this day
    let intensity = 0;
    if (isCompleted) {
      intensity = 1; // At least 1 (this habit)
      // If we have all habits, count total completed on this day
      if (allHabits.length > 0) {
        intensity = allHabits.filter(h => h.completedDates.includes(dayDate)).length;
      }
    }
    
    return {
      day: i + 1,
      isCompleted,
      intensity,
    };
  });

  // Calculate statistics
  const completedCount = days.filter((d) => d.isCompleted).length;
  const completionPercentage = Math.round((completedCount / daysInMonth) * 100);

  // Get max intensity for normalization
  const maxIntensity = Math.max(...days.map(d => d.intensity), 1);

  // Create weeks with empty cells at the beginning
  const weeks: (typeof days[0] | null)[][] = [];
  let currentWeek: (typeof days[0] | null)[] = Array(firstDayIndex).fill(null);
  
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Add the last week if it has any days
  if (currentWeek.length > 0) {
    // Fill remaining cells with null
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const screenWidth = Dimensions.get('window').width;
  const cellSize = (screenWidth - 32) / 7 - 4;

  // Color gradient function - intensity-based
  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) {
      return colors.border; // Light gray for not completed
    }
    
    // Normalize intensity to 0-1 range
    const normalizedIntensity = Math.min(intensity / maxIntensity, 1);
    
    // Create gradient from light green to dark green
    // Using RGB interpolation
    const startR = 220; // Light green: #DCFCE7
    const startG = 252;
    const startB = 231;
    
    const endR = 34;   // Dark green: #22C55E
    const endG = 197;
    const endB = 94;
    
    const r = Math.round(startR + (endR - startR) * normalizedIntensity);
    const g = Math.round(startG + (endG - startG) * normalizedIntensity);
    const b = Math.round(startB + (endB - startB) * normalizedIntensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <View className="mb-4">
        <Text className="text-lg font-bold text-foreground mb-1">
          {t('monthlyChart.progressThisMonth')}
        </Text>
        <Text className="text-sm text-muted">
          {completedCount} {t('monthlyChart.daysOut')} {daysInMonth} {t('monthlyChart.days')} ({completionPercentage}%)
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-4 h-2 bg-border rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </View>

      {/* Calendar Grid */}
      <View className="gap-2">
        {/* Day headers */}
        <View className="flex-row justify-between mb-2">
          {t('monthlyChart.dayLabels').split(',').map((day: string, idx: number) => (
            <Text
              key={idx}
              className="text-xs font-semibold text-muted text-center"
              style={{ width: cellSize }}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar cells */}
        {weeks.map((week, weekIdx) => (
          <View key={weekIdx} className="flex-row justify-between">
            {week.map((day, dayIdx) => (
              <View
                key={dayIdx}
                className="rounded-lg items-center justify-center"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: day ? getHeatmapColor(day.intensity) : 'transparent',
                }}
              >
                {day && (
                  <Text
                    className={`text-xs font-semibold ${
                      day.intensity > 0 ? 'text-white' : 'text-muted'
                    }`}
                  >
                    {day.day}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View className="mt-4">
        <View className="flex-row items-center justify-center gap-3 mb-2 flex-wrap">
          <View className="flex-row items-center gap-1">
            <View
              className="rounded"
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors.border,
              }}
            />
            <Text className="text-xs text-muted">{t('heatmap.notCompleted')}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View
              className="rounded"
              style={{
                width: 12,
                height: 12,
                backgroundColor: 'rgb(220, 252, 231)', // Light green
              }}
            />
            <Text className="text-xs text-muted">{t('heatmap.low')}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View
              className="rounded"
              style={{
                width: 12,
                height: 12,
                backgroundColor: 'rgb(127, 225, 160)', // Medium green
              }}
            />
            <Text className="text-xs text-muted">{t('heatmap.medium')}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View
              className="rounded"
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors.success, // Dark green
              }}
            />
            <Text className="text-xs text-muted">{t('heatmap.high')}</Text>
          </View>
        </View>
        {allHabits.length > 0 && (
          <Text className="text-xs text-muted text-center">
            {t('heatmap.intensityLabel')}: 1-{maxIntensity}
          </Text>
        )}
      </View>
    </View>
  );
}
