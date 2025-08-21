import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import { useLearningStore } from '../../store/learningStore';
import { learningService } from '../../services/learningService';
import { syncService } from '../../services/syncService';
import { TimetableEntry } from '../../types/database';

export default function TimetableScreen() {
  const {
    timetableEntries,
    isOffline,
    getTodaysTimetable,
    getUpcomingTimetable
  } = useLearningStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'today' | 'upcoming'>('today');
  const [newEntry, setNewEntry] = useState({
    title: '',
    description: '',
    type: 'class' as 'class' | 'exam' | 'assignment' | 'event',
    startTime: '',
    endTime: '',
    location: ''
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isOffline) {
        await syncService.syncPendingChanges();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.title || !newEntry.startTime || !newEntry.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const entry: TimetableEntry = {
        id: `timetable_${Date.now()}`,
        title: newEntry.title,
        description: newEntry.description,
        type: newEntry.type,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        location: newEntry.location,
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await learningService.saveTimetableEntry(entry);
      setShowAddModal(false);
      setNewEntry({
        title: '',
        description: '',
        type: 'class',
        startTime: '',
        endTime: '',
        location: ''
      });
      
      Alert.alert('Success', 'Timetable entry added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add timetable entry');
    }
  };

  const handleDeleteEntry = (entry: TimetableEntry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await learningService.deleteTimetableEntry(entry.id);
              Alert.alert('Success', 'Entry deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          }
        }
      ]
    );
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'class': return '#007AFF';
      case 'exam': return '#FF3B30';
      case 'assignment': return '#FF9500';
      case 'event': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'class': return '📚';
      case 'exam': return '📝';
      case 'assignment': return '📋';
      case 'event': return '📅';
      default: return '📌';
    }
  };

  const renderTimetableEntry = ({ item }: { item: TimetableEntry }) => (
    <TouchableOpacity
      style={styles.entryItem}
      onLongPress={() => handleDeleteEntry(item)}
    >
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleRow}>
          <Text style={styles.entryIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={styles.entryTitle}>{item.title}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.entryDescription}>{item.description}</Text>
      )}

      <View style={styles.entryDetails}>
        <Text style={styles.entryTime}>
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
        {viewMode === 'upcoming' && (
          <Text style={styles.entryDate}>{formatDate(item.startTime)}</Text>
        )}
      </View>

      {item.location && (
        <Text style={styles.entryLocation}>📍 {item.location}</Text>
      )}
    </TouchableOpacity>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddModal(false)}>
            <Text style={styles.modalCancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Timetable Entry</Text>
          <TouchableOpacity onPress={handleAddEntry}>
            <Text style={styles.modalSaveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Title *"
            value={newEntry.title}
            onChangeText={(text) => setNewEntry({ ...newEntry, title: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newEntry.description}
            onChangeText={(text) => setNewEntry({ ...newEntry, description: text })}
            multiline
          />

          <View style={styles.typeSelector}>
            {['class', 'exam', 'assignment', 'event'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  newEntry.type === type && styles.selectedTypeOption
                ]}
                onPress={() => setNewEntry({ ...newEntry, type: type as any })}
              >
                <Text style={[
                  styles.typeOptionText,
                  newEntry.type === type && styles.selectedTypeOptionText
                ]}>
                  {getTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Start Time (YYYY-MM-DD HH:MM) *"
            value={newEntry.startTime}
            onChangeText={(text) => setNewEntry({ ...newEntry, startTime: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="End Time (YYYY-MM-DD HH:MM) *"
            value={newEntry.endTime}
            onChangeText={(text) => setNewEntry({ ...newEntry, endTime: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEntry.location}
            onChangeText={(text) => setNewEntry({ ...newEntry, location: text })}
          />
        </View>
      </View>
    </Modal>
  );

  const todaysEntries = getTodaysTimetable();
  const upcomingEntries = getUpcomingTimetable(7); // Next 7 days
  const displayEntries = viewMode === 'today' ? todaysEntries : upcomingEntries;

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineIndicatorText}>📴 Offline Mode</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.viewModeSelector}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'today' && styles.activeViewModeButton
            ]}
            onPress={() => setViewMode('today')}
          >
            <Text style={[
              styles.viewModeButtonText,
              viewMode === 'today' && styles.activeViewModeButtonText
            ]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'upcoming' && styles.activeViewModeButton
            ]}
            onPress={() => setViewMode('upcoming')}
          >
            <Text style={[
              styles.viewModeButtonText,
              viewMode === 'upcoming' && styles.activeViewModeButtonText
            ]}>
              Upcoming
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Timetable list */}
      <FlatList
        data={displayEntries}
        renderItem={renderTimetableEntry}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {viewMode === 'today' 
                ? 'No events scheduled for today' 
                : 'No upcoming events'
              }
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {renderAddModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineIndicator: {
    backgroundColor: '#ff9500',
    padding: 8,
    alignItems: 'center',
  },
  offlineIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeViewModeButton: {
    backgroundColor: '#007AFF',
  },
  viewModeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeViewModeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  entryItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  entryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  entryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  entryLocation: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalSaveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeOption: {
    backgroundColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTypeOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
