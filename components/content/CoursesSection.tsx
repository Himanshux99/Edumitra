import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert
} from 'react-native';
import { useContentStore } from '../../store/contentStore';
import { contentService } from '../../services/contentService';
import { Course } from '../../types/content';

export default function CoursesSection() {
  const {
    getFilteredCourses,
    getEnrolledCourses,
    getTrendingCourses,
    selectedCourse,
    setSelectedCourse,
    updateCourse,
    toggleBookmark,
    getBookmarkedContent
  } = useContentStore();

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'enrolled' | 'trending' | 'bookmarked'>('all');

  const allCourses = getFilteredCourses();
  const enrolledCourses = getEnrolledCourses();
  const trendingCourses = getTrendingCourses();
  const bookmarkedCourses = getBookmarkedContent('course');

  const getDisplayCourses = () => {
    switch (activeFilter) {
      case 'enrolled':
        return enrolledCourses;
      case 'trending':
        return trendingCourses;
      case 'bookmarked':
        return allCourses.filter(course => 
          bookmarkedCourses.some(bookmark => bookmark.contentId === course.id)
        );
      default:
        return allCourses;
    }
  };

  const handleCoursePress = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleEnrollCourse = async (course: Course) => {
    try {
      await contentService.enrollInCourse(course.id);
      updateCourse(course.id, { isEnrolled: true });
      Alert.alert('Success', `Enrolled in ${course.title}`);
      setShowCourseModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to enroll in course');
    }
  };

  const handleBookmarkCourse = (course: Course) => {
    toggleBookmark('course', course.id);
  };

  const renderCourseCard = (course: Course) => {
    const isBookmarked = bookmarkedCourses.some(bookmark => bookmark.contentId === course.id);
    
    return (
      <TouchableOpacity
        key={course.id}
        style={styles.courseCard}
        onPress={() => handleCoursePress(course)}
      >
        <View style={styles.courseImageContainer}>
          <View style={styles.courseImage}>
            <Text style={styles.coursePlaceholder}>📚</Text>
          </View>
          <View style={styles.courseBadges}>
            {course.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.badgeText}>PREMIUM</Text>
              </View>
            )}
            {course.isOfflineAvailable && (
              <View style={styles.offlineBadge}>
                <Text style={styles.badgeText}>📱</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => handleBookmarkCourse(course)}
          >
            <Text style={styles.bookmarkIcon}>
              {isBookmarked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {course.title}
          </Text>
          <Text style={styles.courseInstructor}>by {course.instructor}</Text>
          
          <View style={styles.courseStats}>
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {course.rating}</Text>
              <Text style={styles.reviewCount}>({course.reviewCount})</Text>
            </View>
            <Text style={styles.enrollmentCount}>
              {course.enrollmentCount.toLocaleString()} students
            </Text>
          </View>

          <View style={styles.courseMeta}>
            <Text style={styles.duration}>⏱️ {course.duration}h</Text>
            <Text style={styles.level}>{course.level}</Text>
            <Text style={styles.lessons}>{course.totalLessons} lessons</Text>
          </View>

          <View style={styles.courseFooter}>
            <View style={styles.priceContainer}>
              {course.price > 0 ? (
                <Text style={styles.price}>₹{course.price}</Text>
              ) : (
                <Text style={styles.freePrice}>FREE</Text>
              )}
            </View>
            
            {course.isEnrolled ? (
              <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.enrollButton}
                onPress={() => handleEnrollCourse(course)}
              >
                <Text style={styles.enrollButtonText}>Enroll Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCourseModal = () => {
    if (!selectedCourse) return null;

    return (
      <Modal
        visible={showCourseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCourseModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Course Details</Text>
            <TouchableOpacity onPress={() => handleBookmarkCourse(selectedCourse)}>
              <Text style={styles.modalBookmarkButton}>
                {bookmarkedCourses.some(b => b.contentId === selectedCourse.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalCourseImage}>
              <Text style={styles.modalCoursePlaceholder}>📚</Text>
            </View>

            <View style={styles.modalCourseInfo}>
              <Text style={styles.modalCourseTitle}>{selectedCourse.title}</Text>
              <Text style={styles.modalCourseInstructor}>by {selectedCourse.instructor}</Text>
              
              <View style={styles.modalCourseStats}>
                <Text style={styles.modalRating}>⭐ {selectedCourse.rating} ({selectedCourse.reviewCount} reviews)</Text>
                <Text style={styles.modalEnrollment}>{selectedCourse.enrollmentCount.toLocaleString()} students enrolled</Text>
              </View>

              <Text style={styles.modalCourseDescription}>{selectedCourse.description}</Text>

              <View style={styles.modalCourseMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Duration</Text>
                  <Text style={styles.metaValue}>{selectedCourse.duration} hours</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Level</Text>
                  <Text style={styles.metaValue}>{selectedCourse.level}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Lessons</Text>
                  <Text style={styles.metaValue}>{selectedCourse.totalLessons}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Quizzes</Text>
                  <Text style={styles.metaValue}>{selectedCourse.totalQuizzes}</Text>
                </View>
              </View>

              {selectedCourse.prerequisites.length > 0 && (
                <View style={styles.prerequisitesSection}>
                  <Text style={styles.sectionTitle}>Prerequisites</Text>
                  {selectedCourse.prerequisites.map((prereq, index) => (
                    <Text key={index} style={styles.prerequisiteItem}>• {prereq}</Text>
                  ))}
                </View>
              )}

              {selectedCourse.learningOutcomes.length > 0 && (
                <View style={styles.outcomesSection}>
                  <Text style={styles.sectionTitle}>What you'll learn</Text>
                  {selectedCourse.learningOutcomes.map((outcome, index) => (
                    <Text key={index} style={styles.outcomeItem}>✓ {outcome}</Text>
                  ))}
                </View>
              )}

              <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {selectedCourse.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.modalPriceContainer}>
              {selectedCourse.price > 0 ? (
                <Text style={styles.modalPrice}>₹{selectedCourse.price}</Text>
              ) : (
                <Text style={styles.modalFreePrice}>FREE</Text>
              )}
            </View>
            
            {selectedCourse.isEnrolled ? (
              <TouchableOpacity style={styles.modalContinueButton}>
                <Text style={styles.modalContinueButtonText}>Continue Learning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.modalEnrollButton}
                onPress={() => handleEnrollCourse(selectedCourse)}
              >
                <Text style={styles.modalEnrollButtonText}>Enroll Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const displayCourses = getDisplayCourses();

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All Courses', count: allCourses.length },
            { key: 'enrolled', label: 'Enrolled', count: enrolledCourses.length },
            { key: 'trending', label: 'Trending', count: trendingCourses.length },
            { key: 'bookmarked', label: 'Bookmarked', count: bookmarkedCourses.length }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                activeFilter === filter.key && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                activeFilter === filter.key && styles.activeFilterTabText
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Courses Grid */}
      <ScrollView style={styles.coursesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.coursesGrid}>
          {displayCourses.map(renderCourseCard)}
        </View>

        {displayCourses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or search terms</Text>
          </View>
        )}
      </ScrollView>

      {renderCourseModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  coursesContainer: {
    flex: 1,
  },
  coursesGrid: {
    padding: 15,
    gap: 15,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  courseImageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coursePlaceholder: {
    fontSize: 48,
    opacity: 0.5,
  },
  courseBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 5,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  courseInfo: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  enrollmentCount: {
    fontSize: 12,
    color: '#666',
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  level: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  lessons: {
    fontSize: 12,
    color: '#666',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  freePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  enrollButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  enrollButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBookmarkButton: {
    fontSize: 24,
  },
  modalContent: {
    flex: 1,
  },
  modalCourseImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCoursePlaceholder: {
    fontSize: 64,
    opacity: 0.5,
  },
  modalCourseInfo: {
    padding: 20,
  },
  modalCourseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalCourseInstructor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  modalCourseStats: {
    marginBottom: 16,
  },
  modalRating: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalEnrollment: {
    fontSize: 14,
    color: '#666',
  },
  modalCourseDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalCourseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  prerequisitesSection: {
    marginBottom: 20,
  },
  outcomesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  prerequisiteItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  outcomeItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalPriceContainer: {
    flex: 1,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  modalFreePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalEnrollButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  modalEnrollButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContinueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  modalContinueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
