// Student academic data types and interfaces

export interface StudentAcademicData {
  id?: string;
  userId: string; // Firebase Auth UID
  studentId: string; // Student ID from registration
  
  // Academic Performance
  cgpa: number;
  currentSemester: number;
  totalSemesters: number;
  
  // Attendance Data
  attendance: AttendanceData;
  
  // Subject-wise Performance
  subjects: SubjectPerformance[];
  
  // Completed Courses/Modules
  completedCourses: CompletedCourse[];
  
  // Additional Academic Metrics
  academicMetrics: AcademicMetrics;
  
  // Metadata
  lastUpdated: string;
  createdAt: string;
  academicYear: string;
}

export interface AttendanceData {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  subjectWiseAttendance: SubjectAttendance[];
  lastUpdated: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
}

export interface SubjectPerformance {
  subjectCode: string;
  subjectName: string;
  credits: number;
  grade: string; // A+, A, B+, etc.
  gradePoints: number; // 10, 9, 8, etc.
  marks: number;
  maxMarks: number;
  semester: number;
  examType: 'midterm' | 'final' | 'assignment' | 'quiz' | 'project';
}

export interface CompletedCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  credits: number;
  grade: string;
  gradePoints: number;
  completionDate: string;
  semester: number;
  instructor: string;
}

export interface AcademicMetrics {
  // GPA by semester
  semesterGPAs: SemesterGPA[];
  
  // Academic standing
  academicStanding: 'excellent' | 'good' | 'satisfactory' | 'probation';
  
  // Progress tracking
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  progressPercentage: number;
  
  // Performance trends
  performanceTrend: 'improving' | 'declining' | 'stable';
  
  // Achievements
  achievements: Achievement[];
  
  // Warnings/Alerts
  academicAlerts: AcademicAlert[];
}

export interface SemesterGPA {
  semester: number;
  gpa: number;
  credits: number;
  academicYear: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  dateEarned: string;
  type: 'academic' | 'attendance' | 'extracurricular';
  icon?: string;
}

export interface AcademicAlert {
  id: string;
  type: 'low_attendance' | 'low_gpa' | 'missing_assignment' | 'exam_reminder';
  severity: 'low' | 'medium' | 'high';
  message: string;
  actionRequired: boolean;
  dueDate?: string;
  createdAt: string;
}

// Form data for uploading student data
export interface StudentDataUploadForm {
  // Basic Info
  cgpa: string;
  currentSemester: string;
  academicYear: string;
  
  // Attendance
  overallAttendance: string;
  totalClasses: string;
  attendedClasses: string;
  
  // Subject Performance (can add multiple)
  subjects: SubjectFormData[];
  
  // Completed Courses (can add multiple)
  completedCourses: CompletedCourseFormData[];
}

export interface SubjectFormData {
  subjectCode: string;
  subjectName: string;
  credits: string;
  grade: string;
  marks: string;
  maxMarks: string;
  semester: string;
  examType: string;
}

export interface CompletedCourseFormData {
  courseCode: string;
  courseName: string;
  credits: string;
  grade: string;
  completionDate: string;
  semester: string;
  instructor: string;
}

// API Response types
export interface StudentDataResponse {
  success: boolean;
  data?: StudentAcademicData;
  error?: string;
  message?: string;
}

export interface StudentDataListResponse {
  success: boolean;
  data?: StudentAcademicData[];
  error?: string;
  message?: string;
  total?: number;
}

// Dashboard display data
export interface StudentDashboardData {
  academicOverview: {
    cgpa: number;
    attendance: number;
    completedCredits: number;
    totalCredits: number;
    currentSemester: number;
  };
  
  recentPerformance: SubjectPerformance[];
  attendanceTrend: AttendanceData;
  upcomingDeadlines: AcademicAlert[];
  achievements: Achievement[];
  performanceChart: ChartData[];
}

export interface ChartData {
  semester: number;
  gpa: number;
  attendance: number;
  credits: number;
}

// Validation errors
export interface StudentDataValidationErrors {
  cgpa?: string;
  attendance?: string;
  subjects?: { [index: number]: { [field: string]: string } };
  completedCourses?: { [index: number]: { [field: string]: string } };
  general?: string;
}

// Filter and search options for admin view
export interface StudentDataFilters {
  academicYear?: string;
  semester?: number;
  minCGPA?: number;
  maxCGPA?: number;
  attendanceThreshold?: number;
  academicStanding?: string;
  searchQuery?: string;
}

// Bulk operations for admin
export interface BulkStudentDataOperation {
  operation: 'update' | 'delete' | 'export';
  studentIds: string[];
  updateData?: Partial<StudentAcademicData>;
}

export interface StudentDataExport {
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
  filters?: StudentDataFilters;
}

// Real-time update types
export interface StudentDataUpdate {
  type: 'create' | 'update' | 'delete';
  studentId: string;
  data?: Partial<StudentAcademicData>;
  timestamp: string;
}

// Permission types for role-based access
export interface StudentDataPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean; // Admin permission
  canExport: boolean;
  canBulkUpdate: boolean;
}
