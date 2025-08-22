/**
 * Career Roadmap Types
 * Comprehensive type definitions for personalized career roadmaps
 */

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  isUserSkill: boolean;
  relevanceScore: number; // 0-100
  description: string;
  learningResources: LearningResource[];
}

export type SkillCategory = 
  | 'programming'
  | 'data_science'
  | 'ai_ml'
  | 'web_development'
  | 'mobile_development'
  | 'cloud_computing'
  | 'cybersecurity'
  | 'devops'
  | 'design'
  | 'business'
  | 'soft_skills';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LearningResource {
  id: string;
  title: string;
  type: 'course' | 'book' | 'tutorial' | 'project' | 'certification';
  url?: string;
  duration: string;
  difficulty: SkillLevel;
  provider: string;
  rating: number;
  cost: 'free' | 'paid';
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  category: string;
  averageSalary: SalaryRange;
  growthRate: number; // percentage
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  requiredSkills: string[]; // skill IDs
  optionalSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  roadmap: RoadmapPhase[];
  matchScore: number; // 0-100 based on user skills
  icon: string;
  color: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  location: string;
  experience: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "2-3 months"
  skills: string[]; // skill IDs to learn in this phase
  projects: Project[];
  milestones: Milestone[];
  order: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: SkillLevel;
  estimatedHours: number;
  skills: string[]; // skill IDs practiced
  deliverables: string[];
  resources: LearningResource[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'skill_mastery' | 'project_completion' | 'certification' | 'portfolio';
  criteria: string[];
  points: number;
}

export interface UserRoadmapProgress {
  id: string;
  userId: string;
  careerPathId: string;
  startedAt: string;
  currentPhase: number;
  overallProgress: number; // 0-100
  phaseProgress: PhaseProgress[];
  completedMilestones: string[];
  earnedPoints: number;
  estimatedCompletion: string;
  lastUpdated: string;
}

export interface PhaseProgress {
  phaseId: string;
  progress: number; // 0-100
  completedSkills: string[];
  completedProjects: string[];
  completedMilestones: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface SchedulePlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'custom';
  tasks: ScheduleTask[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  totalPoints: number;
  earnedPoints: number;
  streakCount: number;
  createdAt: string;
}

export interface ScheduleTask {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'practice' | 'project' | 'review' | 'break';
  duration: number; // minutes
  skillId?: string;
  careerPathId?: string;
  priority: 'low' | 'medium' | 'high';
  points: number;
  isCompleted: boolean;
  completedAt?: string;
  scheduledTime: string; // HH:MM format
  reminderEnabled: boolean;
}

export interface VirtualTree {
  id: string;
  userId: string;
  level: number;
  experience: number;
  maxExperience: number;
  treeType: TreeType;
  unlockedFeatures: string[];
  achievements: Achievement[];
  lastWatered: string; // when user last completed tasks
  health: number; // 0-100, decreases if no activity
  createdAt: string;
}

export type TreeType = 'oak' | 'pine' | 'cherry' | 'bamboo' | 'bonsai';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'completion' | 'skill' | 'milestone' | 'special';
  criteria: string;
  points: number;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CompletionCertificate {
  id: string;
  userId: string;
  careerPathId: string;
  careerPathTitle: string;
  completedAt: string;
  totalDuration: string;
  skillsLearned: string[];
  projectsCompleted: string[];
  finalScore: number;
  certificateUrl?: string;
  shareableLink: string;
}

export interface PersonalizationData {
  userId: string;
  currentSkills: Skill[];
  interests: string[];
  careerGoals: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  availableHoursPerWeek: number;
  experienceLevel: 'student' | 'beginner' | 'intermediate' | 'experienced';
  industryPreference: string[];
  salaryExpectation: SalaryRange;
  locationPreference: string[];
  lastUpdated: string;
}
