// Notification system data models for push notifications and smart nudges

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: NotificationData;
  scheduledFor?: string; // ISO date string
  deliveredAt?: string; // ISO date string
  readAt?: string; // ISO date string
  actionTaken?: string; // Action performed by user
  priority: NotificationPriority;
  isRead: boolean;
  isDelivered: boolean;
  isScheduled: boolean;
  expiresAt?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  // Deep link information
  screen?: string;
  params?: Record<string, any>;
  
  // Content references
  courseId?: string;
  lessonId?: string;
  assignmentId?: string;
  examId?: string;
  goalId?: string;
  
  // Action buttons
  actions?: NotificationAction[];
  
  // Rich content
  imageUrl?: string;
  iconUrl?: string;
  
  // Analytics
  campaignId?: string;
  segmentId?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  action: 'open_app' | 'deep_link' | 'dismiss' | 'snooze' | 'custom';
  data?: Record<string, any>;
}

export interface SmartNudge {
  id: string;
  userId: string;
  type: NudgeType;
  trigger: NudgeTrigger;
  condition: NudgeCondition;
  content: NudgeContent;
  frequency: NudgeFrequency;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  maxTriggers?: number;
  effectiveness: number; // 0-1 score
  createdAt: string;
  updatedAt: string;
}

export interface NudgeTrigger {
  event: TriggerEvent;
  delay?: number; // minutes
  conditions?: TriggerCondition[];
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface NudgeCondition {
  userSegment?: UserSegment[];
  timeOfDay?: TimeRange;
  dayOfWeek?: number[]; // 0-6, Sunday = 0
  studyStreak?: StreakCondition;
  lastActivity?: ActivityCondition;
  performance?: PerformanceCondition;
}

export interface NudgeContent {
  title: string;
  body: string;
  emoji?: string;
  imageUrl?: string;
  actionText?: string;
  deepLink?: string;
  variables?: Record<string, string>; // For personalization
}

export interface NudgeFrequency {
  type: 'once' | 'daily' | 'weekly' | 'custom';
  interval?: number; // hours for custom frequency
  maxPerDay?: number;
  maxPerWeek?: number;
}

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  description: string;
  scheduledFor: string; // ISO date string
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  relatedEntityId?: string; // Course, assignment, exam ID
  relatedEntityType?: string;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  snoozeCount: number;
  maxSnoozes: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // For weekly recurrence
  dayOfMonth?: number; // For monthly recurrence
  endDate?: string; // When to stop recurring
  maxOccurrences?: number; // Max number of occurrences
}

export interface NotificationPreferences {
  userId: string;
  globalEnabled: boolean;
  categories: CategoryPreferences;
  quietHours: QuietHours;
  frequency: FrequencyPreferences;
  channels: ChannelPreferences;
  smartNudges: SmartNudgePreferences;
  updatedAt: string;
}

export interface CategoryPreferences {
  reminders: boolean;
  deadlines: boolean;
  streaks: boolean;
  achievements: boolean;
  courses: boolean;
  exams: boolean;
  assignments: boolean;
  social: boolean;
  marketing: boolean;
  system: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
}

export interface FrequencyPreferences {
  maxPerDay: number;
  maxPerHour: number;
  batchSimilar: boolean;
  respectQuietHours: boolean;
}

export interface ChannelPreferences {
  push: boolean;
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

export interface SmartNudgePreferences {
  enabled: boolean;
  learningReminders: boolean;
  motivationalMessages: boolean;
  streakMaintenance: boolean;
  performanceInsights: boolean;
  adaptiveFrequency: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  userId: string;
  event: AnalyticsEvent;
  timestamp: string;
  deviceInfo?: DeviceInfo;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  pushToken?: string;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  targetSegments: string[];
  template: NotificationTemplate;
  schedule: CampaignSchedule;
  status: CampaignStatus;
  analytics: CampaignAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  scheduledFor?: string;
  recurrence?: RecurrencePattern;
  timezone: string;
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  dismissed: number;
  conversionRate: number;
}

// Enums and Types
export type NotificationType = 
  | 'reminder'
  | 'deadline'
  | 'streak'
  | 'achievement'
  | 'course_update'
  | 'exam_alert'
  | 'assignment_due'
  | 'social'
  | 'marketing'
  | 'system'
  | 'smart_nudge';

export type NotificationCategory = 
  | 'learning'
  | 'deadlines'
  | 'social'
  | 'achievements'
  | 'system'
  | 'marketing'
  | 'emergency';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NudgeType = 
  | 'learning_reminder'
  | 'streak_maintenance'
  | 'course_completion'
  | 'practice_encouragement'
  | 'performance_insight'
  | 'goal_progress'
  | 'social_engagement'
  | 'habit_formation';

export type TriggerEvent = 
  | 'app_open'
  | 'lesson_complete'
  | 'quiz_complete'
  | 'streak_broken'
  | 'goal_missed'
  | 'inactivity'
  | 'low_performance'
  | 'course_enrolled'
  | 'deadline_approaching';

export type ReminderType = 
  | 'assignment_due'
  | 'exam_scheduled'
  | 'course_deadline'
  | 'study_session'
  | 'goal_check'
  | 'streak_maintenance'
  | 'custom';

export type AnalyticsEvent = 
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'dismissed'
  | 'action_taken'
  | 'expired';

export type CampaignType = 
  | 'promotional'
  | 'educational'
  | 'retention'
  | 'onboarding'
  | 're_engagement'
  | 'transactional';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

// Helper interfaces
export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface StreakCondition {
  current: number;
  operator: 'equals' | 'greater_than' | 'less_than';
}

export interface ActivityCondition {
  hours: number;
  operator: 'greater_than' | 'less_than';
}

export interface PerformanceCondition {
  metric: 'quiz_score' | 'completion_rate' | 'study_time';
  value: number;
  operator: 'greater_than' | 'less_than';
}

// Notification summary and statistics
export interface NotificationSummary {
  totalNotifications: number;
  unreadCount: number;
  todayCount: number;
  weekCount: number;
  byCategory: Record<NotificationCategory, number>;
  byType: Record<NotificationType, number>;
  recentNotifications: Notification[];
}

export interface NotificationStats {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  dismissRate: number;
  averageResponseTime: number; // minutes
  bestPerformingTime: string; // HH:MM
  worstPerformingTime: string; // HH:MM
  topCategories: Array<{
    category: NotificationCategory;
    engagement: number;
  }>;
}
