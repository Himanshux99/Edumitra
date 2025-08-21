import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notificationService';
import { NotificationPreferences as NotificationPreferencesType } from '../../types/notifications';

export default function NotificationPreferences() {
  const { preferences, setPreferences } = useNotificationStore();
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferencesType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const userPreferences = await notificationService.getUserPreferences();
      setLocalPreferences(userPreferences);
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const updatePreference = async (path: string, value: any) => {
    if (!localPreferences) return;

    const updatedPreferences = { ...localPreferences };
    const keys = path.split('.');
    let current: any = updatedPreferences;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setLocalPreferences(updatedPreferences);
    
    try {
      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendImmediateNotification(
        'Test Notification',
        'This is a test notification to verify your settings!',
        { test: true },
        'normal'
      );
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (!localPreferences) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Global Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 General Settings</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>Enable Notifications</Text>
            <Text style={styles.preferenceDescription}>
              Turn on/off all notifications
            </Text>
          </View>
          <Switch
            value={localPreferences.globalEnabled}
            onValueChange={(value) => updatePreference('globalEnabled', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Text style={styles.testButtonText}>🧪 Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Category Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📂 Notification Categories</Text>
        
        {Object.entries(localPreferences.categories).map(([category, enabled]) => (
          <View key={category} style={styles.preferenceItem}>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={styles.preferenceDescription}>
                {getCategoryDescription(category)}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={(value) => updatePreference(`categories.${category}`, value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
              disabled={!localPreferences.globalEnabled}
            />
          </View>
        ))}
      </View>

      {/* Quiet Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌙 Quiet Hours</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>Enable Quiet Hours</Text>
            <Text style={styles.preferenceDescription}>
              Disable notifications during specified hours
            </Text>
          </View>
          <Switch
            value={localPreferences.quietHours.enabled}
            onValueChange={(value) => updatePreference('quietHours.enabled', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {localPreferences.quietHours.enabled && (
          <View style={styles.quietHoursContainer}>
            <Text style={styles.quietHoursText}>
              🕘 From {localPreferences.quietHours.startTime} to {localPreferences.quietHours.endTime}
            </Text>
            <Text style={styles.quietHoursSubtext}>
              Timezone: {localPreferences.quietHours.timezone}
            </Text>
          </View>
        )}
      </View>

      {/* Frequency Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Frequency Settings</Text>
        
        <View style={styles.frequencyGrid}>
          <View style={styles.frequencyCard}>
            <Text style={styles.frequencyValue}>{localPreferences.frequency.maxPerDay}</Text>
            <Text style={styles.frequencyLabel}>Max per day</Text>
          </View>
          
          <View style={styles.frequencyCard}>
            <Text style={styles.frequencyValue}>{localPreferences.frequency.maxPerHour}</Text>
            <Text style={styles.frequencyLabel}>Max per hour</Text>
          </View>
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>Batch Similar Notifications</Text>
            <Text style={styles.preferenceDescription}>
              Group similar notifications together
            </Text>
          </View>
          <Switch
            value={localPreferences.frequency.batchSimilar}
            onValueChange={(value) => updatePreference('frequency.batchSimilar', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Smart Nudges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Smart Nudges</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>Enable Smart Nudges</Text>
            <Text style={styles.preferenceDescription}>
              AI-powered learning reminders and motivation
            </Text>
          </View>
          <Switch
            value={localPreferences.smartNudges.enabled}
            onValueChange={(value) => updatePreference('smartNudges.enabled', value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {localPreferences.smartNudges.enabled && (
          <>
            {Object.entries(localPreferences.smartNudges).map(([key, enabled]) => {
              if (key === 'enabled') return null;
              
              return (
                <View key={key} style={styles.preferenceItem}>
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceTitle}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Text>
                    <Text style={styles.preferenceDescription}>
                      {getNudgeDescription(key)}
                    </Text>
                  </View>
                  <Switch
                    value={enabled as boolean}
                    onValueChange={(value) => updatePreference(`smartNudges.${key}`, value)}
                    trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              );
            })}
          </>
        )}
      </View>

      {/* Channels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Notification Channels</Text>
        
        {Object.entries(localPreferences.channels).map(([channel, enabled]) => (
          <View key={channel} style={styles.preferenceItem}>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>
                {channel.toUpperCase()} Notifications
              </Text>
              <Text style={styles.preferenceDescription}>
                {getChannelDescription(channel)}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={(value) => updatePreference(`channels.${channel}`, value)}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
              disabled={channel !== 'push' && channel !== 'inApp'}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Helper functions
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    reminders: 'Study reminders and task notifications',
    deadlines: 'Assignment and exam deadline alerts',
    streaks: 'Learning streak maintenance notifications',
    achievements: 'Achievement and milestone celebrations',
    courses: 'Course updates and new content alerts',
    exams: 'Exam schedules and preparation reminders',
    assignments: 'Assignment submissions and feedback',
    social: 'Social interactions and community updates',
    marketing: 'Promotional content and offers',
    system: 'App updates and system notifications',
  };
  return descriptions[category] || 'Notification category';
};

const getNudgeDescription = (nudgeType: string): string => {
  const descriptions: Record<string, string> = {
    learningReminders: 'Gentle reminders to continue learning',
    motivationalMessages: 'Encouraging messages to stay motivated',
    streakMaintenance: 'Notifications to maintain learning streaks',
    performanceInsights: 'Insights about your learning performance',
    adaptiveFrequency: 'Smart timing based on your behavior',
  };
  return descriptions[nudgeType] || 'Smart nudge feature';
};

const getChannelDescription = (channel: string): string => {
  const descriptions: Record<string, string> = {
    push: 'Push notifications on your device',
    email: 'Email notifications (coming soon)',
    inApp: 'In-app notification center',
    sms: 'SMS notifications (coming soon)',
  };
  return descriptions[channel] || 'Notification channel';
};

const styles = StyleSheet.create({
  container: {
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
  section: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceContent: {
    flex: 1,
    marginRight: 15,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quietHoursContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  quietHoursText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  quietHoursSubtext: {
    fontSize: 14,
    color: '#666',
  },
  frequencyGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  frequencyCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  frequencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  frequencyLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
