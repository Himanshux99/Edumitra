import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { resumeService } from '../../services/resumeService';
import { ResumeData } from '../../types/resume';

interface ResumeStats {
  experienceCount: number;
  educationCount: number;
  skillsCount: number;
  projectsCount: number;
}

const ResumeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [resumeStats, setResumeStats] = useState<{ [key: string]: ResumeStats }>({});

  useEffect(() => {
    if (user?.uid) {
      loadResumes();
    }
  }, [user]);

  const loadResumes = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userResumes = await resumeService.getResumesByUserId(user.uid);
      setResumes(userResumes);

      // Load stats for each resume
      const stats: { [key: string]: ResumeStats } = {};
      for (const resume of userResumes) {
        if (resume.id) {
          stats[resume.id] = await resumeService.getResumeStats(resume.id);
        }
      }
      setResumeStats(stats);
    } catch (error) {
      console.error('Error loading resumes:', error);
      Alert.alert('Error', 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResumes();
    setRefreshing(false);
  };

  const handleCreateResume = async () => {
    if (!user?.uid || !newResumeTitle.trim()) {
      Alert.alert('Error', 'Please enter a resume title');
      return;
    }

    try {
      const emptyResume = resumeService.createEmptyResume(user.uid, newResumeTitle.trim());
      const resumeId = await resumeService.createResume(emptyResume);
      
      setShowCreateModal(false);
      setNewResumeTitle('');
      
      // Navigate to editor with the new resume ID
      router.push(`/(drawer)/career-tools/resume-editor?id=${resumeId}`);
    } catch (error) {
      console.error('Error creating resume:', error);
      Alert.alert('Error', 'Failed to create resume');
    }
  };

  const handleEditResume = (resume: ResumeData) => {
    if (resume.id) {
      router.push(`/(drawer)/career-tools/resume-editor?id=${resume.id}`);
    }
  };

  const handleDuplicateResume = async (resumeId: string) => {
    try {
      const newResumeId = await resumeService.duplicateResume(resumeId);
      await loadResumes(); // Refresh the list
      Alert.alert('Success', 'Resume duplicated successfully');
    } catch (error) {
      console.error('Error duplicating resume:', error);
      Alert.alert('Error', 'Failed to duplicate resume');
    }
  };

  const handleDeleteResume = (resumeId: string, title: string) => {
    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await resumeService.deleteResume(resumeId);
              await loadResumes(); // Refresh the list
            } catch (error) {
              console.error('Error deleting resume:', error);
              Alert.alert('Error', 'Failed to delete resume');
            }
          },
        },
      ]
    );
  };

  const renderResumeCard = (resume: ResumeData) => {
    if (!resume.id) return null;

    const stats = resumeStats[resume.id] || {
      experienceCount: 0,
      educationCount: 0,
      skillsCount: 0,
      projectsCount: 0,
    };

    return (
      <View key={resume.id} style={styles.resumeCard}>
        <View style={styles.resumeHeader}>
          <View style={styles.resumeInfo}>
            <Text style={styles.resumeTitle}>{resume.title || 'Untitled Resume'}</Text>
            <Text style={styles.resumeName}>{resume.personalInfo?.fullName || 'No name'}</Text>
            <Text style={styles.resumeDate}>
              Updated: {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Never'}
            </Text>
          </View>
          <View style={styles.resumeActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditResume(resume)}
            >
              <Ionicons name="create" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDuplicateResume(resume.id!)}
            >
              <Ionicons name="copy" size={20} color="#34C759" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteResume(resume.id!, resume.title || 'Untitled Resume')}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resumeStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.experienceCount}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.educationCount}</Text>
            <Text style={styles.statLabel}>Education</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.skillsCount}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.projectsCount}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditResume(resume)}
        >
          <Ionicons name="create" size={16} color="white" />
          <Text style={styles.editButtonText}>Edit Resume</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading resumes...</Text>
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
          <Text style={styles.title}>Resume Builder</Text>
          <Text style={styles.subtitle}>
            Create and manage your professional resumes
          </Text>
        </View>

        {/* Create Resume Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.createButtonText}>Create New Resume</Text>
        </TouchableOpacity>

        {/* Resumes List */}
        <View style={styles.resumesSection}>
          <Text style={styles.sectionTitle}>Your Resumes ({resumes.length})</Text>
          
          {resumes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyStateTitle}>No resumes yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first resume to get started
              </Text>
            </View>
          ) : (
            resumes.map(renderResumeCard)
          )}
        </View>
      </ScrollView>

      {/* Create Resume Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Resume</Text>
            <TouchableOpacity onPress={handleCreateResume}>
              <Text style={styles.modalCreateButton}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Resume Title</Text>
            <TextInput
              style={styles.textInput}
              value={newResumeTitle}
              onChangeText={setNewResumeTitle}
              placeholder="Enter resume title (e.g., Software Engineer Resume)"
              placeholderTextColor="#999"
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  resumesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  resumeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resumeName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resumeDate: {
    fontSize: 12,
    color: '#999',
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  resumeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCreateButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
});

export default ResumeDashboard;
