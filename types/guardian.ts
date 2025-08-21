// Parental/Guardian View types and interfaces

// Guardian Profile Types
export interface GuardianProfile {
  id: string;
  userId: string; // Reference to auth user
  name: string;
  email: string;
  phone: string;
  relationship: GuardianRelationship;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  preferredLanguage: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  students: GuardianStudentLink[];
  notificationSettings: GuardianNotificationSettings;
}

export type GuardianRelationship = 
  | 'father'
  | 'mother'
  | 'guardian'
  | 'grandfather'
  | 'grandmother'
  | 'uncle'
  | 'aunt'
  | 'sibling'
  | 'other';

export interface GuardianStudentLink {
  id: string;
  guardianId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  relationship: GuardianRelationship;
  consentStatus: ConsentStatus;
  accessLevel: AccessLevel;
  linkedAt: string;
  consentGivenAt: string | null;
  consentExpiresAt: string | null;
  isActive: boolean;
}

export type ConsentStatus = 
  | 'pending'
  | 'granted'
  | 'denied'
  | 'expired'
  | 'revoked';

export type AccessLevel = 
  | 'full'
  | 'limited'
  | 'summary_only'
  | 'emergency_only';

// Consent Management
export interface ConsentRequest {
  id: string;
  studentId: string;
  guardianId: string;
  requestedBy: 'student' | 'guardian' | 'admin';
  accessLevel: AccessLevel;
  permissions: ConsentPermission[];
  message: string;
  status: ConsentStatus;
  requestedAt: string;
  respondedAt: string | null;
  expiresAt: string | null;
  metadata: ConsentMetadata;
}

export type ConsentPermission = 
  | 'view_grades'
  | 'view_attendance'
  | 'view_assignments'
  | 'view_schedule'
  | 'view_behavior'
  | 'view_fees'
  | 'receive_notifications'
  | 'contact_teachers'
  | 'view_medical_info'
  | 'emergency_contact';

export interface ConsentMetadata {
  ipAddress: string;
  userAgent: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
  };
}

// Student Performance Summary for Guardians
export interface StudentPerformanceSummary {
  studentId: string;
  studentName: string;
  academicYear: string;
  semester: string;
  lastUpdated: string;
  
  // Academic Performance
  overallGrade: string;
  gpa: number;
  cgpa: number;
  rank: number | null;
  totalStudents: number;
  
  // Subject Performance
  subjects: SubjectPerformance[];
  
  // Attendance
  attendanceSummary: AttendanceSummary;
  
  // Assignments & Tests
  assignmentsSummary: AssignmentsSummary;
  
  // Behavioral & Disciplinary
  behaviorSummary: BehaviorSummary;
  
  // Achievements & Awards
  achievements: Achievement[];
  
  // Areas of Concern
  concerns: PerformanceConcern[];
  
  // Recommendations
  recommendations: string[];
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  instructor: string;
  currentGrade: string;
  percentage: number;
  credits: number;
  
  // Recent Performance
  recentTests: TestResult[];
  assignments: AssignmentResult[];
  
  // Trends
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  
  // Attendance for this subject
  attendancePercentage: number;
  classesAttended: number;
  totalClasses: number;
}

export interface TestResult {
  id: string;
  name: string;
  type: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  feedback?: string;
}

export interface AssignmentResult {
  id: string;
  title: string;
  dueDate: string;
  submittedAt: string | null;
  status: 'submitted' | 'late' | 'missing' | 'graded';
  score: number | null;
  maxScore: number;
  feedback?: string;
}

export interface AttendanceSummary {
  overallPercentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedAbsences: number;
  
  // Monthly breakdown
  monthlyAttendance: MonthlyAttendance[];
  
  // Recent attendance
  recentAttendance: DailyAttendance[];
  
  // Attendance alerts
  alerts: AttendanceAlert[];
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  percentage: number;
  presentDays: number;
  totalDays: number;
}

export interface DailyAttendance {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  periods: PeriodAttendance[];
  remarks?: string;
}

export interface PeriodAttendance {
  period: number;
  subject: string;
  status: 'present' | 'absent' | 'late';
  teacher: string;
}

export interface AttendanceAlert {
  id: string;
  type: 'low_attendance' | 'consecutive_absences' | 'pattern_concern';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  acknowledged: boolean;
}

export interface AssignmentsSummary {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdueAssignments: number;
  averageScore: number;
  
  // Upcoming assignments
  upcomingAssignments: UpcomingAssignment[];
  
  // Recent submissions
  recentSubmissions: RecentSubmission[];
}

export interface UpcomingAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
  description: string;
}

export interface RecentSubmission {
  id: string;
  title: string;
  subject: string;
  submittedAt: string;
  score: number | null;
  maxScore: number;
  status: 'graded' | 'pending' | 'late';
}

export interface BehaviorSummary {
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  
  // Behavioral metrics
  punctuality: number; // 1-5 scale
  participation: number;
  cooperation: number;
  responsibility: number;
  
  // Incidents
  incidents: BehaviorIncident[];
  
  // Positive recognitions
  recognitions: BehaviorRecognition[];
  
  // Teacher comments
  teacherComments: TeacherComment[];
}

export interface BehaviorIncident {
  id: string;
  type: 'minor' | 'major' | 'serious';
  category: string;
  description: string;
  date: string;
  reportedBy: string;
  actionTaken: string;
  resolved: boolean;
}

export interface BehaviorRecognition {
  id: string;
  type: 'academic' | 'behavioral' | 'leadership' | 'service';
  title: string;
  description: string;
  date: string;
  awardedBy: string;
}

export interface TeacherComment {
  id: string;
  teacherName: string;
  subject: string;
  comment: string;
  date: string;
  type: 'general' | 'academic' | 'behavioral';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'sports' | 'arts' | 'leadership' | 'service' | 'other';
  level: 'school' | 'district' | 'state' | 'national' | 'international';
  date: string;
  certificate?: string;
  image?: string;
}

export interface PerformanceConcern {
  id: string;
  type: 'academic' | 'attendance' | 'behavioral' | 'health' | 'social';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  identifiedAt: string;
  identifiedBy: string;
  actionPlan: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  followUpDate: string | null;
}

// Guardian Notification Settings
export interface GuardianNotificationSettings {
  id: string;
  guardianId: string;
  
  // Notification channels
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  
  // Notification types
  academicAlerts: NotificationPreference;
  attendanceAlerts: NotificationPreference;
  behaviorAlerts: NotificationPreference;
  assignmentReminders: NotificationPreference;
  gradeUpdates: NotificationPreference;
  schoolAnnouncements: NotificationPreference;
  emergencyAlerts: NotificationPreference;
  feeReminders: NotificationPreference;
  
  // Timing preferences
  quietHours: QuietHours;
  frequency: NotificationFrequency;
  
  // Language and format
  language: string;
  timezone: string;
  digestFormat: 'immediate' | 'daily' | 'weekly';
  
  updatedAt: string;
}

export interface NotificationPreference {
  enabled: boolean;
  channels: ('email' | 'sms' | 'push' | 'inApp')[];
  threshold: 'all' | 'important' | 'critical';
  customRules: NotificationRule[];
}

export interface NotificationRule {
  id: string;
  condition: string;
  action: 'notify' | 'suppress' | 'escalate';
  channels: ('email' | 'sms' | 'push' | 'inApp')[];
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  exceptions: ('emergency' | 'critical')[];
}

export type NotificationFrequency = 
  | 'immediate'
  | 'every_15_minutes'
  | 'hourly'
  | 'daily'
  | 'weekly';

// Guardian Notifications
export interface GuardianNotification {
  id: string;
  guardianId: string;
  studentId: string;
  type: GuardianNotificationType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: any;
  channels: ('email' | 'sms' | 'push' | 'inApp')[];
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  readAt: string | null;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: string;
}

export type GuardianNotificationType = 
  | 'grade_update'
  | 'attendance_alert'
  | 'assignment_due'
  | 'assignment_missing'
  | 'behavior_incident'
  | 'achievement'
  | 'fee_reminder'
  | 'school_announcement'
  | 'emergency_alert'
  | 'teacher_message'
  | 'schedule_change'
  | 'exam_reminder'
  | 'consent_request'
  | 'system_update';

// Guardian State
export interface GuardianState {
  // Guardian Profile
  currentGuardian: GuardianProfile | null;
  
  // Students and Access
  linkedStudents: GuardianStudentLink[];
  selectedStudent: GuardianStudentLink | null;
  
  // Student Data
  studentPerformance: { [studentId: string]: StudentPerformanceSummary };
  
  // Consent Management
  consentRequests: ConsentRequest[];
  activeConsents: GuardianStudentLink[];
  
  // Notifications
  notifications: GuardianNotification[];
  unreadCount: number;
  notificationSettings: GuardianNotificationSettings | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  
  // View preferences
  selectedTimeframe: 'week' | 'month' | 'semester' | 'year';
  dashboardLayout: 'compact' | 'detailed';
}

// API Response Types
export interface GuardianResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  permissions?: ConsentPermission[];
}

export interface GuardianListResponse<T> extends GuardianResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Guardian Analytics
export interface GuardianAnalytics {
  guardianId: string;
  period: string;
  
  // Engagement metrics
  loginFrequency: number;
  averageSessionDuration: number;
  featuresUsed: string[];
  
  // Student monitoring
  studentsMonitored: number;
  alertsReceived: number;
  alertsActioned: number;
  
  // Communication
  messagesExchanged: number;
  meetingsScheduled: number;
  
  // Satisfaction
  satisfactionScore: number;
  feedbackProvided: boolean;
}

// Guardian Communication
export interface GuardianMessage {
  id: string;
  guardianId: string;
  studentId: string;
  recipientType: 'teacher' | 'admin' | 'counselor' | 'principal';
  recipientId: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'sent' | 'delivered' | 'read' | 'replied';
  sentAt: string;
  readAt: string | null;
  repliedAt: string | null;
  attachments: MessageAttachment[];
  thread: GuardianMessage[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Guardian Reports
export interface GuardianReport {
  id: string;
  guardianId: string;
  studentId: string;
  type: GuardianReportType;
  title: string;
  description: string;
  period: {
    start: string;
    end: string;
  };
  data: any;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'json';
  downloadUrl: string;
  expiresAt: string;
}

export type GuardianReportType = 
  | 'academic_progress'
  | 'attendance_summary'
  | 'behavior_report'
  | 'comprehensive_report'
  | 'subject_wise_analysis'
  | 'comparative_analysis';

// Search and Filter Types
export interface GuardianSearchFilters {
  studentId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  subjects?: string[];
  notificationTypes?: GuardianNotificationType[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  status?: string[];
  sortBy?: 'date' | 'priority' | 'subject' | 'grade';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
