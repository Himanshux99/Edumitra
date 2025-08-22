/**
 * Career Roadmap Detail View
 * Shows detailed roadmap with phases, skills, projects, and progress tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { careerRoadmapService } from '@/services/careerRoadmapService';
import { 
  CareerPath, 
  RoadmapPhase, 
  UserRoadmapProgress, 
  Project, 
  Milestone 
} from '@/types/careerRoadmap';

const { width } = Dimensions.get('window');

interface RoadmapDetailViewProps {
  careerPath: CareerPath;
  userProgress?: UserRoadmapProgress;
  onBack: () => void;
}

export default function RoadmapDetailView({ 
  careerPath, 
  userProgress, 
  onBack 
}: RoadmapDetailViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState<UserRoadmapProgress | undefined>(userProgress);

  const handleCompleteSkill = async (phaseId: string, skillId: string) => {
    if (!user || !progress) return;

    try {
      await careerRoadmapService.updateProgress(progress.id, phaseId, {
        type: 'skill',
        id: skillId
      });
      
      Alert.alert('Great!', 'Skill marked as completed. Keep up the good work!');
      // Refresh progress data
    } catch (error) {
      console.error('Error completing skill:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const handleCompleteProject = async (phaseId: string, projectId: string) => {
    if (!user || !progress) return;

    try {
      await careerRoadmapService.updateProgress(progress.id, phaseId, {
        type: 'project',
        id: projectId
      });
      
      Alert.alert('Excellent!', 'Project completed! You\'re making great progress.');
      setShowProjectModal(false);
    } catch (error) {
      console.error('Error completing project:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const getPhaseProgress = (phaseId: string): number => {
    if (!progress) return 0;
    const phaseProgress = progress.phaseProgress.find(p => p.phaseId === phaseId);
    return phaseProgress?.progress || 0;
  };

  const isSkillCompleted = (phaseId: string, skillId: string): boolean => {
    if (!progress) return false;
    const phaseProgress = progress.phaseProgress.find(p => p.phaseId === phaseId);
    return phaseProgress?.completedSkills.includes(skillId) || false;
  };

  const isProjectCompleted = (phaseId: string, projectId: string): boolean => {
    if (!progress) return false;
    const phaseProgress = progress.phaseProgress.find(p => p.phaseId === phaseId);
    return phaseProgress?.completedProjects.includes(projectId) || false;
  };

  const renderProgressBar = (progress: number) => {
    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress / 100}
          color="#4CAF50"
        />
      );
    }
    
    return (
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progress}%`, backgroundColor: '#4CAF50' }
          ]} 
        />
      </View>
    );
  };

  const renderPhase = (phase: RoadmapPhase, index: number) => {
    const phaseProgress = getPhaseProgress(phase.id);
    const isCurrentPhase = progress?.currentPhase === index;
    
    return (
      <TouchableOpacity
        key={phase.id}
        style={[
          styles.phaseCard,
          { 
            backgroundColor: colors.background,
            borderColor: isCurrentPhase ? '#667eea' : colors.text + '20',
            borderWidth: isCurrentPhase ? 2 : 1,
          }
        ]}
        onPress={() => setSelectedPhase(phase)}
      >
        <View style={styles.phaseHeader}>
          <View style={styles.phaseNumber}>
            <Text style={styles.phaseNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.phaseInfo}>
            <Text style={[styles.phaseTitle, { color: colors.text }]}>
              {phase.title}
            </Text>
            <Text style={[styles.phaseDuration, { color: colors.text }]}>
              Duration: {phase.duration}
            </Text>
          </View>
          <View style={styles.phaseProgress}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {Math.round(phaseProgress)}%
            </Text>
          </View>
        </View>

        <Text style={[styles.phaseDescription, { color: colors.text }]}>
          {phase.description}
        </Text>

        {renderProgressBar(phaseProgress)}

        <View style={styles.phaseStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="school" size={16} color="#2196F3" />
            <Text style={[styles.statText, { color: colors.text }]}>
              {phase.skills.length} skills
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="assignment" size={16} color="#FF9800" />
            <Text style={[styles.statText, { color: colors.text }]}>
              {phase.projects.length} projects
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="flag" size={16} color="#4CAF50" />
            <Text style={[styles.statText, { color: colors.text }]}>
              {phase.milestones.length} milestones
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkillItem = (skillId: string, phaseId: string) => {
    const isCompleted = isSkillCompleted(phaseId, skillId);
    
    return (
      <TouchableOpacity
        key={skillId}
        style={[
          styles.skillItem,
          { 
            backgroundColor: isCompleted ? '#E8F5E8' : colors.background,
            borderColor: isCompleted ? '#4CAF50' : colors.text + '20',
          }
        ]}
        onPress={() => !isCompleted && handleCompleteSkill(phaseId, skillId)}
      >
        <MaterialIcons 
          name={isCompleted ? "check-circle" : "radio-button-unchecked"} 
          size={20} 
          color={isCompleted ? "#4CAF50" : colors.text} 
        />
        <Text style={[
          styles.skillText, 
          { 
            color: colors.text,
            textDecorationLine: isCompleted ? 'line-through' : 'none'
          }
        ]}>
          {skillId}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProjectItem = (project: Project, phaseId: string) => {
    const isCompleted = isProjectCompleted(phaseId, project.id);
    
    return (
      <TouchableOpacity
        key={project.id}
        style={[
          styles.projectItem,
          { 
            backgroundColor: isCompleted ? '#E8F5E8' : colors.background,
            borderColor: isCompleted ? '#4CAF50' : colors.text + '20',
          }
        ]}
        onPress={() => {
          setSelectedProject(project);
          setShowProjectModal(true);
        }}
      >
        <View style={styles.projectHeader}>
          <MaterialIcons 
            name={isCompleted ? "check-circle" : "assignment"} 
            size={20} 
            color={isCompleted ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={[styles.projectTitle, { color: colors.text }]}>
            {project.title}
          </Text>
        </View>
        <Text style={[styles.projectDescription, { color: colors.text }]}>
          {project.description}
        </Text>
        <View style={styles.projectMeta}>
          <Text style={[styles.projectDifficulty, { color: colors.text }]}>
            {project.difficulty} • {project.estimatedHours}h
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: careerPath.color || '#667eea' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{careerPath.title}</Text>
          <Text style={styles.headerSubtitle}>
            {progress ? `${Math.round(progress.overallProgress)}% Complete` : 'Not Started'}
          </Text>
        </View>
        <Text style={styles.headerEmoji}>{careerPath.icon}</Text>
      </View>

      {/* Overall Progress */}
      {progress && (
        <View style={[styles.overallProgress, { backgroundColor: colors.background }]}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            Overall Progress
          </Text>
          {renderProgressBar(progress.overallProgress)}
          <Text style={[styles.progressDetails, { color: colors.text }]}>
            Phase {progress.currentPhase + 1} of {careerPath.roadmap.length}
          </Text>
        </View>
      )}

      {/* Roadmap Phases */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Learning Roadmap
        </Text>
        
        {careerPath.roadmap.map((phase, index) => renderPhase(phase, index))}
      </ScrollView>

      {/* Phase Detail Modal */}
      <Modal
        visible={selectedPhase !== null}
        animationType="slide"
        onRequestClose={() => setSelectedPhase(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedPhase(null)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedPhase?.title}
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPhase && (
              <>
                <Text style={[styles.modalDescription, { color: colors.text }]}>
                  {selectedPhase.description}
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Skills to Learn
                </Text>
                {selectedPhase.skills.map(skillId => 
                  renderSkillItem(skillId, selectedPhase.id)
                )}

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Projects
                </Text>
                {selectedPhase.projects.map(project => 
                  renderProjectItem(project, selectedPhase.id)
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Project Detail Modal */}
      <Modal
        visible={showProjectModal}
        animationType="slide"
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedProject?.title}
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedProject && selectedPhase && (
              <>
                <Text style={[styles.modalDescription, { color: colors.text }]}>
                  {selectedProject.description}
                </Text>

                <View style={styles.projectDetails}>
                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    Difficulty: {selectedProject.difficulty}
                  </Text>
                  <Text style={[styles.detailLabel, { color: colors.text }]}>
                    Estimated Time: {selectedProject.estimatedHours} hours
                  </Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Deliverables
                </Text>
                {selectedProject.deliverables.map((deliverable, index) => (
                  <Text key={index} style={[styles.deliverable, { color: colors.text }]}>
                    • {deliverable}
                  </Text>
                ))}

                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleCompleteProject(selectedPhase.id, selectedProject.id)}
                >
                  <Text style={styles.completeButtonText}>Mark as Complete</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  headerEmoji: {
    fontSize: 32,
  },
  overallProgress: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  phaseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 12,
    opacity: 0.7,
  },
  phaseProgress: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  phaseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
  },
  phaseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  projectItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.8,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectDifficulty: {
    fontSize: 12,
    opacity: 0.7,
  },
  projectDetails: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  deliverable: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  completeButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
