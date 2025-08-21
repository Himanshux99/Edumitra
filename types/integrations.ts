// Integrations types and interfaces

// Base Integration Types
export interface BaseIntegration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  isEnabled: boolean;
  lastSync: string | null;
  syncFrequency: SyncFrequency;
  credentials: IntegrationCredentials;
  settings: IntegrationSettings;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationType = 'lms' | 'erp' | 'cloud_storage' | 'calendar' | 'email';

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'syncing'
  | 'error'
  | 'pending_auth'
  | 'expired';

export type SyncFrequency = 
  | 'real_time'
  | 'every_15_minutes'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'manual';

export interface IntegrationCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  expiresAt?: string;
}

export interface IntegrationSettings {
  autoSync: boolean;
  syncCourses: boolean;
  syncGrades: boolean;
  syncAttendance: boolean;
  syncAssignments: boolean;
  syncAnnouncements: boolean;
  notifyOnSync: boolean;
  conflictResolution: 'local_wins' | 'remote_wins' | 'manual';
}

// LMS Integration Types
export interface LMSIntegration extends BaseIntegration {
  type: 'lms';
  provider: LMSProvider;
  courses: LMSCourse[];
  assignments: LMSAssignment[];
  grades: LMSGrade[];
  announcements: LMSAnnouncement[];
}

export type LMSProvider = 'moodle' | 'google_classroom' | 'canvas' | 'blackboard' | 'schoology';

export interface LMSCourse {
  id: string;
  externalId: string;
  name: string;
  code: string;
  description: string;
  instructor: string;
  semester: string;
  credits: number;
  enrollmentStatus: 'enrolled' | 'completed' | 'dropped';
  startDate: string;
  endDate: string;
  lastAccessed: string;
  progress: number; // 0-100
  grade: string | null;
  url: string;
  integrationId: string;
  syncedAt: string;
}

export interface LMSAssignment {
  id: string;
  externalId: string;
  courseId: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  submittedAt: string | null;
  status: AssignmentStatus;
  grade: number | null;
  maxGrade: number;
  feedback: string | null;
  attachments: LMSAttachment[];
  url: string;
  integrationId: string;
  syncedAt: string;
}

export type AssignmentType = 
  | 'assignment'
  | 'quiz'
  | 'exam'
  | 'project'
  | 'discussion'
  | 'lab'
  | 'presentation';

export type AssignmentStatus = 
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'graded'
  | 'overdue'
  | 'late';

export interface LMSGrade {
  id: string;
  externalId: string;
  courseId: string;
  assignmentId?: string;
  studentId: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  letterGrade: string;
  gpa: number;
  feedback: string | null;
  gradedAt: string;
  integrationId: string;
  syncedAt: string;
}

export interface LMSAnnouncement {
  id: string;
  externalId: string;
  courseId: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  attachments: LMSAttachment[];
  integrationId: string;
  syncedAt: string;
}

export interface LMSAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  downloadUrl: string;
}

// College ERP Integration Types
export interface ERPIntegration extends BaseIntegration {
  type: 'erp';
  provider: ERPProvider;
  studentProfile: ERPStudentProfile;
  attendance: ERPAttendance[];
  grades: ERPGrade[];
  schedule: ERPSchedule[];
  fees: ERPFeeRecord[];
}

export type ERPProvider = 'custom' | 'fedena' | 'eduerp' | 'campus_management' | 'other';

export interface ERPStudentProfile {
  id: string;
  externalId: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  program: string;
  batch: string;
  semester: number;
  year: number;
  cgpa: number;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  enrollmentDate: string;
  expectedGraduation: string;
  integrationId: string;
  syncedAt: string;
}

export interface ERPAttendance {
  id: string;
  externalId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  date: string;
  status: AttendanceStatus;
  period: number;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  remarks: string | null;
  integrationId: string;
  syncedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface ERPGrade {
  id: string;
  externalId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  semester: number;
  examType: ExamType;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  credits: number;
  examDate: string;
  resultDate: string;
  integrationId: string;
  syncedAt: string;
}

export type ExamType = 
  | 'internal'
  | 'midterm'
  | 'final'
  | 'practical'
  | 'assignment'
  | 'project'
  | 'viva';

export interface ERPSchedule {
  id: string;
  externalId: string;
  studentId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar';
  semester: number;
  integrationId: string;
  syncedAt: string;
}

export interface ERPFeeRecord {
  id: string;
  externalId: string;
  studentId: string;
  semester: number;
  year: number;
  feeType: FeeType;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: FeeStatus;
  receiptNumber: string | null;
  integrationId: string;
  syncedAt: string;
}

export type FeeType = 
  | 'tuition'
  | 'library'
  | 'lab'
  | 'exam'
  | 'hostel'
  | 'transport'
  | 'miscellaneous';

export type FeeStatus = 'pending' | 'paid' | 'overdue' | 'partial';

// Cloud Storage Integration Types
export interface CloudStorageIntegration extends BaseIntegration {
  type: 'cloud_storage';
  provider: CloudStorageProvider;
  quota: CloudStorageQuota;
  files: CloudStorageFile[];
  folders: CloudStorageFolder[];
}

export type CloudStorageProvider = 'google_drive' | 'onedrive' | 'dropbox' | 'icloud';

export interface CloudStorageQuota {
  total: number; // bytes
  used: number; // bytes
  available: number; // bytes
  percentage: number;
}

export interface CloudStorageFile {
  id: string;
  externalId: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  parentId: string | null;
  path: string;
  downloadUrl: string;
  viewUrl: string;
  shareUrl: string | null;
  isShared: boolean;
  permissions: CloudStoragePermission[];
  createdAt: string;
  modifiedAt: string;
  integrationId: string;
  syncedAt: string;
  localPath: string | null;
  syncStatus: FileSyncStatus;
}

export interface CloudStorageFolder {
  id: string;
  externalId: string;
  name: string;
  parentId: string | null;
  path: string;
  isShared: boolean;
  permissions: CloudStoragePermission[];
  createdAt: string;
  modifiedAt: string;
  integrationId: string;
  syncedAt: string;
}

export interface CloudStoragePermission {
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  email?: string;
  domain?: string;
}

export type FileSyncStatus = 
  | 'synced'
  | 'pending'
  | 'uploading'
  | 'downloading'
  | 'conflict'
  | 'error';

// Integration State
export interface IntegrationState {
  // Integrations
  integrations: BaseIntegration[];
  activeIntegrations: BaseIntegration[];
  
  // LMS Data
  lmsCourses: LMSCourse[];
  lmsAssignments: LMSAssignment[];
  lmsGrades: LMSGrade[];
  lmsAnnouncements: LMSAnnouncement[];
  
  // ERP Data
  erpProfile: ERPStudentProfile | null;
  erpAttendance: ERPAttendance[];
  erpGrades: ERPGrade[];
  erpSchedule: ERPSchedule[];
  erpFees: ERPFeeRecord[];
  
  // Cloud Storage Data
  cloudFiles: CloudStorageFile[];
  cloudFolders: CloudStorageFolder[];
  cloudQuota: CloudStorageQuota | null;
  
  // Sync State
  syncStatus: { [integrationId: string]: SyncStatus };
  lastSyncTime: string | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedIntegration: BaseIntegration | null;
}

export interface SyncStatus {
  isActive: boolean;
  progress: number; // 0-100
  currentOperation: string;
  itemsProcessed: number;
  totalItems: number;
  errors: SyncError[];
  startedAt: string;
  completedAt: string | null;
}

export interface SyncError {
  id: string;
  type: 'authentication' | 'network' | 'data' | 'permission' | 'quota';
  message: string;
  details: any;
  timestamp: string;
  resolved: boolean;
}

// API Response Types
export interface IntegrationResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  syncInfo?: {
    lastSync: string;
    nextSync: string;
    itemsProcessed: number;
  };
}

export interface IntegrationListResponse<T> extends IntegrationResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// OAuth and Authentication Types
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  scope: string;
}

// Sync Configuration
export interface SyncConfiguration {
  integrationId: string;
  enabled: boolean;
  frequency: SyncFrequency;
  dataTypes: SyncDataType[];
  filters: SyncFilters;
  conflictResolution: ConflictResolution;
  notifications: SyncNotificationSettings;
}

export type SyncDataType = 
  | 'courses'
  | 'assignments'
  | 'grades'
  | 'attendance'
  | 'announcements'
  | 'schedule'
  | 'files'
  | 'profile';

export interface SyncFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  courses?: string[];
  semesters?: number[];
  fileTypes?: string[];
  maxFileSize?: number;
}

export type ConflictResolution = 
  | 'local_wins'
  | 'remote_wins'
  | 'newest_wins'
  | 'manual_review';

export interface SyncNotificationSettings {
  onStart: boolean;
  onComplete: boolean;
  onError: boolean;
  onConflict: boolean;
  email: boolean;
  push: boolean;
}

// Integration Analytics
export interface IntegrationAnalytics {
  integrationId: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number; // seconds
  dataTransferred: number; // bytes
  lastSyncDuration: number; // seconds
  uptime: number; // percentage
  errorRate: number; // percentage
  syncHistory: SyncHistoryEntry[];
}

export interface SyncHistoryEntry {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: 'success' | 'failed' | 'cancelled';
  itemsProcessed: number;
  errors: number;
  duration: number; // seconds
  dataTransferred: number; // bytes
}

// Webhook Types
export interface WebhookConfig {
  integrationId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  retryPolicy: WebhookRetryPolicy;
}

export type WebhookEvent = 
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'data_updated'
  | 'integration_connected'
  | 'integration_disconnected';

export interface WebhookRetryPolicy {
  maxRetries: number;
  retryDelay: number; // seconds
  backoffMultiplier: number;
}

// Integration Capabilities
export interface IntegrationCapabilities {
  provider: string;
  supportedDataTypes: SyncDataType[];
  supportedSyncFrequencies: SyncFrequency[];
  requiresOAuth: boolean;
  supportsWebhooks: boolean;
  supportsRealTimeSync: boolean;
  maxFileSize: number; // bytes
  rateLimit: {
    requests: number;
    period: number; // seconds
  };
  features: IntegrationFeature[];
}

export type IntegrationFeature = 
  | 'two_way_sync'
  | 'file_upload'
  | 'file_download'
  | 'bulk_operations'
  | 'incremental_sync'
  | 'conflict_resolution'
  | 'offline_support';

// Error Types
export interface IntegrationError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  integrationId?: string;
  operation?: string;
  retryable: boolean;
}

// Search and Filter Types
export interface IntegrationSearchFilters {
  query?: string;
  type?: IntegrationType;
  provider?: string;
  status?: IntegrationStatus;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'name' | 'type' | 'status' | 'lastSync' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
