import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

interface TimePickerProps {
  hour: number;
  minute: number;
  onTimeChange: (hour: number, minute: number) => void;
  title?: string;
  showLabels?: boolean;
}

const itemHeight = 50;
const visibleItems = 3;
const listHeight = itemHeight * visibleItems;

export function TimePicker({ hour, minute, onTimeChange }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);

  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const snapTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Re-align to the nearest item once scrolling stops (web has no native snapping)
  const snapWhenIdle = (key: string, ref: React.RefObject<FlatList | null>, offsetY: number) => {
    clearTimeout(snapTimers.current[key]);
    snapTimers.current[key] = setTimeout(() => {
      const target = Math.round(offsetY / itemHeight) * itemHeight;
      if (target !== offsetY) ref.current?.scrollToOffset({ offset: target, animated: true });
    }, 120);
  };

  // Scroll to initial value on mount
  useEffect(() => {
    setTimeout(() => {
      hourListRef.current?.scrollToIndex({ index: hour, animated: false });
      minuteListRef.current?.scrollToIndex({ index: minute, animated: false });
    }, 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleHourScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    snapWhenIdle('h', hourListRef, offsetY);
    const index = Math.round(offsetY / itemHeight);
    if (index >= 0 && index < 24 && index !== selectedHour) {
      setSelectedHour(index);
      onTimeChange(index, selectedMinute);
    }
  };

  const handleMinuteScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    snapWhenIdle('m', minuteListRef, offsetY);
    const index = Math.round(offsetY / itemHeight);
    if (index >= 0 && index < 60 && index !== selectedMinute) {
      setSelectedMinute(index);
      onTimeChange(selectedHour, index);
    }
  };

  const scrollToHour = (h: number) => {
    hourListRef.current?.scrollToIndex({ index: h, animated: true });
    setSelectedHour(h);
    onTimeChange(h, selectedMinute);
  };

  const scrollToMinute = (m: number) => {
    minuteListRef.current?.scrollToIndex({ index: m, animated: true });
    setSelectedMinute(m);
    onTimeChange(selectedHour, m);
  };

  const renderItem = (item: number, isSelected: boolean, type: 'hour' | 'minute') => (
    <TouchableOpacity
      key={item}
      style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}
      activeOpacity={0.7}
      onPress={() => {
        if (type === 'hour') {
          scrollToHour(item);
        } else {
          scrollToMinute(item);
        }
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: isSelected ? 'bold' : 'normal',
          color: isSelected ? '#0A7EA4' : '#9BA1A6',
        }}
      >
        {String(item).padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

  return (
    <View
      style={{
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#333',
      }}
    >
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
        {/* Hour Picker */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ height: listHeight }}>
            <FlatList
              ref={hourListRef}
              data={hours}
              renderItem={({ item }) => renderItem(item, item === selectedHour, 'hour')}
              keyExtractor={(i) => `h-${i}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={itemHeight}
              decelerationRate="fast"
              onScroll={handleHourScroll}
              scrollEventThrottle={16}
              getItemLayout={getItemLayout}
              initialScrollIndex={hour}
              contentContainerStyle={{
                paddingVertical: itemHeight,
              }}
              style={{ width: 64 }}
            />
          </View>
        </View>

        {/* Separator */}
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' }}>:</Text>

        {/* Minute Picker */}
        <View style={{ alignItems: 'center' }}>
          <View style={{ height: listHeight }}>
            <FlatList
              ref={minuteListRef}
              data={minutes}
              renderItem={({ item }) => renderItem(item, item === selectedMinute, 'minute')}
              keyExtractor={(i) => `m-${i}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={itemHeight}
              decelerationRate="fast"
              onScroll={handleMinuteScroll}
              scrollEventThrottle={16}
              getItemLayout={getItemLayout}
              initialScrollIndex={minute}
              contentContainerStyle={{
                paddingVertical: itemHeight,
              }}
              style={{ width: 64 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
