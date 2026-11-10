import React, { ScrollView, Text, View, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useHabits } from '@/lib/habit-context';
import { useTranslation } from '@/hooks/use-translation';
import { Habit } from '@/lib/types';
import { CalendarGridAdvanced } from '@/components/calendar-grid-advanced';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

const MOOD_EMOJIS = ['😞', '😐', '🙂', '😊', '😄'];
const MOOD_STORAGE_PREFIX = 'mood:';

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, deleteHabit, archiveHabit, getHabitStats, toggleHabitCompletion, updateCompletionNote } = useHabits();
  const t = useTranslation();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDateForNote, setSelectedDateForNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (id) {
      const found = habits.find((h) => h.id === id);
      setHabit(found || null);
    }
  }, [id, habits]);

  const handleEdit = () => {
    router.push(`/add-habit?habitId=${id}` as any);
  };

  const handleArchive = () => {
    Alert.alert(
      t('habitDetail.archive'),
      t('habitDetail.confirmArchive'),
      [
        { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
        {
          text: t('habitDetail.archive'),
          onPress: async () => {
            if (id) {
              await archiveHabit(id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleToggleDate = async (date: number) => {
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);

    if (isCompleted) {
      setSelectedDateForNote(date);
      const existingNote = habit.completionNotes?.[String(date)] || '';
      if (existingNote.startsWith(MOOD_STORAGE_PREFIX)) {
        const parts = existingNote.split('|');
        const moodIndex = parseInt(parts[0].replace(MOOD_STORAGE_PREFIX, ''), 10);
        setSelectedMood(moodIndex);
        setNoteText(parts.slice(1).join('|'));
      } else {
        setSelectedMood(null);
        setNoteText(existingNote);
      }
    } else {
      await toggleHabitCompletion(habit.id, date);
      setSelectedDateForNote(date);
      setNoteText('');
      setSelectedMood(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleUnmarkDate = async () => {
    if (!habit || !selectedDateForNote) return;
    await toggleHabitCompletion(habit.id, selectedDateForNote);
    setSelectedDateForNote(null);
    setSelectedMood(null);
    setNoteText('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveNote = async () => {
    if (!habit || !selectedDateForNote) return;
    setIsSavingNote(true);
    try {
      let finalNote = noteText.trim();
      if (selectedMood !== null) {
        finalNote = `${MOOD_STORAGE_PREFIX}${selectedMood}|${finalNote}`;
      }
      await updateCompletionNote(habit.id, selectedDateForNote, finalNote);
      setSelectedDateForNote(null);
      setSelectedMood(null);
      setNoteText('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = () => {
    Alert.alert(
      t('habitDetail.deleteConfirm'),
      t('habitDetail.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), onPress: () => {}, style: 'cancel' },
        {
          text: t('habitDetail.delete'),
          onPress: async () => {
            if (id) {
              await deleteHabit(id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!habit) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">{t('habitDetail.notFound')}</Text>
      </ScreenContainer>
    );
  }

  const stats = getHabitStats(habit.id);
  const today = new Date().setHours(0, 0, 0, 0);
  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#0A7EA4" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">{t('habitDetail.detail')}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={handleEdit}>
              <MaterialIcons name="edit" size={24} color="#0A7EA4" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleArchive}>
              <MaterialIcons name="archive" size={24} color="#F59E0B" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <MaterialIcons name="delete" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Habit Card */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <View className="flex-row items-center gap-4 mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: habit.color }}
            >
              <MaterialIcons name={habit.icon as any} size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{habit.name}</Text>
              {habit.description && (
                <Text className="text-sm text-muted mt-1">{habit.description}</Text>
              )}
            </View>
          </View>

          {isCompletedToday && (
            <View className="bg-success bg-opacity-10 border border-success rounded-lg p-3 mt-4">
              <Text className="font-semibold" style={{ color: 'white' }}>
                {t('habitDetail.completedToday')}
              </Text>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-2">{t('habitDetail.statistics')}</Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                     <Text className="text-sm text-muted">{t('habitDetail.currentStreak')}</Text>
                <Text className="text-3xl font-bold text-primary">{stats.currentStreak}</Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
                <Text className="text-sm text-muted">{t('habitDetail.bestStreak')}</Text>
                <Text className="text-3xl font-bold text-primary">{stats.bestStreak}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Calendar */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('habitDetail.calendar')}</Text>
          <CalendarGridAdvanced
            completedDates={habit.completedDates}
            month={currentMonth}
            year={currentYear}
            onDatePress={handleToggleDate}
            onMonthChange={handleMonthChange}
          />
        </View>

        {/* Note Editor */}
        {selectedDateForNote && (
          <View className="mb-6 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-2">
              {t('habitDetail.noteFor')} {new Date(selectedDateForNote).toLocaleDateString(t('statistics.month') === 'Mois' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' })}
            </Text>

            {/* Mood Selector */}
            <View className="flex-row justify-between mb-3">
              {MOOD_EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedMood(index);
                    Haptics.selectionAsync();
                  }}
                  className="items-center flex-1 py-2"
                >
                  <Text
                    style={{
                      fontSize: selectedMood === index ? 36 : 28,
                      opacity: selectedMood === index ? 1 : 0.5,
                    }}
                  >
                    {emoji}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder={t('habitDetail.notePlaceholder')}
              placeholderTextColor="#9BA1A6"
              multiline
              numberOfLines={3}
              className="bg-surface border border-border rounded-lg p-3 text-foreground mb-3"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleUnmarkDate}
                className="flex-1 bg-error border border-error rounded-lg py-2"
              >
                <Text className="text-center text-white font-medium">{t('habitDetail.unmark')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDateForNote(null);
                  setSelectedMood(null);
                  setNoteText('');
                }}
                className="flex-1 bg-surface border border-border rounded-lg py-2"
              >
                <Text className="text-center text-foreground font-medium">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveNote}
                disabled={isSavingNote}
                className="flex-1 bg-primary rounded-lg py-2"
              >
                {isSavingNote ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center text-white font-medium">{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Information */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('habitDetail.information')}</Text>
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted">{t('habitDetail.category')}</Text>
              <Text className="text-foreground font-semibold capitalize">{t(`categories.${habit.category}`)}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-muted">{t('habitDetail.frequency')}</Text>
              <Text className="text-foreground font-semibold capitalize">{t(`frequencies.${habit.frequency}`)}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-muted">{t('habitDetail.totalCompleted')}</Text>
              <Text className="text-foreground font-semibold">{stats.totalCompleted} {t('habitDetail.days')}</Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row justify-between">
              <Text className="text-muted">{t('habitDetail.timeRange')}</Text>
              {habit.habitStartTime && habit.habitEndTime ? (
                <Text className="text-foreground font-semibold">{habit.habitStartTime} - {habit.habitEndTime}</Text>
              ) : (
                <Text className="text-muted font-semibold">{t('habitDetail.notSet')}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
