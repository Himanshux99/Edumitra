import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Notification, NotificationPriority } from '../../types/notifications';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onDismiss?: () => void;
  showActions?: boolean;
}

export default function NotificationCard({ 
  notification, 
  onPress, 
  onDismiss,
  showActions = true 
}: NotificationCardProps) {
  
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'reminder':
        return '⏰';
      case 'deadline':
        return '📅';
      case 'streak':
        return '🔥';
      case 'achievement':
        return '🏆';
      case 'course_update':
        return '📚';
      case 'exam_alert':
        return '📝';
      case 'assignment_due':
        return '📋';
      case 'social':
        return '👥';
      case 'marketing':
        return '📢';
      case 'system':
        return '⚙️';
      case 'smart_nudge':
        return '🎯';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'normal':
        return '#007AFF';
      case 'low':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const getCategoryColor = () => {
    switch (notification.category) {
      case 'learning':
        return '#34C759';
      case 'deadlines':
        return '#FF9500';
      case 'social':
        return '#5856D6';
      case 'achievements':
        return '#FFD60A';
      case 'system':
        return '#8E8E93';
      case 'marketing':
        return '#FF3B30';
      case 'emergency':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const handleActionPress = (action: any) => {
    switch (action.action) {
      case 'open_app':
        onPress();
        break;
      case 'deep_link':
        onPress();
        break;
      case 'dismiss':
        onDismiss?.();
        break;
      case 'snooze':
        Alert.alert('Snooze', 'Notification snoozed for 1 hour');
        break;
      default:
        onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Priority indicator */}
      <View 
        style={[
          styles.priorityIndicator,
          { backgroundColor: getPriorityColor(notification.priority) }
        ]} 
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getNotificationIcon()}</Text>
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {notification.title}
            </Text>
            <View style={styles.metadata}>
              <View 
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor() }
                ]}
              >
                <Text style={styles.categoryText}>
                  {notification.category.replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.time}>
                {formatTime(notification.createdAt)}
              </Text>
            </View>
          </View>

          {!notification.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>

        {/* Body */}
        <Text style={styles.body} numberOfLines={3}>
          {notification.body}
        </Text>

        {/* Actions */}
        {showActions && notification.data?.actions && notification.data.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {notification.data.actions.slice(0, 2).map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
              >
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Scheduled indicator */}
        {notification.isScheduled && notification.scheduledFor && (
          <View style={styles.scheduledContainer}>
            <Text style={styles.scheduledIcon}>⏱️</Text>
            <Text style={styles.scheduledText}>
              Scheduled for {new Date(notification.scheduledFor).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Expiry warning */}
        {notification.expiresAt && new Date(notification.expiresAt) < new Date() && (
          <View style={styles.expiredContainer}>
            <Text style={styles.expiredIcon}>⚠️</Text>
            <Text style={styles.expiredText}>This notification has expired</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  unreadContainer: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  priorityIndicator: {
    width: 4,
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  scheduledIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  scheduledText: {
    fontSize: 12,
    color: '#856404',
    flex: 1,
  },
  expiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8D7DA',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  expiredIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  expiredText: {
    fontSize: 12,
    color: '#721C24',
    flex: 1,
  },
});
