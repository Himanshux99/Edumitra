import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Import components
import StudentAcademicDashboard from '../../components/student/StudentAcademicDashboard';
import StudentDataUploadForm from '../../components/student/StudentDataUploadForm';
import AdminStudentDataView from '../../components/admin/AdminStudentDataView';

type ViewMode = 'dashboard' | 'upload' | 'admin';

export default function AcademicDataScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useAuth();

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    header: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    headerSubtitle: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButtonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.tint,
    },
    headerButtonText: {
      color: '#ffffff',
      fontWeight: '600',
      marginLeft: 4,
      fontSize: 12,
    },
    headerButtonTextSecondary: {
      color: colors.tint,
    },
    tabContainer: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: colors.tint,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
    tabTextActive: {
      color: colors.tint,
    },
    content: {
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    closeButton: {
      padding: 8,
    },
    accessDeniedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    accessDeniedText: {
      fontSize: 16,
      color: '#ff4444',
      textAlign: 'center',
      marginTop: 16,
    },
  });

  // Check user permissions
  const isAdmin = userProfile?.role && ['admin', 'super_admin', 'teacher'].includes(userProfile.role);
  const isStudent = userProfile?.role === 'student';

  // Handle upload success
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    Alert.alert('Success', 'Academic data uploaded successfully!');
    // Refresh dashboard by switching views
    setCurrentView('dashboard');
  };

  // Handle upload cancel
  const handleUploadCancel = () => {
    setShowUploadModal(false);
  };

  // Handle edit data
  const handleEditData = () => {
    setShowUploadModal(true);
  };

  // Render header based on user role and current view
  const renderHeader = () => {
    let title = 'Academic Data';
    let subtitle = '';

    if (currentView === 'admin') {
      title = 'Students Overview';
      subtitle = 'Monitor all students academic performance';
    } else if (isStudent) {
      title = 'My Academic Data';
      subtitle = 'Track your academic progress and performance';
    } else {
      title = 'Academic Data';
      subtitle = 'Manage academic information';
    }

    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
          
          <View style={styles.headerActions}>
            {(isStudent || currentView !== 'admin') && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowUploadModal(true)}
              >
                <IconSymbol name="plus" size={14} color="#ffffff" />
                <Text style={styles.headerButtonText}>
                  {isStudent ? 'Upload Data' : 'Add Data'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Render tabs for admin users
  const renderTabs = () => {
    if (!isAdmin) return null;

    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentView === 'dashboard' && styles.tabActive]}
          onPress={() => setCurrentView('dashboard')}
        >
          <Text style={[styles.tabText, currentView === 'dashboard' && styles.tabTextActive]}>
            My Data
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, currentView === 'admin' && styles.tabActive]}
          onPress={() => setCurrentView('admin')}
        >
          <Text style={[styles.tabText, currentView === 'admin' && styles.tabTextActive]}>
            All Students
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render main content based on current view and user role
  const renderContent = () => {
    // Admin view - show all students data
    if (currentView === 'admin' && isAdmin) {
      return (
        <AdminStudentDataView
          onStudentSelect={(student) => {
            Alert.alert(
              'Student Details',
              `Student ID: ${student.studentId}\nCGPA: ${student.cgpa}\nAttendance: ${student.attendance.overallPercentage}%`,
              [{ text: 'OK' }]
            );
          }}
        />
      );
    }

    // Student dashboard view (for both students and admins viewing their own data)
    if (currentView === 'dashboard') {
      return (
        <StudentAcademicDashboard
          onUploadData={() => setShowUploadModal(true)}
          onEditData={handleEditData}
        />
      );
    }

    // Default fallback
    return (
      <View style={styles.accessDeniedContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#ff4444" />
        <Text style={styles.accessDeniedText}>
          Unable to load content. Please check your permissions.
        </Text>
      </View>
    );
  };

  // Check if user has access
  if (!userProfile) {
    return (
      <View style={styles.accessDeniedContainer}>
        <IconSymbol name="person.fill.xmark" size={48} color="#ff4444" />
        <Text style={styles.accessDeniedText}>
          Please sign in to access academic data.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleUploadCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isStudent ? 'Upload Academic Data' : 'Add Academic Data'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleUploadCancel}
              >
                <IconSymbol name="xmark" size={20} color={colorScheme === 'dark' ? '#ffffff' : '#333333'} />
              </TouchableOpacity>
            </View>
            
            <StudentDataUploadForm
              onSuccess={handleUploadSuccess}
              onCancel={handleUploadCancel}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
