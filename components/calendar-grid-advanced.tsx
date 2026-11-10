import React from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/hooks/use-translation';
import { MaterialIcons } from '@expo/vector-icons';

interface CalendarGridAdvancedProps {
  completedDates: number[];
  month: number;
  year: number;
  onDatePress?: (date: number) => void;
  onMonthChange?: (month: number, year: number) => void;
}

export function CalendarGridAdvanced({
  completedDates,
  month,
  year,
  onDatePress,
  onMonthChange,
}: CalendarGridAdvancedProps) {
  const colors = useColors();
  const today = new Date().setHours(0, 0, 0, 0);
  const t = useTranslation();

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get the number of days from previous month to display
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Create array of all days to display
  const allDays = [
    ...Array.from({ length: prevMonthDays }, (_, i) => ({
      day: daysInPrevMonth - prevMonthDays + i + 1,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - prevMonthDays + i + 1).setHours(0, 0, 0, 0),
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
      date: new Date(year, month, i + 1).setHours(0, 0, 0, 0),
    })),
  ];

  // Add next month days to complete the grid
  const remainingDays = 42 - allDays.length; // 6 rows * 7 days
  const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: false,
    date: new Date(year, month + 1, i + 1).setHours(0, 0, 0, 0),
  }));

  const calendarDays = [...allDays, ...nextMonthDays];

  // Calculate statistics
  const completedCount = calendarDays.filter(
    (d) => d.isCurrentMonth && completedDates.includes(d.date)
  ).length;
  const completionPercentage = Math.round((completedCount / daysInMonth) * 100);

  const screenWidth = Dimensions.get('window').width;
  const cellSize = (screenWidth - 32) / 7 - 4;

  // Day names
  const dayLabels = t('monthlyChart.dayLabels');

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange?.(11, year - 1);
    } else {
      onMonthChange?.(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange?.(0, year + 1);
    } else {
      onMonthChange?.(month + 1, year);
    }
  };

  const handleDatePress = (date: number) => {
    // Prevent clicking on future dates
    if (date > today) {
      return;
    }
    onDatePress?.(date);
  };

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      {/* Header with Month/Year and Navigation */}
      <View className="mb-4">
        <Text className="text-sm text-muted mb-2">
          {monthNames[month]} {year}
        </Text>
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handlePrevMonth} className="p-2">
            <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-foreground">{monthNames[month]}</Text>

          <TouchableOpacity onPress={handleNextMonth} className="p-2">
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs font-semibold text-foreground">
              {completedCount}/{daysInMonth} days ({completionPercentage}%)
            </Text>
          </View>
          <View className="h-2 bg-border rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </View>
        </View>
      </View>

      {/* Day Headers */}
      <View className="flex-row justify-between mb-2">
        {dayLabels.split(',').map((day: string, idx: number) => (
          <Text
            key={idx}
            className="text-xs font-bold text-muted text-center"
            style={{ width: cellSize }}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View className="gap-2">
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => {
          const weekDays = calendarDays.slice(weekIdx * 7, (weekIdx + 1) * 7);

          return (
            <View key={weekIdx} className="flex-row justify-between">
              {/* Days */}
              {weekDays.map((day, dayIdx) => (
              <TouchableOpacity
                key={dayIdx}
                onPress={() => {
                  if (day.isCurrentMonth) {
                    handleDatePress(day.date);
                  }
                }}
                disabled={!day.isCurrentMonth || day.date > today}
                  className={`rounded-md items-center justify-center border ${
                    !day.isCurrentMonth
                      ? 'bg-transparent border-transparent'
                      : completedDates.includes(day.date)
                        ? 'bg-success border-success'
                        : 'bg-background border-border'
                  }`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                  }}
                >
                  <Text
                    className={`text-xs font-bold ${
                      completedDates.includes(day.date) && day.isCurrentMonth
                        ? 'text-white'
                        : day.isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted opacity-30'
                    }`}
                  >
                    {day.day.toString().padStart(2, '0')}
                  </Text>
                  {completedDates.includes(day.date) && day.isCurrentMonth && (
                    <View className="absolute top-0.5 right-0.5">
                      <MaterialIcons name="check" size={8} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row gap-2 mt-3 pt-3 border-t border-border">
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 bg-success rounded" />
          <Text className="text-xs text-muted">{t('habitDetail.completed')}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2 h-2 bg-background border border-border rounded" />
          <Text className="text-xs text-muted">{t('habitDetail.pending')}</Text>
        </View>
      </View>
    </View>
  );
}

