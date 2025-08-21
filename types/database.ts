// Database types for offline-first learning modules

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  pdfUrl?: string;
  localPdfPath?: string;
  duration: number; // in minutes
  courseId: string;
  order: number;
  isDownloaded: boolean;
  downloadedAt?: string;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  userId: string;
  progressPercentage: number;
  timeSpent: number; // in minutes
  isCompleted: boolean;
  lastPosition?: number; // for video/audio content
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  lessonId?: string;
  courseId: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number;
  isDownloaded: boolean;
  downloadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[]; // for multiple choice
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  totalPoints: number;
  timeSpent: number; // in minutes
  isCompleted: boolean;
  isPassed: boolean;
  startedAt: string;
  completedAt?: string;
  syncedAt?: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface TimetableEntry {
  id: string;
  title: string;
  description?: string;
  type: 'class' | 'exam' | 'assignment' | 'event';
  startTime: string;
  endTime: string;
  location?: string;
  courseId?: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderMinutes?: number;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnailUrl?: string;
  localThumbnailPath?: string;
  totalLessons: number;
  estimatedDuration: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isDownloaded: boolean;
  downloadedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncStatus {
  id: string;
  entityType: 'lesson' | 'quiz' | 'timetable' | 'progress';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  isSynced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: string;
  createdAt: string;
}

export interface OfflineContent {
  id: string;
  type: 'lesson' | 'quiz' | 'pdf' | 'video' | 'audio';
  entityId: string;
  localPath: string;
  originalUrl: string;
  fileSize: number;
  downloadedAt: string;
  lastAccessedAt: string;
}
