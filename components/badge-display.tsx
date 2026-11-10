import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Badge, BADGES, BadgeType } from '@/lib/badges';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/hooks/use-translation';
import { MaterialIcons } from '@expo/vector-icons';

interface BadgeDisplayProps {
  unlockedBadges: BadgeType[];
  onBadgePress?: (badge: Badge) => void;
}

export function BadgeDisplay({ unlockedBadges, onBadgePress }: BadgeDisplayProps) {
  const colors = useColors();
  const t = useTranslation();

  const badges = unlockedBadges.map((id) => BADGES[id]).filter((b) => b !== undefined);

  if (badges.length === 0) {
    return (
      <View className="bg-surface rounded-2xl p-6 border border-border items-center justify-center py-8">
        <MaterialIcons name="emoji-events" size={48} color={colors.muted} />
        <Text className="text-foreground font-semibold mt-3 mb-1">{t('badges.noBadges')}</Text>
        <Text className="text-sm text-muted text-center">
          {t('badges.noBadgesDescription')}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-foreground mb-4">{t('badges.yourBadges')}</Text>
      <FlatList
        data={badges}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onBadgePress?.(item)}
            className="bg-surface rounded-lg p-4 border border-border mb-3 flex-row items-center gap-4"
          >
            {/* Badge Icon */}
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: item.color }}
            >
              <Text className="text-3xl">{item.icon}</Text>
            </View>

            {/* Badge Info */}
            <View className="flex-1">
              <Text className="text-foreground font-bold">{t(item.name)}</Text>
              <Text className="text-sm text-muted mt-1">{t(item.description)}</Text>
            </View>

            {/* Arrow */}
            <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
          </TouchableOpacity>
        )}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
