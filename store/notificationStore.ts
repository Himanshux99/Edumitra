import { create } from 'zustand';
import {
  Notification,
  NotificationPreferences,
  SmartNudge,
  Reminder,
  NotificationSummary,
  NotificationStats,
  NotificationType,
  NotificationCategory,
  NotificationPriority
} from '../types/notifications';

interface NotificationState {
  // Data
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  nudges: SmartNudge[];
  reminders: Reminder[];
  summary: NotificationSummary | null;
  stats: NotificationStats | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  unreadCount: number;
  
  // Filters and sorting
  selectedCategory: NotificationCategory | 'all';
  selectedType: NotificationType | 'all';
  sortBy: 'date' | 'priority' | 'category';
  sortOrder: 'asc' | 'desc';
  
  // Actions - Data Management
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  
  setPreferences: (preferences: NotificationPreferences) => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  
  setNudges: (nudges: SmartNudge[]) => void;
  addNudge: (nudge: SmartNudge) => void;
  updateNudge: (id: string, updates: Partial<SmartNudge>) => void;
  removeNudge: (id: string) => void;
  
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  
  setSummary: (summary: NotificationSummary) => void;
  setStats: (stats: NotificationStats) => void;
  
  // Actions - UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  updateUnreadCount: () => void;
  
  // Actions - Filters
  setSelectedCategory: (category: NotificationCategory | 'all') => void;
  setSelectedType: (type: NotificationType | 'all') => void;
  setSortBy: (sortBy: 'date' | 'priority' | 'category') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Computed getters
  getFilteredNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  getTodayNotifications: () => Notification[];
  getNotificationsByCategory: (category: NotificationCategory) => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  getActiveReminders: () => Reminder[];
  getActiveNudges: () => SmartNudge[];
  getRecentNotifications: (limit?: number) => Notification[];
  getHighPriorityNotifications: () => Notification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  notifications: [],
  preferences: null,
  nudges: [],
  reminders: [],
  summary: null,
  stats: null,
  
  isLoading: false,
  error: null,
  isInitialized: false,
  unreadCount: 0,
  
  selectedCategory: 'all',
  selectedType: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  
  // Data management actions
  setNotifications: (notifications) => {
    set({ notifications });
    get().updateUnreadCount();
  },
  
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications]
    }));
    get().updateUnreadCount();
  },
  
  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    }));
    get().updateUnreadCount();
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
    get().updateUnreadCount();
  },
  
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id 
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    }));
    get().updateUnreadCount();
  },
  
  markAllAsRead: () => {
    const now = new Date().toISOString();
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || now
      }))
    }));
    get().updateUnreadCount();
  },
  
  setPreferences: (preferences) => set({ preferences }),
  
  updatePreferences: (updates) => {
    set((state) => ({
      preferences: state.preferences 
        ? { ...state.preferences, ...updates, updatedAt: new Date().toISOString() }
        : null
    }));
  },
  
  setNudges: (nudges) => set({ nudges }),
  
  addNudge: (nudge) => {
    set((state) => ({
      nudges: [nudge, ...state.nudges]
    }));
  },
  
  updateNudge: (id, updates) => {
    set((state) => ({
      nudges: state.nudges.map(nudge =>
        nudge.id === id ? { ...nudge, ...updates } : nudge
      )
    }));
  },
  
  removeNudge: (id) => {
    set((state) => ({
      nudges: state.nudges.filter(nudge => nudge.id !== id)
    }));
  },
  
  setReminders: (reminders) => set({ reminders }),
  
  addReminder: (reminder) => {
    set((state) => ({
      reminders: [reminder, ...state.reminders]
    }));
  },
  
  updateReminder: (id, updates) => {
    set((state) => ({
      reminders: state.reminders.map(reminder =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
    }));
  },
  
  removeReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.filter(reminder => reminder.id !== id)
    }));
  },
  
  setSummary: (summary) => set({ summary }),
  setStats: (stats) => set({ stats }),
  
  // UI state actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  
  updateUnreadCount: () => {
    const { notifications } = get();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ unreadCount });
  },
  
  // Filter actions
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedType: (type) => set({ selectedType: type }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  
  // Computed getters
  getFilteredNotifications: () => {
    const { notifications, selectedCategory, selectedType, sortBy, sortOrder } = get();
    let filtered = notifications;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }
    
    // Sort notifications
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    });
    
    return filtered;
  },
  
  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.isRead);
  },
  
  getTodayNotifications: () => {
    const { notifications } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      notificationDate.setHours(0, 0, 0, 0);
      return notificationDate.getTime() === today.getTime();
    });
  },
  
  getNotificationsByCategory: (category) => {
    const { notifications } = get();
    return notifications.filter(n => n.category === category);
  },
  
  getNotificationsByType: (type) => {
    const { notifications } = get();
    return notifications.filter(n => n.type === type);
  },
  
  getActiveReminders: () => {
    const { reminders } = get();
    return reminders.filter(r => r.isActive && !r.isCompleted);
  },
  
  getActiveNudges: () => {
    const { nudges } = get();
    return nudges.filter(n => n.isActive);
  },
  
  getRecentNotifications: (limit = 10) => {
    const { notifications } = get();
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  
  getHighPriorityNotifications: () => {
    const { notifications } = get();
    return notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
  },
}));
