import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch
} from 'react-native';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService, smartNudgeEngine } from '../../services/notificationService';
import NotificationCard from '../../components/notifications/NotificationCard';
import NotificationPreferences from '../../components/notifications/NotificationPreferences';
import NotificationStats from '../../components/notifications/NotificationStats';
import PermissionRequest from '../../components/notifications/PermissionRequest';

type NotificationTab = 'all' | 'unread' | 'reminders' | 'nudges' | 'permissions' | 'settings';

export default function NotificationsScreen() {
  const {
    notifications,
    preferences,
    summary,
    unreadCount,
    isLoading,
    error,
    isInitialized,
    selectedCategory,
    setNotifications,
    setPreferences,
    setSummary,
    setLoading,
    setError,
    setInitialized,
    markAsRead,
    markAllAsRead,
    getFilteredNotifications,
    getUnreadNotifications,
    getActiveReminders,
    getRecentNotifications
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize notification service
      await notificationService.initialize();
      
      // Initialize smart nudge engine
      await smartNudgeEngine.initialize();
      
      // Load user data
      await loadNotificationData();
      
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationData = async () => {
    try {
      const [userNotifications, userPreferences, notificationSummary] = await Promise.all([
        notificationService.getUserNotifications(),
        notificationService.getUserPreferences(),
        notificationService.getNotificationSummary()
      ]);

      setNotifications(userNotifications);
      setPreferences(userPreferences);
      setSummary(notificationSummary);
    } catch (error) {
      console.error('Failed to load notification data:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotificationData();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    markAsRead(notificationId);
    
    // Handle navigation based on notification data
    const notification = notifications.find(n => n.id === notificationId);
    if (notification?.data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to:', notification.data.screen);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = getUnreadNotifications();
      for (const notification of unreadNotifications) {
        await notificationService.markAsRead(notification.id);
      }
      markAllAsRead();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleTestNotification = async () => {
    try {
      console.log('Test notification button pressed');

      // Check if notification service is initialized
      if (!notificationService.isServiceInitialized) {
        console.log('Initializing notification service...');
        await notificationService.initialize();
      }

      // Check permissions first
      const permissionStatus = await notificationService.getPermissionStatus();
      console.log('Permission status:', permissionStatus);

      if (!permissionStatus.granted) {
        Alert.alert(
          'Permissions Required',
          'Notifications are not enabled. Would you like to enable them now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              onPress: () => setActiveTab('permissions')
            }
          ]
        );
        return;
      }

      const notificationId = await notificationService.sendImmediateNotification(
        'Test Notification 🧪',
        'This is a test notification from EduMitra! If you see this, notifications are working correctly.',
        {
          test: true,
          timestamp: new Date().toISOString(),
          screen: 'notifications'
        },
        'normal'
      );

      console.log('Test notification sent with ID:', notificationId);
      Alert.alert('Success', `Test notification sent! ID: ${notificationId.substring(0, 8)}...`);

      // Refresh the notification list
      await loadNotificationData();
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Error', `Failed to send test notification: ${error.message || error}`);
    }
  };

  const getDisplayNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return getUnreadNotifications();
      case 'reminders':
        return notifications.filter(n => n.type === 'reminder' || n.type === 'deadline');
      case 'nudges':
        return notifications.filter(n => n.type === 'smart_nudge');
      default:
        return getFilteredNotifications();
    }
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📬</Text>
          <Text style={styles.statValue}>{summary?.totalNotifications || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔔</Text>
          <Text style={styles.statValue}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{summary?.todayCount || 0}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{summary?.weekCount || 0}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsCard}>
        <Text style={styles.cardTitle}>🚀 Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Text style={styles.quickActionIcon}>✅</Text>
            <Text style={styles.quickActionText}>Mark All Read</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.quickActionIcon}>🧪</Text>
            <Text style={styles.quickActionText}>Test Notification</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setActiveTab('permissions')}
          >
            <Text style={styles.quickActionIcon}>🔐</Text>
            <Text style={styles.quickActionText}>Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setActiveTab('nudges')}
          >
            <Text style={styles.quickActionIcon}>🎯</Text>
            <Text style={styles.quickActionText}>Smart Nudges</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Notifications */}
      <View style={styles.recentCard}>
        <Text style={styles.cardTitle}>📋 Recent Notifications</Text>
        {getRecentNotifications(5).map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => handleNotificationPress(notification.id)}
          />
        ))}
        
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              You'll see your notifications here when they arrive
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderNotificationsList = () => {
    const displayNotifications = getDisplayNotifications();
    
    return (
      <ScrollView 
        style={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {displayNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => handleNotificationPress(notification.id)}
          />
        ))}
        
        {displayNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No notifications</Text>
            <Text style={styles.emptyStateSubtext}>
              No notifications match your current filter
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeNotifications}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All', icon: '📬', count: notifications.length },
            { key: 'unread', label: 'Unread', icon: '🔔', count: unreadCount },
            { key: 'reminders', label: 'Reminders', icon: '⏰', count: getActiveReminders().length },
            { key: 'nudges', label: 'Smart Nudges', icon: '🎯', count: 0 },
            { key: 'permissions', label: 'Permissions', icon: '🔐', count: 0 },
            { key: 'settings', label: 'Settings', icon: '⚙️', count: 0 }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key as NotificationTab)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
                {tab.count > 0 && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'all' && renderOverview()}
            {(activeTab === 'unread' || activeTab === 'reminders' || activeTab === 'nudges') && renderNotificationsList()}
            {activeTab === 'permissions' && (
              <ScrollView style={styles.tabContent}>
                <PermissionRequest
                  onPermissionGranted={() => {
                    Alert.alert('Success', 'Notifications enabled! You can now receive important updates.');
                    loadNotificationData();
                  }}
                  onPermissionDenied={() => {
                    Alert.alert('Info', 'You can enable notifications later in the Permissions tab.');
                  }}
                />
              </ScrollView>
            )}
            {activeTab === 'settings' && <NotificationPreferences />}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 100,
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overviewContainer: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '47%',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  notificationsList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
