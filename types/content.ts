// Content Hub data models for courses, study materials, scholarships, and internships

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  thumbnailUrl: string;
  localThumbnailPath?: string;
  category: CourseCategory;
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  totalLessons: number;
  totalQuizzes: number;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  isPremium: boolean;
  isEnrolled: boolean;
  enrollmentCount: number;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  syllabus: CourseSyllabus[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  isOfflineAvailable: boolean;
  downloadSize?: number; // in MB
}

export interface CourseSyllabus {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  resources: StudyMaterial[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  url: string;
  localPath?: string;
  fileSize: number; // in bytes
  duration?: number; // for videos/audio in seconds
  pageCount?: number; // for PDFs
  thumbnailUrl?: string;
  courseId?: string;
  lessonId?: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isDownloaded: boolean;
  downloadedAt?: string;
  lastAccessedAt?: string;
  accessCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  category: ExamCategory;
  subcategory?: string;
  examType: 'practice' | 'mock' | 'previous_year' | 'sample';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkingRatio?: number;
  instructions: string[];
  sections: TestSection[];
  isPremium: boolean;
  price: number;
  currency: string;
  attemptCount: number;
  averageScore: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isOfflineAvailable: boolean;
}

export interface TestSection {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimit?: number; // in minutes
  order: number;
  questions: TestQuestion[];
}

export interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'numerical' | 'descriptive';
  options?: string[];
  correctAnswers: string[];
  explanation: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  imageUrl?: string;
  order: number;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  provider: string;
  providerLogo?: string;
  amount: number;
  currency: string;
  type: ScholarshipType;
  category: string[];
  eligibility: EligibilityCriteria;
  applicationDeadline: string;
  resultDate?: string;
  applicationUrl: string;
  documentsRequired: string[];
  selectionProcess: string[];
  benefits: string[];
  renewalCriteria?: string[];
  contactInfo: ContactInfo;
  tags: string[];
  location: string;
  isActive: boolean;
  applicationCount: number;
  successRate?: number;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
  applicationStatus?: ApplicationStatus;
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: 'remote' | 'onsite' | 'hybrid';
  duration: string;
  stipend?: number;
  currency: string;
  type: InternshipType;
  category: string[];
  skills: string[];
  eligibility: EligibilityCriteria;
  applicationDeadline: string;
  startDate: string;
  endDate?: string;
  applicationUrl: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  contactInfo: ContactInfo;
  tags: string[];
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
  applicationStatus?: ApplicationStatus;
}

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  education: string[];
  courses: string[];
  cgpaMin?: number;
  percentageMin?: number;
  yearOfStudy?: string[];
  nationality?: string[];
  gender?: 'male' | 'female' | 'any';
  familyIncome?: {
    min?: number;
    max?: number;
    currency: string;
  };
  additionalCriteria?: string[];
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

export interface UserBookmark {
  id: string;
  userId: string;
  contentType: 'course' | 'material' | 'test' | 'scholarship' | 'internship';
  contentId: string;
  createdAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  contentType: 'course' | 'material' | 'test';
  contentId: string;
  progress: number; // 0-100
  timeSpent: number; // in seconds
  lastAccessedAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ContentReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  contentType: 'course' | 'material' | 'test';
  contentId: string;
  rating: number; // 1-5
  review: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  category?: string[];
  subcategory?: string[];
  level?: string[];
  type?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  rating?: number;
  isPremium?: boolean;
  isOfflineAvailable?: boolean;
  sortBy?: 'relevance' | 'rating' | 'price' | 'duration' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface ContentRecommendation {
  id: string;
  userId: string;
  contentType: 'course' | 'material' | 'test' | 'scholarship' | 'internship';
  contentId: string;
  reason: 'similar_content' | 'user_interest' | 'trending' | 'recommended_for_you';
  score: number;
  createdAt: string;
}

// Enums
export type CourseCategory = 
  | 'engineering'
  | 'medical'
  | 'management'
  | 'law'
  | 'arts'
  | 'science'
  | 'commerce'
  | 'computer_science'
  | 'mathematics'
  | 'language'
  | 'competitive_exams'
  | 'skill_development';

export type MaterialType = 
  | 'pdf'
  | 'video'
  | 'audio'
  | 'presentation'
  | 'document'
  | 'image'
  | 'interactive'
  | 'quiz'
  | 'assignment';

export type ExamCategory = 
  | 'jee'
  | 'neet'
  | 'cat'
  | 'gate'
  | 'upsc'
  | 'ssc'
  | 'banking'
  | 'railway'
  | 'defense'
  | 'state_exams'
  | 'university_exams'
  | 'international_exams';

export type ScholarshipType = 
  | 'merit_based'
  | 'need_based'
  | 'sports'
  | 'arts'
  | 'minority'
  | 'government'
  | 'private'
  | 'international'
  | 'research';

export type InternshipType = 
  | 'summer'
  | 'winter'
  | 'part_time'
  | 'full_time'
  | 'research'
  | 'industrial'
  | 'academic'
  | 'startup';

export type ApplicationStatus = 
  | 'not_applied'
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'selected'
  | 'rejected'
  | 'waitlisted';

// Content Hub Summary
export interface ContentHubSummary {
  totalCourses: number;
  enrolledCourses: number;
  totalMaterials: number;
  downloadedMaterials: number;
  totalTests: number;
  attemptedTests: number;
  totalScholarships: number;
  bookmarkedScholarships: number;
  totalInternships: number;
  bookmarkedInternships: number;
  recentlyViewed: RecentContent[];
  recommendations: ContentRecommendation[];
  trendingContent: TrendingContent[];
}

export interface RecentContent {
  id: string;
  type: 'course' | 'material' | 'test' | 'scholarship' | 'internship';
  title: string;
  thumbnailUrl?: string;
  lastAccessedAt: string;
  progress?: number;
}

export interface TrendingContent {
  id: string;
  type: 'course' | 'material' | 'test';
  title: string;
  thumbnailUrl?: string;
  trendScore: number;
  category: string;
}
