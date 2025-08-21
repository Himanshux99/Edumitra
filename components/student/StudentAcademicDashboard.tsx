import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { studentDataService } from '../../services/studentDataService';
import { StudentAcademicData, StudentDashboardData } from '../../types/student';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import InitialStudentDataView from './InitialStudentDataView';

interface StudentAcademicDashboardProps {
  onUploadData?: () => void;
  onEditData?: () => void;
}

export default function StudentAcademicDashboard({ 
  onUploadData, 
  onEditData 
}: StudentAcademicDashboardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useAuth();
  const { isOffline, isConnected } = useNetworkStatus();

  // State management
  const [studentData, setStudentData] = useState<StudentAcademicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#ff4444',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    scrollContainer: {
      padding: 20,
    },
    header: {
      backgroundColor: colors.tint,
      padding: 20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginBottom: 20,
    },
    headerContent: {
      alignItems: 'center',
    },
    studentName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 4,
    },
    studentId: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.9,
    },
    overviewSection: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitleText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    sectionIcon: {
      marginRight: 8,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    metricCard: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
      borderRadius: 8,
      padding: 12,
      width: '48%',
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.tint,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
    progressBar: {
      height: 8,
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
      borderRadius: 4,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.tint,
      borderRadius: 4,
    },
    subjectsList: {
      gap: 8,
    },
    subjectItem: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    subjectInfo: {
      flex: 1,
    },
    subjectName: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 2,
    },
    subjectCode: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
    subjectGrade: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.tint,
    },
    alertsList: {
      gap: 8,
    },
    alertItem: {
      backgroundColor: '#fff3cd',
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107',
      borderRadius: 8,
      padding: 12,
    },
    alertItemHigh: {
      backgroundColor: '#f8d7da',
      borderLeftColor: '#dc3545',
    },
    alertText: {
      fontSize: 14,
      color: '#856404',
    },
    alertTextHigh: {
      color: '#721c24',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
      marginBottom: 20,
    },
    uploadButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    uploadButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      marginLeft: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    editButton: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.tint,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    editButtonText: {
      color: colors.tint,
      fontWeight: '600',
    },
    refreshButton: {
      flex: 1,
      backgroundColor: colors.tint,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    refreshButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    offlineIndicator: {
      backgroundColor: '#ff8800',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      alignSelf: 'center',
    },
    offlineIndicatorText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

  // Load student data on component mount
  useEffect(() => {
    loadStudentData();
  }, [userProfile?.uid]);

  // Set up real-time listener
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = studentDataService.subscribeToStudentData(
      userProfile.uid,
      (data) => {
        setStudentData(data);
        setIsLoading(false);
        setError(null);
      }
    );

    return unsubscribe;
  }, [userProfile?.uid]);

  // Load student data function
  const loadStudentData = async () => {
    try {
      if (!userProfile?.uid) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      setError(null);
      let result = await studentDataService.getStudentData(userProfile.uid);

      // If no data exists, initialize it
      if (result.success && !result.data && userProfile.role === 'student') {
        console.log('No student data found, initializing...');
        const studentId = userProfile.studentData?.studentId || `STU${Date.now()}`;
        const initResult = await studentDataService.initializeStudentData(userProfile.uid, studentId);

        if (initResult.success) {
          result = initResult;
        }
      }

      if (result.success) {
        setStudentData(result.data || null);
      } else {
        setError(result.error || 'Failed to load student data');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStudentData();
    setIsRefreshing(false);
  };

  // Handle retry
  const handleRetry = () => {
    setIsLoading(true);
    loadStudentData();
  };

  // Calculate dashboard metrics
  const getDashboardMetrics = (data: StudentAcademicData) => {
    const totalCreditsEarned = data.completedCourses.reduce((sum, course) => sum + course.credits, 0);
    const progressPercentage = Math.min((totalCreditsEarned / 120) * 100, 100); // Assuming 120 total credits
    
    return {
      cgpa: data.cgpa,
      attendance: data.attendance.overallPercentage,
      completedCredits: totalCreditsEarned,
      progressPercentage,
      currentSemester: data.currentSemester
    };
  };

  // Get grade color
  const getGradeColor = (grade: string): string => {
    const gradeColors: { [key: string]: string } = {
      'A+': '#00C851',
      'A': '#00C851',
      'A-': '#2BBBAD',
      'B+': '#4285F4',
      'B': '#4285F4',
      'B-': '#FF8800',
      'C+': '#FF8800',
      'C': '#FF6600',
      'C-': '#FF4444',
      'D+': '#FF4444',
      'D': '#CC0000',
      'F': '#CC0000'
    };
    return gradeColors[grade] || colors.tint;
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={styles.loadingText}>Loading academic data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show initial state with default values if no data uploaded yet
  if (!studentData) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.emptyState}>
          <IconSymbol
            name="doc.text.below.ecg"
            size={64}
            color={colorScheme === 'dark' ? '#666666' : '#cccccc'}
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateTitle}>Welcome to Your Academic Dashboard</Text>
          <Text style={styles.emptyStateText}>
            Your academic data is being initialized. Upload your academic information
            to view detailed performance metrics, track your progress, and get insights
            into your academic journey.
          </Text>

          {onUploadData && (
            <TouchableOpacity style={styles.uploadButton} onPress={onUploadData}>
              <IconSymbol name="plus" size={16} color="#ffffff" />
              <Text style={styles.uploadButtonText}>Upload Academic Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  // Check if this is initial/default data (no subjects uploaded yet)
  const isInitialData = studentData.subjects.length === 0 &&
                       studentData.completedCourses.length === 0 &&
                       studentData.cgpa === 0;

  // Show initial data view for new students
  if (isInitialData) {
    return (
      <InitialStudentDataView
        studentData={studentData}
        onUploadData={onUploadData}
        isOffline={isOffline}
      />
    );
  }

  // Main dashboard with data
  const metrics = getDashboardMetrics(studentData);
  const calculatedMetrics = studentDataService.calculateAcademicMetrics(studentData);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.studentName}>{userProfile?.displayName}</Text>
          <Text style={styles.studentId}>Student ID: {studentData.studentId}</Text>
        </View>
      </View>

      <View style={styles.scrollContainer}>
        {/* Offline Indicator */}
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <IconSymbol name="wifi.slash" size={14} color="#ffffff" />
            <Text style={styles.offlineIndicatorText}>
              Offline - Showing cached data
            </Text>
          </View>
        )}

        {/* Academic Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="chart.bar.fill" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Academic Overview</Text>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.cgpa.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>CGPA</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.attendance.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Attendance</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.completedCredits}</Text>
              <Text style={styles.metricLabel}>Credits Earned</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>Sem {metrics.currentSemester}</Text>
              <Text style={styles.metricLabel}>Current Semester</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.metricLabel}>Degree Progress: {metrics.progressPercentage.toFixed(1)}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${metrics.progressPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Recent Subject Performance */}
        <View style={styles.overviewSection}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="book.fill" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Recent Performance</Text>
          </View>
          
          <View style={styles.subjectsList}>
            {studentData.subjects.slice(0, 5).map((subject, index) => (
              <View key={index} style={styles.subjectItem}>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subject.subjectName}</Text>
                  <Text style={styles.subjectCode}>
                    {subject.subjectCode} • {subject.credits} Credits • Sem {subject.semester}
                  </Text>
                </View>
                <Text style={[styles.subjectGrade, { color: getGradeColor(subject.grade) }]}>
                  {subject.grade}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Academic Alerts */}
        {calculatedMetrics.academicAlerts.length > 0 && (
          <View style={styles.overviewSection}>
            <View style={styles.sectionTitle}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#ffc107" style={styles.sectionIcon} />
              <Text style={styles.sectionTitleText}>Academic Alerts</Text>
            </View>
            
            <View style={styles.alertsList}>
              {calculatedMetrics.academicAlerts.map((alert, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.alertItem,
                    alert.severity === 'high' && styles.alertItemHigh
                  ]}
                >
                  <Text style={[
                    styles.alertText,
                    alert.severity === 'high' && styles.alertTextHigh
                  ]}>
                    {alert.message}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onEditData && (
            <TouchableOpacity style={styles.editButton} onPress={onEditData}>
              <Text style={styles.editButtonText}>Edit Data</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
