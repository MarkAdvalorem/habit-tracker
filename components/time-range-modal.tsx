import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimePicker } from './time-picker';
import { useTranslation } from '@/hooks/use-translation';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';

interface TimeRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialStartTime?: string;
  initialEndTime?: string;
}

export function TimeRangeModal({ visible, onClose, onConfirm, initialStartTime = '09:00', initialEndTime = '10:00' }: TimeRangeModalProps) {
  const t = useTranslation();
  const colors = useColors();
  
  const parseTime = (time: string): [number, number] => {
    const [h, m] = time.split(':').map(Number);
    return [h || 9, m || 0];
  };

  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);

  useEffect(() => {
    if (visible) {
      const [sh, sm] = parseTime(initialStartTime);
      const [eh, em] = parseTime(initialEndTime);
      setStartHour(sh);
      setStartMinute(sm);
      setEndHour(eh);
      setEndMinute(em);
    }
  }, [visible, initialStartTime, initialEndTime]);

  const handleConfirm = () => {
    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (startTotal >= endTotal) {
      return;
    }
    onConfirm(startTime, endTime);
  };

  const isInvalid = startHour * 60 + startMinute >= endHour * 60 + endMinute;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <MaterialIcons name="access-time" size={32} color={colors.primary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground, textAlign: 'center' }}>{t('addHabit.selectTimeRange')}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
            {/* Start Time */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600', textAlign: 'center' }}>
                {t('addHabit.startTimeLabel')}
              </Text>
              <View>
                <TimePicker
                  hour={startHour}
                  minute={startMinute}
                  onTimeChange={(h, m) => {
                    setStartHour(h);
                    setStartMinute(m);
                  }}
                  showLabels={false}
                />
              </View>
            </View>

            {/* End Time */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: '600', textAlign: 'center' }}>
                {t('addHabit.endTimeLabel')}
              </Text>
              <View>
                <TimePicker
                  hour={endHour}
                  minute={endMinute}
                  onTimeChange={(h, m) => {
                    setEndHour(h);
                    setEndMinute(m);
                  }}
                  showLabels={false}
                />
              </View>
            </View>
          </View>

          {/* Display Selected Range */}
          <View style={{ backgroundColor: isInvalid ? '#FEF2F2' : colors.primary + '1A', borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: isInvalid ? '#EF4444' : colors.primary, marginBottom: 24 }}>
            <Text style={{ fontSize: 12, color: isInvalid ? '#EF4444' : colors.muted, marginBottom: 4 }}>{t('addHabit.selectedRange')}</Text>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: isInvalid ? '#EF4444' : colors.primary }}>
              {String(startHour).padStart(2, '0')}:{String(startMinute).padStart(2, '0')} - {' '}
              {String(endHour).padStart(2, '0')}:{String(endMinute).padStart(2, '0')}
            </Text>
            {isInvalid && (
              <Text style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{t('addHabit.endTimeError')}</Text>
            )}
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            >
              <Text style={{ color: colors.foreground, fontWeight: '600' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isInvalid}
              style={[styles.button, { backgroundColor: isInvalid ? '#9CA3AF' : colors.primary }]}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>{t('addHabit.confirmTime')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
