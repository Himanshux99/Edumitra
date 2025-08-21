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
import { useCommunityStore } from '../../../store/communityStore';
import { communityService } from '../../../services/communityService';
import { Colors } from '../../../constants/Colors';
import { Question, QuestionCategory } from '../../../types/community';

const { width } = Dimensions.get('window');

const questionCategories: QuestionCategory[] = [
  'Programming',
  'Career Advice',
  'Study Help',
  'Project Guidance',
  'Technical Issues',
  'General',
  'Interview Prep',
  'Course Related'
];

export default function QAForumScreen() {
  const {
    questions,
    currentUser,
    isLoading,
    error,
    getUserQuestions
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'All'>('All');
  const [showAskModal, setShowAskModal] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionCategory, setQuestionCategory] = useState<QuestionCategory>('General');
  const [questionTags, setQuestionTags] = useState('');

  useEffect(() => {
    loadQAData();
    initializeSampleQuestions();
  }, []);

  const loadQAData = async () => {
    try {
      await communityService.loadAllCommunityData();
    } catch (error) {
      console.error('Failed to load Q&A data:', error);
      Alert.alert('Error', 'Failed to load Q&A data');
    }
  };

  const initializeSampleQuestions = async () => {
    // Add sample questions if none exist
    if (questions.length === 0) {
      const sampleQuestions: Question[] = [
        {
          id: 'q1',
          title: 'How to implement authentication in React Native?',
          content: 'I\'m building a React Native app and need to implement user authentication. What are the best practices and libraries to use?',
          category: 'Programming',
          tags: ['react-native', 'authentication', 'security'],
          askedBy: 'user_1',
          askedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 45,
          votes: 8,
          answers: [],
          isResolved: false,
          attachments: []
        },
        {
          id: 'q2',
          title: 'Career transition from web development to mobile development',
          content: 'I\'ve been working as a web developer for 3 years and want to transition to mobile development. What skills should I focus on and how long might this transition take?',
          category: 'Career Advice',
          tags: ['career', 'mobile-development', 'transition'],
          askedBy: 'user_2',
          askedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          views: 32,
          votes: 12,
          answers: [],
          isResolved: false,
          attachments: []
        },
        {
          id: 'q3',
          title: 'Best resources for learning data structures and algorithms?',
          content: 'I\'m preparing for technical interviews and need to strengthen my DSA knowledge. What are the best online resources, books, and practice platforms?',
          category: 'Study Help',
          tags: ['dsa', 'interview-prep', 'learning-resources'],
          askedBy: 'user_3',
          askedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          views: 67,
          votes: 15,
          answers: [],
          isResolved: false,
          attachments: []
        }
      ];

      // Add sample questions to store
      const store = useCommunityStore.getState();
      store.setQuestions(sampleQuestions);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQAData();
    setRefreshing(false);
  };

  const handleAskQuestion = async () => {
    if (!questionTitle.trim() || !questionContent.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to ask questions');
      return;
    }

    try {
      const tags = questionTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      await communityService.postQuestion({
        title: questionTitle.trim(),
        content: questionContent.trim(),
        category: questionCategory,
        tags
      });

      setShowAskModal(false);
      setQuestionTitle('');
      setQuestionContent('');
      setQuestionTags('');
      setQuestionCategory('General');
      Alert.alert('Success', 'Question posted successfully!');
    } catch (error) {
      console.error('Failed to post question:', error);
      Alert.alert('Error', 'Failed to post question');
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesCategory = selectedCategory === 'All' || question.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const userQuestions = currentUser ? getUserQuestions(currentUser.id) : [];

  const renderQuestionCard = (question: Question) => (
    <TouchableOpacity
      key={question.id}
      style={styles.questionCard}
      onPress={() => router.push(`/community/qa/${question.id}`)}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionTitle} numberOfLines={2}>
            {question.title}
          </Text>
          <Text style={styles.questionContent} numberOfLines={3}>
            {question.content}
          </Text>
        </View>
        {question.isResolved && (
          <View style={styles.resolvedBadge}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.resolvedText}>Resolved</Text>
          </View>
        )}
      </View>

      <View style={styles.questionTags}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(question.category) + '20' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(question.category) }]}>
            {question.category}
          </Text>
        </View>
        {question.tags.slice(0, 2).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {question.tags.length > 2 && (
          <Text style={styles.moreTags}>+{question.tags.length - 2}</Text>
        )}
      </View>

      <View style={styles.questionStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="thumb-up" size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.statText}>{question.votes}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="chat-bubble-outline" size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.statText}>{question.answers.length}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="visibility" size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.statText}>{question.views}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color={Colors.light.tabIconDefault} />
          <Text style={styles.statText}>
            {new Date(question.askedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: QuestionCategory) => {
    const colors = {
      'Programming': '#4CAF50',
      'Career Advice': '#2196F3',
      'Study Help': '#FF9800',
      'Project Guidance': '#9C27B0',
      'Technical Issues': '#f44336',
      'General': '#607D8B',
      'Interview Prep': '#795548',
      'Course Related': '#E91E63'
    };
    return colors[category] || Colors.light.tint;
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
          <Text style={styles.title}>Q&A Forum</Text>
          <Text style={styles.subtitle}>
            Ask questions and get answers from the community
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.light.tabIconDefault} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.tabIconDefault}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="clear" size={20} color={Colors.light.tabIconDefault} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.askButton}
            onPress={() => setShowAskModal(true)}
          >
            <MaterialIcons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{questions.length}</Text>
            <Text style={styles.statLabel}>Total Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userQuestions.length}</Text>
            <Text style={styles.statLabel}>My Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {questions.filter(q => q.isResolved).length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
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
                  All ({questions.length})
                </Text>
              </TouchableOpacity>
              {questionCategories.map((category) => {
                const count = questions.filter(q => q.category === category).length;
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
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Questions' : `${selectedCategory} Questions`} ({filteredQuestions.length})
          </Text>
          {filteredQuestions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="live-help" size={64} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>No questions found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to ask a question in this category'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.askQuestionButton}
                  onPress={() => setShowAskModal(true)}
                >
                  <Text style={styles.askQuestionButtonText}>Ask Question</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.questionsList}>
              {filteredQuestions.map(renderQuestionCard)}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Ask Question Modal */}
      <Modal
        visible={showAskModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAskModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAskModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ask Question</Text>
            <TouchableOpacity
              onPress={handleAskQuestion}
              disabled={!questionTitle.trim() || !questionContent.trim()}
            >
              <Text style={[
                styles.postText,
                (!questionTitle.trim() || !questionContent.trim()) && styles.disabledText
              ]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Question Title *</Text>
              <TextInput
                style={styles.textInput}
                value={questionTitle}
                onChangeText={setQuestionTitle}
                placeholder="What's your question?"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={questionContent}
                onChangeText={setQuestionContent}
                placeholder="Provide more details about your question"
                placeholderTextColor={Colors.light.tabIconDefault}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryPicker}>
                  {questionCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        questionCategory === category && styles.selectedCategory
                      ]}
                      onPress={() => setQuestionCategory(category)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        questionCategory === category && styles.selectedCategoryText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tags (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={questionTags}
                onChangeText={setQuestionTags}
                placeholder="Separate tags with commas (e.g., react, javascript, help)"
                placeholderTextColor={Colors.light.tabIconDefault}
              />
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  askButton: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionInfo: {
    flex: 1,
    marginRight: 12,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  questionContent: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resolvedText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  questionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: Colors.light.tabIconDefault + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.tabIconDefault,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 10,
    color: Colors.light.tabIconDefault,
    fontStyle: 'italic',
  },
  questionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
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
  askQuestionButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  askQuestionButtonText: {
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
  postText: {
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  bottomSpacing: {
    height: 20,
  },
});
