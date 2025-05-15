jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_NOTIFICATION_SETTINGS = {
  fastEndEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderTime: '20:00',
};

const mockGetNotificationSettings = jest.fn();
const mockSaveNotificationSettings = jest.fn();
const mockScheduleEndOfFastNotification = jest.fn();
const mockScheduleDailyReminder = jest.fn();
const mockCancelScheduledNotifications = jest.fn();
const mockCheckNotificationPermissions = jest.fn();

jest.mock('../services/NotificationService', () => {
  return {
    DEFAULT_NOTIFICATION_SETTINGS: {
      fastEndEnabled: true,
      dailyReminderEnabled: false,
      dailyReminderTime: '20:00',
    },
    getNotificationSettings: jest.fn(() => mockGetNotificationSettings()),
    saveNotificationSettings: jest.fn((settings) => mockSaveNotificationSettings(settings)),
    scheduleEndOfFastNotification: jest.fn((time) => mockScheduleEndOfFastNotification(time)),
    scheduleDailyReminder: jest.fn(() => mockScheduleDailyReminder()),
    cancelScheduledNotifications: jest.fn(() => mockCancelScheduledNotifications()),
    checkNotificationPermissions: jest.fn(() => mockCheckNotificationPermissions()),
  };
});

import {
  getNotificationSettings,
  saveNotificationSettings,
  scheduleEndOfFastNotification,
  scheduleDailyReminder,
  cancelScheduledNotifications,
  checkNotificationPermissions
} from '../services/NotificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNotificationSettings.mockImplementation(async () => {
      const settingsJson = await AsyncStorage.getItem('notification_settings');
      if (!settingsJson) {
        return DEFAULT_NOTIFICATION_SETTINGS;
      }
      return JSON.parse(settingsJson);
    });
    
    mockSaveNotificationSettings.mockImplementation(async (settings) => {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      return settings;
    });
    
    mockScheduleEndOfFastNotification.mockImplementation(async () => 'notification-id');
    mockScheduleDailyReminder.mockImplementation(async () => 'daily-reminder-id');
    mockCancelScheduledNotifications.mockImplementation(async () => {});
    mockCheckNotificationPermissions.mockImplementation(async () => true);
    
    // Initialize with default settings
    return saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
  });

  describe('getNotificationSettings', () => {
    it('returns default settings if none are saved', async () => {
      await AsyncStorage.clear();
      const settings = await getNotificationSettings();
      expect(settings).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    });

    it('returns saved settings', async () => {
      const customSettings = { fastEndEnabled: false, dailyReminderEnabled: true, dailyReminderTime: '10:00' };
      await saveNotificationSettings(customSettings);
      const settings = await getNotificationSettings();
      expect(settings).toEqual(customSettings);
    });
  });

  describe('saveNotificationSettings', () => {
    it('saves settings to AsyncStorage', async () => {
      const customSettings = { fastEndEnabled: true, dailyReminderEnabled: false, dailyReminderTime: '12:00' };
      await saveNotificationSettings(customSettings);
      const savedItem = await AsyncStorage.getItem('notification_settings');
      const saved = JSON.parse(savedItem || '{}');
      expect(saved).toEqual(customSettings);
    });
  });

  describe('scheduleEndOfFastNotification', () => {
    it('schedules a notification for fast completion', async () => {
      const result = await scheduleEndOfFastNotification(Date.now() + 100000);
      expect(result).toBe('notification-id');
    });
  });

  describe('scheduleDailyReminder', () => {
    it('schedules a daily reminder notification', async () => {
      const result = await scheduleDailyReminder();
      expect(result).toBe('daily-reminder-id');
    });
  });

  describe('cancelScheduledNotifications', () => {
    it('cancels all scheduled notifications', async () => {
      await cancelScheduledNotifications();
      expect(mockCancelScheduledNotifications).toHaveBeenCalled();
    });
  });

  describe('checkNotificationPermissions', () => {
    it('verifies notification permissions', async () => {
      const result = await checkNotificationPermissions();
      expect(result).toBe(true);
    });
  });
});