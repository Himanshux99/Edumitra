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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useIntegrationStore } from '../../store/integrationStore';
import { integrationService } from '../../services/integrationService';
import { Colors } from '../../constants/Colors';
import { BaseIntegration, IntegrationType, IntegrationStatus } from '../../types/integrations';

const { width } = Dimensions.get('window');

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  provider: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  isAvailable: boolean;
  features: string[];
}

export default function IntegrationsScreen() {
  const {
    integrations,
    activeIntegrations,
    syncStatus,
    isLoading,
    error,
    getIntegrationsByType,
    getConnectedIntegrations,
    clearError
  } = useIntegrationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<IntegrationType | null>(null);

  useEffect(() => {
    loadIntegrationsData();
    initializeSampleIntegrations();
  }, []);

  const loadIntegrationsData = async () => {
    try {
      await integrationService.loadAllIntegrationData();
    } catch (error) {
      console.error('Failed to load integrations data:', error);
      Alert.alert('Error', 'Failed to load integrations data');
    }
  };

  const initializeSampleIntegrations = async () => {
    // Add sample integrations if none exist
    if (integrations.length === 0) {
      const sampleIntegrations: BaseIntegration[] = [
        {
          id: 'integration_1',
          name: 'Google Classroom',
          type: 'lms',
          status: 'connected',
          isEnabled: true,
          lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'daily',
          credentials: {
            accessToken: 'sample_token',
            refreshToken: 'sample_refresh_token'
          },
          settings: {
            autoSync: true,
            syncCourses: true,
            syncGrades: true,
            syncAttendance: false,
            syncAssignments: true,
            syncAnnouncements: true,
            notifyOnSync: true,
            conflictResolution: 'remote_wins'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'integration_2',
          name: 'College ERP',
          type: 'erp',
          status: 'connected',
          isEnabled: true,
          lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          syncFrequency: 'daily',
          credentials: {
            username: 'student_id',
            password: 'encrypted_password',
            baseUrl: 'https://erp.college.edu'
          },
          settings: {
            autoSync: true,
            syncCourses: false,
            syncGrades: true,
            syncAttendance: true,
            syncAssignments: false,
            syncAnnouncements: true,
            notifyOnSync: true,
            conflictResolution: 'remote_wins'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Add sample integrations to store
      const store = useIntegrationStore.getState();
      store.setIntegrations(sampleIntegrations);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIntegrationsData();
    setRefreshing(false);
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      await integrationService.syncIntegration(integrationId);
      Alert.alert('Success', 'Integration synced successfully!');
    } catch (error) {
      console.error('Failed to sync integration:', error);
      Alert.alert('Error', 'Failed to sync integration');
    }
  };

  const handleToggleIntegration = async (integration: BaseIntegration) => {
    try {
      await integrationService.updateIntegration(integration.id, {
        isEnabled: !integration.isEnabled
      });
      Alert.alert(
        'Success', 
        `Integration ${integration.isEnabled ? 'disabled' : 'enabled'} successfully!`
      );
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      Alert.alert('Error', 'Failed to update integration');
    }
  };

  const handleDeleteIntegration = (integration: BaseIntegration) => {
    Alert.alert(
      'Delete Integration',
      `Are you sure you want to remove "${integration.name}"? This will delete all synced data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await integrationService.deleteIntegration(integration.id);
              Alert.alert('Success', 'Integration deleted successfully');
            } catch (error) {
              console.error('Failed to delete integration:', error);
              Alert.alert('Error', 'Failed to delete integration');
            }
          },
        },
      ]
    );
  };

  const availableIntegrations: IntegrationCard[] = [
    {
      id: 'google_classroom',
      name: 'Google Classroom',
      description: 'Sync courses, assignments, and grades from Google Classroom',
      type: 'lms',
      provider: 'google_classroom',
      icon: 'school',
      color: '#4285F4',
      isAvailable: true,
      features: ['Courses', 'Assignments', 'Grades', 'Announcements']
    },
    {
      id: 'moodle',
      name: 'Moodle',
      description: 'Connect to your Moodle LMS for course content and grades',
      type: 'lms',
      provider: 'moodle',
      icon: 'school',
      color: '#FF7A00',
      isAvailable: true,
      features: ['Courses', 'Assignments', 'Grades', 'Resources']
    },
    {
      id: 'college_erp',
      name: 'College ERP',
      description: 'Sync attendance, grades, and academic records from your college ERP',
      type: 'erp',
      provider: 'custom',
      icon: 'business',
      color: '#2196F3',
      isAvailable: true,
      features: ['Attendance', 'Grades', 'Schedule', 'Fees']
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Access and sync your notes and documents from Google Drive',
      type: 'cloud_storage',
      provider: 'google_drive',
      icon: 'cloud',
      color: '#4285F4',
      isAvailable: true,
      features: ['File Sync', 'Notes', 'Documents', 'Sharing']
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Connect to Microsoft OneDrive for file storage and sync',
      type: 'cloud_storage',
      provider: 'onedrive',
      icon: 'cloud',
      color: '#0078D4',
      isAvailable: true,
      features: ['File Sync', 'Office Documents', 'Collaboration']
    }
  ];

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'syncing': return '#FF9800';
      case 'error': return '#f44336';
      case 'disconnected': return '#9E9E9E';
      case 'pending_auth': return '#2196F3';
      case 'expired': return '#FF5722';
      default: return Colors.light.tabIconDefault;
    }
  };

  const getStatusText = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'syncing': return 'Syncing...';
      case 'error': return 'Error';
      case 'disconnected': return 'Disconnected';
      case 'pending_auth': return 'Pending Auth';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const renderIntegrationCard = (integration: BaseIntegration) => {
    const currentSyncStatus = syncStatus[integration.id];
    const isCurrentlySyncing = currentSyncStatus?.isActive;

    return (
      <View key={integration.id} style={styles.integrationCard}>
        <View style={styles.integrationHeader}>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationName}>{integration.name}</Text>
            <Text style={styles.integrationType}>
              {integration.type.toUpperCase()} Integration
            </Text>
            {integration.lastSync && (
              <Text style={styles.lastSync}>
                Last sync: {new Date(integration.lastSync).toLocaleString()}
              </Text>
            )}
          </View>
          <View style={styles.integrationStatus}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(integration.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(integration.status) }]}>
              {isCurrentlySyncing ? 'Syncing...' : getStatusText(integration.status)}
            </Text>
          </View>
        </View>

        {isCurrentlySyncing && currentSyncStatus && (
          <View style={styles.syncProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${currentSyncStatus.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentSyncStatus.currentOperation} ({currentSyncStatus.progress}%)
            </Text>
          </View>
        )}

        <View style={styles.integrationActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.syncButton]}
            onPress={() => handleSyncIntegration(integration.id)}
            disabled={isCurrentlySyncing || integration.status !== 'connected'}
          >
            <MaterialIcons 
              name={isCurrentlySyncing ? "hourglass-empty" : "sync"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {isCurrentlySyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              integration.isEnabled ? styles.disableButton : styles.enableButton
            ]}
            onPress={() => handleToggleIntegration(integration)}
          >
            <MaterialIcons 
              name={integration.isEnabled ? "pause" : "play-arrow"} 
              size={16} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {integration.isEnabled ? 'Disable' : 'Enable'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteIntegration(integration)}
          >
            <MaterialIcons name="delete" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAvailableIntegrationCard = (integrationCard: IntegrationCard) => {
    const isAlreadyConnected = integrations.some(
      integration => integration.type === integrationCard.type && 
      integration.name.toLowerCase().includes(integrationCard.provider.toLowerCase())
    );

    return (
      <TouchableOpacity
        key={integrationCard.id}
        style={[
          styles.availableCard,
          { borderLeftColor: integrationCard.color },
          isAlreadyConnected && styles.connectedCard
        ]}
        onPress={() => {
          if (!isAlreadyConnected) {
            setSelectedIntegrationType(integrationCard.type);
            setShowAddModal(true);
          }
        }}
        disabled={isAlreadyConnected}
      >
        <View style={styles.availableCardHeader}>
          <View style={[styles.availableIcon, { backgroundColor: integrationCard.color + '20' }]}>
            <MaterialIcons name={integrationCard.icon} size={24} color={integrationCard.color} />
          </View>
          <View style={styles.availableInfo}>
            <Text style={styles.availableName}>{integrationCard.name}</Text>
            <Text style={styles.availableDescription}>{integrationCard.description}</Text>
          </View>
          {isAlreadyConnected && (
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          )}
        </View>
        <View style={styles.availableFeatures}>
          {integrationCard.features.map((feature, index) => (
            <View key={index} style={styles.featureTag}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const connectedIntegrations = getConnectedIntegrations();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            loadIntegrationsData();
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
          <Text style={styles.title}>Integrations</Text>
          <Text style={styles.subtitle}>
            Connect your learning platforms and sync your data
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{integrations.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{connectedIntegrations.length}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeIntegrations.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Object.values(syncStatus).filter(status => status?.isActive).length}
            </Text>
            <Text style={styles.statLabel}>Syncing</Text>
          </View>
        </View>

        {/* Connected Integrations */}
        {integrations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected Integrations</Text>
            <View style={styles.integrationsList}>
              {integrations.map(renderIntegrationCard)}
            </View>
          </View>
        )}

        {/* Available Integrations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Integrations</Text>
          <View style={styles.availableList}>
            {availableIntegrations.map(renderAvailableIntegrationCard)}
          </View>
        </View>

        {/* Empty State */}
        {integrations.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="link-off" size={64} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyStateText}>No integrations connected</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect your learning platforms to sync courses, grades, and more
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Integration Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Integration</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Choose an integration to connect your learning platforms
            </Text>
            
            <View style={styles.modalIntegrationsList}>
              {availableIntegrations
                .filter(card => !integrations.some(
                  integration => integration.type === card.type && 
                  integration.name.toLowerCase().includes(card.provider.toLowerCase())
                ))
                .map(renderAvailableIntegrationCard)}
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
  integrationsList: {
    gap: 16,
  },
  integrationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  integrationType: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastSync: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  integrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  syncProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.background,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  integrationActions: {
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
  syncButton: {
    backgroundColor: Colors.light.tint,
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  disableButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    flex: 0,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  availableList: {
    gap: 12,
  },
  availableCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  connectedCard: {
    opacity: 0.6,
  },
  availableCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  availableIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  availableInfo: {
    flex: 1,
  },
  availableName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  availableDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  availableFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 10,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalIntegrationsList: {
    gap: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});
