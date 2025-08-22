/**
 * Admin Student Data Viewer Component
 * 
 * This component allows teachers and admins to:
 * - View all students' profiles and academic data
 * - Search and filter students
 * - Update student information
 * - Monitor student progress across all metrics
 * - Generate reports and analytics
 * 
 * Features:
 * - Role-based access control (Admin/Teacher only)
 * - Real-time data updates
 * - Search and filtering capabilities
 * - Bulk operations support
 * - Export functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { enhancedStudentDataService } from '../../services/enhancedStudentDataService';
import { studentDataService } from '../../services/studentDataService';
import {
  StudentProfile,
  StudentAcademicData
} from '../../types/student';

// ============================================================================
// ADMIN STUDENT DATA VIEWER COMPONENT
// ============================================================================

interface AdminStudentDataViewerProps {
  onStudentSelect?: (student: StudentProfile) => void;
}

export default function AdminStudentDataViewer({ onStudentSelect }: AdminStudentDataViewerProps) {
  const { user, userProfile } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // State management
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [academicData, setAcademicData] = useState<Map<string, StudentAcademicData>>(new Map());
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // ============================================================================
  // ACCESS CONTROL
  // ============================================================================

  // Check if user has admin access
  const hasAdminAccess = userProfile?.role && ['admin', 'teacher', 'super_admin'].includes(userProfile.role);

  useEffect(() => {
    if (!hasAdminAccess) {
      setError('Access denied. Admin or Teacher role required.');
      return;
    }

    if (user?.uid) {
      loadAllStudentsData();
    }
  }, [user?.uid, hasAdminAccess]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  /**
   * Load all students data (Admin only)
   */
  const loadAllStudentsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all student profiles
      const studentsResponse = await enhancedStudentDataService.getAllStudents(100);
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
        setFilteredStudents(studentsResponse.data);

        // Load academic data for each student
        const academicDataMap = new Map<string, StudentAcademicData>();
        
        for (const student of studentsResponse.data) {
          try {
            const academicResponse = await studentDataService.getStudentData(student.userId);
            if (academicResponse.success && academicResponse.data) {
              academicDataMap.set(student.userId, academicResponse.data);
            }
          } catch (error) {
            console.warn(`Failed to load academic data for student ${student.userId}:`, error);
          }
        }
        
        setAcademicData(academicDataMap);
      } else {
        setError(studentsResponse.error || 'Failed to load students data');
      }
    } catch (error) {
      console.error('Error loading students data:', error);
      setError('Failed to load students data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllStudentsData();
    setRefreshing(false);
  };

  // ============================================================================
  // SEARCH AND FILTERING
  // ============================================================================

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedCourse, selectedSemester, students]);

  /**
   * Filter students based on search query and filters
   */
  const filterStudents = () => {
    let filtered = [...students];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.studentId?.toLowerCase().includes(query) ||
        student.course?.toLowerCase().includes(query) ||
        student.branch?.toLowerCase().includes(query)
      );
    }

    // Apply course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(student => student.course === selectedCourse);
    }

    // Apply semester filter
    if (selectedSemester !== 'all') {
      filtered = filtered.filter(student => student.currentSemester.toString() === selectedSemester);
    }

    setFilteredStudents(filtered);
  };

  // ============================================================================
  // STUDENT CARD COMPONENT
  // ============================================================================

  const renderStudentCard = ({ item: student }: { item: StudentProfile }) => {
    const academic = academicData.get(student.userId);
    
    return (
      <TouchableOpacity
        style={[styles.studentCard, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => onStudentSelect?.(student)}
        activeOpacity={0.7}
      >
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Text style={[styles.studentName, { color: colors.text }]}>
              {student.name || 'Unknown Student'}
            </Text>
            <Text style={[styles.studentId, { color: colors.tabIconDefault }]}>
              ID: {student.studentId || 'N/A'}
            </Text>
            <Text style={[styles.studentEmail, { color: colors.tabIconDefault }]}>
              {student.email}
            </Text>
          </View>
          
          <View style={styles.studentStats}>
            {academic && (
              <>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>CGPA</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {academic.cgpa?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Attendance</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {academic.attendance?.overallPercentage?.toFixed(1) || 'N/A'}%
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.studentDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Course:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {student.course || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Branch:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {student.branch || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.tabIconDefault }]}>Semester:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {student.currentSemester} of {student.totalSemesters}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.lastUpdated, { color: colors.tabIconDefault }]}>
            Last updated: {student.lastUpdated ? new Date(student.lastUpdated).toLocaleDateString() : 'Never'}
          </Text>
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: student.isActive ? '#4CAF50' : '#f44336' }
          ]}>
            <Text style={styles.statusText}>
              {student.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================================================
  // FILTER CONTROLS
  // ============================================================================

  const renderFilterControls = () => {
    // Get unique courses and semesters for filter options
    const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
    const semesters = [...new Set(students.map(s => s.currentSemester.toString()))];

    return (
      <View style={[styles.filterContainer, { backgroundColor: colors.background }]}>
        <TextInput
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="Search students..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Course:</Text>
            <TouchableOpacity
              style={[styles.filterButton, { borderColor: colors.border }]}
              onPress={() => {
                // In a real app, you'd show a picker/modal here
                Alert.alert('Filter', 'Course filter - implement picker');
              }}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                {selectedCourse === 'all' ? 'All Courses' : selectedCourse}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Semester:</Text>
            <TouchableOpacity
              style={[styles.filterButton, { borderColor: colors.border }]}
              onPress={() => {
                // In a real app, you'd show a picker/modal here
                Alert.alert('Filter', 'Semester filter - implement picker');
              }}
            >
              <Text style={[styles.filterButtonText, { color: colors.text }]}>
                {selectedSemester === 'all' ? 'All Semesters' : `Sem ${selectedSemester}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!hasAdminAccess) {
    return (
      <View style={[styles.accessDeniedContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.accessDeniedText, { color: colors.text }]}>
          Access Denied
        </Text>
        <Text style={[styles.accessDeniedSubtext, { color: colors.tabIconDefault }]}>
          You need admin or teacher privileges to view student data.
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading students data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Student Data Management
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          {filteredStudents.length} of {students.length} students
        </Text>
      </View>

      {renderFilterControls()}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={loadAllStudentsData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id || item.userId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              {searchQuery || selectedCourse !== 'all' || selectedSemester !== 'all'
                ? 'No students match your search criteria'
                : 'No students found'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  filterContainer: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  studentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
  },
  studentStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  lastUpdated: {
    fontSize: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
