import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert
} from 'react-native';
import { useContentStore } from '../../store/contentStore';
import { contentService } from '../../services/contentService';
import CoursesSection from '../../components/content/CoursesSection';
import StudyMaterialsSection from '../../components/content/StudyMaterialsSection';
import MockTestsSection from '../../components/content/MockTestsSection';
import ScholarshipsSection from '../../components/content/ScholarshipsSection';
import InternshipsSection from '../../components/content/InternshipsSection';

type ContentTab = 'overview' | 'courses' | 'materials' | 'tests' | 'scholarships' | 'internships';

export default function ContentHubScreen() {
  const {
    contentHubSummary,
    isLoading,
    error,
    searchQuery,
    setLoading,
    setError,
    setSearchQuery,
    setContentHubSummary,
    setCourses,
    setStudyMaterials,
    setMockTests,
    setScholarships,
    setInternships
  } = useContentStore();

  const [activeTab, setActiveTab] = useState<ContentTab>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all content data
      const [
        summary,
        courses,
        materials,
        tests,
        scholarships,
        internships
      ] = await Promise.all([
        contentService.getContentHubSummary(),
        contentService.getCourses(),
        contentService.getStudyMaterials(),
        contentService.getMockTests(),
        contentService.getScholarships(),
        contentService.getInternships()
      ]);

      setContentHubSummary(summary);
      setCourses(courses);
      setStudyMaterials(materials);
      setMockTests(tests);
      setScholarships(scholarships);
      setInternships(internships);

    } catch (error) {
      console.error('Failed to load content data:', error);
      setError('Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContentData();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderOverview = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{contentHubSummary?.totalCourses || 0}</Text>
          <Text style={styles.statLabel}>Total Courses</Text>
          <Text style={styles.statSubtext}>
            {contentHubSummary?.enrolledCourses || 0} enrolled
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📄</Text>
          <Text style={styles.statValue}>{contentHubSummary?.totalMaterials || 0}</Text>
          <Text style={styles.statLabel}>Study Materials</Text>
          <Text style={styles.statSubtext}>
            {contentHubSummary?.downloadedMaterials || 0} downloaded
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📝</Text>
          <Text style={styles.statValue}>{contentHubSummary?.totalTests || 0}</Text>
          <Text style={styles.statLabel}>Mock Tests</Text>
          <Text style={styles.statSubtext}>
            {contentHubSummary?.attemptedTests || 0} attempted
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎓</Text>
          <Text style={styles.statValue}>{contentHubSummary?.totalScholarships || 0}</Text>
          <Text style={styles.statLabel}>Scholarships</Text>
          <Text style={styles.statSubtext}>
            {contentHubSummary?.bookmarkedScholarships || 0} bookmarked
          </Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💼</Text>
          <Text style={styles.statValue}>{contentHubSummary?.totalInternships || 0}</Text>
          <Text style={styles.statLabel}>Internships</Text>
          <Text style={styles.statSubtext}>
            {contentHubSummary?.bookmarkedInternships || 0} bookmarked
          </Text>
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessCard}>
        <Text style={styles.cardTitle}>🚀 Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => setActiveTab('courses')}
          >
            <Text style={styles.quickAccessIcon}>📚</Text>
            <Text style={styles.quickAccessText}>Browse Courses</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => setActiveTab('tests')}
          >
            <Text style={styles.quickAccessIcon}>📝</Text>
            <Text style={styles.quickAccessText}>Take Mock Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => setActiveTab('materials')}
          >
            <Text style={styles.quickAccessIcon}>📄</Text>
            <Text style={styles.quickAccessText}>Study Materials</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => setActiveTab('scholarships')}
          >
            <Text style={styles.quickAccessIcon}>🎓</Text>
            <Text style={styles.quickAccessText}>Find Scholarships</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesCard}>
        <Text style={styles.cardTitle}>📂 Popular Categories</Text>
        <View style={styles.categoriesGrid}>
          {[
            { name: 'JEE Preparation', icon: '🔬', color: '#FF6B6B' },
            { name: 'NEET Preparation', icon: '🧬', color: '#4ECDC4' },
            { name: 'CAT Preparation', icon: '📊', color: '#45B7D1' },
            { name: 'Programming', icon: '💻', color: '#96CEB4' },
            { name: 'Mathematics', icon: '📐', color: '#FFEAA7' },
            { name: 'Science', icon: '🔬', color: '#DDA0DD' }
          ].map((category, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.categoryButton, { backgroundColor: category.color }]}
              onPress={() => {
                setActiveTab('courses');
                // Set category filter here
              }}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>🕒 Continue Learning</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📚</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Complete JEE Mathematics</Text>
              <Text style={styles.activitySubtitle}>Continue from Lesson 15</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
            </View>
            <TouchableOpacity style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>📝</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>JEE Main Mock Test 1</Text>
              <Text style={styles.activitySubtitle}>Resume test - 45 min left</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
            </View>
            <TouchableOpacity style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadContentData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Content Hub</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, materials, tests..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'courses', label: 'Courses', icon: '📚' },
            { key: 'materials', label: 'Materials', icon: '📄' },
            { key: 'tests', label: 'Tests', icon: '📝' },
            { key: 'scholarships', label: 'Scholarships', icon: '🎓' },
            { key: 'internships', label: 'Internships', icon: '💼' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key as ContentTab)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading content...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'courses' && <CoursesSection />}
            {activeTab === 'materials' && <StudyMaterialsSection />}
            {activeTab === 'tests' && <MockTestsSection />}
            {activeTab === 'scholarships' && <ScholarshipsSection />}
            {activeTab === 'internships' && <InternshipsSection />}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 80,
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  quickAccessCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAccessButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '47%',
  },
  quickAccessIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoriesCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
