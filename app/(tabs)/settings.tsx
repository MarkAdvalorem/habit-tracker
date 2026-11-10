import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useHabits } from '@/lib/habit-context';
import { useThemeContext } from '@/lib/theme-provider';
import { useTranslation } from '@/hooks/use-translation';
import { useColors } from '@/hooks/use-colors';
import { useLanguageInit } from '@/lib/language-init-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Language } from '@/lib/types';
import Constants from 'expo-constants';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { exportToCSV, exportToHTML } from '@/lib/export-service';
import { scheduleVacationEndReminder, cancelVacationEndReminder } from '@/lib/notification-scheduler';
const { Paths, File } = FileSystem;

export default function SettingsScreen() {
  const router = useRouter();
  const { habits, updateSettings, settings, resetAllData } = useHabits();
  const { setColorScheme } = useThemeContext();
  const t = useTranslation();
  const colors = useColors();
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    settings.vacationMode?.endsAt ? new Date(settings.vacationMode.endsAt) : null
  );




  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    try {
      if (theme !== 'auto') {
        setColorScheme(theme as 'light' | 'dark');
      }
      await updateSettings({ theme });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('[Settings] Error changing theme:', error);
    }
  };

  const { setLanguage: setAppLanguage, languageValue } = useLanguageInit();

  const LANG_FLAGS: Record<string, string> = {
    fr: '🇫🇷', en: '🇬🇧', it: '🇮🇹', de: '🇩🇪', ru: '🇷🇺', es: '🇪🇸',
  };

  const isLangActive = (lang: string) => {
    const effective = languageValue || settings.language || 'fr';
    return effective === lang;
  };

  const handleLanguageChange = async (language: Language) => {
    try {
      await updateSettings({ language });
      await setAppLanguage(language);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('[Settings] Error changing language:', error);
      Alert.alert(t('common.error'), t('settings.languageChangeError'));
    }
  };

  const handleResetData = () => {
    Alert.alert(
      t('settings.resetConfirmTitle'),
      t('settings.resetConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(t('settings.resetSuccess'));
            } catch (error) {
              console.error('[Settings] Error resetting data:', error);
              Alert.alert(t('common.error'), t('settings.resetDataError'));
            }
          },
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    if (habits.length === 0) return;
    setIsExporting(true);
    try {
      const csv = exportToCSV(habits, settings.language);
      const file = new File(Paths.document, 'habit-tracker-export.csv');
      const writer = file.writableStream().getWriter();
      await writer.write(new TextEncoder().encode(csv));
      await writer.close();
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: t('export.exportCSV'), UTI: 'public.comma-separated-values-text' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowExportModal(false);
    } catch (error) {
      console.error('[Settings] Export CSV error:', error);
      Alert.alert(t('common.error'), t('export.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (habits.length === 0) return;
    setIsExporting(true);
    try {
      const html = exportToHTML(habits, settings.language);
      const { uri } = await Print.printToFileAsync({ html, width: 800 });
      const dateStr = new Date().toISOString().split('T')[0];
      const pdfFile = new File(Paths.document, `habit-tracker-${dateStr}.pdf`);
      const pdfWriter = pdfFile.writableStream().getWriter();
      const sourceFile = new File(uri);
      const data = await sourceFile.arrayBuffer();
      await pdfWriter.write(new Uint8Array(data));
      await pdfWriter.close();
      await Sharing.shareAsync(pdfFile.uri, { mimeType: 'application/pdf', dialogTitle: t('export.exportPDF'), UTI: 'com.adobe.pdf' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowExportModal(false);
    } catch (error) {
      console.error('[Settings] Export PDF error:', error);
      Alert.alert(t('common.error'), t('export.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleVacationToggle = async (enabled: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (enabled) {
      setShowVacationModal(true);
      setSelectedEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days from now
    } else {
      await updateSettings({ vacationMode: { enabled: false } });
      await cancelVacationEndReminder();
    }
  };

  const handleVacationConfirm = async () => {
    const endsAt = selectedEndDate ? selectedEndDate.getTime() : undefined;
    await updateSettings({
      vacationMode: {
        enabled: true,
        endsAt,
      },
    });
    if (endsAt) {
      await scheduleVacationEndReminder(endsAt, settings.language);
    }
    setShowVacationModal(false);
  };

  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', it: 'it-IT', de: 'de-DE', ru: 'ru-RU', es: 'es-ES' };
  const getLocale = () => localeMap[settings.language] || 'en-US';

  const getVacationEndDateString = () => {
    if (!settings.vacationMode?.endsAt) return '';
    const date = new Date(settings.vacationMode.endsAt);
    return date.toLocaleDateString(getLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const addDays = (base: Date, days: number) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <Text className="text-4xl font-bold text-foreground mb-6">{t('settings.title')}</Text>

        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('settings.notifications')}</Text>

          {/* Info about habit-specific times */}
          <View className={`bg-primary bg-opacity-10 border rounded-lg p-4`} style={{ borderColor: colors.primary }}>
            <Text className="font-semibold mb-2" style={{ color: '#ffffff' }}>{t('settings.remindersEnabled')}</Text>
            <Text className="text-sm" style={{ color: '#ffffff' }}>
              {t('settings.remindersEnabledDescription')}
            </Text>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('settings.appearance')}</Text>

          {/* Theme */}
          <View className="bg-surface rounded-lg p-4 border border-border mb-3">
            <Text className="text-foreground font-semibold mb-3">{t('settings.theme')}</Text>
            <View className="flex-row gap-2">
              {(['light', 'dark', 'auto'] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  onPress={() => handleThemeChange(theme)}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    settings.theme === theme
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
                  }`}
                >
                  <Text
                    className={`text-center font-semibold capitalize ${
                      settings.theme === theme ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {theme === 'light' ? t('settings.light') : theme === 'dark' ? t('settings.dark') : "auto"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-foreground font-semibold mb-3">{t('settings.language')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {(['fr', 'en', 'it', 'de', 'ru', 'es'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => handleLanguageChange(lang)}
                  className={`py-2 px-3 rounded-lg border ${
                    isLangActive(lang)
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border'
                  }`}
                  style={{ minWidth: '30%' as any, flex: 1 }}
                >
                  <Text
                    className={`text-center font-semibold ${
                      isLangActive(lang) ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {LANG_FLAGS[lang]}{' '}
                    {lang === 'fr' ? t('settings.french')
                      : lang === 'en' ? t('settings.english')
                      : lang === 'it' ? t('settings.italian')
                      : lang === 'de' ? t('settings.german')
                      : lang === 'ru' ? t('settings.russian')
                      : t('settings.spanish')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Vacation Mode Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('vacation.title')}</Text>

          <TouchableOpacity
            onPress={() => handleVacationToggle(!settings.vacationMode?.enabled)}
            className="bg-surface rounded-lg p-4 border border-border"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-semibold">{t('vacation.enabled')}</Text>
                <Text className="text-sm text-muted mt-1">{t('vacation.description')}</Text>
                {settings.vacationMode?.enabled && settings.vacationMode?.endsAt && (
                  <Text className="text-xs mt-1" style={{ color: colors.warning }}>
                    {t('vacation.ends', { date: getVacationEndDateString() })}
                  </Text>
                )}
              </View>
              <View className={`w-12 h-7 rounded-full justify-center px-1 ${settings.vacationMode?.enabled ? 'bg-success' : 'bg-border'}`}>
                <View
                  className="w-5 h-5 rounded-full bg-white"
                  style={{
                    transform: [{ translateX: settings.vacationMode?.enabled ? 20 : 0 }],
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Data Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('settings.data')}</Text>

          {/* Statistics */}
          <View className="bg-surface rounded-lg p-4 border border-border mb-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-foreground font-semibold">{t('statistics.habits')}</Text>
                <Text className="text-sm text-muted mt-1">{habits.length} {habits.length > 1 ? t('settings.habitsCount') : t('settings.habitCount')}</Text>
              </View>
              <MaterialIcons name="info" size={24} color="#0A7EA4" />
            </View>
          </View>

          {/* Archived Habits */}
          <TouchableOpacity
            onPress={() => router.push('/archived-habits' as any)}
            className="bg-surface rounded-lg p-4 border border-border mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-foreground font-semibold">{t('archived.title')}</Text>
                <Text className="text-sm text-muted mt-1">{t('settings.viewArchived')}</Text>
              </View>
              <MaterialIcons name="archive" size={24} color="#0A7EA4" />
            </View>
          </TouchableOpacity>

          {/* Export Data */}
          <TouchableOpacity
            onPress={() => {
              setShowExportModal(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className="bg-surface rounded-lg p-4 border border-border mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-foreground font-semibold">{t('export.title')}</Text>
                <Text className="text-sm text-muted mt-1">{t('export.description')}</Text>
              </View>
              <MaterialIcons name="download" size={24} color="#0A7EA4" />
            </View>
          </TouchableOpacity>

          {/* Reset Data */}
          <TouchableOpacity
            onPress={handleResetData}
            className="bg-error rounded-lg p-4 mb-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">{t('settings.resetData')}</Text>
              <MaterialIcons name="delete" size={24} color="white" />
            </View>
          </TouchableOpacity>

        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">{t('settings.about')}</Text>

          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-foreground font-semibold text-lg mb-1">Habit Tracker</Text>
            <Text className="text-sm text-muted mb-3">{t('settings.version')} {Constants.expoConfig?.version || '1.0.0'}</Text>
            <Text className="text-sm text-foreground mb-2">{t('settings.aboutDescription')}</Text>
            <Text className="text-xs text-muted">{t('settings.aboutTechStack')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.primary + '1A' }}>
                <MaterialIcons name="download" size={32} color={colors.primary} />
              </View>
              <Text className="text-xl font-bold text-foreground text-center">{t('export.title')}</Text>
            </View>

            <Text className="text-sm text-muted text-center mb-6">{t('export.description')}</Text>

            <TouchableOpacity
              onPress={handleExportCSV}
              disabled={isExporting || habits.length === 0}
              className="w-full py-3 rounded-lg border border-border items-center mb-3"
              style={{ opacity: habits.length === 0 ? 0.5 : 1 }}
            >
              {isExporting ? (
                <ActivityIndicator color="#0A7EA4" size="small" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="insert-drive-file" size={20} color="#0A7EA4" />
                  <Text className="text-primary font-semibold">{t('export.exportCSV')}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportPDF}
              disabled={isExporting || habits.length === 0}
              className="w-full py-3 rounded-lg border border-border items-center"
              style={{ opacity: habits.length === 0 ? 0.5 : 1 }}
            >
              {isExporting ? (
                <ActivityIndicator color="#0A7EA4" size="small" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="picture-as-pdf" size={20} color="#EF4444" />
                  <Text className="text-error font-semibold">{t('export.exportPDF')}</Text>
                </View>
              )}
            </TouchableOpacity>

            {habits.length === 0 && (
              <Text className="text-xs text-muted text-center mt-3">{t('export.noData')}</Text>
            )}

            <TouchableOpacity
              onPress={() => setShowExportModal(false)}
              disabled={isExporting}
              className="w-full py-3 rounded-lg items-center mt-4"
            >
              <Text className="text-muted font-semibold">{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vacation Mode Modal */}
      <Modal
        visible={showVacationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVacationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-3" style={{ backgroundColor: colors.warning + '1A' }}>
                <MaterialIcons name="beach-access" size={32} color={colors.warning} />
              </View>
              <Text className="text-xl font-bold text-foreground text-center">{t('vacation.title')}</Text>
            </View>

            <Text className="text-sm text-muted text-center mb-6">{t('vacation.selectEndDate')}</Text>

            {/* Date Selection */}
            <View className="flex-row justify-center gap-3 mb-6">
              {[1, 3, 7, 14, 30].map((days) => {
                const date = addDays(new Date(), days);
                const isSelected = selectedEndDate?.toDateString() === date.toDateString();
                return (
                  <TouchableOpacity
                    key={days}
                    onPress={() => setSelectedEndDate(date)}
                    className={`px-3 py-2 rounded-lg border ${
                      isSelected ? 'bg-warning border-warning' : 'bg-background border-border'
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold text-xs ${
                        isSelected ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      +{days}j
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedEndDate && (
              <Text className="text-sm text-foreground text-center mb-4">
                {t('vacation.ends', {
                  date: selectedEndDate.toLocaleDateString(getLocale(), {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                })}
              </Text>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowVacationModal(false)}
                className="flex-1 py-3 rounded-lg border border-border items-center"
              >
                <Text className="text-foreground font-semibold">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVacationConfirm}
                className="flex-1 py-3 rounded-lg items-center"
                style={{ backgroundColor: colors.warning }}
              >
                <Text className="text-white font-semibold">{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
