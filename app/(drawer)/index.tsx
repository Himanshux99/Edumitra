import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { syncService } from '../../services/syncService';
import { useLearningStore } from '../../store/learningStore';

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 0.3,
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
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
    color: '#2c3e50',
    letterSpacing: 0.3,
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
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  quickStatCard: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  quickStatLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
