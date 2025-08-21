// Dashboard data models for Personal Dashboard feature

export interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  sessionType: 'lecture' | 'lab' | 'tutorial' | 'seminar';
  duration: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  assessmentType: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project' | 'presentation';
  assessmentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string; // A+, A, B+, etc.
  weightage: number; // percentage contribution to final grade
  submittedAt: string;
  gradedAt: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'semester' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: 'hours' | 'pages' | 'chapters' | 'assignments' | 'quizzes' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  endDate: string;
  reminderEnabled: boolean;
  reminderFrequency?: 'daily' | 'weekly' | 'custom';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  type: 'homework' | 'project' | 'essay' | 'presentation' | 'lab_report' | 'research';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'submitted' | 'graded';
  assignedDate: string;
  dueDate: string;
  submittedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  progress: number; // 0-100
  attachments: string[];
  notes?: string;
  reminderSet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'assignment' | 'exam' | 'goal' | 'event' | 'custom';
  relatedId?: string; // ID of related assignment, exam, etc.
  reminderTime: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'snoozed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  examName: string;
  examType: 'quiz' | 'midterm' | 'final' | 'practical' | 'oral' | 'project_defense';
  date: string;
  duration: number; // in minutes
  location?: string;
  syllabus: string[];
  preparationStatus: 'not_started' | 'in_progress' | 'completed';
  preparationProgress: number; // 0-100
  studyHours: number;
  targetGrade?: string;
  actualGrade?: string;
  actualScore?: number;
  maxScore?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  notes?: string;
  resources: ExamResource[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamResource {
  id: string;
  type: 'textbook' | 'notes' | 'video' | 'practice_test' | 'slides' | 'website';
  title: string;
  url?: string;
  description?: string;
  completed: boolean;
}

export interface PerformanceAnalytics {
  id: string;
  userId: string;
  period: 'weekly' | 'monthly' | 'semester' | 'yearly';
  startDate: string;
  endDate: string;
  
  // Academic metrics
  overallGPA: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  
  // Study metrics
  totalStudyHours: number;
  averageStudyHoursPerDay: number;
  goalsCompleted: number;
  goalsTotal: number;
  
  // Course-wise performance
  coursePerformance: CoursePerformance[];
  
  // Trends
  gradesTrend: number[]; // weekly/monthly averages
  attendanceTrend: number[];
  studyHoursTrend: number[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  currentGrade: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  upcomingExams: number;
  studyHours: number;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

export interface DashboardSummary {
  userId: string;
  
  // Quick stats
  todayAttendance: number;
  weeklyAttendanceRate: number;
  currentGPA: number;
  pendingAssignments: number;
  upcomingExams: number;
  activeGoals: number;
  todayStudyHours: number;
  
  // Recent activities
  recentGrades: Grade[];
  upcomingDeadlines: Assignment[];
  todayReminders: Reminder[];
  
  // Performance indicators
  performanceTrend: 'improving' | 'stable' | 'declining';
  attendanceTrend: 'improving' | 'stable' | 'declining';
  studyConsistency: 'excellent' | 'good' | 'average' | 'poor';
  
  lastUpdated: string;
}

// Chart data interfaces
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
  }[];
}

export interface PieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}[];
