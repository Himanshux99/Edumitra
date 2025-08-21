import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useGuardianStore } from '../../store/guardianStore';
import { guardianService } from '../../services/guardianService';
import { Colors } from '../../constants/Colors';
import { GuardianStudentLink, AccessLevel, ConsentPermission, GuardianRelationship } from '../../types/guardian';

const { width } = Dimensions.get('window');

export default function GuardianViewScreen() {
  const {
    currentGuardian,
    linkedStudents,
    selectedStudent,
    notifications,
    unreadCount,
    isLoading,
    error,
    getActiveConsents,
    getPendingConsentRequests,
    getCriticalAlerts,
    getOverallStudentSummary,
    clearError,
    setSelectedStudent
  } = useGuardianStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [relationship, setRelationship] = useState<GuardianRelationship>('guardian');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('full');
  const [selectedPermissions, setSelectedPermissions] = useState<ConsentPermission[]>([
    'view_grades',
    'view_attendance',
    'view_assignments',
    'receive_notifications'
  ]);

  useEffect(() => {
    loadGuardianData();
    initializeSampleData();
  }, []);

  const loadGuardianData = async () => {
    try {
      await guardianService.loadAllGuardianData();
    } catch (error) {
      console.error('Failed to load guardian data:', error);
      Alert.alert('Error', 'Failed to load guardian data');
    }
  };

  const initializeSampleData = async () => {
    // Initialize sample guardian profile if none exists
    if (!currentGuardian) {
      try {
        await guardianService.createGuardianProfile({
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1234567890',
          relationship: 'father'
        });
      } catch (error) {
        console.error('Failed to create guardian profile:', error);
      }
    }

    // Add sample student link if none exists
    if (linkedStudents.length === 0) {
      try {
        await guardianService.requestStudentAccess(
          'student@example.com',
          'father',
          'full',
          ['view_grades', 'view_attendance', 'view_assignments', 'receive_notifications']
        );
        
        // Auto-approve for demo purposes
        setTimeout(async () => {
          const store = useGuardianStore.getState();
          const pendingRequests = store.getPendingConsentRequests();
          if (pendingRequests.length > 0) {
            await guardianService.approveConsentRequest(
              pendingRequests[0].id,
              ['view_grades', 'view_attendance', 'view_assignments', 'receive_notifications']
            );
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to create sample student link:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGuardianData();
    setRefreshing(false);
  };

  const handleAddStudent = async () => {
    if (!studentEmail.trim()) {
      Alert.alert('Error', 'Please enter student email');
      return;
    }

    try {
      await guardianService.requestStudentAccess(
        studentEmail.trim(),
        relationship,
        accessLevel,
        selectedPermissions
      );

      setShowAddStudentModal(false);
      setStudentEmail('');
      Alert.alert(
        'Request Sent',
        'A consent request has been sent to the student. You will be notified once they approve access.'
      );
    } catch (error) {
      console.error('Failed to request student access:', error);
      Alert.alert('Error', 'Failed to send access request');
    }
  };

  const handleStudentSelect = (student: GuardianStudentLink) => {
    setSelectedStudent(student);
    router.push(`/guardian/student/${student.studentId}`);
  };

  const handleRevokeAccess = (student: GuardianStudentLink) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to revoke access to ${student.studentName}'s data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await guardianService.revokeStudentAccess(student.id);
              Alert.alert('Success', 'Access revoked successfully');
            } catch (error) {
              console.error('Failed to revoke access:', error);
              Alert.alert('Error', 'Failed to revoke access');
            }
          },
        },
      ]
    );
  };

  const activeConsents = getActiveConsents();
  const pendingRequests = getPendingConsentRequests();
  const criticalAlerts = getCriticalAlerts();
  const overallSummary = getOverallStudentSummary();

  const accessLevels: AccessLevel[] = ['full', 'limited', 'summary_only', 'emergency_only'];
  const relationships: GuardianRelationship[] = ['father', 'mother', 'guardian', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sibling', 'other'];
  const availablePermissions: ConsentPermission[] = [
    'view_grades',
    'view_attendance',
    'view_assignments',
    'view_schedule',
    'view_behavior',
    'view_fees',
    'receive_notifications',
    'contact_teachers',
    'emergency_contact'
  ];

  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case 'full': return '#4CAF50';
      case 'limited': return '#FF9800';
      case 'summary_only': return '#2196F3';
      case 'emergency_only': return '#f44336';
      default: return Colors.light.tabIconDefault;
    }
  };

  const getAccessLevelText = (level: AccessLevel) => {
    switch (level) {
      case 'full': return 'Full Access';
      case 'limited': return 'Limited Access';
      case 'summary_only': return 'Summary Only';
      case 'emergency_only': return 'Emergency Only';
      default: return level;
    }
  };

  const renderStudentCard = (student: GuardianStudentLink) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => handleStudentSelect(student)}
    >
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.studentName}</Text>
          <Text style={styles.studentEmail}>{student.studentEmail}</Text>
          <Text style={styles.relationship}>
            {student.relationship.charAt(0).toUpperCase() + student.relationship.slice(1)}
          </Text>
        </View>
        <View style={styles.studentStatus}>
          <View style={[styles.accessBadge, { backgroundColor: getAccessLevelColor(student.accessLevel) + '20' }]}>
            <Text style={[styles.accessText, { color: getAccessLevelColor(student.accessLevel) }]}>
              {getAccessLevelText(student.accessLevel)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.revokeButton}
            onPress={() => handleRevokeAccess(student)}
          >
            <MaterialIcons name="remove-circle-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.studentActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleStudentSelect(student)}
        >
          <MaterialIcons name="visibility" size={16} color="white" />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.notificationButton]}
          onPress={() => router.push(`/guardian/notifications/${student.studentId}`)}
        >
          <MaterialIcons name="notifications" size={16} color="white" />
          <Text style={styles.actionButtonText}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            loadGuardianData();
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Guardian View</Text>
              <Text style={styles.subtitle}>
                Monitor your children's academic progress
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddStudentModal(true)}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overallSummary.totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overallSummary.averageGPA.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg GPA</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{overallSummary.averageAttendance.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critical Alerts</Text>
            <View style={styles.alertsContainer}>
              {criticalAlerts.slice(0, 3).map((alert) => (
                <View key={alert.id} style={styles.alertCard}>
                  <MaterialIcons name="warning" size={20} color="#f44336" />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/guardian/notifications')}>
                    <MaterialIcons name="chevron-right" size={20} color={Colors.light.tabIconDefault} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pending Consent Requests */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.requestsContainer}>
              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle}>Access Request</Text>
                    <Text style={styles.requestMessage}>{request.message}</Text>
                    <Text style={styles.requestDate}>
                      Requested: {new Date(request.requestedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => guardianService.approveConsentRequest(request.id, request.permissions)}
                    >
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.denyButton]}
                      onPress={() => guardianService.denyConsent(request.id, 'Access denied by guardian')}
                    >
                      <Text style={styles.actionButtonText}>Deny</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Connected Students */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Students ({activeConsents.length})</Text>
          {activeConsents.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="child-care" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No students connected</Text>
              <Text style={styles.emptyStateSubtext}>
                Add a student to start monitoring their academic progress
              </Text>
              <TouchableOpacity
                style={styles.getStartedButton}
                onPress={() => setShowAddStudentModal(true)}
              >
                <Text style={styles.getStartedButtonText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.studentsList}>
              {activeConsents.map(renderStudentCard)}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/guardian/notifications')}
            >
              <MaterialIcons name="notifications" size={24} color={Colors.light.tint} />
              <Text style={styles.quickActionText}>View All Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/guardian/settings')}
            >
              <MaterialIcons name="settings" size={24} color={Colors.light.tint} />
              <Text style={styles.quickActionText}>Notification Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/guardian/reports')}
            >
              <MaterialIcons name="assessment" size={24} color={Colors.light.tint} />
              <Text style={styles.quickActionText}>Generate Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/guardian/help')}
            >
              <MaterialIcons name="help" size={24} color={Colors.light.tint} />
              <Text style={styles.quickActionText}>Help & Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={showAddStudentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddStudentModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddStudentModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Student</Text>
            <TouchableOpacity
              onPress={handleAddStudent}
              disabled={!studentEmail.trim()}
            >
              <Text style={[
                styles.sendText,
                !studentEmail.trim() && styles.disabledText
              ]}>
                Send Request
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Student Email *</Text>
              <TextInput
                style={styles.textInput}
                value={studentEmail}
                onChangeText={setStudentEmail}
                placeholder="Enter student's email address"
                placeholderTextColor={Colors.light.tabIconDefault}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.relationshipPicker}>
                  {relationships.map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relationshipOption,
                        relationship === rel && styles.selectedRelationship
                      ]}
                      onPress={() => setRelationship(rel)}
                    >
                      <Text style={[
                        styles.relationshipOptionText,
                        relationship === rel && styles.selectedRelationshipText
                      ]}>
                        {rel.charAt(0).toUpperCase() + rel.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Access Level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.accessLevelPicker}>
                  {accessLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.accessLevelOption,
                        accessLevel === level && styles.selectedAccessLevel
                      ]}
                      onPress={() => setAccessLevel(level)}
                    >
                      <Text style={[
                        styles.accessLevelOptionText,
                        accessLevel === level && styles.selectedAccessLevelText
                      ]}>
                        {getAccessLevelText(level)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Permissions</Text>
              <View style={styles.permissionsContainer}>
                {availablePermissions.map((permission) => (
                  <TouchableOpacity
                    key={permission}
                    style={[
                      styles.permissionOption,
                      selectedPermissions.includes(permission) && styles.selectedPermission
                    ]}
                    onPress={() => {
                      if (selectedPermissions.includes(permission)) {
                        setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
                      } else {
                        setSelectedPermissions([...selectedPermissions, permission]);
                      }
                    }}
                  >
                    <MaterialIcons 
                      name={selectedPermissions.includes(permission) ? "check-box" : "check-box-outline-blank"} 
                      size={20} 
                      color={selectedPermissions.includes(permission) ? Colors.light.tint : Colors.light.tabIconDefault} 
                    />
                    <Text style={[
                      styles.permissionText,
                      selectedPermissions.includes(permission) && styles.selectedPermissionText
                    ]}>
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  requestsContainer: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  studentsList: {
    gap: 16,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  relationship: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  studentStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  accessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  accessText: {
    fontSize: 10,
    fontWeight: '600',
  },
  revokeButton: {
    padding: 4,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    backgroundColor: Colors.light.tint,
  },
  notificationButton: {
    backgroundColor: '#FF9800',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  denyButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '20',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '20',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sendText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  disabledText: {
    color: Colors.light.tabIconDefault,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  relationshipPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedRelationship: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  relationshipOptionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedRelationshipText: {
    color: 'white',
  },
  accessLevelPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  accessLevelOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedAccessLevel: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  accessLevelOptionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedAccessLevelText: {
    color: 'white',
  },
  permissionsContainer: {
    gap: 12,
  },
  permissionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  selectedPermission: {
    // Additional styling for selected permissions if needed
  },
  permissionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedPermissionText: {
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
