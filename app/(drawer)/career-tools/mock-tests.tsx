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
import { MockTest, MockTestAttempt, TestCategory } from '../../../types/career';

const { width } = Dimensions.get('window');

const testCategories: TestCategory[] = [
  'Technical',
  'Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Quantitative Aptitude',
  'General Knowledge',
  'Domain Specific',
  'Coding',
  'System Design'
];

export default function MockTestsScreen() {
  const {
    mockTests,
    testAttempts,
    isLoading,
    error,
    getTestsByCategory,
    getTestAttemptsByTest
  } = useCareerToolsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | 'All'>('All');

  useEffect(() => {
    loadTestData();
    initializeSampleTests();
  }, []);

  const loadTestData = async () => {
    try {
      await careerToolsService.loadAllCareerData();
    } catch (error) {
      console.error('Failed to load test data:', error);
      Alert.alert('Error', 'Failed to load test data');
    }
  };

  const initializeSampleTests = async () => {
    // Add some sample tests if none exist
    if (mockTests.length === 0) {
      const sampleTests: MockTest[] = [
        {
          id: 'test_1',
          title: 'JavaScript Fundamentals',
          description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
          category: 'Technical',
          difficulty: 'Medium',
          duration: 30,
          totalQuestions: 20,
          passingScore: 70,
          questions: [],
          isOfflineAvailable: true,
          tags: ['JavaScript', 'Programming', 'Web Development'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'test_2',
          title: 'Logical Reasoning',
          description: 'Assess your logical thinking and problem-solving abilities.',
          category: 'Logical Reasoning',
          difficulty: 'Medium',
          duration: 45,
          totalQuestions: 25,
          passingScore: 60,
          questions: [],
          isOfflineAvailable: true,
          tags: ['Logic', 'Reasoning', 'Problem Solving'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'test_3',
          title: 'Data Structures & Algorithms',
          description: 'Test your understanding of fundamental data structures and algorithms.',
          category: 'Technical',
          difficulty: 'Hard',
          duration: 60,
          totalQuestions: 30,
          passingScore: 75,
          questions: [],
          isOfflineAvailable: true,
          tags: ['DSA', 'Programming', 'Computer Science'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'test_4',
          title: 'Quantitative Aptitude',
          description: 'Test your mathematical and numerical reasoning skills.',
          category: 'Quantitative Aptitude',
          difficulty: 'Medium',
          duration: 40,
          totalQuestions: 25,
          passingScore: 65,
          questions: [],
          isOfflineAvailable: true,
          tags: ['Math', 'Numbers', 'Aptitude'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      // Add sample tests to store
      const store = useCareerToolsStore.getState();
      store.setMockTests(sampleTests);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTestData();
    setRefreshing(false);
  };

  const handleStartTest = (test: MockTest) => {
    Alert.alert(
      'Start Test',
      `You are about to start "${test.title}". This test has ${test.totalQuestions} questions and should take about ${test.duration} minutes to complete.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Test',
          onPress: () => {
            // Navigate to test taking screen
            router.push(`/career-tools/mock-tests/take/${test.id}`);
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

  const getTestProgress = (testId: string) => {
    const attempts = getTestAttemptsByTest(testId);
    if (attempts.length === 0) return null;
    
    const bestAttempt = attempts.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
    
    return {
      attempts: attempts.length,
      bestScore: bestAttempt.percentage,
      lastAttempt: attempts[0].startedAt
    };
  };

  const renderTestCard = (test: MockTest) => {
    const progress = getTestProgress(test.id);
    
    return (
      <View key={test.id} style={styles.testCard}>
        <View style={styles.testHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testDescription}>{test.description}</Text>
            <View style={styles.testMeta}>
              <View style={styles.metaItem}>
                <MaterialIcons name="schedule" size={16} color={Colors.light.tabIconDefault} />
                <Text style={styles.metaText}>{test.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialIcons name="quiz" size={16} color={Colors.light.tabIconDefault} />
                <Text style={styles.metaText}>{test.totalQuestions} questions</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(test.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(test.difficulty) }]}>
                  {test.difficulty}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {progress && (
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{progress.attempts}</Text>
                <Text style={styles.progressLabel}>Attempts</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{progress.bestScore.toFixed(0)}%</Text>
                <Text style={styles.progressLabel}>Best Score</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {progress.bestScore >= test.passingScore ? 'Passed' : 'Failed'}
                </Text>
                <Text style={styles.progressLabel}>Status</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.testTags}>
          {test.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleStartTest(test)}
        >
          <MaterialIcons name="play-arrow" size={20} color="white" />
          <Text style={styles.startButtonText}>
            {progress ? 'Retake Test' : 'Start Test'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const filteredTests = selectedCategory === 'All' 
    ? mockTests 
    : getTestsByCategory(selectedCategory);

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
          <Text style={styles.title}>Mock Tests</Text>
          <Text style={styles.subtitle}>
            Practice with aptitude and technical tests
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockTests.length}</Text>
            <Text style={styles.statLabel}>Available Tests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{testAttempts.length}</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {testAttempts.filter(a => a.isPassed).length}
            </Text>
            <Text style={styles.statLabel}>Passed</Text>
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
                  All ({mockTests.length})
                </Text>
              </TouchableOpacity>
              {testCategories.map((category) => {
                const count = getTestsByCategory(category).length;
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

        {/* Tests List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Tests' : `${selectedCategory} Tests`} ({filteredTests.length})
          </Text>
          {filteredTests.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="quiz" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No tests available</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedCategory === 'All' 
                  ? 'Tests will appear here when available'
                  : `No tests available in ${selectedCategory} category`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.testsList}>
              {filteredTests.map(renderTestCard)}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        {testAttempts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityContainer}>
              {testAttempts.slice(0, 5).map((attempt) => {
                const test = mockTests.find(t => t.id === attempt.testId);
                return (
                  <View key={attempt.id} style={styles.activityItem}>
                    <MaterialIcons 
                      name={attempt.isPassed ? "check-circle" : "cancel"} 
                      size={20} 
                      color={attempt.isPassed ? "#4CAF50" : "#f44336"} 
                    />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        {test?.title || 'Unknown Test'}
                      </Text>
                      <Text style={styles.activityScore}>
                        Score: {attempt.percentage.toFixed(0)}% • {attempt.isPassed ? 'Passed' : 'Failed'}
                      </Text>
                      <Text style={styles.activityTime}>
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
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
  testsList: {
    gap: 16,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  testHeader: {
    marginBottom: 16,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
    marginBottom: 12,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
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
  progressSection: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  testTags: {
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
  startButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
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
  activityContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activityScore: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  bottomSpacing: {
    height: 20,
  },
});
