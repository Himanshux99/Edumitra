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
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  AttendanceRecord,
  Grade,
  StudyGoal,
  Assignment,
  Reminder,
  Exam,
  PerformanceAnalytics,
  DashboardSummary
} from '../types/dashboard';

class FirebaseService {
  private userId: string = 'demo_user'; // In production, get from auth

  // Generic CRUD operations
  async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      throw error;
    }
  }

  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString()
      });
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      throw error;
    }
  }

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }

  async getByUserId<T>(collectionName: string, userId?: string): Promise<T[]> {
    try {
      const q = query(
        collection(db, collectionName),
        where('userId', '==', userId || this.userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting ${collectionName} by user:`, error);
      // Return mock data for demo
      return this.getMockData<T>(collectionName);
    }
  }

  // Real-time listeners
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    userId?: string
  ): () => void {
    try {
      const q = query(
        collection(db, collectionName),
        where('userId', '==', userId || this.userId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      });
    } catch (error) {
      console.error(`Error subscribing to ${collectionName}:`, error);
      // Return mock data for demo
      callback(this.getMockData<T>(collectionName));
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Attendance operations
  async createAttendanceRecord(data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<AttendanceRecord>('attendance', { ...data, userId: this.userId });
  }

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return this.getByUserId<AttendanceRecord>('attendance');
  }

  async getAttendanceByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('userId', '==', this.userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
    } catch (error) {
      console.error('Error getting attendance by date range:', error);
      return this.getMockAttendanceData();
    }
  }

  // Grades operations
  async createGrade(data: Omit<Grade, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Grade>('grades', { ...data, userId: this.userId });
  }

  async getGrades(): Promise<Grade[]> {
    return this.getByUserId<Grade>('grades');
  }

  async getGradesByCourse(courseId: string): Promise<Grade[]> {
    try {
      const q = query(
        collection(db, 'grades'),
        where('userId', '==', this.userId),
        where('courseId', '==', courseId),
        orderBy('gradedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Grade[];
    } catch (error) {
      console.error('Error getting grades by course:', error);
      return this.getMockGradesData();
    }
  }

  // Study Goals operations
  async createStudyGoal(data: Omit<StudyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<StudyGoal>('study_goals', { ...data, userId: this.userId });
  }

  async updateStudyGoalProgress(id: string, currentValue: number): Promise<void> {
    return this.update<StudyGoal>('study_goals', id, { currentValue });
  }

  async getStudyGoals(): Promise<StudyGoal[]> {
    return this.getByUserId<StudyGoal>('study_goals');
  }

  async getActiveStudyGoals(): Promise<StudyGoal[]> {
    try {
      const q = query(
        collection(db, 'study_goals'),
        where('userId', '==', this.userId),
        where('status', '==', 'active'),
        orderBy('priority', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyGoal[];
    } catch (error) {
      console.error('Error getting active study goals:', error);
      return this.getMockStudyGoalsData();
    }
  }

  // Assignments operations
  async createAssignment(data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Assignment>('assignments', { ...data, userId: this.userId });
  }

  async updateAssignmentProgress(id: string, progress: number, status?: Assignment['status']): Promise<void> {
    const updateData: Partial<Assignment> = { progress };
    if (status) updateData.status = status;
    return this.update<Assignment>('assignments', id, updateData);
  }

  async getAssignments(): Promise<Assignment[]> {
    return this.getByUserId<Assignment>('assignments');
  }

  async getPendingAssignments(): Promise<Assignment[]> {
    try {
      const q = query(
        collection(db, 'assignments'),
        where('userId', '==', this.userId),
        where('status', 'in', ['not_started', 'in_progress']),
        orderBy('dueDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Assignment[];
    } catch (error) {
      console.error('Error getting pending assignments:', error);
      return this.getMockAssignmentsData();
    }
  }

  // Exams operations
  async createExam(data: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return this.create<Exam>('exams', { ...data, userId: this.userId });
  }

  async updateExamPreparation(id: string, progress: number, studyHours: number): Promise<void> {
    return this.update<Exam>('exams', id, { 
      preparationProgress: progress, 
      studyHours,
      preparationStatus: progress >= 100 ? 'completed' : 'in_progress'
    });
  }

  async getExams(): Promise<Exam[]> {
    return this.getByUserId<Exam>('exams');
  }

  async getUpcomingExams(): Promise<Exam[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'exams'),
        where('userId', '==', this.userId),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
    } catch (error) {
      console.error('Error getting upcoming exams:', error);
      return this.getMockExamsData();
    }
  }

  // Dashboard summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      // In a real implementation, this would aggregate data from multiple collections
      // For demo, we'll return mock data
      return this.getMockDashboardSummary();
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return this.getMockDashboardSummary();
    }
  }

  // Mock data methods for demo purposes
  private getMockData<T>(collectionName: string): T[] {
    switch (collectionName) {
      case 'attendance':
        return this.getMockAttendanceData() as T[];
      case 'grades':
        return this.getMockGradesData() as T[];
      case 'study_goals':
        return this.getMockStudyGoalsData() as T[];
      case 'assignments':
        return this.getMockAssignmentsData() as T[];
      case 'exams':
        return this.getMockExamsData() as T[];
      default:
        return [];
    }
  }

  private getMockAttendanceData(): AttendanceRecord[] {
    const today = new Date();
    const records: AttendanceRecord[] = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      records.push({
        id: `attendance_${i}`,
        userId: this.userId,
        courseId: `course_${i % 3 + 1}`,
        courseName: ['Mathematics', 'Physics', 'Chemistry'][i % 3],
        date: date.toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent',
        sessionType: ['lecture', 'lab', 'tutorial'][i % 3] as any,
        duration: 60 + Math.floor(Math.random() * 60),
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
      });
    }
    
    return records;
  }

  private getMockGradesData(): Grade[] {
    return [
      {
        id: 'grade_1',
        userId: this.userId,
        courseId: 'course_1',
        courseName: 'Mathematics',
        assessmentType: 'quiz',
        assessmentName: 'Calculus Quiz 1',
        score: 85,
        maxScore: 100,
        percentage: 85,
        grade: 'A',
        weightage: 10,
        submittedAt: '2024-01-15T10:00:00Z',
        gradedAt: '2024-01-16T14:00:00Z',
        feedback: 'Good work on derivatives!',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T14:00:00Z'
      },
      {
        id: 'grade_2',
        userId: this.userId,
        courseId: 'course_2',
        courseName: 'Physics',
        assessmentType: 'midterm',
        assessmentName: 'Mechanics Midterm',
        score: 78,
        maxScore: 100,
        percentage: 78,
        grade: 'B+',
        weightage: 30,
        submittedAt: '2024-01-20T09:00:00Z',
        gradedAt: '2024-01-22T16:00:00Z',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-22T16:00:00Z'
      }
    ];
  }

  private getMockStudyGoalsData(): StudyGoal[] {
    return [
      {
        id: 'goal_1',
        userId: this.userId,
        title: 'Study 2 hours daily',
        description: 'Maintain consistent daily study routine',
        category: 'daily',
        targetValue: 2,
        currentValue: 1.5,
        unit: 'hours',
        priority: 'high',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        reminderEnabled: true,
        reminderFrequency: 'daily',
        tags: ['study', 'routine'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T12:00:00Z'
      }
    ];
  }

  private getMockAssignmentsData(): Assignment[] {
    return [
      {
        id: 'assignment_1',
        userId: this.userId,
        courseId: 'course_1',
        courseName: 'Mathematics',
        title: 'Calculus Problem Set 3',
        description: 'Solve integration problems from chapter 5',
        type: 'homework',
        priority: 'medium',
        status: 'in_progress',
        assignedDate: '2024-01-15',
        dueDate: '2024-01-25',
        estimatedHours: 4,
        actualHours: 2,
        progress: 50,
        attachments: [],
        reminderSet: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-21T12:00:00Z'
      }
    ];
  }

  private getMockExamsData(): Exam[] {
    return [
      {
        id: 'exam_1',
        userId: this.userId,
        courseId: 'course_1',
        courseName: 'Mathematics',
        examName: 'Final Exam',
        examType: 'final',
        date: '2024-02-15',
        duration: 180,
        location: 'Room 101',
        syllabus: ['Calculus', 'Linear Algebra', 'Statistics'],
        preparationStatus: 'in_progress',
        preparationProgress: 65,
        studyHours: 25,
        targetGrade: 'A',
        difficulty: 'hard',
        resources: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T12:00:00Z'
      }
    ];
  }

  private getMockDashboardSummary(): DashboardSummary {
    return {
      userId: this.userId,
      todayAttendance: 2,
      weeklyAttendanceRate: 85,
      currentGPA: 3.7,
      pendingAssignments: 3,
      upcomingExams: 2,
      activeGoals: 4,
      todayStudyHours: 2.5,
      recentGrades: this.getMockGradesData().slice(0, 3),
      upcomingDeadlines: this.getMockAssignmentsData().slice(0, 3),
      todayReminders: [],
      performanceTrend: 'improving',
      attendanceTrend: 'stable',
      studyConsistency: 'good',
      lastUpdated: new Date().toISOString()
    };
  }
}

export const firebaseService = new FirebaseService();
