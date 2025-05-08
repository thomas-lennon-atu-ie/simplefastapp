import React, { useState, useEffect } from 'react';
import { Modal, View, Button, Platform, StyleSheet } from 'react-native';

import { ThemedText } from './ThemedText';

type Props = {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onCancel: () => void;
  minDate?: Date;
  maxDate?: Date;
  title?: string; // <-- Add this
};

export function DateTimePickerModal({
  visible,
  value,
  onChange,
  onCancel,
  minDate,
  maxDate,
  title,
}: Readonly<Props>) {
  const [internalValue, setInternalValue] = useState<Date>(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value, visible]);

  if (!visible) return null;

  if (Platform.OS === 'web') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Datetime = require('react-datetime').default;
    return (
      <div style={{
        position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 320 }}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 12 }}>
            {title ?? 'Select Date & Time'}
          </ThemedText>
          <Datetime
            value={internalValue}
            onChange={(date: unknown) => {
              // Type guard for Moment.js object
              function isMoment(obj: unknown): obj is { toDate: () => Date } {
                return typeof obj === 'object' && obj !== null && typeof (obj as { toDate?: unknown }).toDate === 'function';
              }
              if (isMoment(date)) {
                setInternalValue(date.toDate());
              } else if (date instanceof Date) {
                setInternalValue(date);
              }
            }}
            input={false}
            closeOnSelect={false}
            isValidDate={(current: Date) => {
              const now = new Date();
              if (maxDate && current > maxDate) return false;
              if (minDate && current < minDate) return false;
              return current <= now;
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <button
              onClick={onCancel}
              style={{
                background: '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onChange(internalValue)}
              style={{
                background: '#0a7ea4',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer'
              }}
              disabled={
                (maxDate && internalValue > maxDate) ||
                (minDate && internalValue < minDate) ||
                internalValue > new Date()
              }
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/iOS
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DateTimePicker = require('@react-native-community/datetimepicker').default;
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <DateTimePicker
            value={internalValue}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_event: unknown, selectedDate?: Date) => {
              if (selectedDate) setInternalValue(selectedDate);
            }}
            maximumDate={maxDate && maxDate < new Date() ? maxDate : new Date()}
            minimumDate={minDate}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button title="Cancel" onPress={onCancel} />
            <Button
              title="Confirm"
              onPress={() => onChange(internalValue)}
              disabled={
                (maxDate && internalValue > maxDate) ||
                (minDate && internalValue < minDate) ||
                internalValue > new Date()
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0008',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 24,
    borderRadius: 12,
    padding: 16,
  },
});