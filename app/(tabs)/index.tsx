import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { TouchableOpacity as RNGHTouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useHabits } from '@/lib/habit-context';
import { useTranslation } from '@/hooks/use-translation';
import { useColors } from '@/hooks/use-colors';
import { HABIT_CATEGORIES, Habit, HabitCategory } from '@/lib/types';
import { isHabitOverdue, getTimeOfDay, getTimeOfDayLabel, getTimeOfDayIcon, TimeOfDay } from '@/lib/time-utils';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const t = useTranslation();
  const colors = useColors();
  const { habits, toggleHabitCompletion, getHabitStats, refreshHabits, settings, isReordering, setIsReordering, reorderHabits } = useHabits();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<TimeOfDay, boolean>>({
    morning: true,
    afternoon: true,
    evening: true,
    night: true,
    unscheduled: true,
  });

  const isFiltered = selectedCategory !== 'all';

  const normalOpacity = useSharedValue(1);
  const reorderOpacity = useSharedValue(0);

  useEffect(() => {
    const duration = 200;
    if (isReordering) {
      normalOpacity.value = withTiming(0, { duration });
      reorderOpacity.value = withTiming(1, { duration });
    } else {
      reorderOpacity.value = withTiming(0, { duration });
      normalOpacity.value = withTiming(1, { duration });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReordering]);

  const normalStyle = useAnimatedStyle(() => ({ opacity: normalOpacity.value }));
  const reorderStyle = useAnimatedStyle(() => ({ opacity: reorderOpacity.value }));

  const vacationEnabled = settings.vacationMode?.enabled;
  const vacationEndsAt = settings.vacationMode?.endsAt;
  const isVacationActive = vacationEnabled && (!vacationEndsAt || vacationEndsAt > Date.now());

  const getVacationEndDateString = () => {
    if (!vacationEndsAt) return '';
    const date = new Date(vacationEndsAt);
    return date.toLocaleDateString(t('common.locale') === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshHabits();
    setRefreshing(false);
  };

  useEffect(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const count = habits.filter((h) => h.completedDates.includes(today)).length;
    setTodayCompletedCount(count);
  }, [habits]);

  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  const groupedHabits = useMemo(() => {
    const groups: Record<TimeOfDay, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
      unscheduled: [],
    };

    filteredHabits.forEach(habit => {
      const timeOfDay = getTimeOfDay(habit.habitStartTime);
      groups[timeOfDay].push(habit);
    });

    // Sort each group by orderIndex
    Object.values(groups).forEach(group => {
      group.sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return groups;
  }, [filteredHabits]);

  const toggleSection = (section: TimeOfDay) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleToggleHabit = async (habitId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleHabitCompletion(habitId);
  };

  const handleAddHabit = () => {
    router.push('/add-habit' as any);
  };

  const handleHabitPress = (habitId: string) => {
    router.push(`/habit-detail/${habitId}` as any);
  };

  const handleDragEnd = ({ data }: { data: Habit[] }) => {
    const orderedIds = data.map(h => h.id);
    reorderHabits(orderedIds);
  };

  const renderHabitCard = ({ item: habit }: { item: Habit }) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const isCompletedToday = habit.completedDates.includes(today);
    const stats = getHabitStats(habit.id);
    const isOverdue = isHabitOverdue(habit.habitEndTime, isCompletedToday);

    return (
      <TouchableOpacity
        onPress={() => handleHabitPress(habit.id)}
        onLongPress={isFiltered ? undefined : () => setIsReordering(true)}
        delayLongPress={300}
        activeOpacity={0.7}
        className="mb-3"
      >
        <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: habit.color }}
            >
              <MaterialIcons name={habit.icon as any} size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground mb-1">
                {habit.name}
              </Text>
              {isOverdue && (
                <View className="flex-row items-center gap-1 mb-1">
                  <MaterialIcons name="warning" size={14} color={colors.error} />
                  <Text className="text-xs font-medium" style={{ color: colors.error }}>
                    {t('home.overdue')}
                  </Text>
                </View>
              )}
              <Text className="text-sm text-muted mb-2">
                🔥 {stats.currentStreak} {t('habitDetail.days')}
              </Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <Text className="text-xs text-muted">
                  {stats.completedThisMonth} {t('habitDetail.days')} {t('habitDetail.calendar')}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleToggleHabit(habit.id)}
            className={`w-14 h-14 rounded-full items-center justify-center border-2 ml-4 ${
              isCompletedToday
                ? 'bg-success border-success'
                : 'bg-surface border-border'
            }`}
          >
            {isCompletedToday ? (
              <MaterialIcons name="check" size={24} color="white" />
            ) : (
              <MaterialIcons name="add" size={24} color="#9BA1A6" />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (timeOfDay: TimeOfDay) => {
    const habitsInGroup = groupedHabits[timeOfDay];
    if (habitsInGroup.length === 0) return null;

    const isExpanded = expandedSections[timeOfDay];
    const label = getTimeOfDayLabel(timeOfDay, t);
    const icon = getTimeOfDayIcon(timeOfDay);

    return (
      <TouchableOpacity
        onPress={() => toggleSection(timeOfDay)}
        className="flex-row items-center justify-between py-3 mt-2"
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons name={icon as any} size={20} color={colors.muted} />
          <Text className="text-base font-semibold text-foreground">
            {label}
          </Text>
          <Text className="text-sm text-muted">
            ({habitsInGroup.length})
          </Text>
        </View>
        <MaterialIcons
          name={isExpanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={colors.muted}
        />
      </TouchableOpacity>
    );
  };

  const renderHabitList = (timeOfDay: TimeOfDay) => {
    const habitsInGroup = groupedHabits[timeOfDay];
    if (habitsInGroup.length === 0) return null;
    if (!expandedSections[timeOfDay]) return null;

    return (
      <FlatList
        data={habitsInGroup}
        renderItem={renderHabitCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    );
  };

  const renderDraggableItem = ({ item, drag, isActive }: RenderItemParams<Habit>) => {
    const stats = getHabitStats(item.id);

    return (
      <RNGHTouchableOpacity
        onLongPress={drag}
        delayLongPress={100}
        activeOpacity={0.6}
        className="mb-3"
        style={isActive ? { opacity: 0.8 } as any : undefined}
      >
        <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center">
          <MaterialIcons name="drag-indicator" size={28} color="#9BA1A6" style={{ marginRight: 8 }} />
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: item.color, marginHorizontal: 12 }}
          >
            <MaterialIcons name={item.icon as any} size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-muted">
              🔥 {stats.currentStreak} {t('habitDetail.days')}
            </Text>
          </View>
        </View>
      </RNGHTouchableOpacity>
    );
  };

  const headerContent = (
    <View>
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-4xl font-bold text-foreground">{t('home.title')}</Text>
        {isReordering ? (
          <TouchableOpacity onPress={() => setIsReordering(false)}>
            <MaterialIcons name="check" size={32} color={colors.success} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleAddHabit}>
            <MaterialIcons name="add" size={32} color="#0A7EA4" />
          </TouchableOpacity>
        )}
      </View>

      {isVacationActive && (
        <View className="mb-4 p-3 rounded-xl border flex-row items-center gap-2" style={{ backgroundColor: `${colors.warning}1A`, borderColor: colors.warning }}>
          <MaterialIcons name="beach-access" size={20} color={colors.warning} />
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: colors.warning }}>
              {t('vacation.banner')}
            </Text>
            {vacationEndsAt && (
              <Text className="text-xs mt-0.5" style={{ color: colors.muted }}>
                {t('vacation.ends', { date: getVacationEndDateString() })}
              </Text>
            )}
          </View>
        </View>
      )}

      {isReordering && (
        <Text className="text-sm text-muted mb-4">{t('reorder.hint')}</Text>
      )}

      {!isReordering && (
        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full border mr-2 ${
                selectedCategory === 'all' ? 'bg-primary border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text className={`font-medium ${selectedCategory === 'all' ? 'text-white' : 'text-foreground'}`}>
                {t('home.all')}
              </Text>
            </TouchableOpacity>
            {Object.entries(HABIT_CATEGORIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedCategory(key as HabitCategory)}
                className={`px-4 py-2 rounded-full border mr-2 ${
                  selectedCategory === key ? 'bg-primary border-primary' : 'bg-surface border-border'
                }`}
              >
                <Text className={`font-medium ${selectedCategory === key ? 'text-white' : 'text-foreground'}`}>
                  {t(value.translationKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!isReordering && (
        <View className="mb-6">
          <Text className="text-sm text-muted">
            {todayCompletedCount} {t('home.completedToday')}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        <Animated.View
          style={[{ flex: 1 }, normalStyle]}
          pointerEvents={isReordering ? 'none' : 'auto'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {headerContent}

            {filteredHabits.length === 0 ? (
              <View className="flex-1 items-center justify-center gap-4 py-20">
                <MaterialIcons name="filter-list" size={64} color="#9BA1A6" />
                <Text className="text-lg font-semibold text-foreground">
                  {selectedCategory === 'all' ? t('home.noHabits') : t('home.noHabitsInCategory')}
                </Text>
                <Text className="text-sm text-muted text-center">
                  {t('home.noHabitsDescription')}
                </Text>
                <TouchableOpacity
                  onPress={handleAddHabit}
                  className="bg-primary px-6 py-3 rounded-full mt-4"
                >
                  <Text className="text-white font-semibold">{t('home.createHabit')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {(['morning', 'afternoon', 'evening', 'night', 'unscheduled'] as TimeOfDay[]).map(timeOfDay => (
                  <React.Fragment key={timeOfDay}>
                    {renderSectionHeader(timeOfDay)}
                    {renderHabitList(timeOfDay)}
                  </React.Fragment>
                ))}
              </>
            )}
          </ScrollView>

          {habits.length > 0 && (
            <TouchableOpacity
              onPress={handleAddHabit}
              className="absolute bottom-8 right-4 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg"
            >
              <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, reorderStyle]}
          pointerEvents={isReordering ? 'auto' : 'none'}
        >
          <DraggableFlatList
            data={habits}
            renderItem={renderDraggableItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            ListHeaderComponent={headerContent}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
