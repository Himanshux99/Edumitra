import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StudentAcademicData } from '../../types/student';

interface InitialStudentDataViewProps {
  studentData: StudentAcademicData;
  onUploadData?: () => void;
  isOffline?: boolean;
}

export default function InitialStudentDataView({ 
  studentData, 
  onUploadData,
  isOffline = false 
}: InitialStudentDataViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    scrollContainer: {
      padding: 20,
    },
    welcomeSection: {
      backgroundColor: colors.tint,
      padding: 20,
      borderRadius: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.9,
      textAlign: 'center',
      marginBottom: 16,
    },
    studentInfo: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    studentId: {
      fontSize: 14,
      color: '#ffffff',
      fontWeight: '600',
    },
    academicYear: {
      fontSize: 12,
      color: '#ffffff',
      opacity: 0.8,
      marginTop: 2,
    },
    metricsSection: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
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
      padding: 16,
      width: '48%',
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.tint,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
    infoSection: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoText: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      lineHeight: 20,
      marginBottom: 12,
    },
    featureList: {
      marginTop: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    featureIcon: {
      marginRight: 8,
    },
    featureText: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      flex: 1,
    },
    actionButtons: {
      gap: 12,
      marginTop: 20,
    },
    uploadButton: {
      backgroundColor: colors.tint,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    uploadButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
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

  const features = [
    { icon: 'chart.bar.fill', text: 'Track your CGPA and academic performance' },
    { icon: 'calendar.badge.checkmark', text: 'Monitor attendance across all subjects' },
    { icon: 'book.fill', text: 'View subject-wise grades and progress' },
    { icon: 'trophy.fill', text: 'Earn achievements and track milestones' },
    { icon: 'exclamationmark.triangle.fill', text: 'Get alerts for academic improvements' },
    { icon: 'wifi.slash', text: 'Access your data even when offline' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContainer}>
        {/* Offline Indicator */}
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <IconSymbol name="wifi.slash" size={14} color="#ffffff" />
            <Text style={styles.offlineIndicatorText}>
              Offline Mode - Data cached locally
            </Text>
          </View>
        )}

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Your Academic Journey!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your academic dashboard has been initialized and is ready to track your progress.
          </Text>
          <View style={styles.studentInfo}>
            <Text style={styles.studentId}>Student ID: {studentData.studentId}</Text>
            <Text style={styles.academicYear}>Academic Year: {studentData.academicYear}</Text>
          </View>
        </View>

        {/* Current Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="chart.bar.fill" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Your Current Status</Text>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{studentData.cgpa.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>CGPA</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{studentData.attendance.overallPercentage.toFixed(0)}%</Text>
              <Text style={styles.metricLabel}>Attendance</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{studentData.academicMetrics.totalCreditsEarned}</Text>
              <Text style={styles.metricLabel}>Credits Earned</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>Sem {studentData.currentSemester}</Text>
              <Text style={styles.metricLabel}>Current Semester</Text>
            </View>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="info.circle.fill" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Getting Started</Text>
          </View>
          
          <Text style={styles.infoText}>
            Your academic dashboard is now ready! Upload your academic data to unlock powerful 
            features that will help you track your progress and achieve your academic goals.
          </Text>

          <View style={styles.featureList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <IconSymbol 
                  name={feature.icon as any} 
                  size={16} 
                  color={colors.tint} 
                  style={styles.featureIcon} 
                />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onUploadData && (
            <TouchableOpacity style={styles.uploadButton} onPress={onUploadData}>
              <IconSymbol name="plus.circle.fill" size={20} color="#ffffff" />
              <Text style={styles.uploadButtonText}>Upload Your Academic Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
