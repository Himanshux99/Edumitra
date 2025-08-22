/**
 * Enhanced Student Data Service for EduMitra
 * 
 * This service manages all student-related data including:
 * - Student profiles and academic data
 * - Timetables and schedules
 * - Lesson progress and notes
 * - Career profiles and resume data
 * - Notifications and reminders
 * 
 * Features:
 * - Role-based access control (Students see only their data, Admins see all)
 * - Offline support with caching
 * - Real-time updates with Firestore listeners
 * - Comprehensive error handling
 * - Loading states management
 */

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
  disableNetwork
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  StudentProfile,
  StudentAcademicData,
  TimetableEntry,
  WeeklyTimetable,
  LessonProgress,
  StudentNote,
  CareerProfile,
  StudentNotification,
  ReminderLog
} from '../types/student';

// ============================================================================
// RESPONSE TYPES FOR API CONSISTENCY
// ============================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> extends ServiceResponse<T[]> {
  total?: number;
}

// ============================================================================
// ENHANCED STUDENT DATA SERVICE CLASS
// ============================================================================

class EnhancedStudentDataService {
  // Collection names for organized data storage
  private readonly COLLECTIONS = {
    STUDENTS: 'students',
    ACADEMIC_DATA: 'studentAcademicData',
    TIMETABLES: 'personal_timetables',
    LESSON_PROGRESS: 'lesson_progress',
    NOTES: 'user_notes',
    CAREER_PROFILES: 'career_profiles',
    NOTIFICATIONS: 'user_notifications',
    REMINDERS: 'reminder_logs'
  };

  // Offline cache for better performance
  private offlineCache: Map<string, any> = new Map();
  private isOffline: boolean = false;

  // ============================================================================
  // STUDENT PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Create or update student profile
   * @param userId - Firebase Auth UID
   * @param profileData - Student profile information
   * @returns Promise with operation result
   */
  async saveStudentProfile(
    userId: string,
    profileData: Omit<StudentProfile, 'id' | 'userId' | 'createdAt' | 'lastUpdated'>
  ): Promise<ServiceResponse<StudentProfile>> {
    try {
      // Check if profile already exists
      const existingProfile = await this.getStudentProfile(userId);
      
      const profileWithMetadata = {
        ...profileData,
        userId,
        lastUpdated: serverTimestamp(),
        ...(existingProfile.data ? {} : { createdAt: serverTimestamp() })
      };

      if (existingProfile.data?.id) {
        // Update existing profile
        const docRef = doc(db, this.COLLECTIONS.STUDENTS, existingProfile.data.id);
        await updateDoc(docRef, profileWithMetadata);
        
        return {
          success: true,
          data: { ...profileWithMetadata, id: existingProfile.data.id } as StudentProfile,
          message: 'Student profile updated successfully'
        };
      } else {
        // Create new profile using userId as document ID for easy access
        const docRef = doc(db, this.COLLECTIONS.STUDENTS, userId);
        await updateDoc(docRef, profileWithMetadata);
        
        return {
          success: true,
          data: { ...profileWithMetadata, id: userId } as StudentProfile,
          message: 'Student profile created successfully'
        };
      }
    } catch (error) {
      console.error('Error saving student profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save student profile'
      };
    }
  }

  /**
   * Get student profile by user ID
   * @param userId - Firebase Auth UID
   * @returns Promise with student profile data
   */
  async getStudentProfile(userId: string): Promise<ServiceResponse<StudentProfile>> {
    try {
      // Try to get from cache first if offline
      if (this.isOffline && this.offlineCache.has(`profile_${userId}`)) {
        return {
          success: true,
          data: this.offlineCache.get(`profile_${userId}`),
          message: 'Student profile retrieved from cache (offline)'
        };
      }

      const docRef = doc(db, this.COLLECTIONS.STUDENTS, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as StudentProfile;
        
        // Cache the data for offline access
        this.offlineCache.set(`profile_${userId}`, data);
        
        return {
          success: true,
          data,
          message: 'Student profile retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: 'Student profile not found'
        };
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      
      // Check cache as fallback
      if (this.offlineCache.has(`profile_${userId}`)) {
        return {
          success: true,
          data: this.offlineCache.get(`profile_${userId}`),
          message: 'Student profile retrieved from cache (error fallback)'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch student profile'
      };
    }
  }

  // ============================================================================
  // TIMETABLE MANAGEMENT
  // ============================================================================

  /**
   * Save timetable entry for a student
   * @param userId - Firebase Auth UID
   * @param timetableData - Timetable entry data
   * @returns Promise with operation result
   */
  async saveTimetableEntry(
    userId: string,
    timetableData: Omit<TimetableEntry, 'id' | 'userId' | 'createdAt' | 'lastUpdated'>
  ): Promise<ServiceResponse<TimetableEntry>> {
    try {
      const entryWithMetadata = {
        ...timetableData,
        userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.TIMETABLES), entryWithMetadata);
      
      return {
        success: true,
        data: { ...entryWithMetadata, id: docRef.id } as TimetableEntry,
        message: 'Timetable entry saved successfully'
      };
    } catch (error) {
      console.error('Error saving timetable entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save timetable entry'
      };
    }
  }

  /**
   * Get all timetable entries for a student
   * @param userId - Firebase Auth UID
   * @param day - Optional filter by day
   * @returns Promise with timetable entries
   */
  async getTimetableEntries(userId: string, day?: string): Promise<ListResponse<TimetableEntry>> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.TIMETABLES),
        where('userId', '==', userId),
        orderBy('startTime', 'asc')
      );

      if (day) {
        q = query(
          collection(db, this.COLLECTIONS.TIMETABLES),
          where('userId', '==', userId),
          where('day', '==', day),
          orderBy('startTime', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      const entries: TimetableEntry[] = [];

      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as TimetableEntry);
      });

      return {
        success: true,
        data: entries,
        total: entries.length,
        message: 'Timetable entries retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching timetable entries:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch timetable entries'
      };
    }
  }

  // ============================================================================
  // LESSON PROGRESS TRACKING
  // ============================================================================

  /**
   * Update lesson progress for a student
   * @param userId - Firebase Auth UID
   * @param progressData - Lesson progress data
   * @returns Promise with operation result
   */
  async updateLessonProgress(
    userId: string,
    progressData: Omit<LessonProgress, 'id' | 'userId' | 'createdAt' | 'lastUpdated'>
  ): Promise<ServiceResponse<LessonProgress>> {
    try {
      // Check if progress already exists for this lesson
      const q = query(
        collection(db, this.COLLECTIONS.LESSON_PROGRESS),
        where('userId', '==', userId),
        where('lessonId', '==', progressData.lessonId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      const progressWithMetadata = {
        ...progressData,
        userId,
        lastUpdated: serverTimestamp()
      };

      if (!querySnapshot.empty) {
        // Update existing progress
        const docRef = doc(db, this.COLLECTIONS.LESSON_PROGRESS, querySnapshot.docs[0].id);
        await updateDoc(docRef, progressWithMetadata);
        
        return {
          success: true,
          data: { ...progressWithMetadata, id: querySnapshot.docs[0].id } as LessonProgress,
          message: 'Lesson progress updated successfully'
        };
      } else {
        // Create new progress entry
        const newProgressData = {
          ...progressWithMetadata,
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, this.COLLECTIONS.LESSON_PROGRESS), newProgressData);
        
        return {
          success: true,
          data: { ...newProgressData, id: docRef.id } as LessonProgress,
          message: 'Lesson progress created successfully'
        };
      }
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lesson progress'
      };
    }
  }

  // ============================================================================
  // NOTES MANAGEMENT
  // ============================================================================

  /**
   * Save a student note
   * @param userId - Firebase Auth UID
   * @param noteData - Note data
   * @returns Promise with operation result
   */
  async saveNote(
    userId: string,
    noteData: Omit<StudentNote, 'id' | 'userId' | 'createdAt' | 'lastUpdated'>
  ): Promise<ServiceResponse<StudentNote>> {
    try {
      const noteWithMetadata = {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.NOTES), noteWithMetadata);

      return {
        success: true,
        data: { ...noteWithMetadata, id: docRef.id } as StudentNote,
        message: 'Note saved successfully'
      };
    } catch (error) {
      console.error('Error saving note:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save note'
      };
    }
  }

  /**
   * Get all notes for a student
   * @param userId - Firebase Auth UID
   * @param category - Optional filter by category
   * @returns Promise with notes list
   */
  async getNotes(userId: string, category?: string): Promise<ListResponse<StudentNote>> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.NOTES),
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('lastUpdated', 'desc')
      );

      if (category) {
        q = query(
          collection(db, this.COLLECTIONS.NOTES),
          where('userId', '==', userId),
          where('category', '==', category),
          where('isArchived', '==', false),
          orderBy('lastUpdated', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const notes: StudentNote[] = [];

      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as StudentNote);
      });

      return {
        success: true,
        data: notes,
        total: notes.length,
        message: 'Notes retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notes'
      };
    }
  }

  // ============================================================================
  // CAREER PROFILE MANAGEMENT
  // ============================================================================

  /**
   * Save or update career profile
   * @param userId - Firebase Auth UID
   * @param careerData - Career profile data
   * @returns Promise with operation result
   */
  async saveCareerProfile(
    userId: string,
    careerData: Omit<CareerProfile, 'id' | 'userId' | 'createdAt' | 'lastUpdated'>
  ): Promise<ServiceResponse<CareerProfile>> {
    try {
      // Check if career profile already exists
      const q = query(
        collection(db, this.COLLECTIONS.CAREER_PROFILES),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      const careerWithMetadata = {
        ...careerData,
        userId,
        lastUpdated: serverTimestamp()
      };

      if (!querySnapshot.empty) {
        // Update existing career profile
        const docRef = doc(db, this.COLLECTIONS.CAREER_PROFILES, querySnapshot.docs[0].id);
        await updateDoc(docRef, careerWithMetadata);

        return {
          success: true,
          data: { ...careerWithMetadata, id: querySnapshot.docs[0].id } as CareerProfile,
          message: 'Career profile updated successfully'
        };
      } else {
        // Create new career profile
        const newCareerData = {
          ...careerWithMetadata,
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, this.COLLECTIONS.CAREER_PROFILES), newCareerData);

        return {
          success: true,
          data: { ...newCareerData, id: docRef.id } as CareerProfile,
          message: 'Career profile created successfully'
        };
      }
    } catch (error) {
      console.error('Error saving career profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save career profile'
      };
    }
  }

  /**
   * Get career profile for a student
   * @param userId - Firebase Auth UID
   * @returns Promise with career profile data
   */
  async getCareerProfile(userId: string): Promise<ServiceResponse<CareerProfile>> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.CAREER_PROFILES),
        where('userId', '==', userId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as CareerProfile;

        return {
          success: true,
          data,
          message: 'Career profile retrieved successfully'
        };
      } else {
        return {
          success: false,
          error: 'Career profile not found'
        };
      }
    } catch (error) {
      console.error('Error fetching career profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch career profile'
      };
    }
  }

  // ============================================================================
  // NOTIFICATIONS MANAGEMENT
  // ============================================================================

  /**
   * Create a notification for a student
   * @param userId - Firebase Auth UID
   * @param notificationData - Notification data
   * @returns Promise with operation result
   */
  async createNotification(
    userId: string,
    notificationData: Omit<StudentNotification, 'id' | 'userId' | 'createdAt'>
  ): Promise<ServiceResponse<StudentNotification>> {
    try {
      const notificationWithMetadata = {
        ...notificationData,
        userId,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.NOTIFICATIONS), notificationWithMetadata);

      return {
        success: true,
        data: { ...notificationWithMetadata, id: docRef.id } as StudentNotification,
        message: 'Notification created successfully'
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create notification'
      };
    }
  }

  /**
   * Get notifications for a student
   * @param userId - Firebase Auth UID
   * @param unreadOnly - Filter for unread notifications only
   * @returns Promise with notifications list
   */
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<ListResponse<StudentNotification>> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('createdAt', 'desc')
      );

      if (unreadOnly) {
        q = query(
          collection(db, this.COLLECTIONS.NOTIFICATIONS),
          where('userId', '==', userId),
          where('isRead', '==', false),
          where('isArchived', '==', false),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const notifications: StudentNotification[] = [];

      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as StudentNotification);
      });

      return {
        success: true,
        data: notifications,
        total: notifications.length,
        message: 'Notifications retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications'
      };
    }
  }

  /**
   * Mark notification as read
   * @param notificationId - Notification document ID
   * @returns Promise with operation result
   */
  async markNotificationAsRead(notificationId: string): Promise<ServiceResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTIONS.NOTIFICATIONS, notificationId);
      await updateDoc(docRef, {
        isRead: true,
        readAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      };
    }
  }

  // ============================================================================
  // ADMIN FUNCTIONS (For Teachers/Admins to access all student data)
  // ============================================================================

  /**
   * Get all students (Admin only)
   * @param limit - Number of students to fetch
   * @returns Promise with students list
   */
  async getAllStudents(limitCount: number = 50): Promise<ListResponse<StudentProfile>> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.STUDENTS),
        where('role', '==', 'student'),
        orderBy('lastUpdated', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const students: StudentProfile[] = [];

      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as StudentProfile);
      });

      return {
        success: true,
        data: students,
        total: students.length,
        message: 'Students retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching all students:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch students'
      };
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Set offline mode
   * @param offline - Whether the service is offline
   */
  setOfflineMode(offline: boolean): void {
    this.isOffline = offline;
  }

  /**
   * Clear offline cache
   */
  clearCache(): void {
    this.offlineCache.clear();
  }

  /**
   * Subscribe to real-time updates for student data
   * @param userId - Firebase Auth UID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToStudentProfile(userId: string, callback: (profile: StudentProfile | null) => void): () => void {
    const docRef = doc(db, this.COLLECTIONS.STUDENTS, userId);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as StudentProfile;
        callback(data);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in student profile subscription:', error);
      callback(null);
    });
  }
}

// Export singleton instance
export const enhancedStudentDataService = new EnhancedStudentDataService();
