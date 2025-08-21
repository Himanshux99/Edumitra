import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { useLearningStore } from '../../store/learningStore';
import { syncService } from '../../services/syncService';
import { Quiz, QuizAttempt } from '../../types/database';

export default function QuizzesScreen() {
  const {
    courses,
    quizzes,
    selectedCourse,
    isOffline,
    selectCourse,
    getQuizzesByCourse,
    getQuizAttempts
  } = useLearningStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    courses.length > 0 ? courses[0].id : null
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isOffline) {
        await syncService.syncPendingChanges();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = courses.find(c => c.id === courseId);
    if (course) {
      selectCourse(course);
    }
  };

  const handleQuizPress = (quiz: Quiz) => {
    if (isOffline && !quiz.isDownloaded) {
      Alert.alert(
        'Offline Mode',
        'This quiz is not available offline. Please connect to the internet to take this quiz.'
      );
      return;
    }

    Alert.alert(
      'Start Quiz',
      `Do you want to start "${quiz.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => startQuiz(quiz) }
      ]
    );
  };

  const startQuiz = (quiz: Quiz) => {
    // Navigate to quiz taking screen
    Alert.alert('Quiz Started', `Starting quiz: ${quiz.title}`);
  };

  const renderCourseSelector = () => (
    <View style={styles.courseSelectorContainer}>
      <Text style={styles.sectionTitle}>Select Course</Text>
      <FlatList
        horizontal
        data={courses}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.courseSelectorItem,
              selectedCourseId === item.id && styles.selectedCourseSelectorItem
            ]}
            onPress={() => handleCourseSelect(item.id)}
          >
            <Text style={[
              styles.courseSelectorText,
              selectedCourseId === item.id && styles.selectedCourseSelectorText
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  const renderQuizItem = ({ item }: { item: Quiz }) => {
    const attempts = getQuizAttempts(item.id, 'default_user');
    const bestAttempt = attempts.find(a => a.isPassed) || attempts[0];
    const hasAttempts = attempts.length > 0;

    return (
      <TouchableOpacity
        style={styles.quizItem}
        onPress={() => handleQuizPress(item)}
      >
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <View style={styles.quizBadges}>
            {item.isDownloaded && (
              <View style={styles.downloadedBadge}>
                <Text style={styles.badgeText}>📱</Text>
              </View>
            )}
            {isOffline && !item.isDownloaded && (
              <View style={styles.offlineBadge}>
                <Text style={styles.badgeText}>⚠️</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.quizDescription}>{item.description}</Text>

        <View style={styles.quizMeta}>
          <Text style={styles.metaText}>
            {item.questions.length} questions
          </Text>
          {item.timeLimit && (
            <Text style={styles.metaText}>
              {item.timeLimit} min
            </Text>
          )}
          <Text style={styles.metaText}>
            Pass: {item.passingScore}%
          </Text>
        </View>

        {hasAttempts && (
          <View style={styles.attemptsSection}>
            <Text style={styles.attemptsTitle}>Your Progress:</Text>
            <View style={styles.attemptInfo}>
              <Text style={styles.attemptText}>
                Attempts: {attempts.length}
              </Text>
              {bestAttempt && (
                <Text style={[
                  styles.scoreText,
                  bestAttempt.isPassed ? styles.passedScore : styles.failedScore
                ]}>
                  Best: {Math.round((bestAttempt.score / bestAttempt.totalPoints) * 100)}%
                  {bestAttempt.isPassed ? ' ✅' : ' ❌'}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (!item.isDownloaded && isOffline) && styles.disabledButton
            ]}
            onPress={() => handleQuizPress(item)}
            disabled={!item.isDownloaded && isOffline}
          >
            <Text style={[
              styles.actionButtonText,
              (!item.isDownloaded && isOffline) && styles.disabledButtonText
            ]}>
              {hasAttempts ? 'Retake Quiz' : 'Start Quiz'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const courseQuizzes = selectedCourseId ? getQuizzesByCourse(selectedCourseId) : [];

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineIndicatorText}>📴 Offline Mode</Text>
        </View>
      )}

      {/* Course selector */}
      {renderCourseSelector()}

      {/* Quizzes list */}
      <View style={styles.quizzesSection}>
        <Text style={styles.sectionTitle}>
          {selectedCourse ? `${selectedCourse.title} - Quizzes` : 'Quizzes'}
        </Text>
        <FlatList
          data={courseQuizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedCourse 
                  ? 'No quizzes available for this course' 
                  : 'Select a course to view quizzes'
                }
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  offlineIndicator: {
    backgroundColor: '#ff9500',
    padding: 8,
    alignItems: 'center',
  },
  offlineIndicatorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  courseSelectorContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  courseSelectorItem: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCourseSelectorItem: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  courseSelectorText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCourseSelectorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quizzesSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  quizItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  quizBadges: {
    flexDirection: 'row',
  },
  downloadedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  offlineBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  attemptsSection: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  attemptsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  attemptInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attemptText: {
    fontSize: 12,
    color: '#666',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  passedScore: {
    color: '#4CAF50',
  },
  failedScore: {
    color: '#F44336',
  },
  actionSection: {
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButtonText: {
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
