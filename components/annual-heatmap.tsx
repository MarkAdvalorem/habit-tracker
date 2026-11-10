import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from '@/hooks/use-translation';

interface AnnualHeatmapProps {
  completedDates: number[];
  year: number;
  allHabits?: any[];
  onYearChange?: (year: number) => void;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function AnnualHeatmap({ completedDates, year, allHabits = [], onYearChange }: AnnualHeatmapProps) {
  const t = useTranslation();
  const { width: screenWidth } = useWindowDimensions();

  // Calculate cell size based on screen width to fit heatmap
  const weeksCount = 53; // Maximum weeks in a year
  const dayLabelsWidth = 20;
  const availableWidth = screenWidth - 48; // Account for padding
  const CELL_SIZE = Math.max(8, Math.min(10, (availableWidth - dayLabelsWidth) / weeksCount - 2));
  const CELL_GAP = Math.max(1, CELL_SIZE * 0.2);

  const yearData = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const dayCount = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    const days: { date: number; dayOfYear: number; month: number; intensity: number; isCompleted: boolean }[] = [];

    for (let i = 0; i < dayCount; i++) {
      const date = new Date(year, 0, 1 + i);
      const dateKey = date.setHours(0, 0, 0, 0);
      const isCompleted = completedDates.includes(dateKey);

      let intensity = 0;
      if (isCompleted) {
        intensity = 1;
        if (allHabits.length > 0) {
          intensity = allHabits.filter((h) => h.completedDates.includes(dateKey)).length;
        }
      }

      days.push({
        date: dateKey,
        dayOfYear: i + 1,
        month: date.getMonth(),
        intensity,
        isCompleted,
      });
    }

    const completedCount = days.filter((d) => d.isCompleted).length;
    const totalHabitsPerDay = allHabits.length > 0 ? allHabits.length : 1;
    const totalPossible = completedCount * totalHabitsPerDay;
    const maxPossible = days.length * totalHabitsPerDay;
    const annualRate = maxPossible > 0 ? Math.round((totalPossible / maxPossible) * 100) : 0;

    // Find longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    for (const day of days) {
      if (day.isCompleted) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Find most productive month
    const monthCounts = Array(12).fill(0);
    days.forEach((d) => {
      if (d.isCompleted) monthCounts[d.month]++;
    });
    const mostProductiveMonth = monthCounts.indexOf(Math.max(...monthCounts));

    // Group days by week columns for GitHub-style layout
    const firstDayOfWeek = startDate.getDay();
    const weeks: (typeof days[0] | null)[][] = [];
    let currentWeek: (typeof days[0] | null)[] = Array(firstDayOfWeek).fill(null);

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Find month boundaries for labels
    const monthStartWeeks: Record<number, number> = {};
    weeks.forEach((week, weekIdx) => {
      for (const day of week) {
        if (day && !(day.month in monthStartWeeks)) {
          monthStartWeeks[day.month] = weekIdx;
        }
      }
    });

    const maxIntensity = Math.max(...days.map((d) => d.intensity), 1);

    return {
      days,
      weeks,
      completedCount,
      longestStreak,
      annualRate,
      mostProductiveMonth,
      monthStartWeeks,
      maxIntensity,
    };
  }, [completedDates, year, allHabits]);

  const getHeatmapColor = (intensity: number, isDark: boolean = false) => {
    if (intensity === 0) {
      return isDark ? '#161B22' : '#EBEDF0';
    }

    const normalizedIntensity = Math.min(intensity / yearData.maxIntensity, 1);

    if (normalizedIntensity < 0.33) {
      return isDark ? '#0E4429' : '#9BE9A8';
    } else if (normalizedIntensity < 0.66) {
      return isDark ? '#006D32' : '#40C463';
    } else {
      return isDark ? '#006D32' : '#30A14E';
    }
  };

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      {/* Year Navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => onYearChange?.(year - 1)} className="p-2">
          <Text className="text-lg font-bold text-primary">{'\u2039'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">{year}</Text>
        <TouchableOpacity onPress={() => onYearChange?.(year + 1)} className="p-2">
          <Text className="text-lg font-bold text-primary">{'\u203A'}</Text>
        </TouchableOpacity>
      </View>

      {/* Annual Stats */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
          <Text className="text-xs text-muted">{t('statistics.daysCompleted')}</Text>
          <Text className="text-xl font-bold text-primary">{yearData.completedCount}</Text>
        </View>
        <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
          <Text className="text-xs text-muted">{t('statistics.longestStreak')}</Text>
          <Text className="text-xl font-bold text-primary">{yearData.longestStreak}</Text>
        </View>
        <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
          <Text className="text-xs text-muted">{t('statistics.annualRate')}</Text>
          <Text className="text-xl font-bold text-primary">{yearData.annualRate}%</Text>
        </View>
      </View>

      {/* Heatmap */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {/* Day labels */}
          <View className="mr-1 justify-center">
            {DAY_LABELS.map((label, idx) => (
              <View key={idx} style={{ height: CELL_SIZE + CELL_GAP }} className="justify-center">
                <Text className="text-[8px] text-muted text-center">{label}</Text>
              </View>
            ))}
          </View>

          {/* Heatmap grid */}
          <View className="flex-1">
            {/* Month labels */}
            <View className="flex-row mb-1" style={{ height: 12 }}>
              {MONTH_LABELS.map((label, monthIdx) => {
                const weekIdx = yearData.monthStartWeeks[monthIdx];
                const leftOffset = weekIdx !== undefined ? weekIdx * (CELL_SIZE + CELL_GAP) : 0;
                return (
                  <Text
                    key={monthIdx}
                    className="text-[8px] text-muted absolute"
                    style={{ left: leftOffset }}
                  >
                    {t(`months.${monthIdx}`)}
                  </Text>
                );
              })}
            </View>

            {/* Weeks */}
            <View className="flex-row">
              {yearData.weeks.map((week, weekIdx) => (
                <View key={weekIdx} className="mr-0.5">
                  {week.map((day, dayIdx) => (
                    <View
                      key={dayIdx}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        marginBottom: CELL_GAP,
                        borderRadius: 2,
                        backgroundColor: day ? getHeatmapColor(day.intensity) : 'transparent',
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View className="mt-4 flex-row items-center justify-center gap-2">
        <Text className="text-[10px] text-muted">{t('heatmap.less')}</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((level, idx) => (
          <View
            key={idx}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: getHeatmapColor(level * yearData.maxIntensity),
            }}
          />
        ))}
        <Text className="text-[10px] text-muted">{t('heatmap.more')}</Text>
      </View>
    </View>
  );
}
