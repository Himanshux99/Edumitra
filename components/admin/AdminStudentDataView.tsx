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
  FlatList,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { studentDataService } from '../../services/studentDataService';
import { 
  StudentAcademicData, 
  StudentDataFilters,
  StudentDataListResponse 
} from '../../types/student';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface AdminStudentDataViewProps {
  onStudentSelect?: (student: StudentAcademicData) => void;
}

export default function AdminStudentDataView({ onStudentSelect }: AdminStudentDataViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useAuth();

  // State management
  const [studentsData, setStudentsData] = useState<StudentAcademicData[]>([]);
  const [filteredData, setFilteredData] = useState<StudentAcademicData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<StudentDataFilters>({});

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    header: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      padding: 12,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    },
    filterButtonActive: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    filterButtonText: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    filterButtonTextActive: {
      color: '#ffffff',
    },
    statsContainer: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      padding: 16,
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.tint,
    },
    statLabel: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      marginTop: 4,
    },
    listContainer: {
      flex: 1,
    },
    studentCard: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      padding: 16,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    studentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    studentInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 4,
    },
    studentId: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      marginBottom: 2,
    },
    academicYear: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
    cgpaContainer: {
      alignItems: 'center',
    },
    cgpaValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.tint,
    },
    cgpaLabel: {
      fontSize: 10,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    metricItem: {
      alignItems: 'center',
      flex: 1,
    },
    metricValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    metricLabel: {
      fontSize: 10,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      marginTop: 2,
    },
    alertBadge: {
      backgroundColor: '#ff4444',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
    },
    alertBadgeText: {
      fontSize: 10,
      color: '#ffffff',
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#ff4444',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
    },
  });

  // Load students data on component mount
  useEffect(() => {
    loadStudentsData();
  }, []);

  // Set up real-time listener for admin
  useEffect(() => {
    if (!userProfile?.role || !['admin', 'super_admin', 'teacher'].includes(userProfile.role)) {
      return;
    }

    const unsubscribe = studentDataService.subscribeToAllStudentsData(
      (data) => {
        setStudentsData(data);
        setIsLoading(false);
        setError(null);
      },
      filters
    );

    return unsubscribe;
  }, [userProfile?.role, filters]);

  // Filter data based on search query
  useEffect(() => {
    let filtered = studentsData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = studentsData.filter(student => 
        student.studentId.toLowerCase().includes(query) ||
        student.subjects.some(subject => 
          subject.subjectName.toLowerCase().includes(query) ||
          subject.subjectCode.toLowerCase().includes(query)
        )
      );
    }

    setFilteredData(filtered);
  }, [studentsData, searchQuery]);

  // Load students data function
  const loadStudentsData = async () => {
    try {
      if (!userProfile?.role || !['admin', 'super_admin', 'teacher'].includes(userProfile.role)) {
        setError('Access denied. Admin privileges required.');
        setIsLoading(false);
        return;
      }

      setError(null);
      const result = await studentDataService.getAllStudentsData(filters);
      
      if (result.success && result.data) {
        setStudentsData(result.data);
        setFilteredData(result.data);
      } else {
        setError(result.error || 'Failed to load students data');
      }
    } catch (error) {
      console.error('Error loading students data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStudentsData();
    setIsRefreshing(false);
  };

  // Handle retry
  const handleRetry = () => {
    setIsLoading(true);
    loadStudentsData();
  };

  // Calculate overall statistics
  const getOverallStats = () => {
    if (filteredData.length === 0) {
      return { totalStudents: 0, avgCGPA: 0, avgAttendance: 0, alertCount: 0 };
    }

    const totalStudents = filteredData.length;
    const avgCGPA = filteredData.reduce((sum, student) => sum + student.cgpa, 0) / totalStudents;
    const avgAttendance = filteredData.reduce((sum, student) => sum + student.attendance.overallPercentage, 0) / totalStudents;
    const alertCount = filteredData.filter(student => 
      student.cgpa < 6.0 || student.attendance.overallPercentage < 75
    ).length;

    return { totalStudents, avgCGPA, avgAttendance, alertCount };
  };

  // Get academic standing color
  const getAcademicStandingColor = (cgpa: number, attendance: number): string => {
    if (cgpa >= 8.5 && attendance >= 85) return '#00C851';
    if (cgpa >= 7.0 && attendance >= 75) return '#4285F4';
    if (cgpa >= 6.0 && attendance >= 65) return '#FF8800';
    return '#FF4444';
  };

  // Check if student has alerts
  const hasAlerts = (student: StudentAcademicData): boolean => {
    return student.cgpa < 6.0 || student.attendance.overallPercentage < 75;
  };

  // Render student card
  const renderStudentCard = ({ item: student }: { item: StudentAcademicData }) => {
    const standingColor = getAcademicStandingColor(student.cgpa, student.attendance.overallPercentage);
    const totalCredits = student.completedCourses.reduce((sum, course) => sum + course.credits, 0);
    const progressPercentage = Math.min((totalCredits / 120) * 100, 100);

    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => onStudentSelect?.(student)}
        activeOpacity={0.7}
      >
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.studentName}>Student {student.studentId}</Text>
              {hasAlerts(student) && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>Alert</Text>
                </View>
              )}
            </View>
            <Text style={styles.studentId}>ID: {student.studentId}</Text>
            <Text style={styles.academicYear}>
              {student.academicYear} • Semester {student.currentSemester}
            </Text>
          </View>
          
          <View style={styles.cgpaContainer}>
            <Text style={[styles.cgpaValue, { color: standingColor }]}>
              {student.cgpa.toFixed(2)}
            </Text>
            <Text style={styles.cgpaLabel}>CGPA</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{student.attendance.overallPercentage.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Attendance</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{totalCredits}</Text>
            <Text style={styles.metricLabel}>Credits</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{progressPercentage.toFixed(0)}%</Text>
            <Text style={styles.metricLabel}>Progress</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{student.subjects.length}</Text>
            <Text style={styles.metricLabel}>Subjects</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Check admin access
  if (!userProfile?.role || !['admin', 'super_admin', 'teacher'].includes(userProfile.role)) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="lock.fill" size={48} color="#ff4444" />
        <Text style={styles.errorText}>Access Denied. Admin privileges required.</Text>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={styles.loadingText}>Loading students data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stats = getOverallStats();

  return (
    <View style={styles.container}>
      {/* Header with Search and Filters */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students Academic Data</Text>
        
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={16} color={colorScheme === 'dark' ? '#cccccc' : '#666666'} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student ID or subject..."
            placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Overall Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgCGPA.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg CGPA</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.avgAttendance.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg Attendance</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: stats.alertCount > 0 ? '#ff4444' : colors.tint }]}>
              {stats.alertCount}
            </Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>
      </View>

      {/* Students List */}
      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="person.3" size={48} color={colorScheme === 'dark' ? '#666666' : '#cccccc'} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No students found matching your search.' : 'No student data available.'}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.listContainer}
          data={filteredData}
          renderItem={renderStudentCard}
          keyExtractor={(item) => item.id || item.userId}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
