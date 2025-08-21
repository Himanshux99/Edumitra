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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCareerToolsStore } from '../../../store/careerToolsStore';
import { careerToolsService } from '../../../services/careerToolsService';
import { Colors } from '../../../constants/Colors';
import { InterviewQuestion, InterviewSession, InterviewCategory } from '../../../types/career';

const { width } = Dimensions.get('window');

const interviewCategories: InterviewCategory[] = [
  'General',
  'Leadership',
  'Problem Solving',
  'Communication',
  'Teamwork',
  'Conflict Resolution',
  'Technical Skills',
  'Career Goals',
  'Company Culture',
  'Industry Specific'
];

export default function InterviewPrepScreen() {
  const {
    interviewQuestions,
    interviewSessions,
    isLoading,
    error,
    getInterviewQuestionsByCategory
  } = useCareerToolsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | 'All'>('All');

  useEffect(() => {
    loadInterviewData();
    initializeSampleQuestions();
  }, []);

  const loadInterviewData = async () => {
    try {
      await careerToolsService.loadAllCareerData();
    } catch (error) {
      console.error('Failed to load interview data:', error);
      Alert.alert('Error', 'Failed to load interview data');
    }
  };

  const initializeSampleQuestions = async () => {
    // Add some sample questions if none exist
    if (interviewQuestions.length === 0) {
      const sampleQuestions: InterviewQuestion[] = [
        {
          id: 'q1',
          question: 'Tell me about yourself.',
          category: 'General',
          difficulty: 'Easy',
          type: 'Behavioral',
          sampleAnswer: 'Start with a brief overview of your professional background, highlight key achievements, and connect your experience to the role you\'re applying for.',
          tips: [
            'Keep it concise (2-3 minutes)',
            'Focus on professional achievements',
            'Connect your background to the role',
            'Practice your elevator pitch'
          ],
          relatedSkills: ['Communication', 'Self-awareness'],
          companyTypes: ['Corporate', 'Startup', 'Tech Giant'],
          tags: ['Introduction', 'Common', 'Opening']
        },
        {
          id: 'q2',
          question: 'What is your greatest weakness?',
          category: 'General',
          difficulty: 'Medium',
          type: 'Behavioral',
          sampleAnswer: 'Choose a real weakness that you\'re actively working to improve. Explain the steps you\'re taking to address it and show progress.',
          tips: [
            'Be honest but strategic',
            'Show self-awareness',
            'Demonstrate improvement efforts',
            'Avoid clichés like "perfectionist"'
          ],
          relatedSkills: ['Self-reflection', 'Growth mindset'],
          companyTypes: ['Corporate', 'Startup'],
          tags: ['Weakness', 'Self-awareness', 'Common']
        },
        {
          id: 'q3',
          question: 'Describe a challenging project you worked on.',
          category: 'Problem Solving',
          difficulty: 'Medium',
          type: 'Behavioral',
          sampleAnswer: 'Use the STAR method: Situation, Task, Action, Result. Focus on your problem-solving process and the positive outcome.',
          tips: [
            'Use the STAR method',
            'Choose a relevant example',
            'Highlight your problem-solving skills',
            'Quantify the results if possible'
          ],
          relatedSkills: ['Problem solving', 'Project management'],
          companyTypes: ['Tech Giant', 'Corporate'],
          tags: ['STAR method', 'Projects', 'Problem solving']
        },
        {
          id: 'q4',
          question: 'How do you handle working in a team?',
          category: 'Teamwork',
          difficulty: 'Easy',
          type: 'Behavioral',
          sampleAnswer: 'Describe your collaborative approach, communication style, and how you contribute to team success while respecting diverse perspectives.',
          tips: [
            'Emphasize collaboration',
            'Give specific examples',
            'Show respect for diversity',
            'Highlight communication skills'
          ],
          relatedSkills: ['Teamwork', 'Communication', 'Collaboration'],
          companyTypes: ['Startup', 'Corporate'],
          tags: ['Teamwork', 'Collaboration', 'Communication']
        },
        {
          id: 'q5',
          question: 'Where do you see yourself in 5 years?',
          category: 'Career Goals',
          difficulty: 'Medium',
          type: 'Behavioral',
          sampleAnswer: 'Align your goals with the company\'s growth opportunities. Show ambition while demonstrating commitment to the role.',
          tips: [
            'Align with company opportunities',
            'Show realistic ambition',
            'Demonstrate commitment',
            'Focus on skill development'
          ],
          relatedSkills: ['Career planning', 'Goal setting'],
          companyTypes: ['Corporate', 'Tech Giant'],
          tags: ['Career goals', 'Future plans', 'Ambition']
        }
      ];

      // Add sample questions to store
      const store = useCareerToolsStore.getState();
      store.setInterviewQuestions(sampleQuestions);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInterviewData();
    setRefreshing(false);
  };

  const handleStartPractice = (category?: InterviewCategory) => {
    const questionsToUse = category 
      ? getInterviewQuestionsByCategory(category)
      : interviewQuestions;

    if (questionsToUse.length === 0) {
      Alert.alert('No Questions', 'No questions available for this category.');
      return;
    }

    Alert.alert(
      'Start Practice Session',
      `Start practicing with ${questionsToUse.length} ${category || 'interview'} questions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            // Navigate to practice session
            router.push(`/career-tools/interview-prep/practice${category ? `?category=${category}` : ''}`);
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#f44336';
      default: return Colors.light.tabIconDefault;
    }
  };

  const renderQuestionCard = (question: InterviewQuestion) => (
    <View key={question.id} style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.questionMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
                {question.difficulty}
              </Text>
            </View>
            <Text style={styles.questionType}>{question.type}</Text>
          </View>
        </View>
      </View>

      <View style={styles.questionTags}>
        {question.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push(`/career-tools/interview-prep/question/${question.id}`)}
      >
        <Text style={styles.viewButtonText}>View Details</Text>
        <MaterialIcons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  const filteredQuestions = selectedCategory === 'All' 
    ? interviewQuestions 
    : getInterviewQuestionsByCategory(selectedCategory);

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
          <Text style={styles.title}>Interview Prep</Text>
          <Text style={styles.subtitle}>
            Practice with common interview questions and improve your responses
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{interviewQuestions.length}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{interviewSessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {interviewCategories.filter(cat => getInterviewQuestionsByCategory(cat).length > 0).length}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Practice</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleStartPractice()}
            >
              <MaterialIcons name="play-arrow" size={32} color={Colors.light.tint} />
              <Text style={styles.quickActionTitle}>Random Practice</Text>
              <Text style={styles.quickActionSubtitle}>Mix of all questions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleStartPractice('General')}
            >
              <MaterialIcons name="person" size={32} color="#4CAF50" />
              <Text style={styles.quickActionTitle}>General Questions</Text>
              <Text style={styles.quickActionSubtitle}>Common interview questions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilter}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'All' && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory('All')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === 'All' && styles.selectedCategoryText
                ]}>
                  All ({interviewQuestions.length})
                </Text>
              </TouchableOpacity>
              {interviewCategories.map((category) => {
                const count = getInterviewQuestionsByCategory(category).length;
                if (count === 0) return null;
                
                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategoryButton
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.selectedCategoryText
                    ]}>
                      {category} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Questions List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Questions' : `${selectedCategory} Questions`} ({filteredQuestions.length})
            </Text>
            {filteredQuestions.length > 0 && (
              <TouchableOpacity
                style={styles.practiceAllButton}
                onPress={() => handleStartPractice(selectedCategory === 'All' ? undefined : selectedCategory)}
              >
                <MaterialIcons name="play-arrow" size={16} color="white" />
                <Text style={styles.practiceAllText}>Practice All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {filteredQuestions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="record-voice-over" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No questions available</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedCategory === 'All' 
                  ? 'Questions will appear here when available'
                  : `No questions available in ${selectedCategory} category`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.questionsList}>
              {filteredQuestions.map(renderQuestionCard)}
            </View>
          )}
        </View>

        {/* Recent Sessions */}
        {interviewSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.sessionsContainer}>
              {interviewSessions.slice(0, 3).map((session) => (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <MaterialIcons name="record-voice-over" size={20} color={Colors.light.tint} />
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionDate}>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.sessionType}>{session.type}</Text>
                  </View>
                  <Text style={styles.sessionStats}>
                    {session.questions.length} questions • {session.duration} min
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  practiceAllButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  practiceAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 12,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
    textAlign: 'center',
  },
  categoryFilter: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '40',
  },
  selectedCategoryButton: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  questionsList: {
    gap: 16,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionInfo: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  questionType: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  questionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.tint,
    fontWeight: '500',
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
    fontWeight: '600',
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
  sessionsContainer: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  sessionDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  sessionType: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  sessionStats: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginLeft: 32,
  },
  bottomSpacing: {
    height: 20,
  },
});
