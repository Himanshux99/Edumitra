import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  Notification,
  NotificationPreferences,
  SmartNudge,
  Reminder,
  NotificationSummary,
  NotificationType,
  NotificationCategory,
  NotificationPriority
} from '../types/notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private userId: string = 'demo_user'; // In production, get from auth
  private pushToken: string | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      await this.requestPermissions();
      
      // Get push token
      await this.registerForPushNotifications();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      // Load user preferences
      await this.loadUserPreferences();
      
      this.isInitialized = true;
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      console.log('Checking notification permissions...');

      // Check current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Current permission status:', existingStatus);

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');

        // Request permissions from user
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
            allowAnnouncements: false,
          },
        });

        finalStatus = status;
        console.log('Permission request result:', finalStatus);
      }

      if (finalStatus === 'granted') {
        console.log('✅ Notification permissions granted!');
        return true;
      } else {
        console.warn('⚠️ Notification permissions not granted:', finalStatus);

        // On web, we can still try to send notifications
        if (Platform.OS === 'web') {
          console.log('Running on web - will attempt to show notifications anyway');
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);

      // On web, allow testing even if permissions fail
      if (Platform.OS === 'web') {
        console.log('Web platform - allowing notifications for testing');
        return true;
      }

      return false;
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    try {
      // Try to get push token, but don't fail if it doesn't work on web
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        this.pushToken = token.data;
        console.log('Push token:', this.pushToken);

        // Store token for backend registration
        await AsyncStorage.setItem('pushToken', this.pushToken);

        return this.pushToken;
      } else {
        // For web/simulator, create a mock token
        this.pushToken = 'web_mock_token_' + Date.now();
        console.log('Mock push token for web:', this.pushToken);
        return this.pushToken;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      // Create fallback token for testing
      this.pushToken = 'fallback_token_' + Date.now();
      return this.pushToken;
    }
  }

  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived);
    
    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
  }

  private handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log('Notification received:', notification);
    
    // Track analytics
    this.trackNotificationEvent(notification.request.identifier, 'received');
    
    // Update notification as delivered
    this.markAsDelivered(notification.request.identifier);
  };

  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    console.log('Notification response:', response);
    
    const notificationId = response.notification.request.identifier;
    const actionIdentifier = response.actionIdentifier;
    
    // Track analytics
    this.trackNotificationEvent(notificationId, 'clicked');
    
    // Mark as read
    this.markAsRead(notificationId);
    
    // Handle deep linking
    this.handleDeepLink(response.notification.request.content.data);
  };

  // Schedule a notification
  async scheduleNotification(
    title: string,
    body: string,
    scheduledFor: Date,
    data?: any,
    priority: NotificationPriority = 'normal'
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          priority: this.mapPriorityToExpo(priority),
          sound: true,
          badge: 1,
        },
        trigger: {
          date: scheduledFor,
        },
      });

      // Store notification in local database
      await this.storeNotification({
        id: notificationId,
        userId: this.userId,
        type: 'reminder',
        category: 'learning',
        title,
        body,
        data,
        scheduledFor: scheduledFor.toISOString(),
        priority,
        isRead: false,
        isDelivered: false,
        isScheduled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Schedule immediate notification
  async sendImmediateNotification(
    title: string,
    body: string,
    data?: any,
    priority: NotificationPriority = 'normal'
  ): Promise<string> {
    try {
      console.log('Sending immediate notification:', { title, body, data, priority });

      // Check if service is initialized
      if (!this.isInitialized) {
        console.log('Notification service not initialized, initializing now...');
        await this.initialize();
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          priority: this.mapPriorityToExpo(priority),
          sound: true,
          badge: 1,
        },
        trigger: null, // Send immediately
      });

      console.log('Notification scheduled with ID:', notificationId);

      // Store notification
      await this.storeNotification({
        id: notificationId,
        userId: this.userId,
        type: 'system',
        category: 'system',
        title,
        body,
        data,
        deliveredAt: new Date().toISOString(),
        priority,
        isRead: false,
        isDelivered: true,
        isScheduled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('Notification stored successfully');
      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      throw error;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // Update local storage
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get all notifications for user
  async getUserNotifications(): Promise<Notification[]> {
    try {
      return await this.getStoredNotifications();
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Get notification summary
  async getNotificationSummary(): Promise<NotificationSummary> {
    try {
      const notifications = await this.getStoredNotifications();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const unreadCount = notifications.filter(n => !n.isRead).length;
      const todayCount = notifications.filter(n => 
        new Date(n.createdAt) >= today
      ).length;
      const weekCount = notifications.filter(n => 
        new Date(n.createdAt) >= weekAgo
      ).length;

      // Group by category
      const byCategory = notifications.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {} as Record<NotificationCategory, number>);

      // Group by type
      const byType = notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<NotificationType, number>);

      // Recent notifications (last 10)
      const recentNotifications = notifications
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      return {
        totalNotifications: notifications.length,
        unreadCount,
        todayCount,
        weekCount,
        byCategory,
        byType,
        recentNotifications,
      };
    } catch (error) {
      console.error('Error getting notification summary:', error);
      return {
        totalNotifications: 0,
        unreadCount: 0,
        todayCount: 0,
        weekCount: 0,
        byCategory: {} as Record<NotificationCategory, number>,
        byType: {} as Record<NotificationType, number>,
        recentNotifications: [],
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      );
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark notification as delivered
  async markAsDelivered(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId 
          ? { ...n, isDelivered: true, deliveredAt: new Date().toISOString() }
          : n
      );
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as delivered:', error);
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences();
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Get user preferences
  async getUserPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default preferences
      return this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  // Private helper methods
  private async storeNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.push(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  private async getStoredNotifications(): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  private async loadUserPreferences(): Promise<void> {
    try {
      const preferences = await this.getUserPreferences();
      // Apply preferences to notification behavior
      console.log('Loaded notification preferences:', preferences);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  private mapPriorityToExpo(priority: NotificationPriority): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'urgent':
        return Notifications.AndroidNotificationPriority.MAX;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      case 'normal':
        return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'low':
        return Notifications.AndroidNotificationPriority.LOW;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  private handleDeepLink(data: any): void {
    if (data?.screen) {
      // Handle navigation to specific screen
      console.log('Deep linking to:', data.screen, data.params);
      // Implement navigation logic here
    }
  }

  private trackNotificationEvent(notificationId: string, event: string): void {
    // Track analytics event
    console.log(`Notification ${notificationId} ${event}`);
    // Implement analytics tracking here
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      userId: this.userId,
      globalEnabled: true,
      categories: {
        reminders: true,
        deadlines: true,
        streaks: true,
        achievements: true,
        courses: true,
        exams: true,
        assignments: true,
        social: true,
        marketing: false,
        system: true,
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'Asia/Kolkata',
      },
      frequency: {
        maxPerDay: 10,
        maxPerHour: 3,
        batchSimilar: true,
        respectQuietHours: true,
      },
      channels: {
        push: true,
        email: false,
        inApp: true,
        sms: false,
      },
      smartNudges: {
        enabled: true,
        learningReminders: true,
        motivationalMessages: true,
        streakMaintenance: true,
        performanceInsights: true,
        adaptiveFrequency: true,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  // Get push token for backend registration
  getPushToken(): string | null {
    return this.pushToken;
  }

  // Check if service is initialized
  get isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  // Get detailed permission status
  async getPermissionStatus(): Promise<{
    status: string;
    canAskAgain: boolean;
    granted: boolean;
    ios?: any;
    android?: any;
  }> {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      return {
        status: permissions.status,
        canAskAgain: permissions.canAskAgain || false,
        granted: permissions.status === 'granted',
        ios: permissions.ios,
        android: permissions.android,
      };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return {
        status: 'unknown',
        canAskAgain: false,
        granted: false,
      };
    }
  }

  // Request permissions with user-friendly handling
  async requestPermissionsWithPrompt(): Promise<{
    granted: boolean;
    status: string;
    message: string;
  }> {
    try {
      const currentStatus = await this.getPermissionStatus();

      if (currentStatus.granted) {
        return {
          granted: true,
          status: 'granted',
          message: 'Notifications are already enabled!',
        };
      }

      if (!currentStatus.canAskAgain) {
        return {
          granted: false,
          status: 'denied',
          message: 'Please enable notifications in your device settings.',
        };
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
          allowProvisional: false,
          allowAnnouncements: false,
        },
      });

      const granted = status === 'granted';

      return {
        granted,
        status,
        message: granted
          ? 'Notifications enabled successfully!'
          : 'Notifications were not enabled. You can enable them later in settings.',
      };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        granted: false,
        status: 'error',
        message: 'Failed to request notification permissions.',
      };
    }
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Clear badge
  async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }
}

export const notificationService = new NotificationService();

// Smart Nudge Engine
class SmartNudgeEngine {
  private userId: string = 'demo_user';
  private nudges: SmartNudge[] = [];

  async initialize(): Promise<void> {
    try {
      await this.loadNudges();
      this.setupNudgeTriggers();
      console.log('Smart nudge engine initialized');
    } catch (error) {
      console.error('Failed to initialize smart nudge engine:', error);
    }
  }

  // Create a smart nudge
  async createNudge(nudge: Omit<SmartNudge, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newNudge: SmartNudge = {
      ...nudge,
      id: `nudge_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.nudges.push(newNudge);
    await this.saveNudges();
    return newNudge.id;
  }

  // Trigger nudges based on user behavior
  async triggerNudges(event: string, context: any): Promise<void> {
    const activeNudges = this.nudges.filter(n =>
      n.isActive &&
      n.trigger.event === event &&
      this.shouldTriggerNudge(n, context)
    );

    for (const nudge of activeNudges) {
      await this.executeNudge(nudge, context);
    }
  }

  // Check if nudge should be triggered
  private shouldTriggerNudge(nudge: SmartNudge, context: any): boolean {
    // Check frequency limits
    if (nudge.maxTriggers && nudge.triggerCount >= nudge.maxTriggers) {
      return false;
    }

    // Check time-based conditions
    if (nudge.condition.timeOfDay) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime < nudge.condition.timeOfDay.start || currentTime > nudge.condition.timeOfDay.end) {
        return false;
      }
    }

    // Check day of week
    if (nudge.condition.dayOfWeek) {
      const today = new Date().getDay();
      if (!nudge.condition.dayOfWeek.includes(today)) {
        return false;
      }
    }

    // Check frequency limits
    if (nudge.lastTriggered) {
      const lastTrigger = new Date(nudge.lastTriggered);
      const now = new Date();
      const hoursSinceLastTrigger = (now.getTime() - lastTrigger.getTime()) / (1000 * 60 * 60);

      if (nudge.frequency.type === 'daily' && hoursSinceLastTrigger < 24) {
        return false;
      }

      if (nudge.frequency.type === 'custom' && nudge.frequency.interval && hoursSinceLastTrigger < nudge.frequency.interval) {
        return false;
      }
    }

    return true;
  }

  // Execute a nudge
  private async executeNudge(nudge: SmartNudge, context: any): Promise<void> {
    try {
      // Personalize content
      const personalizedContent = this.personalizeContent(nudge.content, context);

      // Schedule notification
      const delay = nudge.trigger.delay || 0;
      const scheduledFor = new Date(Date.now() + delay * 60 * 1000);

      await notificationService.scheduleNotification(
        personalizedContent.title,
        personalizedContent.body,
        scheduledFor,
        {
          nudgeId: nudge.id,
          type: 'smart_nudge',
          deepLink: personalizedContent.deepLink,
        },
        'normal'
      );

      // Update nudge statistics
      nudge.triggerCount++;
      nudge.lastTriggered = new Date().toISOString();
      nudge.updatedAt = new Date().toISOString();

      await this.saveNudges();

      console.log(`Executed nudge: ${nudge.type} for user ${this.userId}`);
    } catch (error) {
      console.error('Error executing nudge:', error);
    }
  }

  // Personalize nudge content
  private personalizeContent(content: any, context: any): any {
    let personalizedTitle = content.title;
    let personalizedBody = content.body;

    // Replace variables with context values
    if (content.variables) {
      Object.entries(content.variables).forEach(([key, value]) => {
        const contextValue = context[key] || value;
        personalizedTitle = personalizedTitle.replace(`{{${key}}}`, contextValue);
        personalizedBody = personalizedBody.replace(`{{${key}}}`, contextValue);
      });
    }

    return {
      title: personalizedTitle,
      body: personalizedBody,
      deepLink: content.deepLink,
    };
  }

  // Setup automatic nudge triggers
  private setupNudgeTriggers(): void {
    // This would integrate with app events
    // For demo, we'll create some sample triggers
    console.log('Setting up nudge triggers');
  }

  // Load nudges from storage
  private async loadNudges(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('smartNudges');
      if (stored) {
        this.nudges = JSON.parse(stored);
      } else {
        // Create default nudges
        this.nudges = this.createDefaultNudges();
        await this.saveNudges();
      }
    } catch (error) {
      console.error('Error loading nudges:', error);
      this.nudges = this.createDefaultNudges();
    }
  }

  // Save nudges to storage
  private async saveNudges(): Promise<void> {
    try {
      await AsyncStorage.setItem('smartNudges', JSON.stringify(this.nudges));
    } catch (error) {
      console.error('Error saving nudges:', error);
    }
  }

  // Create default nudges
  private createDefaultNudges(): SmartNudge[] {
    return [
      {
        id: 'nudge_learning_reminder',
        userId: this.userId,
        type: 'learning_reminder',
        trigger: {
          event: 'inactivity',
          delay: 60, // 1 hour
        },
        condition: {
          timeOfDay: { start: '09:00', end: '21:00' },
          dayOfWeek: [1, 2, 3, 4, 5], // Weekdays
        },
        content: {
          title: '📚 Time to learn!',
          body: "You haven't studied today. Let's continue your learning journey!",
          emoji: '📚',
          actionText: 'Start Learning',
          deepLink: '/lessons',
          variables: {
            userName: 'Student',
          },
        },
        frequency: {
          type: 'daily',
          maxPerDay: 1,
        },
        isActive: true,
        triggerCount: 0,
        effectiveness: 0.7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'nudge_streak_maintenance',
        userId: this.userId,
        type: 'streak_maintenance',
        trigger: {
          event: 'streak_broken',
          delay: 30,
        },
        condition: {
          timeOfDay: { start: '10:00', end: '20:00' },
        },
        content: {
          title: '🔥 Keep your streak alive!',
          body: "Don't break your {{streakDays}}-day learning streak. Study for just 10 minutes!",
          emoji: '🔥',
          actionText: 'Continue Streak',
          deepLink: '/dashboard',
          variables: {
            streakDays: '7',
          },
        },
        frequency: {
          type: 'daily',
          maxPerDay: 2,
        },
        isActive: true,
        triggerCount: 0,
        effectiveness: 0.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Get all nudges for user
  async getUserNudges(): Promise<SmartNudge[]> {
    return this.nudges.filter(n => n.userId === this.userId);
  }

  // Update nudge effectiveness based on user response
  async updateNudgeEffectiveness(nudgeId: string, wasEffective: boolean): Promise<void> {
    const nudge = this.nudges.find(n => n.id === nudgeId);
    if (nudge) {
      // Simple effectiveness calculation
      const weight = 0.1;
      const newScore = wasEffective ? 1 : 0;
      nudge.effectiveness = nudge.effectiveness * (1 - weight) + newScore * weight;
      nudge.updatedAt = new Date().toISOString();
      await this.saveNudges();
    }
  }
}

export const smartNudgeEngine = new SmartNudgeEngine();
