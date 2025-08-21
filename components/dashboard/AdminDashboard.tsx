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

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile, signOut } = useAuth();

  const adminActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, and manage student and teacher accounts',
      icon: 'person.3.fill',
      color: '#007AFF',
      onPress: () => Alert.alert('Feature', 'User management coming soon!'),
    },
    {
      title: 'Course Management',
      description: 'Create and manage courses, lessons, and curriculum',
      icon: 'book.fill',
      color: '#34C759',
      onPress: () => router.push('/(drawer)/content'),
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed analytics and generate reports',
      icon: 'chart.bar.fill',
      color: '#FF9500',
      onPress: () => Alert.alert('Feature', 'Analytics dashboard coming soon!'),
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: 'gear',
      color: '#8E8E93',
      onPress: () => Alert.alert('Feature', 'System settings coming soon!'),
    },
    {
      title: 'Notifications',
      description: 'Send announcements and manage notifications',
      icon: 'bell.fill',
      color: '#FF3B30',
      onPress: () => router.push('/(drawer)/notifications'),
    },
    {
      title: 'Backup & Security',
      description: 'Manage data backup and security settings',
      icon: 'lock.shield.fill',
      color: '#5856D6',
      onPress: () => Alert.alert('Feature', 'Security settings coming soon!'),
    },
  ];

  const quickStats = [
    { label: 'Total Students', value: '1,234', icon: 'person.fill', color: '#007AFF' },
    { label: 'Active Teachers', value: '56', icon: 'person.badge.plus', color: '#34C759' },
    { label: 'Total Courses', value: '89', icon: 'book.fill', color: '#FF9500' },
    { label: 'System Health', value: '98%', icon: 'checkmark.circle.fill', color: '#30D158' },
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
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    actionsGrid: {
      gap: 12,
    },
    actionCard: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 4,
    },
    actionDescription: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      lineHeight: 20,
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
              await signOut();
            } catch (error) {
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
            <Text style={styles.roleText}>Administrator</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
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

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          <View style={styles.actionsGrid}>
            {adminActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionHeader}>
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                    <IconSymbol size={20} name={action.icon as any} color={action.color} />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
