import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useLearningStore } from '../../store/learningStore';
import { learningService } from '../../services/learningService';
import { syncService } from '../../services/syncService';
import { Lesson, Course } from '../../types/database';

export default function LessonsScreen() {
  const {
    courses,
    lessons,
    lessonProgress,
    selectedCourse,
    isLoading,
    isOffline,
    selectCourse,
    getLessonsByCourse,
    getLessonProgress
  } = useLearningStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
      selectCourse(courses[0]);
    }
  }, [courses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isOffline) {
        await syncService.syncPendingChanges();
        await learningService.loadAllData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourseId(course.id);
    selectCourse(course);
  };

  const handleLessonPress = (lesson: Lesson) => {
    // Navigate to lesson detail screen
    Alert.alert('Lesson', `Opening: ${lesson.title}`);
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={[
        styles.courseItem,
        selectedCourseId === item.id && styles.selectedCourseItem
      ]}
      onPress={() => handleCourseSelect(item)}
    >
      <Text style={[
        styles.courseTitle,
        selectedCourseId === item.id && styles.selectedCourseTitle
      ]}>
        {item.title}
      </Text>
      <Text style={styles.courseInstructor}>{item.instructor}</Text>
      <Text style={styles.courseLessons}>{item.totalLessons} lessons</Text>
    </TouchableOpacity>
  );

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    const progress = getLessonProgress(item.id, 'default_user');
    const progressPercentage = progress?.progressPercentage || 0;
    const isCompleted = progress?.isCompleted || false;

    return (
      <TouchableOpacity
        style={styles.lessonItem}
        onPress={() => handleLessonPress(item)}
      >
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            isCompleted ? styles.completedBadge : styles.inProgressBadge
          ]}>
            <Text style={styles.statusText}>
              {isCompleted ? 'Completed' : `${progressPercentage}%`}
            </Text>
          </View>
        </View>
        <Text style={styles.lessonDescription}>{item.description}</Text>
        <View style={styles.lessonMeta}>
          <Text style={styles.lessonDuration}>{item.duration} min</Text>
          {item.isDownloaded && (
            <Text style={styles.downloadedText}>📱 Downloaded</Text>
          )}
          {isOffline && !item.isDownloaded && (
            <Text style={styles.offlineText}>⚠️ Requires internet</Text>
          )}
        </View>
        {progressPercentage > 0 && (
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const courseLessons = selectedCourseId ? getLessonsByCourse(selectedCourseId) : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Offline indicator */}
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineIndicatorText}>📴 Offline Mode</Text>
        </View>
      )}

      {/* Courses list */}
      <View style={styles.coursesSection}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <FlatList
          horizontal
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.coursesList}
        />
      </View>

      {/* Lessons list */}
      <View style={styles.lessonsSection}>
        <Text style={styles.sectionTitle}>
          {selectedCourse ? `${selectedCourse.title} - Lessons` : 'Lessons'}
        </Text>
        <FlatList
          data={courseLessons}
          renderItem={renderLessonItem}
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
                  ? 'No lessons available for this course' 
                  : 'Select a course to view lessons'
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  coursesSection: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lessonsSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  coursesList: {
    paddingHorizontal: 15,
  },
  courseItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCourseItem: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedCourseTitle: {
    color: 'white',
  },
  courseInstructor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  courseLessons: {
    fontSize: 11,
    color: '#888',
  },
  lessonItem: {
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
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  inProgressBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#888',
  },
  downloadedText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  offlineText: {
    fontSize: 12,
    color: '#FF5722',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
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
