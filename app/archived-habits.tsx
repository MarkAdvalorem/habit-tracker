import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useHabits } from '@/lib/habit-context';
import { useTranslation } from '@/hooks/use-translation';
import { Habit } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

type ArchivedHabit = Habit;

export default function ArchivedHabitsScreen() {
  const router = useRouter();
  const t = useTranslation();
  const { archivedHabits, restoreHabit, deleteHabit } = useHabits();

  const handleRestore = async (habit: ArchivedHabit) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await restoreHabit(habit.id);
  };

  const handleDelete = async (habit: ArchivedHabit) => {
    Alert.alert(
      t('habitDetail.deleteConfirm'),
      t('archived.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          onPress: async () => {
            await deleteHabit(habit.id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderHabit = ({ item }: { item: ArchivedHabit }) => (
    <View className="bg-surface rounded-2xl p-4 border border-border mb-3">
      <View className="flex-row items-center gap-3">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: item.color }}
        >
          <MaterialIcons name={item.icon as any} size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">{item.name}</Text>
          <Text className="text-xs text-muted">
            {t('archived.archivedOn')} {new Date(item.archivedAt!).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={() => handleRestore(item)}
          className="flex-1 bg-primary rounded-lg py-2"
        >
          <Text className="text-center text-white font-medium">{t('archived.restore')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          className="flex-1 bg-error rounded-lg py-2"
        >
          <Text className="text-center text-white font-medium">{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color="#0A7EA4" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">{t('archived.title')}</Text>
        </View>

        {archivedHabits.length === 0 ? (
          <View className="items-center py-12">
            <MaterialIcons name="archive" size={64} color="#9BA1A6" />
            <Text className="text-lg font-semibold text-foreground mt-4">{t('archived.noArchived')}</Text>
            <Text className="text-sm text-muted text-center mt-2">{t('archived.noArchivedDescription')}</Text>
          </View>
        ) : (
          <FlatList
            data={archivedHabits}
            renderItem={renderHabit}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
