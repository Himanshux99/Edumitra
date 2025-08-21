import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  getDocFromCache,
  getDocsFromCache
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  StudentAcademicData,
  StudentDataResponse,
  StudentDataListResponse,
  StudentDataFilters,
  StudentDataUpdate,
  AcademicMetrics,
  AttendanceData,
  SubjectPerformance,
  CompletedCourse
} from '../types/student';

class StudentDataService {
  private readonly COLLECTION_NAME = 'studentAcademicData';
  private offlineCache: Map<string, StudentAcademicData> = new Map();
  private isOffline: boolean = false;

  /**
   * Create initial student data with default values
   * @param userId - Firebase Auth UID of the student
   * @param studentId - Student ID from registration
   * @returns Default student academic data
   */
  createInitialStudentData(userId: string, studentId: string): Omit<StudentAcademicData, 'id' | 'createdAt' | 'lastUpdated'> {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

    return {
      userId,
      studentId,
      cgpa: 0.0,
      currentSemester: 1,
      totalSemesters: 8,
      attendance: {
        overallPercentage: 0.0,
        totalClasses: 0,
        attendedClasses: 0,
        subjectWiseAttendance: [],
        lastUpdated: new Date().toISOString()
      },
      subjects: [],
      completedCourses: [],
      academicMetrics: {
        semesterGPAs: [],
        academicStanding: 'satisfactory',
        totalCreditsEarned: 0,
        totalCreditsRequired: 120,
        progressPercentage: 0,
        performanceTrend: 'stable',
        achievements: [],
        academicAlerts: []
      },
      academicYear
    };
  }

  /**
   * Initialize student data if it doesn't exist
   * @param userId - Firebase Auth UID of the student
   * @param studentId - Student ID from registration
   * @returns Promise with operation result
   */
  async initializeStudentData(userId: string, studentId: string): Promise<StudentDataResponse> {
    try {
      // Check if student data already exists
      const existingData = await this.getStudentData(userId);

      if (existingData.data) {
        return {
          success: true,
          data: existingData.data,
          message: 'Student data already exists'
        };
      }

      // Create initial data
      const initialData = this.createInitialStudentData(userId, studentId);

      // Upload to Firebase
      const result = await this.uploadStudentData(userId, initialData);

      if (result.success && result.data) {
        // Cache the data for offline access
        this.offlineCache.set(userId, result.data);

        return {
          success: true,
          data: result.data,
          message: 'Initial student data created successfully'
        };
      }

      return result;
    } catch (error) {
      console.error('Error initializing student data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize student data'
      };
    }
  }

  /**
   * Upload or update student academic data
   * @param userId - Firebase Auth UID of the student
   * @param data - Student academic data to upload
   * @returns Promise with operation result
   */
  async uploadStudentData(userId: string, data: Omit<StudentAcademicData, 'id' | 'createdAt' | 'lastUpdated'>): Promise<StudentDataResponse> {
    try {
      // Check if student data already exists
      const existingData = await this.getStudentData(userId);
      
      const timestamp = new Date().toISOString();
      const studentData: Omit<StudentAcademicData, 'id'> = {
        ...data,
        userId,
        lastUpdated: timestamp,
        createdAt: existingData.data?.createdAt || timestamp
      };

      if (existingData.data?.id) {
        // Update existing data
        const docRef = doc(db, this.COLLECTION_NAME, existingData.data.id);
        await updateDoc(docRef, {
          ...studentData,
          lastUpdated: serverTimestamp()
        });
        
        return {
          success: true,
          data: { ...studentData, id: existingData.data.id },
          message: 'Student data updated successfully'
        };
      } else {
        // Create new data
        const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
          ...studentData,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        
        return {
          success: true,
          data: { ...studentData, id: docRef.id },
          message: 'Student data uploaded successfully'
        };
      }
    } catch (error) {
      console.error('Error uploading student data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload student data'
      };
    }
  }

  /**
   * Fetch student academic data by user ID with offline support
   * @param userId - Firebase Auth UID of the student
   * @param forceOnline - Force online fetch even if offline
   * @returns Promise with student data
   */
  async getStudentData(userId: string, forceOnline: boolean = false): Promise<StudentDataResponse> {
    try {
      // Try to get from cache first if offline or if we have cached data
      if ((this.isOffline || !forceOnline) && this.offlineCache.has(userId)) {
        console.log('StudentDataService - Returning cached data for offline access');
        return {
          success: true,
          data: this.offlineCache.get(userId),
          message: 'Student data retrieved from cache (offline)'
        };
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        limit(1)
      );

      let querySnapshot;

      try {
        // Try to get from server first
        querySnapshot = await getDocs(q);
        this.isOffline = false;
      } catch (networkError) {
        console.log('StudentDataService - Network error, trying cache:', networkError);
        this.isOffline = true;

        // Try to get from cache
        try {
          querySnapshot = await getDocsFromCache(q);
        } catch (cacheError) {
          // If no cache and no network, return cached data if available
          if (this.offlineCache.has(userId)) {
            return {
              success: true,
              data: this.offlineCache.get(userId),
              message: 'Student data retrieved from memory cache (offline)'
            };
          }
          throw cacheError;
        }
      }

      if (querySnapshot.empty) {
        return {
          success: true,
          data: undefined,
          message: 'No student data found'
        };
      }

      const doc = querySnapshot.docs[0];
      const data = { id: doc.id, ...doc.data() } as StudentAcademicData;

      // Cache the data for offline access
      this.offlineCache.set(userId, data);

      return {
        success: true,
        data,
        message: `Student data retrieved successfully ${this.isOffline ? '(from cache)' : '(from server)'}`
      };
    } catch (error) {
      console.error('Error fetching student data:', error);

      // Last resort: check memory cache
      if (this.offlineCache.has(userId)) {
        return {
          success: true,
          data: this.offlineCache.get(userId),
          message: 'Student data retrieved from memory cache (error fallback)'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch student data'
      };
    }
  }

  /**
   * Enable offline persistence and cache management
   */
  async enableOfflineSupport(): Promise<void> {
    try {
      // Firestore automatically enables offline persistence
      console.log('StudentDataService - Offline support enabled');
    } catch (error) {
      console.error('Error enabling offline support:', error);
    }
  }

  /**
   * Check network status and update offline flag
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      // Try a simple Firestore operation to check connectivity
      const testQuery = query(collection(db, this.COLLECTION_NAME), limit(1));
      await getDocs(testQuery);
      this.isOffline = false;
      return true;
    } catch (error) {
      this.isOffline = true;
      return false;
    }
  }

  /**
   * Get offline status
   */
  getOfflineStatus(): boolean {
    return this.isOffline;
  }

  /**
   * Clear offline cache
   */
  clearOfflineCache(): void {
    this.offlineCache.clear();
    console.log('StudentDataService - Offline cache cleared');
  }

  /**
   * Get cached data for a user
   */
  getCachedData(userId: string): StudentAcademicData | undefined {
    return this.offlineCache.get(userId);
  }

  /**
   * Manually cache data for offline access
   */
  cacheStudentData(userId: string, data: StudentAcademicData): void {
    this.offlineCache.set(userId, data);
  }

  /**
   * Sync cached changes when back online
   */
  async syncOfflineChanges(): Promise<void> {
    if (this.isOffline) {
      console.log('StudentDataService - Still offline, cannot sync');
      return;
    }

    try {
      // This would sync any pending changes
      // For now, we'll just log that sync is available
      console.log('StudentDataService - Sync functionality available when online');
    } catch (error) {
      console.error('Error syncing offline changes:', error);
    }
  }

  /**
   * Fetch all students data (Admin only)
   * @param filters - Optional filters for data
   * @returns Promise with list of student data
   */
  async getAllStudentsData(filters?: StudentDataFilters): Promise<StudentDataListResponse> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME));
      
      // Apply filters
      if (filters?.academicYear) {
        q = query(q, where('academicYear', '==', filters.academicYear));
      }
      
      if (filters?.semester) {
        q = query(q, where('currentSemester', '==', filters.semester));
      }
      
      if (filters?.minCGPA) {
        q = query(q, where('cgpa', '>=', filters.minCGPA));
      }
      
      // Order by CGPA descending by default
      q = query(q, orderBy('cgpa', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const studentsData: StudentAcademicData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as StudentAcademicData;
        
        // Apply additional filters that can't be done in Firestore query
        if (filters?.maxCGPA && data.cgpa > filters.maxCGPA) return;
        if (filters?.attendanceThreshold && data.attendance.overallPercentage < filters.attendanceThreshold) return;
        if (filters?.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          if (!data.studentId.toLowerCase().includes(searchLower) && 
              !data.subjects.some(s => s.subjectName.toLowerCase().includes(searchLower))) {
            return;
          }
        }
        
        studentsData.push(data);
      });
      
      return {
        success: true,
        data: studentsData,
        total: studentsData.length,
        message: 'Students data retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching all students data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch students data'
      };
    }
  }

  /**
   * Update specific fields of student data
   * @param userId - Firebase Auth UID of the student
   * @param updates - Partial data to update
   * @returns Promise with operation result
   */
  async updateStudentData(userId: string, updates: Partial<StudentAcademicData>): Promise<StudentDataResponse> {
    try {
      const existingData = await this.getStudentData(userId);
      
      if (!existingData.data?.id) {
        return {
          success: false,
          error: 'Student data not found'
        };
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, existingData.data.id);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Student data updated successfully'
      };
    } catch (error) {
      console.error('Error updating student data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update student data'
      };
    }
  }

  /**
   * Delete student data
   * @param userId - Firebase Auth UID of the student
   * @returns Promise with operation result
   */
  async deleteStudentData(userId: string): Promise<StudentDataResponse> {
    try {
      const existingData = await this.getStudentData(userId);
      
      if (!existingData.data?.id) {
        return {
          success: false,
          error: 'Student data not found'
        };
      }
      
      const docRef = doc(db, this.COLLECTION_NAME, existingData.data.id);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Student data deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting student data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete student data'
      };
    }
  }

  /**
   * Listen to real-time updates for student data
   * @param userId - Firebase Auth UID of the student
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToStudentData(userId: string, callback: (data: StudentAcademicData | null) => void): () => void {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('userId', '==', userId),
      limit(1)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }
      
      const doc = querySnapshot.docs[0];
      const data = { id: doc.id, ...doc.data() } as StudentAcademicData;
      callback(data);
    }, (error) => {
      console.error('Error in student data subscription:', error);
      callback(null);
    });
  }

  /**
   * Listen to real-time updates for all students data (Admin only)
   * @param callback - Callback function to handle updates
   * @param filters - Optional filters
   * @returns Unsubscribe function
   */
  subscribeToAllStudentsData(
    callback: (data: StudentAcademicData[]) => void,
    filters?: StudentDataFilters
  ): () => void {
    let q = query(collection(db, this.COLLECTION_NAME), orderBy('cgpa', 'desc'));
    
    // Apply basic filters that Firestore supports
    if (filters?.academicYear) {
      q = query(q, where('academicYear', '==', filters.academicYear));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const studentsData: StudentAcademicData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as StudentAcademicData;
        studentsData.push(data);
      });
      
      callback(studentsData);
    }, (error) => {
      console.error('Error in all students data subscription:', error);
      callback([]);
    });
  }

  /**
   * Calculate academic metrics for a student
   * @param studentData - Student academic data
   * @returns Calculated academic metrics
   */
  calculateAcademicMetrics(studentData: StudentAcademicData): AcademicMetrics {
    const { subjects, completedCourses, cgpa, attendance } = studentData;
    
    // Calculate semester GPAs
    const semesterGPAs = this.calculateSemesterGPAs(subjects);
    
    // Determine academic standing
    const academicStanding = this.determineAcademicStanding(cgpa, attendance.overallPercentage);
    
    // Calculate progress
    const totalCreditsEarned = completedCourses.reduce((sum, course) => sum + course.credits, 0);
    const totalCreditsRequired = 120; // Assuming 120 credits for graduation
    const progressPercentage = Math.min((totalCreditsEarned / totalCreditsRequired) * 100, 100);
    
    // Determine performance trend
    const performanceTrend = this.calculatePerformanceTrend(semesterGPAs);
    
    // Generate achievements
    const achievements = this.generateAchievements(studentData);
    
    // Generate academic alerts
    const academicAlerts = this.generateAcademicAlerts(studentData);
    
    return {
      semesterGPAs,
      academicStanding,
      totalCreditsEarned,
      totalCreditsRequired,
      progressPercentage,
      performanceTrend,
      achievements,
      academicAlerts
    };
  }

  // Helper methods for calculations
  private calculateSemesterGPAs(subjects: SubjectPerformance[]) {
    // Group subjects by semester and calculate GPA
    const semesterMap = new Map();
    
    subjects.forEach(subject => {
      if (!semesterMap.has(subject.semester)) {
        semesterMap.set(subject.semester, { totalPoints: 0, totalCredits: 0 });
      }
      
      const semData = semesterMap.get(subject.semester);
      semData.totalPoints += subject.gradePoints * subject.credits;
      semData.totalCredits += subject.credits;
    });
    
    return Array.from(semesterMap.entries()).map(([semester, data]) => ({
      semester,
      gpa: data.totalCredits > 0 ? data.totalPoints / data.totalCredits : 0,
      credits: data.totalCredits,
      academicYear: '2023-24' // This should come from actual data
    }));
  }

  private determineAcademicStanding(cgpa: number, attendance: number): 'excellent' | 'good' | 'satisfactory' | 'probation' {
    if (cgpa >= 8.5 && attendance >= 85) return 'excellent';
    if (cgpa >= 7.0 && attendance >= 75) return 'good';
    if (cgpa >= 6.0 && attendance >= 65) return 'satisfactory';
    return 'probation';
  }

  private calculatePerformanceTrend(semesterGPAs: any[]): 'improving' | 'declining' | 'stable' {
    if (semesterGPAs.length < 2) return 'stable';
    
    const recent = semesterGPAs.slice(-2);
    const diff = recent[1].gpa - recent[0].gpa;
    
    if (diff > 0.2) return 'improving';
    if (diff < -0.2) return 'declining';
    return 'stable';
  }

  private generateAchievements(studentData: StudentAcademicData) {
    const achievements = [];
    
    if (studentData.cgpa >= 9.0) {
      achievements.push({
        id: 'high_cgpa',
        title: 'Academic Excellence',
        description: 'Maintained CGPA above 9.0',
        dateEarned: new Date().toISOString(),
        type: 'academic' as const
      });
    }
    
    if (studentData.attendance.overallPercentage >= 95) {
      achievements.push({
        id: 'perfect_attendance',
        title: 'Perfect Attendance',
        description: 'Maintained 95%+ attendance',
        dateEarned: new Date().toISOString(),
        type: 'attendance' as const
      });
    }
    
    return achievements;
  }

  private generateAcademicAlerts(studentData: StudentAcademicData) {
    const alerts = [];
    
    if (studentData.attendance.overallPercentage < 75) {
      alerts.push({
        id: 'low_attendance',
        type: 'low_attendance' as const,
        severity: 'high' as const,
        message: 'Attendance is below 75%. Immediate action required.',
        actionRequired: true,
        createdAt: new Date().toISOString()
      });
    }
    
    if (studentData.cgpa < 6.0) {
      alerts.push({
        id: 'low_gpa',
        type: 'low_gpa' as const,
        severity: 'high' as const,
        message: 'CGPA is below 6.0. Academic probation risk.',
        actionRequired: true,
        createdAt: new Date().toISOString()
      });
    }
    
    return alerts;
  }
}

// Export singleton instance
export const studentDataService = new StudentDataService();
export default studentDataService;
