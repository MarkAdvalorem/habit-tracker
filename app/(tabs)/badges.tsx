import React, { useState, useMemo } from 'react';
import { ScrollView, Text, View, TouchableOpacity, FlatList, Modal, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useHabits } from '@/lib/habit-context';
import { useTranslation } from '@/hooks/use-translation';
import { BadgeDisplay } from '@/components/badge-display';
import { Confetti } from '@/components/confetti';
import { BADGES, BadgeType, getBadgeProgress, checkBadgeUnlock } from '@/lib/badges';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function BadgesScreen() {
  const { habits, getHabitStats, refreshHabits } = useHabits();
  const t = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshHabits();
    setRefreshing(false);
  };

  // Calculate global statistics for badge checking
  const globalStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;

    let bestStreakGlobal = 0;
    let totalCompleted = 0;
    let currentStreak = 0;
    let completedThisMonth = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    habits.forEach((habit) => {
      const stats = getHabitStats(habit.id);
      bestStreakGlobal = Math.max(bestStreakGlobal, stats.bestStreak);
      totalCompleted += stats.totalCompleted;
      currentStreak = Math.max(currentStreak, stats.currentStreak);
      completedThisMonth += stats.completedThisMonth;
    });

    const completionPercentage =
      habits.length > 0
        ? Math.round(
            (completedThisMonth / (habits.length * new Date(currentYear, currentMonth + 1, 0).getDate())) * 100
          )
        : 0;

    return {
      currentStreak,
      bestStreak: bestStreakGlobal,
      totalCompleted,
      completionPercentage,
      completedThisMonth,
      totalHabits: habits.length,
      completedTodayCount: completedToday,
    };
  }, [habits, getHabitStats]);

  // Get unlocked badges
  const unlockedBadges = useMemo(() => {
    return (Object.keys(BADGES) as BadgeType[]).filter((badgeId) =>
      checkBadgeUnlock(badgeId, globalStats)
    );
  }, [globalStats]);

  // Get all badges with progress
  const allBadgesWithProgress = useMemo(() => {
    return (Object.keys(BADGES) as BadgeType[]).map((badgeId) => ({
      id: badgeId,
      badge: BADGES[badgeId],
      isUnlocked: unlockedBadges.includes(badgeId),
      progress: getBadgeProgress(badgeId, globalStats),
    }));
  }, [unlockedBadges, globalStats]);

  const handleBadgePress = (badgeId: BadgeType) => {
    setSelectedBadge(badgeId);
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Show confetti if badge is newly unlocked
    const badgeData = allBadgesWithProgress.find((b) => b.id === badgeId);
    if (badgeData?.isUnlocked) {
      setShowConfetti(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const selectedBadgeData = selectedBadge ? allBadgesWithProgress.find((b) => b.id === selectedBadge) : null;

  return (
    <ScreenContainer className="p-4">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-4xl font-bold text-foreground mb-2">{t('badges.title')}</Text>
          <Text className="text-base text-muted">
            {unlockedBadges.length} {unlockedBadges.length !== 1 ? t('badges.unlockedPlural') : t('badges.unlocked')}
          </Text>
        </View>

        {/* Progress Stats */}
        <View className="mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('badges.currentStreak')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.currentStreak}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('statistics.total')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.totalCompleted}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('badges.thisMonth')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.completedThisMonth}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">{t('statistics.today')}</Text>
              <Text className="text-3xl font-bold text-primary">{globalStats.completedTodayCount}</Text>
            </View>
          </View>
        </View>

        {/* Unlocked Badges */}
        {unlockedBadges.length > 0 && (
          <BadgeDisplay
            unlockedBadges={unlockedBadges}
            onBadgePress={(badge) => handleBadgePress(badge.id as BadgeType)}
          />
        )}

        {/* All Badges */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('badges.allBadges')}</Text>
          <FlatList
            data={allBadgesWithProgress}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleBadgePress(item.id)}
                className={`rounded-lg p-4 border mb-3 ${
                  item.isUnlocked
                    ? 'bg-surface border-border'
                    : 'bg-background border-border opacity-50'
                }`}
              >
                <View className="flex-row items-center gap-4">
                  {/* Badge Icon */}
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: item.isUnlocked ? item.badge.color : '#E5E7EB',
                    }}
                  >
                    <Text className={`text-2xl ${item.isUnlocked ? '' : 'opacity-30'}`}>
                      {item.badge.icon}
                    </Text>
                  </View>

                  {/* Badge Info */}
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-foreground font-bold">{t(item.badge.name)}</Text>
                      {item.isUnlocked && (
                        <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                      )}
                    </View>
                    <Text className="text-xs text-muted mb-2">{t(item.badge.description)}</Text>

                    {/* Progress Bar */}
                    {!item.isUnlocked && (
                      <View className="h-1.5 bg-border rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${item.progress.percentage}%` }}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Empty State */}
        {habits.length === 0 && (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="emoji-events" size={64} color="#687076" />
            <Text className="text-lg font-semibold text-foreground mt-4 mb-2">
              {t('home.noHabits')}
            </Text>
            <Text className="text-sm text-muted text-center">
              {t('badges.noBadgesDescription')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Badge Detail Modal */}
      <Modal
        visible={showModal && selectedBadgeData !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 items-center justify-center p-4">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm border border-border">
            {selectedBadgeData && (
              <>
                {/* Badge Icon */}
                <View
                  className="w-20 h-20 rounded-full items-center justify-center self-center mb-4"
                  style={{
                    backgroundColor: selectedBadgeData.isUnlocked
                      ? selectedBadgeData.badge.color
                      : '#E5E7EB',
                  }}
                >
                  <Text className="text-5xl">{selectedBadgeData.badge.icon}</Text>
                </View>

                {/* Badge Name */}
                <Text className="text-2xl font-bold text-foreground text-center mb-2">
                  {t(selectedBadgeData.badge.name)}
                </Text>

                {/* Status */}
                <View className="bg-surface rounded-lg p-3 mb-4 border border-primary">
                  <Text className="text-center font-semibold text-primary">
                    {selectedBadgeData.isUnlocked ? t('badges.unlockedBadge') : t('badges.locked')}
                  </Text>
                </View>

                {/* Description */}
                <Text className="text-foreground mb-4 text-center">
                  {t(selectedBadgeData.badge.description)}
                </Text>

                {/* Requirement */}
                <View className="bg-background rounded-lg p-3 mb-4 border border-border">
                  <Text className="text-xs text-muted mb-1">{t('badges.requirement')}</Text>
                  <Text className="text-foreground font-semibold">
                    {t(selectedBadgeData.badge.requirement)}
                  </Text>
                </View>

                {/* Progress */}
                {!selectedBadgeData.isUnlocked && (
                  <View className="mb-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-sm text-muted">{t('badges.progress')}</Text>
                      <Text className="text-sm font-semibold text-primary">
                        {selectedBadgeData.progress.current}/{selectedBadgeData.progress.target}
                      </Text>
                    </View>
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${selectedBadgeData.progress.percentage}%` }}
                      />
                    </View>
                  </View>
                )}

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="bg-surface rounded-lg py-3 border border-border"
                >
                  <Text className="text-center text-foreground font-semibold">{t('common.close')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
