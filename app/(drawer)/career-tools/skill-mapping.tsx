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
import { Skill, SkillCategory, SkillLevel } from '../../../types/career';

const { width } = Dimensions.get('window');

const skillCategories: SkillCategory[] = [
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Design',
  'Marketing',
  'Business',
  'Communication',
  'Leadership',
  'Other'
];

const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function SkillMappingScreen() {
  const {
    userSkills,
    skillRecommendations,
    isLoading,
    error,
    addSkill,
    updateSkill,
    removeSkill,
    getSkillsByCategory,
    getUserSkillLevel
  } = useCareerToolsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('Programming');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Beginner');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Programming');

  useEffect(() => {
    loadSkillData();
  }, []);

  const loadSkillData = async () => {
    try {
      await careerToolsService.loadAllCareerData();
    } catch (error) {
      console.error('Failed to load skill data:', error);
      Alert.alert('Error', 'Failed to load skill data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSkillData();
    setRefreshing(false);
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      Alert.alert('Error', 'Please enter a skill name');
      return;
    }

    // Check if skill already exists
    const existingSkill = userSkills.find(
      skill => skill.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );

    if (existingSkill) {
      Alert.alert('Error', 'This skill already exists in your profile');
      return;
    }

    const newSkill: Skill = {
      id: careerToolsService.generateSkillId(),
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      isVerified: false,
      endorsements: 0,
      relatedCourses: [],
      lastUpdated: new Date().toISOString(),
    };

    try {
      await careerToolsService.saveSkill(newSkill);
      setShowAddModal(false);
      setNewSkillName('');
      setNewSkillLevel('Beginner');
      setNewSkillCategory('Programming');
      Alert.alert('Success', 'Skill added successfully!');
    } catch (error) {
      console.error('Failed to add skill:', error);
      Alert.alert('Error', 'Failed to add skill');
    }
  };

  const handleUpdateSkillLevel = async (skillId: string, newLevel: SkillLevel) => {
    try {
      await careerToolsService.saveSkill({
        ...userSkills.find(s => s.id === skillId)!,
        level: newLevel,
        lastUpdated: new Date().toISOString(),
      });
      Alert.alert('Success', 'Skill level updated!');
    } catch (error) {
      console.error('Failed to update skill:', error);
      Alert.alert('Error', 'Failed to update skill');
    }
  };

  const handleDeleteSkill = (skillId: string) => {
    Alert.alert(
      'Delete Skill',
      'Are you sure you want to remove this skill from your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await careerToolsService.deleteSkill(skillId);
              Alert.alert('Success', 'Skill removed successfully');
            } catch (error) {
              console.error('Failed to delete skill:', error);
              Alert.alert('Error', 'Failed to remove skill');
            }
          },
        },
      ]
    );
  };

  const getSkillLevelColor = (level: SkillLevel) => {
    switch (level) {
      case 'Beginner': return '#FF9800';
      case 'Intermediate': return '#2196F3';
      case 'Advanced': return '#4CAF50';
      case 'Expert': return '#9C27B0';
      default: return Colors.light.tabIconDefault;
    }
  };

  const renderSkillCard = (skill: Skill) => (
    <View key={skill.id} style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <View style={styles.skillInfo}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillCategory}>{skill.category}</Text>
        </View>
        <View style={styles.skillActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteSkill(skill.id)}
          >
            <MaterialIcons name="delete" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.skillLevel}>
        <Text style={styles.levelLabel}>Proficiency Level:</Text>
        <View style={styles.levelButtons}>
          {skillLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                skill.level === level && {
                  backgroundColor: getSkillLevelColor(level),
                }
              ]}
              onPress={() => handleUpdateSkillLevel(skill.id, level)}
            >
              <Text style={[
                styles.levelButtonText,
                skill.level === level && styles.activeLevelText
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {skill.relatedCourses.length > 0 && (
        <View style={styles.relatedCourses}>
          <Text style={styles.relatedCoursesLabel}>Related Courses:</Text>
          <Text style={styles.relatedCoursesText}>
            {skill.relatedCourses.length} course{skill.relatedCourses.length !== 1 ? 's' : ''} available
          </Text>
        </View>
      )}
    </View>
  );

  const renderCategorySection = (category: SkillCategory) => {
    const categorySkills = getSkillsByCategory(category);
    
    if (categorySkills.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>
          {category} ({categorySkills.length})
        </Text>
        <View style={styles.skillsList}>
          {categorySkills.map(renderSkillCard)}
        </View>
      </View>
    );
  };

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
          <Text style={styles.title}>Skill Mapping</Text>
          <Text style={styles.subtitle}>
            Track and develop your professional skills
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userSkills.length}</Text>
            <Text style={styles.statLabel}>Total Skills</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {userSkills.filter(s => s.level === 'Expert').length}
            </Text>
            <Text style={styles.statLabel}>Expert Level</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {skillCategories.filter(cat => getSkillsByCategory(cat).length > 0).length}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Add Skill Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add New Skill</Text>
          </TouchableOpacity>
        </View>

        {/* Skills by Category */}
        <View style={styles.section}>
          {userSkills.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="trending-up" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No skills added yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start building your skill profile by adding your first skill
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesContainer}>
              {skillCategories.map(renderCategorySection)}
            </View>
          )}
        </View>

        {/* Recommendations */}
        {skillRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skill Recommendations</Text>
            <View style={styles.recommendationsContainer}>
              {skillRecommendations.slice(0, 3).map((rec, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Text style={styles.recommendationTitle}>
                    Recommended Skills for You
                  </Text>
                  <Text style={styles.recommendationReason}>{rec.reason}</Text>
                  <View style={styles.recommendedSkills}>
                    {rec.recommendedSkills.slice(0, 3).map((skill, idx) => (
                      <View key={idx} style={styles.recommendedSkillTag}>
                        <Text style={styles.recommendedSkillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Skill Modal */}
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
            <Text style={styles.modalTitle}>Add Skill</Text>
            <TouchableOpacity
              onPress={handleAddSkill}
              disabled={!newSkillName.trim()}
            >
              <Text style={[
                styles.addText,
                !newSkillName.trim() && styles.disabledText
              ]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Skill Name</Text>
              <TextInput
                style={styles.textInput}
                value={newSkillName}
                onChangeText={setNewSkillName}
                placeholder="Enter skill name"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryPicker}>
                  {skillCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        newSkillCategory === category && styles.selectedCategory
                      ]}
                      onPress={() => setNewSkillCategory(category)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        newSkillCategory === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Proficiency Level</Text>
              <View style={styles.levelPicker}>
                {skillLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelOption,
                      newSkillLevel === level && {
                        backgroundColor: getSkillLevelColor(level),
                      }
                    ]}
                    onPress={() => setNewSkillLevel(level)}
                  >
                    <Text style={[
                      styles.levelOptionText,
                      newSkillLevel === level && styles.selectedLevelText
                    ]}>
                      {level}
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
    fontSize: 24,
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
  addButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    gap: 24,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  skillsList: {
    gap: 12,
  },
  skillCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  skillCategory: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  skillActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  skillLevel: {
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  levelButtonText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  activeLevelText: {
    color: 'white',
  },
  relatedCourses: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.tabIconDefault + '20',
  },
  relatedCoursesLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
  },
  relatedCoursesText: {
    fontSize: 12,
    color: Colors.light.tint,
    marginTop: 2,
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
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  recommendationReason: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 12,
  },
  recommendedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recommendedSkillTag: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedSkillText: {
    fontSize: 12,
    color: Colors.light.tint,
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
  addText: {
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
  categoryPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedCategory: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryOptionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  levelPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  levelOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
    alignItems: 'center',
  },
  levelOptionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedLevelText: {
    color: 'white',
  },
  bottomSpacing: {
    height: 20,
  },
});
