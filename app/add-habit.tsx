import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useHabits } from '@/lib/habit-context';
import { useTranslation } from '@/hooks/use-translation';
import { HABIT_CATEGORIES, HABIT_FREQUENCIES, HABIT_ICONS, CATEGORY_DEFAULT_ICONS, HABIT_TEMPLATES, Habit, HabitCategory, HabitFrequency } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { TimeRangeModal } from '@/components/time-range-modal';

const COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#EF4444',
  '#F59E0B',
  '#06B6D4',
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { habitId } = useLocalSearchParams<{ habitId?: string }>();
  const { habits, addHabit, updateHabit } = useHabits();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health-sport');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState(CATEGORY_DEFAULT_ICONS['health-sport']);
  const [description, setDescription] = useState('');
  const [habitStartTime, setHabitStartTime] = useState('09:00');
  const [habitEndTime, setHabitEndTime] = useState('10:00');
  const [hasTime, setHasTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const t = useTranslation();
  
  useEffect(() => {
    if (habitId) {
      const habit = habits.find((h) => h.id === habitId);
      if (habit) {
        setEditingHabit(habit);
        setName(habit.name);
        setCategory(habit.category);
        setFrequency(habit.frequency);
        setColor(habit.color);
        setIcon(habit.icon || CATEGORY_DEFAULT_ICONS[habit.category]);
        setDescription(habit.description || '');
        setHabitStartTime(habit.habitStartTime || '09:00');
        setHabitEndTime(habit.habitEndTime || '10:00');
        setHasTime(!!habit.habitStartTime);
      }
    }
  }, [habitId, habits]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    // Check if start time is before end time
    const [startHour, startMin] = habitStartTime.split(':').map(Number);
    const [endHour, endMin] = habitEndTime.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    if (hasTime && startTotalMin >= endTotalMin) {
      newErrors.habitEndTime = 'L\'heure de fin doit être après l\'heure de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategoryChange = (newCategory: HabitCategory) => {
    setCategory(newCategory);
    if (!editingHabit) {
      setIcon(CATEGORY_DEFAULT_ICONS[newCategory]);
    }
  };

  const handleTemplateSelect = (template: (typeof HABIT_TEMPLATES)[0]) => {
    if (editingHabit) return;
    setSelectedTemplate(template.nameKey);
    setName(t(template.nameKey));
    setDescription(t(template.descriptionKey));
    setCategory(template.category);
    setFrequency(template.frequency);
    setIcon(template.icon);
    if (HABIT_CATEGORIES[template.category]) {
      setColor(HABIT_CATEGORIES[template.category].color);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, {
          name,
          category,
          frequency,
          color,
          description,
          icon,
          habitStartTime: hasTime ? habitStartTime : undefined,
          habitEndTime: hasTime ? habitEndTime : undefined,
        });
      } else {
        await addHabit({
          name,
          category,
          frequency,
          color,
          description,
          icon,
          habitStartTime: hasTime ? habitStartTime : undefined,
          habitEndTime: hasTime ? habitEndTime : undefined,
        });
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'habitude');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#0A7EA4" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">
            {editingHabit ? t('addHabit.editTitle') : t('addHabit.title')}
          </Text>
          <View className="w-6" />
        </View>

        {/* Required Fields Notice */}
        <View className="p-3 mb-6">
          <Text className="text-xs font-medium" style={{ color: 'white' }}>{t('addHabit.requiredFields')}</Text>
        </View>

        {/* Templates Section */}
        {!editingHabit && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">{t('templates.title')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {HABIT_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.nameKey;
                const catColor = HABIT_CATEGORIES[template.category]?.color || '#6B7280';
                return (
                  <TouchableOpacity
                    key={template.nameKey}
                    onPress={() => handleTemplateSelect(template)}
                    className="px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: isSelected ? catColor : 'transparent',
                      borderColor: isSelected ? catColor : '#374151',
                    }}
                  >
                    <Text
                      className="font-medium"
                      style={{ color: isSelected ? '#ffffff' : '#9CA3AF' }}
                    >
                      {t(template.nameKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">
            {t('addHabit.name')} <Text className="text-error">*</Text>
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (value.trim()) {
                setErrors({ ...errors, name: '' });
              }
            }}
            placeholder={t('addHabit.namePlaceholder')}
            placeholderTextColor="#9BA1A6"
            className={`bg-surface border rounded-lg p-4 text-foreground ${
              errors.name ? 'border-error' : 'border-border'
            }`}
          />
          {errors.name && <Text className="text-error text-xs mt-1">* {errors.name}</Text>}
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">{t('addHabit.description')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('addHabit.descriptionPlaceholder')}
            placeholderTextColor="#9BA1A6"
            multiline
            numberOfLines={3}
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
          />
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">{t('addHabit.category')} *</Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.entries(HABIT_CATEGORIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleCategoryChange(key as HabitCategory)}
                className={`px-4 py-2 rounded-full border ${
                  category === key
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`${
                    category === key ? 'text-white' : 'text-foreground'
                  } font-medium`}
                >
                  {t(value.translationKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">{t('addHabit.frequency')} *</Text>
          <View className="gap-2">
            {Object.entries(HABIT_FREQUENCIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setFrequency(key as HabitFrequency)}
                className={`p-3 rounded-lg border ${
                  frequency === key
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`${
                    frequency === key ? 'text-white' : 'text-foreground'
                  } font-medium`}
                >
                  {t(value)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">{t('addHabit.color')} *</Text>
          <View className="flex-row flex-wrap gap-3">
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                className="w-12 h-12 rounded-full border-2"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? '#0A7EA4' : 'transparent',
                  borderWidth: color === c ? 3 : 0,
                }}
              />
            ))}
          </View>
        </View>

        {/* Icon Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">{t('addHabit.icon')} *</Text>
          <View className="flex-row flex-wrap gap-2">
            {HABIT_ICONS.map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIcon(i)}
                className={`w-12 h-12 rounded-lg items-center justify-center border-2 ${
                  icon === i ? 'bg-primary border-primary' : 'border-border bg-surface'
                }`}
              >
                <MaterialIcons name={i as any} size={24} color={icon === i ? '#ffffff' : '#9BA1A6'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Habit Time Selection */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={() => setHasTime(!hasTime)}
            accessibilityRole="switch"
            accessibilityState={{ checked: hasTime }}
            className="bg-surface rounded-lg p-4 border border-border mb-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-semibold flex-1">{t('addHabit.habitTimeRange')}</Text>
              <View className={`w-12 h-7 rounded-full justify-center px-1 ${hasTime ? 'bg-success' : 'bg-border'}`}>
                <View
                  className="w-5 h-5 rounded-full bg-white"
                  style={{ transform: [{ translateX: hasTime ? 20 : 0 }] }}
                />
              </View>
            </View>
          </TouchableOpacity>
          {hasTime && (<>
          <TouchableOpacity
            onPress={() => setShowTimeModal(true)}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <Text className="text-foreground text-lg font-semibold text-center">
              {habitStartTime} - {habitEndTime}
            </Text>
            <Text className="text-xs text-muted text-center mt-1">{t('addHabit.tapToChange')}</Text>
          </TouchableOpacity>
          <Text className="text-xs text-muted mt-2">
            {t('addHabit.reminderInfo')}
          </Text>
          </>)}

          {/* Time Range Modal */}
          <TimeRangeModal
            visible={showTimeModal}
            onClose={() => setShowTimeModal(false)}
            onConfirm={(start, end) => {
              setHabitStartTime(start);
              setHabitEndTime(end);
              setShowTimeModal(false);
            }}
            initialStartTime={habitStartTime}
            initialEndTime={habitEndTime}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-surface border border-border rounded-lg py-3"
        >
          <Text className="text-center text-foreground font-semibold">Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          className="flex-1 bg-primary rounded-lg py-3"
        >
          <Text className="text-center text-white font-semibold">
            {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
