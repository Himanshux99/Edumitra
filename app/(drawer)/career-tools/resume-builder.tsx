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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCareerToolsStore } from '../../../store/careerToolsStore';
import { careerToolsService } from '../../../services/careerToolsService';
import { Colors } from '../../../constants/Colors';
import { ResumeData, ResumeTemplate } from '../../../types/career';

const { width } = Dimensions.get('window');

export default function ResumeBuilderScreen() {
  const {
    resumes,
    templates,
    currentResume,
    isLoading,
    error,
    setCurrentResume,
    addResume,
    deleteResume,
    duplicateResume
  } = useCareerToolsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);

  useEffect(() => {
    loadResumeData();
  }, []);

  const loadResumeData = async () => {
    try {
      await careerToolsService.loadAllCareerData();
    } catch (error) {
      console.error('Failed to load resume data:', error);
      Alert.alert('Error', 'Failed to load resume data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResumeData();
    setRefreshing(false);
  };

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim() || !selectedTemplate) {
      Alert.alert('Error', 'Please enter a title and select a template');
      return;
    }

    const newResume: ResumeData = {
      id: careerToolsService.generateResumeId(),
      userId: 'default_user', // This should come from auth
      templateId: selectedTemplate.id,
      title: newResumeTitle.trim(),
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      achievements: [],
      references: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await careerToolsService.saveResume(newResume);
      setShowCreateModal(false);
      setNewResumeTitle('');
      setSelectedTemplate(null);
      Alert.alert('Success', 'Resume created successfully!');
    } catch (error) {
      console.error('Failed to create resume:', error);
      Alert.alert('Error', 'Failed to create resume');
    }
  };

  const handleEditResume = (resume: ResumeData) => {
    setCurrentResume(resume);
    router.push(`/career-tools/resume-builder/edit/${resume.id}`);
  };

  const handleDeleteResume = (resumeId: string) => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete this resume? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await careerToolsService.deleteResume(resumeId);
              Alert.alert('Success', 'Resume deleted successfully');
            } catch (error) {
              console.error('Failed to delete resume:', error);
              Alert.alert('Error', 'Failed to delete resume');
            }
          },
        },
      ]
    );
  };

  const handleDuplicateResume = async (resumeId: string) => {
    try {
      duplicateResume(resumeId);
      Alert.alert('Success', 'Resume duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate resume:', error);
      Alert.alert('Error', 'Failed to duplicate resume');
    }
  };

  const renderResumeCard = (resume: ResumeData) => {
    const template = templates.find(t => t.id === resume.templateId);
    
    return (
      <View key={resume.id} style={styles.resumeCard}>
        <View style={styles.resumeHeader}>
          <View style={styles.resumeInfo}>
            <Text style={styles.resumeTitle}>{resume.title}</Text>
            <Text style={styles.resumeTemplate}>
              Template: {template?.name || 'Unknown'}
            </Text>
            <Text style={styles.resumeDate}>
              Updated: {new Date(resume.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.resumeActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditResume(resume)}
            >
              <MaterialIcons name="edit" size={20} color={Colors.light.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDuplicateResume(resume.id)}
            >
              <MaterialIcons name="content-copy" size={20} color={Colors.light.tabIconDefault} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteResume(resume.id)}
            >
              <MaterialIcons name="delete" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.resumeStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{resume.experience.length}</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{resume.education.length}</Text>
            <Text style={styles.statLabel}>Education</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{resume.skills.length}</Text>
            <Text style={styles.statLabel}>Skills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{resume.projects.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleEditResume(resume)}
        >
          <Text style={styles.viewButtonText}>Edit Resume</Text>
          <MaterialIcons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTemplateCard = (template: ResumeTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        selectedTemplate?.id === template.id && styles.selectedTemplate
      ]}
      onPress={() => setSelectedTemplate(template)}
    >
      <View style={styles.templateHeader}>
        <Text style={styles.templateName}>{template.name}</Text>
        {template.isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
      </View>
      <Text style={styles.templateDescription}>{template.description}</Text>
      <Text style={styles.templateCategory}>{template.category}</Text>
    </TouchableOpacity>
  );

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
            Create professional resumes with our templates
          </Text>
        </View>

        {/* Create Resume Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.createButtonText}>Create New Resume</Text>
          </TouchableOpacity>
        </View>

        {/* My Resumes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Resumes ({resumes.length})</Text>
          {resumes.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No resumes yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first resume to get started
              </Text>
            </View>
          ) : (
            <View style={styles.resumesList}>
              {resumes.map(renderResumeCard)}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Resume</Text>
            <TouchableOpacity
              onPress={handleCreateResume}
              disabled={!newResumeTitle.trim() || !selectedTemplate}
            >
              <Text style={[
                styles.createText,
                (!newResumeTitle.trim() || !selectedTemplate) && styles.disabledText
              ]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Resume Title</Text>
              <TextInput
                style={styles.textInput}
                value={newResumeTitle}
                onChangeText={setNewResumeTitle}
                placeholder="Enter resume title"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Choose Template</Text>
              <View style={styles.templatesGrid}>
                {templates.map(renderTemplateCard)}
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
  createButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resumesList: {
    gap: 16,
  },
  resumeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  resumeTemplate: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 2,
  },
  resumeDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  resumeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
  createText: {
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
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: Colors.light.tint,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  popularBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  templateDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
