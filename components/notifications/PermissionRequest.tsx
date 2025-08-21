import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { notificationService } from '../../services/notificationService';

interface PermissionRequestProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export default function PermissionRequest({ 
  onPermissionGranted, 
  onPermissionDenied 
}: PermissionRequestProps) {
  const [permissionStatus, setPermissionStatus] = useState<{
    status: string;
    canAskAgain: boolean;
    granted: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking permission status:', error);
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    
    try {
      const result = await notificationService.requestPermissionsWithPrompt();
      
      Alert.alert(
        result.granted ? 'Success' : 'Permission Status',
        result.message,
        [
          {
            text: 'OK',
            onPress: () => {
              if (result.granted) {
                onPermissionGranted?.();
              } else {
                onPermissionDenied?.();
              }
            }
          }
        ]
      );

      // Refresh permission status
      await checkPermissionStatus();
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = () => {
    Alert.alert(
      'Enable Notifications',
      'To receive notifications, please enable them in your device settings:\n\n' +
      '1. Go to Settings\n' +
      '2. Find EduMitra app\n' +
      '3. Enable Notifications\n' +
      '4. Return to the app',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = () => {
    if (!permissionStatus) return '⏳';
    
    switch (permissionStatus.status) {
      case 'granted':
        return '✅';
      case 'denied':
        return '❌';
      case 'undetermined':
        return '❓';
      default:
        return '⚠️';
    }
  };

  const getStatusMessage = () => {
    if (!permissionStatus) return 'Checking permission status...';
    
    switch (permissionStatus.status) {
      case 'granted':
        return 'Notifications are enabled! You\'ll receive important updates and reminders.';
      case 'denied':
        return 'Notifications are disabled. Enable them to receive important updates and reminders.';
      case 'undetermined':
        return 'Notification permissions haven\'t been set yet. Enable them to receive important updates.';
      default:
        return `Notification status: ${permissionStatus.status}`;
    }
  };

  const getActionButton = () => {
    if (!permissionStatus) return null;

    if (permissionStatus.granted) {
      return (
        <TouchableOpacity style={styles.successButton} disabled>
          <Text style={styles.successButtonText}>✅ Notifications Enabled</Text>
        </TouchableOpacity>
      );
    }

    if (permissionStatus.canAskAgain) {
      return (
        <TouchableOpacity 
          style={styles.requestButton} 
          onPress={handleRequestPermissions}
          disabled={isLoading}
        >
          <Text style={styles.requestButtonText}>
            {isLoading ? 'Requesting...' : '🔔 Enable Notifications'}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
        <Text style={styles.settingsButtonText}>⚙️ Open Settings</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{getStatusIcon()}</Text>
        <Text style={styles.title}>Notification Permissions</Text>
      </View>
      
      <Text style={styles.message}>{getStatusMessage()}</Text>
      
      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>Why enable notifications?</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefitItem}>📚 Study reminders and learning streaks</Text>
          <Text style={styles.benefitItem}>📅 Assignment and exam deadlines</Text>
          <Text style={styles.benefitItem}>🎯 Goal progress and achievements</Text>
          <Text style={styles.benefitItem}>💡 Smart learning suggestions</Text>
          <Text style={styles.benefitItem}>📢 Important app updates</Text>
        </View>
      </View>

      {getActionButton()}

      {Platform.OS === 'web' && (
        <View style={styles.webNote}>
          <Text style={styles.webNoteText}>
            💻 On web: Your browser may ask for notification permission. 
            Click "Allow" to enable notifications.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  benefits: {
    marginBottom: 25,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webNote: {
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  webNoteText: {
    fontSize: 12,
    color: '#007AFF',
    lineHeight: 16,
  },
});
