// Enhanced Student Data Types and Interfaces for EduMitra

// ============================================================================
// CORE STUDENT PROFILE
// ============================================================================

export interface StudentProfile {
  id?: string;
  userId: string; // Firebase Auth UID
  studentId: string; // Student ID from registration

  // Basic Information
  name: string;
  email: string;
  role: 'student' | 'admin' | 'teacher';
  profilePicture?: string;

  // Academic Information
  course: string;
  branch: string;
  currentSemester: number;
  totalSemesters: number;
  academicYear: string;
  enrollmentDate: string;

  // Contact Information
  phone?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  // Metadata
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
}

// ============================================================================
// ACADEMIC DATA STRUCTURE
// ============================================================================

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

// ============================================================================
// TIMETABLE AND SCHEDULE DATA
// ============================================================================

export interface TimetableEntry {
  id?: string;
  userId: string;

  // Schedule Information
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"

  // Subject/Activity Details
  subjectCode: string;
  subjectName: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'exam' | 'assignment' | 'personal';
  instructor?: string;
  room?: string;

  // Additional Information
  isRecurring: boolean;
  color?: string; // For UI display
  notes?: string;

  // Metadata
  createdAt: string;
  lastUpdated: string;
}

export interface WeeklyTimetable {
  id?: string;
  userId: string;
  weekStartDate: string; // ISO date string
  entries: TimetableEntry[];
  semester: number;
  academicYear: string;

  // Metadata
  createdAt: string;
  lastUpdated: string;
}

// ============================================================================
// LESSONS AND LEARNING PROGRESS
// ============================================================================

export interface LessonProgress {
  id?: string;
  userId: string;

  // Lesson Information
  lessonId: string;
  courseId: string;
  lessonTitle: string;

  // Progress Tracking
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  progressPercentage: number; // 0-100
  timeSpent: number; // in minutes

  // Completion Details
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt: string;

  // Performance
  quizScore?: number;
  attempts: number;

  // Metadata
  createdAt: string;
  lastUpdated: string;
}

export interface StudentNote {
  id?: string;
  userId: string;

  // Note Content
  title: string;
  content: string;
  tags: string[];

  // Association
  lessonId?: string;
  subjectCode?: string;
  category: 'lesson' | 'personal' | 'assignment' | 'exam' | 'general';

  // Organization
  isFavorite: boolean;
  isArchived: boolean;

  // Metadata
  createdAt: string;
  lastUpdated: string;
}

// ============================================================================
// CAREER TOOLS AND RESUME DATA
// ============================================================================

export interface CareerProfile {
  id?: string;
  userId: string;

  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;

  // Professional Summary
  summary: string;
  objective: string;

  // Education
  education: EducationEntry[];

  // Experience
  experience: ExperienceEntry[];

  // Skills
  technicalSkills: string[];
  softSkills: string[];
  languages: LanguageSkill[];

  // Projects
  projects: ProjectEntry[];

  // Achievements
  achievements: AchievementEntry[];
  certifications: CertificationEntry[];

  // Career Goals
  careerGoals: CareerGoal[];

  // Metadata
  createdAt: string;
  lastUpdated: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  cgpa?: number;
  isCurrentlyStudying: boolean;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  description: string;
  skills: string[];
}

export interface LanguageSkill {
  language: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  isOngoing: boolean;
}

export interface AchievementEntry {
  title: string;
  description: string;
  date: string;
  category: 'academic' | 'professional' | 'personal' | 'competition';
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface CareerGoal {
  title: string;
  description: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number; // 0-100
}

// ============================================================================
// NOTIFICATIONS AND REMINDERS
// ============================================================================

export interface StudentNotification {
  id?: string;
  userId: string;

  // Notification Content
  title: string;
  message: string;
  type: 'assignment' | 'exam' | 'grade' | 'attendance' | 'general' | 'reminder' | 'achievement';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Status
  isRead: boolean;
  isArchived: boolean;

  // Scheduling
  scheduledFor?: string; // For reminders
  expiresAt?: string;

  // Actions
  actionUrl?: string;
  actionText?: string;

  // Metadata
  createdAt: string;
  readAt?: string;
  source: 'system' | 'admin' | 'teacher' | 'self';
}

export interface ReminderLog {
  id?: string;
  userId: string;

  // Reminder Details
  title: string;
  description: string;
  reminderDate: string;
  reminderTime: string;

  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom';

  // Status
  status: 'pending' | 'sent' | 'completed' | 'cancelled';

  // Association
  relatedTo?: {
    type: 'assignment' | 'exam' | 'lesson' | 'personal';
    id: string;
  };

  // Metadata
  createdAt: string;
  lastTriggered?: string;
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
