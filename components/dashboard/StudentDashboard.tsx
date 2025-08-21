import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function StudentDashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, signOut } = useAuth();

  const studentActions = [
    {
      title: 'My Lessons',
      description: 'Continue your learning journey',
      icon: 'book.fill',
      color: '#007AFF',
      onPress: () => router.push('/(drawer)/lessons'),
    },
    {
      title: 'Take Quiz',
      description: 'Test your knowledge with quizzes',
      icon: 'questionmark.circle.fill',
      color: '#34C759',
      onPress: () => router.push('/(drawer)/quizzes'),
    },
    {
      title: 'Study Timetable',
      description: 'View your class schedule',
      icon: 'calendar',
      color: '#FF9500',
      onPress: () => router.push('/(drawer)/timetable'),
    },
    {
      title: 'Assignments',
      description: 'View and submit assignments',
      icon: 'doc.text.fill',
      color: '#8E8E93',
      onPress: () => Alert.alert('Feature', 'Assignments coming soon!'),
    },
    {
      title: 'Grades',
      description: 'Check your academic performance',
      icon: 'chart.line.uptrend.xyaxis',
      color: '#FF3B30',
      onPress: () => Alert.alert('Feature', 'Grades view coming soon!'),
    },
    {
      title: 'Study Materials',
      description: 'Access course materials and resources',
      icon: 'folder.fill',
      color: '#5856D6',
      onPress: () => router.push('/(drawer)/content'),
    },
  ];

  const progressStats = [
    { label: 'Lessons Completed', value: '24/30', icon: 'checkmark.circle.fill', color: '#34C759' },
    { label: 'Quiz Average', value: '85%', icon: 'star.fill', color: '#FF9500' },
    { label: 'Study Streak', value: '7 days', icon: 'flame.fill', color: '#FF3B30' },
    { label: 'Next Class', value: '2:30 PM', icon: 'clock.fill', color: '#007AFF' },
  ];

  const recentActivity = [
    { title: 'Completed Math Quiz', time: '2 hours ago', icon: 'checkmark.circle.fill', color: '#34C759' },
    { title: 'Started Physics Lesson', time: '1 day ago', icon: 'play.circle.fill', color: '#007AFF' },
    { title: 'Submitted Assignment', time: '2 days ago', icon: 'doc.text.fill', color: '#FF9500' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    header: {
      backgroundColor: colors.tint,
      padding: 20,
      paddingTop: 40,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    welcomeSection: {
      flex: 1,
    },
    welcomeText: {
      fontSize: 16,
      color: '#ffffff',
      opacity: 0.9,
    },
    nameText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginTop: 4,
    },
    roleText: {
      fontSize: 14,
      color: '#ffffff',
      opacity: 0.8,
      marginTop: 2,
    },
    signOutButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    signOutText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    statCard: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      width: '48%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statIcon: {
      marginRight: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    actionCard: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      width: '48%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      lineHeight: 16,
    },
    activityList: {
      gap: 12,
    },
    activityItem: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    activityIcon: {
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('StudentDashboard - Starting logout...');
              await signOut();
              console.log('StudentDashboard - Logout completed, AuthGuard should handle navigation');
              // Let AuthGuard handle the navigation automatically
            } catch (error) {
              console.error('StudentDashboard - Logout error:', error);
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
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userProfile?.displayName}</Text>
            <Text style={styles.roleText}>Student</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Progress Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {progressStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.statIcon}>
                    <IconSymbol size={16} name={stat.icon as any} color={stat.color} />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {studentActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <IconSymbol size={20} name={action.icon as any} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <IconSymbol size={20} name={activity.icon as any} color={activity.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
