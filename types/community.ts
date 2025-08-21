// Community & Mentorship types and interfaces

// User Profile for Community
export interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'mentor' | 'admin' | 'moderator';
  bio?: string;
  expertise?: string[];
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
  reputation: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

// Peer Groups & Discussions
export interface PeerGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  category: GroupCategory;
  coverImage?: string;
  isPrivate: boolean;
  maxMembers?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
  tags: string[];
  rules: string[];
  stats: GroupStats;
}

export type GroupCategory = 
  | 'Academic'
  | 'Career'
  | 'Technology'
  | 'Study Groups'
  | 'Project Teams'
  | 'General Discussion'
  | 'Help & Support'
  | 'Announcements';

export interface GroupMember {
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastActive: string;
  permissions: GroupPermission[];
}

export type GroupPermission = 
  | 'post_messages'
  | 'delete_messages'
  | 'manage_members'
  | 'edit_group'
  | 'moderate_content';

export interface GroupStats {
  totalMembers: number;
  totalMessages: number;
  activeMembers: number;
  lastActivity: string;
}

// Messages & Discussions
export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  attachments: Attachment[];
  replyTo?: string;
  reactions: Reaction[];
  isEdited: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: MessageMetadata;
}

export type MessageType = 
  | 'text'
  | 'image'
  | 'file'
  | 'link'
  | 'poll'
  | 'announcement'
  | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageMetadata {
  linkPreview?: LinkPreview;
  pollData?: PollData;
  systemAction?: SystemAction;
}

export interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  expiresAt?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface SystemAction {
  type: 'user_joined' | 'user_left' | 'group_updated' | 'member_promoted' | 'member_removed';
  actor: string;
  target?: string;
  details?: any;
}

// Mentor Sessions & Q&A
export interface Mentor {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  title: string;
  company?: string;
  expertise: string[];
  bio: string;
  experience: number; // years
  rating: number;
  totalSessions: number;
  languages: string[];
  timezone: string;
  availability: MentorAvailability[];
  pricing: MentorPricing;
  isVerified: boolean;
  isActive: boolean;
  joinedAt: string;
}

export interface MentorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
}

export interface MentorPricing {
  currency: string;
  hourlyRate?: number;
  sessionRate?: number;
  packageDeals?: PricingPackage[];
}

export interface PricingPackage {
  id: string;
  name: string;
  sessions: number;
  price: number;
  description: string;
  validityDays: number;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  studentId: string;
  title: string;
  description: string;
  type: SessionType;
  status: SessionStatus;
  scheduledAt: string;
  duration: number; // minutes
  meetingLink?: string;
  agenda: string[];
  notes?: string;
  feedback?: SessionFeedback;
  recording?: SessionRecording;
  createdAt: string;
  updatedAt: string;
}

export type SessionType = 
  | 'one-on-one'
  | 'group'
  | 'workshop'
  | 'code-review'
  | 'career-guidance'
  | 'interview-prep';

export type SessionStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface SessionFeedback {
  studentRating: number;
  studentComment: string;
  mentorRating: number;
  mentorComment: string;
  createdAt: string;
}

export interface SessionRecording {
  url: string;
  duration: number;
  size: number;
  isPublic: boolean;
  createdAt: string;
}

// Q&A System
export interface Question {
  id: string;
  title: string;
  content: string;
  category: QuestionCategory;
  tags: string[];
  askedBy: string;
  askedAt: string;
  updatedAt: string;
  views: number;
  votes: number;
  answers: Answer[];
  isResolved: boolean;
  acceptedAnswerId?: string;
  bounty?: number;
  attachments: Attachment[];
}

export type QuestionCategory = 
  | 'Programming'
  | 'Career Advice'
  | 'Study Help'
  | 'Project Guidance'
  | 'Technical Issues'
  | 'General'
  | 'Interview Prep'
  | 'Course Related';

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  answeredBy: string;
  answeredAt: string;
  updatedAt: string;
  votes: number;
  isAccepted: boolean;
  attachments: Attachment[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  votes: number;
}

// Moderation Tools
export interface ModerationReport {
  id: string;
  type: ReportType;
  targetId: string; // message, question, answer, or user ID
  targetType: 'message' | 'question' | 'answer' | 'user' | 'group';
  reportedBy: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  evidence: ReportEvidence[];
}

export type ReportType = 
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'misinformation'
  | 'copyright_violation'
  | 'other';

export type ReportReason = 
  | 'Spam or promotional content'
  | 'Harassment or bullying'
  | 'Inappropriate or offensive content'
  | 'Misinformation or false claims'
  | 'Copyright or intellectual property violation'
  | 'Violation of community guidelines'
  | 'Other';

export type ReportStatus = 
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'dismissed'
  | 'escalated';

export interface ReportEvidence {
  type: 'screenshot' | 'link' | 'text' | 'file';
  content: string;
  description?: string;
}

export interface ModerationAction {
  id: string;
  type: ModerationActionType;
  targetId: string;
  targetType: 'message' | 'question' | 'answer' | 'user' | 'group';
  moderatorId: string;
  reason: string;
  duration?: number; // for temporary actions (hours)
  createdAt: string;
  expiresAt?: string;
}

export type ModerationActionType = 
  | 'warning'
  | 'mute'
  | 'temporary_ban'
  | 'permanent_ban'
  | 'content_removal'
  | 'content_edit'
  | 'group_suspension';

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalActions: number;
  activeWarnings: number;
  activeBans: number;
  reportsByType: { [key in ReportType]: number };
  actionsByType: { [key in ModerationActionType]: number };
}

// Community State
export interface CommunityState {
  // User & Profile
  currentUser: CommunityUser | null;
  users: CommunityUser[];
  
  // Groups & Messages
  groups: PeerGroup[];
  currentGroup: PeerGroup | null;
  messages: { [groupId: string]: Message[] };
  
  // Mentorship
  mentors: Mentor[];
  mentorSessions: MentorSession[];
  currentSession: MentorSession | null;
  
  // Q&A
  questions: Question[];
  currentQuestion: Question | null;
  
  // Moderation (admin only)
  reports: ModerationReport[];
  moderationActions: ModerationAction[];
  moderationStats: ModerationStats;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  lastSyncTime: string | null;
  
  // Real-time subscriptions
  activeSubscriptions: string[];
}

// API Response Types
export interface CommunityResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CommunityListResponse<T> extends CommunityResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Real-time Events
export interface RealtimeEvent {
  type: RealtimeEventType;
  data: any;
  timestamp: string;
  groupId?: string;
}

export type RealtimeEventType = 
  | 'message_sent'
  | 'message_updated'
  | 'message_deleted'
  | 'user_joined'
  | 'user_left'
  | 'user_typing'
  | 'user_online'
  | 'user_offline'
  | 'group_updated'
  | 'session_started'
  | 'session_ended'
  | 'question_posted'
  | 'answer_posted';

// Search & Filters
export interface CommunitySearchFilters {
  query?: string;
  category?: GroupCategory | QuestionCategory;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'recent' | 'popular' | 'trending' | 'oldest';
  limit?: number;
  offset?: number;
}

// Notifications
export interface CommunityNotification {
  id: string;
  type: CommunityNotificationType;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export type CommunityNotificationType = 
  | 'new_message'
  | 'mention'
  | 'group_invitation'
  | 'session_reminder'
  | 'session_cancelled'
  | 'question_answered'
  | 'answer_accepted'
  | 'moderation_action';
