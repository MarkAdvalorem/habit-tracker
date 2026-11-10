import React, { useState, useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useHabits } from '@/lib/habit-context';
import { useTranslation } from '@/hooks/use-translation';
import { MonthlyChart } from '@/components/monthly-chart';
import { AnnualHeatmap } from '@/components/annual-heatmap';
import { TrendChart } from '@/components/trend-chart';
import { WeeklyComparison } from '@/components/weekly-comparison';
import { MaterialIcons } from '@expo/vector-icons';

type TimePeriod = 'week' | 'month' | 'year';

export default function StatisticsScreen() {
  const { habits, getHabitStats, refreshHabits } = useHabits();
  const t = useTranslation();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHeatmapYear, setSelectedHeatmapYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshHabits();
    setRefreshing(false);
  };

  // Calculate global statistics
  const globalStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;

    let bestStreakGlobal = 0;
    let totalCompleted = 0;

    habits.forEach((habit) => {
      const stats = getHabitStats(habit.id);
      bestStreakGlobal = Math.max(bestStreakGlobal, stats.bestStreak);
      totalCompleted += stats.totalCompleted;
    });

    return {
      totalHabits: habits.length,
      completedToday,
      bestStreakGlobal,
      totalCompleted,
    };
  }, [habits, getHabitStats]);

  // Calculate weekly data (Monday to Sunday)
  const weeklyData = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate start of week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
    
    const data = [];
    
    // Get data for each day of the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.setHours(0, 0, 0, 0);

      const completed = habits.filter((h) => h.completedDates.includes(dateKey)).length;
      data.push(completed);
    }

    return data;
  }, [habits]);

  // Calculate previous week data
  const previousWeekData = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
    
    const previousWeekStart = new Date(startOfWeek);
    previousWeekStart.setDate(startOfWeek.getDate() - 7);
    
    const data = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(previousWeekStart);
      date.setDate(previousWeekStart.getDate() + i);
      const dateKey = date.setHours(0, 0, 0, 0);
      const completed = habits.filter((h) => h.completedDates.includes(dateKey)).length;
      data.push(completed);
    }

    return data;
  }, [habits]);

  const currentWeekTotal = useMemo(() => weeklyData.reduce((a, b) => a + b, 0), [weeklyData]);
  const previousWeekTotal = useMemo(() => previousWeekData.reduce((a, b) => a + b, 0), [previousWeekData]);

  // Calculate monthly data (used for chart display)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const monthlyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day).setHours(0, 0, 0, 0);
      const completed = habits.filter((h) => h.completedDates.includes(date)).length;
      data.push(completed);
    }

    return data;
  }, [habits, selectedMonth, selectedYear]);

  // Get habits sorted by performance
  const habitsByPerformance = useMemo(() => {
    return habits
      .map((habit) => ({
        ...habit,
        stats: getHabitStats(habit.id),
      }))
      .sort((a, b) => b.stats.completionPercentage - a.stats.completionPercentage);
  }, [habits, getHabitStats]);

  // Aggregate all completed dates for monthly chart
  const allCompletedDates = useMemo(() => {
    const dateSet = new Set<number>();
    habits.forEach(h => h.completedDates.forEach(d => dateSet.add(d)));
    return Array.from(dateSet);
  }, [habits]);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    if (selectedMonth === 11 || selectedYear < now.getFullYear()) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else if (selectedMonth < now.getMonth()) {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString(t('statistics.month') === 'Mois' ? 'fr-FR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Get week labels with dates
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
  
  const weekDatesLabels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date.getDate().toString();
  });

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
        {/* Header */}
        <Text className="text-4xl font-bold text-foreground mb-6">{t('statistics.title')}</Text>

        {/* Global Statistics Cards */}
        <View className="mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('statistics.habits')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.totalHabits}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('statistics.today')}</Text>
              <Text className="text-3xl font-bold text-success">{globalStats.completedToday}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('statistics.bestStreak')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.bestStreakGlobal}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('statistics.total')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.totalCompleted}</Text>
            </View>
          </View>
        </View>

        {/* Time Period Selector */}
        <View className="flex-row gap-2 mb-6">
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimePeriod(period)}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                timePeriod === period
                  ? 'bg-primary border-primary'
                  : 'bg-surface border-border'
              }`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  timePeriod === period ? 'text-white' : 'text-foreground'
                }`}
              >
                {period === 'week' ? t('statistics.week') : period === 'month' ? t('statistics.month') : t('statistics.year')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts */}
        {timePeriod === 'week' && (
          <View className="mb-6">
            <WeeklyComparison
              currentWeekTotal={currentWeekTotal}
              previousWeekTotal={previousWeekTotal}
            />
            <TrendChart
              data={weeklyData}
              labels={weekDatesLabels}
              title={t('statistics.completedThisWeek')}
            />
          </View>
        )}

        {timePeriod === 'month' && (
          <View className="mb-6">
            {/* Month Navigation */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={handlePreviousMonth}>
                <MaterialIcons name="chevron-left" size={24} color="#0A7EA4" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-foreground capitalize">
                {monthName}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <MaterialIcons name="chevron-right" size={24} color="#0A7EA4" />
              </TouchableOpacity>
            </View>

            {/* Calendar View */}
            {habitsByPerformance.length > 0 && (
              <MonthlyChart
                completedDates={allCompletedDates}
                month={selectedMonth}
                year={selectedYear}
                allHabits={habits}
              />
            )}
          </View>
        )}

        {timePeriod === 'year' && (
          <View className="mb-6">
            <AnnualHeatmap
              completedDates={allCompletedDates}
              year={selectedHeatmapYear}
              allHabits={habits}
              onYearChange={setSelectedHeatmapYear}
            />
          </View>
        )}

        {/* Habits Ranking */}
        {habitsByPerformance.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              {t('statistics.ranking')}
            </Text>
            <FlatList
              data={habitsByPerformance}
              renderItem={({ item, index }) => (
                <View
                  key={item.id}
                  className="bg-surface rounded-lg p-4 border border-border mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 gap-3">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: item.color }}
                    >
                      <Text className="text-white font-bold">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">{item.name}</Text>
                      <Text className="text-xs text-muted">
                        {item.stats.completionPercentage}% {t('statistics.completed')}
                      </Text>
                    </View>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-primary">
                      {item.stats.completionPercentage}%
                    </Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {habits.length === 0 && (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="bar-chart" size={64} color="#687076" />
            <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
              {t('statistics.noData')}
            </Text>
            <Text className="text-sm text-muted text-center">
              {t('statistics.noDataDescription')}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
