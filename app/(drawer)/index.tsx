import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLearningStore } from '../../store/learningStore';
import { syncService } from '../../services/syncService';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { auth } from '../../config/firebase';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const {
    courses,
    lessons,
    quizzes,
    timetableEntries,
    lessonProgress,
    isOffline,
    lastSyncTime,
    getTodaysTimetable,
    getUpcomingTimetable
  } = useLearningStore();

  const todaysSchedule = getTodaysTimetable();
  const upcomingEvents = getUpcomingTimetable(3);

  // Calculate progress statistics
  const totalLessons = lessons.length;
  const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleSyncNow = async () => {
    if (!isOffline) {
      await syncService.syncPendingChanges();
    }
  };

  const handleTestLogout = async () => {
    Alert.alert(
      'Test Logout',
      'This is a test logout button. Do you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('HomeScreen - Starting test logout...');
              console.log('HomeScreen - Firebase auth user before logout:', auth.currentUser?.email);

              await signOut();

              console.log('HomeScreen - SignOut completed');
              console.log('HomeScreen - Firebase auth user after logout:', auth.currentUser?.email);

              // Force navigation as backup
              setTimeout(() => {
                console.log('HomeScreen - Forcing navigation to signin...');
                router.replace('/auth/signin');
              }, 500);

            } catch (error) {
              console.error('HomeScreen - Logout error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to EduMitra</Text>
        <Text style={styles.subtitleText}>Your learning companion</Text>

        {/* Offline/Online status */}
        <View style={[styles.statusBadge, isOffline ? styles.offlineStatus : styles.onlineStatus]}>
          <Text style={styles.statusText}>
            {isOffline ? '📴 Offline' : '🌐 Online'}
          </Text>
          {!isOffline && (
            <TouchableOpacity onPress={handleSyncNow} style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Test Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#ff4444',
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
            alignItems: 'center'
          }}
          onPress={handleTestLogout}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🧪 Test Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Learning Progress</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercentage}% Complete</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedLessons}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalLessons - completedLessons}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courses.length}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatIcon}>📚</Text>
          <Text style={styles.quickStatNumber}>{lessons.length}</Text>
          <Text style={styles.quickStatLabel}>Lessons</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatIcon}>❓</Text>
          <Text style={styles.quickStatNumber}>{quizzes.length}</Text>
          <Text style={styles.quickStatLabel}>Quizzes</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatIcon}>📅</Text>
          <Text style={styles.quickStatNumber}>{timetableEntries.length}</Text>
          <Text style={styles.quickStatLabel}>Events</Text>
        </View>
      </View>

      {/* Today's Schedule */}
      {todaysSchedule.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Todays Schedule</Text>
          {todaysSchedule.slice(0, 3).map((event) => (
            <View key={event.id} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>
                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleTitle}>{event.title}</Text>
                <Text style={styles.scheduleType}>{event.type.toUpperCase()}</Text>
              </View>
            </View>
          ))}
          {todaysSchedule.length > 3 && (
            <Text style={styles.moreText}>+{todaysSchedule.length - 3} more events</Text>
          )}
        </View>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔜 Upcoming Events</Text>
          {upcomingEvents.slice(0, 3).map((event) => (
            <View key={event.id} style={styles.scheduleItem}>
              <Text style={styles.scheduleDate}>
                {new Date(event.startTime).toLocaleDateString()}
              </Text>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleTitle}>{event.title}</Text>
                <Text style={styles.scheduleType}>{event.type.toUpperCase()}</Text>
              </View>
            </View>
          ))}
          {upcomingEvents.length > 3 && (
            <Text style={styles.moreText}>+{upcomingEvents.length - 3} more events</Text>
          )}
        </View>
      )}

      {/* Sync Status */}
      {lastSyncTime && (
        <View style={styles.syncInfo}>
          <Text style={styles.syncInfoText}>
            Last synced: {new Date(lastSyncTime).toLocaleString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  onlineStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  offlineStatus: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  quickStatCard: {
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 60,
  },
  scheduleDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    width: 80,
  },
  scheduleDetails: {
    flex: 1,
    marginLeft: 10,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduleType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  syncInfo: {
    padding: 15,
    alignItems: 'center',
  },
  syncInfoText: {
    fontSize: 12,
    color: '#666',
  },
});
