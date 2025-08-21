// Career Tools types and interfaces

// Resume Builder Types
export interface ResumeData {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  achievements: Achievement[];
  references: Reference[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  profileImage?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrentJob: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  gpa?: number;
  achievements: string[];
  relevantCourses: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  githubUrl?: string;
  liveUrl?: string;
  achievements: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'Academic' | 'Professional' | 'Personal' | 'Competition';
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
}

// Resume Templates
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Modern' | 'Classic' | 'Creative' | 'Minimal' | 'Professional';
  previewImage: string;
  isPopular: boolean;
  isPremium: boolean;
  sections: TemplateSection[];
}

export interface TemplateSection {
  id: string;
  name: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'achievements' | 'references';
  isRequired: boolean;
  order: number;
  styling: SectionStyling;
}

export interface SectionStyling {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor?: string;
  margin: number;
  padding: number;
}

// Skill Mapping Types
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  isVerified: boolean;
  endorsements: number;
  relatedCourses: string[];
  lastUpdated: string;
}

export type SkillCategory = 
  | 'Programming'
  | 'Web Development'
  | 'Mobile Development'
  | 'Data Science'
  | 'Machine Learning'
  | 'DevOps'
  | 'Design'
  | 'Marketing'
  | 'Business'
  | 'Communication'
  | 'Leadership'
  | 'Other';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillAssessment {
  id: string;
  skillId: string;
  userId: string;
  score: number;
  maxScore: number;
  level: SkillLevel;
  completedAt: string;
  questions: AssessmentQuestion[];
  timeSpent: number; // in minutes
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'coding' | 'scenario';
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect: boolean;
  points: number;
}

export interface SkillRecommendation {
  id: string;
  userId: string;
  recommendedSkills: string[];
  recommendedCourses: CourseRecommendation[];
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

export interface CourseRecommendation {
  courseId: string;
  title: string;
  description: string;
  skillsToGain: string[];
  estimatedDuration: number; // in hours
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  relevanceScore: number;
}

// Mock Tests & Interview Prep Types
export interface MockTest {
  id: string;
  title: string;
  description: string;
  category: TestCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  questions: MockTestQuestion[];
  isOfflineAvailable: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type TestCategory = 
  | 'Technical'
  | 'Aptitude'
  | 'Logical Reasoning'
  | 'Verbal Ability'
  | 'Quantitative Aptitude'
  | 'General Knowledge'
  | 'Domain Specific'
  | 'Coding'
  | 'System Design';

export interface MockTestQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'coding' | 'essay' | 'true-false';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  timeLimit?: number; // in seconds
  points: number;
}

export interface MockTestAttempt {
  id: string;
  testId: string;
  userId: string;
  answers: TestAnswer[];
  score: number;
  totalScore: number;
  percentage: number;
  timeSpent: number; // in minutes
  isPassed: boolean;
  startedAt: string;
  completedAt?: string;
  analysis: TestAnalysis;
}

export interface TestAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
  pointsEarned: number;
}

export interface TestAnalysis {
  categoryWiseScore: { [category: string]: number };
  difficultyWiseScore: { [difficulty: string]: number };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  timeManagement: {
    averageTimePerQuestion: number;
    questionsRushed: number;
    questionsOvertime: number;
  };
}

// Interview Prep Types
export interface InterviewQuestion {
  id: string;
  question: string;
  category: InterviewCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Behavioral' | 'Technical' | 'Situational' | 'Case Study';
  sampleAnswer: string;
  tips: string[];
  relatedSkills: string[];
  companyTypes: string[]; // e.g., 'Startup', 'Corporate', 'Tech Giant'
  tags: string[];
}

export type InterviewCategory = 
  | 'General'
  | 'Leadership'
  | 'Problem Solving'
  | 'Communication'
  | 'Teamwork'
  | 'Conflict Resolution'
  | 'Technical Skills'
  | 'Career Goals'
  | 'Company Culture'
  | 'Industry Specific';

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  type: 'Practice' | 'Mock Interview' | 'Self Assessment';
  questions: string[]; // question IDs
  responses: InterviewResponse[];
  duration: number; // in minutes
  feedback: InterviewFeedback;
  createdAt: string;
  completedAt?: string;
}

export interface InterviewResponse {
  questionId: string;
  response: string;
  recordingUrl?: string; // for voice/video responses
  timeSpent: number; // in seconds
  confidence: number; // 1-5 scale
  notes: string;
}

export interface InterviewFeedback {
  overallScore: number; // 1-10 scale
  categoryScores: { [category: string]: number };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  nextSteps: string[];
}

// Career Tools State
export interface CareerToolsState {
  // Resume Builder
  resumes: ResumeData[];
  templates: ResumeTemplate[];
  currentResume: ResumeData | null;
  
  // Skills
  userSkills: Skill[];
  skillAssessments: SkillAssessment[];
  skillRecommendations: SkillRecommendation[];
  
  // Mock Tests
  mockTests: MockTest[];
  testAttempts: MockTestAttempt[];
  
  // Interview Prep
  interviewQuestions: InterviewQuestion[];
  interviewSessions: InterviewSession[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

// API Response Types
export interface CareerToolsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CareerToolsListResponse<T> extends CareerToolsResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
