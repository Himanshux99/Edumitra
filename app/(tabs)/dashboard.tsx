import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useDashboardStore } from '../../store/dashboardStore';
import { firebaseService } from '../../services/firebaseService';
import { notificationService } from '../../services/notificationService';
import AcademicOverview from '../../components/dashboard/AcademicOverview';
import GoalsReminders from '../../components/dashboard/GoalsReminders';
import ExamPrepTracker from '../../components/dashboard/ExamPrepTracker';

type DashboardTab = 'overview' | 'academic' | 'goals' | 'exams';

export default function DashboardScreen() {
  const {
    dashboardSummary,
    isLoading,
    error,
    setLoading,
    setError,
    setDashboardSummary,
    setAttendanceRecords,
    setGrades,
    setStudyGoals,
    setAssignments,
    setExams,
    setLastSyncTime
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all dashboard data
      const [
        summary,
        attendance,
        grades,
        goals,
        assignments,
        exams
      ] = await Promise.all([
        firebaseService.getDashboardSummary(),
        firebaseService.getAttendanceRecords(),
        firebaseService.getGrades(),
        firebaseService.getStudyGoals(),
        firebaseService.getAssignments(),
        firebaseService.getExams()
      ]);

      setDashboardSummary(summary);
      setAttendanceRecords(attendance);
      setGrades(grades);
      setStudyGoals(goals);
      setAssignments(assignments);
      setExams(exams);
      setLastSyncTime(new Date().toISOString());

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleTestNotification = async () => {
    try {
      console.log('Testing notification from dashboard...');

      // Check permissions first
      const permissionStatus = await notificationService.getPermissionStatus();

      if (!permissionStatus.granted) {
        Alert.alert(
          'Permissions Required',
          'Notifications are not enabled. Please go to the Notifications tab to enable them.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      await notificationService.sendImmediateNotification(
        '🎉 Dashboard Test',
        'This notification was sent from the dashboard! Your notification system is working.',
        { source: 'dashboard', timestamp: new Date().toISOString() },
        'normal'
      );
      Alert.alert('Success', 'Test notification sent successfully!');
    } catch (error) {
      console.error('Dashboard notification test failed:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderOverview = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{dashboardSummary?.currentGPA.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Current GPA</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{dashboardSummary?.weeklyAttendanceRate || 0}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📝</Text>
          <Text style={styles.statValue}>{dashboardSummary?.pendingAssignments || 0}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{dashboardSummary?.upcomingExams || 0}</Text>
          <Text style={styles.statLabel}>Upcoming Exams</Text>
        </View>
      </View>

      {/* Performance Trends */}
      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>📈 Performance Trends</Text>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Academic Performance</Text>
          <View style={styles.trendIndicator}>
            <Text style={[
              styles.trendValue,
              { color: dashboardSummary?.performanceTrend === 'improving' ? '#4CAF50' : 
                       dashboardSummary?.performanceTrend === 'stable' ? '#FF9800' : '#F44336' }
            ]}>
              {dashboardSummary?.performanceTrend === 'improving' ? '↗️ Improving' :
               dashboardSummary?.performanceTrend === 'stable' ? '➡️ Stable' : '↘️ Declining'}
            </Text>
          </View>
        </View>
        
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Attendance</Text>
          <View style={styles.trendIndicator}>
            <Text style={[
              styles.trendValue,
              { color: dashboardSummary?.attendanceTrend === 'improving' ? '#4CAF50' : 
                       dashboardSummary?.attendanceTrend === 'stable' ? '#FF9800' : '#F44336' }
            ]}>
              {dashboardSummary?.attendanceTrend === 'improving' ? '↗️ Improving' :
               dashboardSummary?.attendanceTrend === 'stable' ? '➡️ Stable' : '↘️ Declining'}
            </Text>
          </View>
        </View>
        
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Study Consistency</Text>
          <View style={styles.trendIndicator}>
            <Text style={[
              styles.trendValue,
              { color: dashboardSummary?.studyConsistency === 'excellent' ? '#4CAF50' : 
                       dashboardSummary?.studyConsistency === 'good' ? '#8BC34A' :
                       dashboardSummary?.studyConsistency === 'average' ? '#FF9800' : '#F44336' }
            ]}>
              {dashboardSummary?.studyConsistency?.charAt(0).toUpperCase() + 
               dashboardSummary?.studyConsistency?.slice(1) || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>🕒 Recent Activity</Text>
        
        {dashboardSummary?.recentGrades.slice(0, 3).map((grade) => (
          <View key={grade.id} style={styles.activityItem}>
            <Text style={styles.activityIcon}>📊</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{grade.assessmentName}</Text>
              <Text style={styles.activitySubtitle}>{grade.courseName}</Text>
            </View>
            <Text style={[
              styles.activityValue,
              { color: grade.percentage >= 80 ? '#4CAF50' : grade.percentage >= 60 ? '#FF9800' : '#F44336' }
            ]}>
              {grade.percentage}%
            </Text>
          </View>
        ))}
        
        {dashboardSummary?.upcomingDeadlines.slice(0, 2).map((assignment) => (
          <View key={assignment.id} style={styles.activityItem}>
            <Text style={styles.activityIcon}>📝</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{assignment.title}</Text>
              <Text style={styles.activitySubtitle}>Due: {new Date(assignment.dueDate).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.activityValue}>{assignment.progress}%</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('academic')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('goals')}
          >
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionText}>Set Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('exams')}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={styles.actionText}>Exam Prep</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefresh}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Test Notification</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'academic', label: 'Academic', icon: '📈' },
          { key: 'goals', label: 'Goals', icon: '🎯' },
          { key: 'exams', label: 'Exams', icon: '📚' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key as DashboardTab)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'academic' && <AcademicOverview />}
            {activeTab === 'goals' && <GoalsReminders />}
            {activeTab === 'exams' && <ExamPrepTracker />}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 18,
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
  trendCard: {
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
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  trendLabel: {
    fontSize: 14,
    color: '#333',
  },
  trendIndicator: {
    alignItems: 'flex-end',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityCard: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
  },
  activityValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsCard: {
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '47%',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
});
