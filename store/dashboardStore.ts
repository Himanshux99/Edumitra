import { create } from 'zustand';
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

interface DashboardState {
  // Data
  attendanceRecords: AttendanceRecord[];
  grades: Grade[];
  studyGoals: StudyGoal[];
  assignments: Assignment[];
  reminders: Reminder[];
  exams: Exam[];
  performanceAnalytics: PerformanceAnalytics | null;
  dashboardSummary: DashboardSummary | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  
  // Filters and selections
  selectedPeriod: 'week' | 'month' | 'semester' | 'year';
  selectedCourse: string | null;
  
  // Actions - Data Management
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  
  setGrades: (grades: Grade[]) => void;
  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  
  setStudyGoals: (goals: StudyGoal[]) => void;
  addStudyGoal: (goal: StudyGoal) => void;
  updateStudyGoal: (id: string, updates: Partial<StudyGoal>) => void;
  updateGoalProgress: (id: string, currentValue: number) => void;
  
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  updateAssignmentProgress: (id: string, progress: number) => void;
  
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  
  setExams: (exams: Exam[]) => void;
  addExam: (exam: Exam) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  updateExamPreparation: (id: string, progress: number, studyHours: number) => void;
  
  setPerformanceAnalytics: (analytics: PerformanceAnalytics) => void;
  setDashboardSummary: (summary: DashboardSummary) => void;
  
  // Actions - UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSyncTime: (time: string) => void;
  setSelectedPeriod: (period: 'week' | 'month' | 'semester' | 'year') => void;
  setSelectedCourse: (courseId: string | null) => void;
  
  // Computed getters
  getAttendanceRate: (period?: 'week' | 'month') => number;
  getCurrentGPA: () => number;
  getPendingAssignments: () => Assignment[];
  getUpcomingExams: (days?: number) => Exam[];
  getActiveGoals: () => StudyGoal[];
  getTodayReminders: () => Reminder[];
  getRecentGrades: (limit?: number) => Grade[];
  getStudyHoursThisWeek: () => number;
  getCoursePerformance: () => { [courseId: string]: number };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  attendanceRecords: [],
  grades: [],
  studyGoals: [],
  assignments: [],
  reminders: [],
  exams: [],
  performanceAnalytics: null,
  dashboardSummary: null,
  
  isLoading: false,
  error: null,
  lastSyncTime: null,
  
  selectedPeriod: 'month',
  selectedCourse: null,
  
  // Data management actions
  setAttendanceRecords: (records) => set({ attendanceRecords: records }),
  addAttendanceRecord: (record) => set((state) => ({
    attendanceRecords: [record, ...state.attendanceRecords]
  })),
  updateAttendanceRecord: (id, updates) => set((state) => ({
    attendanceRecords: state.attendanceRecords.map(record =>
      record.id === id ? { ...record, ...updates } : record
    )
  })),
  
  setGrades: (grades) => set({ grades }),
  addGrade: (grade) => set((state) => ({
    grades: [grade, ...state.grades]
  })),
  updateGrade: (id, updates) => set((state) => ({
    grades: state.grades.map(grade =>
      grade.id === id ? { ...grade, ...updates } : grade
    )
  })),
  
  setStudyGoals: (goals) => set({ studyGoals: goals }),
  addStudyGoal: (goal) => set((state) => ({
    studyGoals: [goal, ...state.studyGoals]
  })),
  updateStudyGoal: (id, updates) => set((state) => ({
    studyGoals: state.studyGoals.map(goal =>
      goal.id === id ? { ...goal, ...updates } : goal
    )
  })),
  updateGoalProgress: (id, currentValue) => set((state) => ({
    studyGoals: state.studyGoals.map(goal =>
      goal.id === id ? { 
        ...goal, 
        currentValue,
        status: currentValue >= goal.targetValue ? 'completed' : goal.status,
        updatedAt: new Date().toISOString()
      } : goal
    )
  })),
  
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) => set((state) => ({
    assignments: [assignment, ...state.assignments]
  })),
  updateAssignment: (id, updates) => set((state) => ({
    assignments: state.assignments.map(assignment =>
      assignment.id === id ? { ...assignment, ...updates } : assignment
    )
  })),
  updateAssignmentProgress: (id, progress) => set((state) => ({
    assignments: state.assignments.map(assignment =>
      assignment.id === id ? { 
        ...assignment, 
        progress,
        status: progress >= 100 ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString()
      } : assignment
    )
  })),
  
  setReminders: (reminders) => set({ reminders }),
  addReminder: (reminder) => set((state) => ({
    reminders: [reminder, ...state.reminders]
  })),
  updateReminder: (id, updates) => set((state) => ({
    reminders: state.reminders.map(reminder =>
      reminder.id === id ? { ...reminder, ...updates } : reminder
    )
  })),
  deleteReminder: (id) => set((state) => ({
    reminders: state.reminders.filter(reminder => reminder.id !== id)
  })),
  
  setExams: (exams) => set({ exams }),
  addExam: (exam) => set((state) => ({
    exams: [exam, ...state.exams]
  })),
  updateExam: (id, updates) => set((state) => ({
    exams: state.exams.map(exam =>
      exam.id === id ? { ...exam, ...updates } : exam
    )
  })),
  updateExamPreparation: (id, progress, studyHours) => set((state) => ({
    exams: state.exams.map(exam =>
      exam.id === id ? { 
        ...exam, 
        preparationProgress: progress,
        studyHours,
        preparationStatus: progress >= 100 ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString()
      } : exam
    )
  })),
  
  setPerformanceAnalytics: (analytics) => set({ performanceAnalytics: analytics }),
  setDashboardSummary: (summary) => set({ dashboardSummary: summary }),
  
  // UI state actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  setSelectedCourse: (courseId) => set({ selectedCourse: courseId }),
  
  // Computed getters
  getAttendanceRate: (period = 'month') => {
    const { attendanceRecords } = get();
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }
    
    const relevantRecords = attendanceRecords.filter(record => 
      new Date(record.date) >= startDate
    );
    
    if (relevantRecords.length === 0) return 0;
    
    const presentRecords = relevantRecords.filter(record => 
      record.status === 'present' || record.status === 'late'
    );
    
    return Math.round((presentRecords.length / relevantRecords.length) * 100);
  },
  
  getCurrentGPA: () => {
    const { grades } = get();
    if (grades.length === 0) return 0;
    
    const totalWeightedPoints = grades.reduce((sum, grade) => 
      sum + (grade.percentage * grade.weightage / 100), 0
    );
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weightage, 0);
    
    if (totalWeight === 0) return 0;
    
    const averagePercentage = totalWeightedPoints / totalWeight * 100;
    // Convert percentage to 4.0 scale
    return Math.round((averagePercentage / 100 * 4) * 100) / 100;
  },
  
  getPendingAssignments: () => {
    const { assignments } = get();
    return assignments.filter(assignment => 
      assignment.status === 'not_started' || assignment.status === 'in_progress'
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },
  
  getUpcomingExams: (days = 30) => {
    const { exams } = get();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return exams.filter(exam => {
      const examDate = new Date(exam.date);
      return examDate >= now && examDate <= futureDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  getActiveGoals: () => {
    const { studyGoals } = get();
    return studyGoals.filter(goal => goal.status === 'active');
  },
  
  getTodayReminders: () => {
    const { reminders } = get();
    const today = new Date().toISOString().split('T')[0];
    
    return reminders.filter(reminder => 
      reminder.reminderTime.startsWith(today) && reminder.status === 'active'
    ).sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));
  },
  
  getRecentGrades: (limit = 5) => {
    const { grades } = get();
    return grades
      .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())
      .slice(0, limit);
  },
  
  getStudyHoursThisWeek: () => {
    const { studyGoals } = get();
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    return studyGoals
      .filter(goal => 
        goal.unit === 'hours' && 
        new Date(goal.updatedAt) >= weekStart
      )
      .reduce((total, goal) => total + goal.currentValue, 0);
  },
  
  getCoursePerformance: () => {
    const { grades } = get();
    const coursePerformance: { [courseId: string]: number } = {};

    grades.forEach(grade => {
      if (!coursePerformance[grade.courseId]) {
        coursePerformance[grade.courseId] = 0;
      }
      coursePerformance[grade.courseId] += grade.percentage;
    });

    // Calculate average for each course
    Object.keys(coursePerformance).forEach(courseId => {
      const courseGrades = grades.filter(g => g.courseId === courseId);
      if (courseGrades.length > 0) {
        coursePerformance[courseId] = coursePerformance[courseId] / courseGrades.length;
      }
    });

    return coursePerformance;
  }
}));
