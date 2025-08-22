/**
 * Student Data Management Screen
 * 
 * This screen provides access to the comprehensive student data management system.
 * It shows different interfaces based on user role:
 * - Students: Can view and edit only their own data
 * - Admins/Teachers: Can view and manage all students' data
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import StudentDataManager from '../../components/student/StudentDataManager';
import AdminStudentDataViewer from '../../components/admin/AdminStudentDataViewer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function StudentDataScreen() {
  const { userProfile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Determine which component to show based on user role
  const isAdmin = userProfile?.role && ['admin', 'teacher', 'super_admin'].includes(userProfile.role);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isAdmin ? (
        <AdminStudentDataViewer />
      ) : (
        <StudentDataManager />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
