import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NavigationProp } from '@react-navigation/native';
import { getAllScheduledNotificationsAsync } from 'expo-notifications';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  NotificationSettings as Settings 
} from '../services/NotificationService';

// Use proper navigation type instead of any
export default function NotificationSettings({ navigation }: Readonly<{ navigation: NavigationProp<any> }>) {
  const [settings, setSettings] = useState<Settings>({
    fastEndEnabled: true,
    dailyReminderEnabled: false,
    dailyReminderTime: '20:00',
  });
  const [loading, setLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedSettings = await getNotificationSettings();
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggle = async (setting: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
  };

  // Use proper event type instead of any
  const handleTimeChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      const newSettings = { ...settings, dailyReminderTime: timeString };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);
    }
  };

  // Web platform time selection handler
  const handleWebTimeChange = (value: Date) => {
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const newSettings = { ...settings, dailyReminderTime: timeString };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    setShowTimePicker(false);
  };

  // Parse time string to Date object for the time picker
  const timeDate = new Date();
  const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);
  timeDate.setHours(hours);
  timeDate.setMinutes(minutes);

  // Render time picker based on platform
  const renderTimePicker = () => {
    if (Platform.OS === 'web') {
      if (!showTimePicker) return null;
      
      // For web, use react-datetime (imported in App.tsx)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Datetime = require('react-datetime').default;
      
      return (
        <div style={{
          position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, minWidth: 320 }}>
            <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 12 }}>
              Set Reminder Time
            </ThemedText>
            <Datetime
              value={timeDate}
              dateFormat={false}
              timeFormat="HH:mm"
              input={false}
              onChange={(date: unknown) => {
                // Type guard for Moment.js object
                function isMoment(obj: unknown): obj is { toDate: () => Date } {
                  return typeof obj === 'object' && obj !== null && 
                    typeof (obj as { toDate?: unknown }).toDate === 'function';
                }
                
                if (isMoment(date)) {
                  handleWebTimeChange(date.toDate());
                } else if (date instanceof Date) {
                  handleWebTimeChange(date);
                }
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
              <button
                onClick={() => setShowTimePicker(false)}
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
            </div>
          </div>
        </div>
      );
    } else {
      // Native platforms
      return showTimePicker && (
        <DateTimePicker
          value={timeDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      );
    }
  };

  const debugNotifications = async () => {
    if (Platform.OS === 'web') {
      alert('Notifications debugging not available on web');
      return;
    }
    
    try {
      const scheduledNotifications = await getAllScheduledNotificationsAsync();
      console.log('Currently scheduled notifications:', scheduledNotifications);
      
      if (scheduledNotifications.length === 0) {
        alert('No scheduled notifications found');
      } else {
        alert(`Found ${scheduledNotifications.length} scheduled notifications. See console for details.`);
      }
    } catch (error) {
      // Fix unknown error type issue
      if (error instanceof Error) {
        console.error('Error checking notifications:', error);
        alert(`Error checking notifications: ${error.message}`);
      } else {
        console.error('Unknown error checking notifications:', error);
        alert('Error checking notifications: Unknown error occurred');
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Show loading indicator if loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ThemedText style={styles.backButtonText}>← Back</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.title}>Notification Settings</ThemedText>
          </View>

          <View style={styles.content}>
            {/* Add information about time zones */}
            <View style={styles.infoCard}>
              <ThemedText style={styles.infoTitle}>⏰ About Notification Times</ThemedText>
              <ThemedText style={styles.infoText}>
                • Daily reminders are based on your device&apos;s local time zone
                • If you change time zones, your reminder time will adjust automatically
                • Fast completion notifications are based on exact elapsed time from when you started
              </ThemedText>
            </View>

            <View style={styles.settingRow}>
              <ThemedText style={styles.settingLabel}>Fast End Notifications</ThemedText>
              <Switch
                value={settings.fastEndEnabled}
                onValueChange={(value) => handleToggle('fastEndEnabled', value)}
              />
            </View>
            
            <View style={styles.settingRow}>
              <ThemedText style={styles.settingLabel}>Daily Reminders</ThemedText>
              <Switch
                value={settings.dailyReminderEnabled}
                onValueChange={(value) => handleToggle('dailyReminderEnabled', value)}
              />
            </View>
            
            {settings.dailyReminderEnabled && (
              <View style={styles.settingRow}>
                <ThemedText style={styles.settingLabel}>Reminder Time</ThemedText>
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <ThemedText style={styles.timeText}>{settings.dailyReminderTime}</ThemedText>
                </TouchableOpacity>
                
                {renderTimePicker()}
              </View>
            )}

            <TouchableOpacity 
              style={[styles.button, { marginTop: 20 }]} 
              onPress={debugNotifications}
            >
              <ThemedText style={styles.buttonText}>Debug Notifications</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 5,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    color: '#0a7ea4',
    padding: 8,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#f5f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});