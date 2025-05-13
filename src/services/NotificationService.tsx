import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
const { SchedulableTriggerInputTypes } = Notifications;

// Only set notification handler on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export interface NotificationSettings {
  fastEndEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  fastEndEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderTime: '20:00', 
};

export async function checkNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Notification permission status:', existingStatus);
    
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('New permission status:', status);
      return status === 'granted';
    }
    
    return existingStatus === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

export async function registerForPushNotificationsAsync() {
  // Only available on native platforms
  if (Platform.OS === 'web') return null;
  
  let token;
  
  // Setup notification channels for Android
  if (Platform.OS === 'android') {
    try {
      console.log('Setting up Android notification channels...');
      
      // Main default channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a7ea4',
      });
      
      // Daily reminders channel
      await Notifications.setNotificationChannelAsync('daily-reminders', {
        name: 'Daily Reminders',
        description: 'Notifications for your daily fasting schedule',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a7ea4',
      });
      
      // Fast completion channel
      await Notifications.setNotificationChannelAsync('fast-completion', {
        name: 'Fast Completion',
        description: 'Notifications when your fast is complete',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a7ea4',
      });
      
      console.log('Android notification channels setup complete');
    } catch (error) {
      console.error('Failed to set up notification channels:', error);
    }
  }

  const hasPermissions = await checkNotificationPermissions();
  if (!hasPermissions) {
    console.log('Notification permissions not granted');
    return null;
  }
  
  console.log('Notification permissions granted, ready to receive notifications');
  return token;
}

export async function scheduleEndOfFastNotification(targetEndTime: number) {
  // Only schedule notifications on native platforms
  if (Platform.OS === 'web') return null;
  
  console.log(`Attempting to schedule fast end notification for: ${new Date(targetEndTime)}`);
  
  const settings = await getNotificationSettings();
  if (!settings.fastEndEnabled) {
    console.log('Fast end notifications are disabled in settings');
    return null;
  }
  
  const hasPermissions = await checkNotificationPermissions();
  if (!hasPermissions) {
    console.log('Cannot schedule notification: permissions not granted');
    return null;
  }
  
  await cancelScheduledNotifications();
  
  if (targetEndTime <= Date.now()) {
    console.log("Target end time is in the past. Notification not scheduled.");
    return null;
  }

  const triggerConfig: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(targetEndTime),
  };
  
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Fast Complete! 🎉",
        body: "Congratulations! You've reached your fasting goal.",
        data: { type: 'fast_end' },
        badge: 1,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        ...triggerConfig,
        channelId: 'fast-completion',
      },
    });
    
    console.log(`Fast end notification scheduled successfully with ID: ${identifier}`);
    console.log(`Will trigger at: ${new Date(targetEndTime)}`);
    
    return identifier;
  } catch (error) {
    console.error('Failed to schedule fast end notification:', error);
    return null;
  }
}

export async function scheduleDailyReminder() {
  // Only schedule notifications on native platforms
  if (Platform.OS === 'web') return null;
  
  const settings = await getNotificationSettings();
  if (!settings.dailyReminderEnabled) {
    console.log('Daily reminders are disabled in settings');
    return null;
  }
  
  const hasPermissions = await checkNotificationPermissions();
  if (!hasPermissions) {
    console.log('Cannot schedule daily reminder: permissions not granted');
    return null;
  }
  
  const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);
  console.log(`Scheduling daily reminder for ${hours}:${minutes}`);
  
  const triggerConfig: Notifications.DailyTriggerInput = {
    type: SchedulableTriggerInputTypes.DAILY,
    hour: hours,
    minute: minutes,
    channelId: 'daily-reminders',
  };

  try {
    // Cancel any existing daily reminders before creating new ones
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const dailyReminders = scheduledNotifications.filter(
      notification => notification.content.data?.type === 'daily_reminder'
    );
    
    for (const reminder of dailyReminders) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Fast",
        body: "It's time to start your fasting period. Tap to open SimpleFast.",
        data: { type: 'daily_reminder' },
        badge: 1,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        ...triggerConfig,
        channelId: 'daily-reminders',
      },
    });
    
    console.log(`Daily reminder scheduled successfully with ID: ${identifier}`);
    console.log(`Will trigger daily at: ${hours}:${minutes}`);
    
    return identifier;
  } catch (error) {
    console.error('Failed to schedule daily reminder:', error);
    return null;
  }
}

export async function cancelScheduledNotifications() {
  // Only run on native platforms
  if (Platform.OS === 'web') {
    console.log('Notifications not available on web platform - skipping cancelAllScheduledNotificationsAsync');
    return;
  }
  
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  
  // Only schedule notifications on native platforms
  if (Platform.OS !== 'web' && settings.dailyReminderEnabled) {
    await scheduleDailyReminder();
  }
  
  return settings;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  if (!settingsJson) return DEFAULT_NOTIFICATION_SETTINGS;
  return JSON.parse(settingsJson) as NotificationSettings;
}