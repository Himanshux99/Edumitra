import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationService } from '../../services/notificationService';
import { Reminder, ReminderType } from '../../types/notifications';

export default function ReminderManager() {
  const { reminders, addReminder, updateReminder, removeReminder, getActiveReminders } = useNotificationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    type: 'study_session' as ReminderType,
    scheduledFor: new Date(),
    isRecurring: false,
  });

  const activeReminders = getActiveReminders();

  const handleCreateReminder = async () => {
    if (!newReminder.title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    try {
      const reminder: Reminder = {
        id: `reminder_${Date.now()}`,
        userId: 'demo_user',
        type: newReminder.type,
        title: newReminder.title,
        description: newReminder.description,
        scheduledFor: newReminder.scheduledFor.toISOString(),
        isRecurring: newReminder.isRecurring,
        isActive: true,
        isCompleted: false,
        snoozeCount: 0,
        maxSnoozes: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Schedule notification
      await notificationService.scheduleNotification(
        reminder.title,
        reminder.description || 'Reminder notification',
        newReminder.scheduledFor,
        {
          reminderId: reminder.id,
          type: 'reminder',
        },
        'normal'
      );

      addReminder(reminder);
      setShowCreateModal(false);
      setNewReminder({
        title: '',
        description: '',
        type: 'study_session',
        scheduledFor: new Date(),
        isRecurring: false,
      });

      Alert.alert('Success', 'Reminder created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create reminder');
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      updateReminder(reminderId, {
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Reminder marked as completed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeReminder(reminderId);
          },
        },
      ]
    );
  };

  const getReminderIcon = (type: ReminderType) => {
    switch (type) {
      case 'assignment_due':
        return '📋';
      case 'exam_scheduled':
        return '📝';
      case 'course_deadline':
        return '📚';
      case 'study_session':
        return '📖';
      case 'goal_check':
        return '🎯';
      case 'streak_maintenance':
        return '🔥';
      case 'custom':
        return '⏰';
      default:
        return '⏰';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Reminder</Text>
          <TouchableOpacity onPress={handleCreateReminder}>
            <Text style={styles.modalSaveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={newReminder.title}
              onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
              placeholder="Enter reminder title"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              placeholder="Enter reminder description (optional)"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeSelector}>
                {[
                  { key: 'study_session', label: 'Study Session', icon: '📖' },
                  { key: 'assignment_due', label: 'Assignment', icon: '📋' },
                  { key: 'exam_scheduled', label: 'Exam', icon: '📝' },
                  { key: 'course_deadline', label: 'Course', icon: '📚' },
                  { key: 'goal_check', label: 'Goal Check', icon: '🎯' },
                  { key: 'custom', label: 'Custom', icon: '⏰' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeOption,
                      newReminder.type === type.key && styles.selectedTypeOption,
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, type: type.key as ReminderType })}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.typeLabel,
                      newReminder.type === type.key && styles.selectedTypeLabel,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Scheduled Time</Text>
            <TouchableOpacity style={styles.dateTimeButton}>
              <Text style={styles.dateTimeText}>
                {newReminder.scheduledFor.toLocaleString()}
              </Text>
              <Text style={styles.dateTimeIcon}>📅</Text>
            </TouchableOpacity>
            <Text style={styles.inputHint}>
              Tap to change date and time (Date picker coming soon)
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Reminders</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.remindersList}>
        {activeReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateText}>No active reminders</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first reminder to stay on track
            </Text>
          </View>
        ) : (
          activeReminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderIconContainer}>
                  <Text style={styles.reminderIcon}>
                    {getReminderIcon(reminder.type)}
                  </Text>
                </View>
                
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  {reminder.description && (
                    <Text style={styles.reminderDescription}>
                      {reminder.description}
                    </Text>
                  )}
                  <Text style={styles.reminderTime}>
                    📅 {formatDateTime(reminder.scheduledFor)}
                  </Text>
                </View>

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCompleteReminder(reminder.id)}
                  >
                    <Text style={styles.actionButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {reminder.isRecurring && (
                <View style={styles.recurringBadge}>
                  <Text style={styles.recurringText}>🔄 Recurring</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {renderCreateModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  remindersList: {
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
  reminderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderIcon: {
    fontSize: 20,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  reminderTime: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
  },
  recurringBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  recurringText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'white',
    minWidth: 80,
  },
  selectedTypeOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedTypeLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  dateTimeIcon: {
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
