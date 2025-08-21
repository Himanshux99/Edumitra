import { create } from 'zustand';
import {
  ResumeData,
  ResumeTemplate,
  Skill,
  SkillAssessment,
  SkillRecommendation,
  MockTest,
  MockTestAttempt,
  InterviewQuestion,
  InterviewSession,
  CareerToolsState
} from '../types/career';

interface CareerToolsActions {
  // Resume Builder Actions
  setResumes: (resumes: ResumeData[]) => void;
  addResume: (resume: ResumeData) => void;
  updateResume: (resumeId: string, updates: Partial<ResumeData>) => void;
  deleteResume: (resumeId: string) => void;
  setCurrentResume: (resume: ResumeData | null) => void;
  duplicateResume: (resumeId: string) => void;
  
  setTemplates: (templates: ResumeTemplate[]) => void;
  
  // Skills Actions
  setUserSkills: (skills: Skill[]) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (skillId: string, updates: Partial<Skill>) => void;
  removeSkill: (skillId: string) => void;
  
  setSkillAssessments: (assessments: SkillAssessment[]) => void;
  addSkillAssessment: (assessment: SkillAssessment) => void;
  
  setSkillRecommendations: (recommendations: SkillRecommendation[]) => void;
  
  // Mock Tests Actions
  setMockTests: (tests: MockTest[]) => void;
  addMockTest: (test: MockTest) => void;
  updateMockTest: (testId: string, updates: Partial<MockTest>) => void;
  
  setTestAttempts: (attempts: MockTestAttempt[]) => void;
  addTestAttempt: (attempt: MockTestAttempt) => void;
  updateTestAttempt: (attemptId: string, updates: Partial<MockTestAttempt>) => void;
  
  // Interview Prep Actions
  setInterviewQuestions: (questions: InterviewQuestion[]) => void;
  addInterviewQuestion: (question: InterviewQuestion) => void;
  
  setInterviewSessions: (sessions: InterviewSession[]) => void;
  addInterviewSession: (session: InterviewSession) => void;
  updateInterviewSession: (sessionId: string, updates: Partial<InterviewSession>) => void;
  
  // UI State Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSyncTime: (time: string) => void;
  clearError: () => void;
  
  // Computed Getters
  getResumeById: (resumeId: string) => ResumeData | undefined;
  getSkillsByCategory: (category: string) => Skill[];
  getTestsByCategory: (category: string) => MockTest[];
  getTestAttemptsByTest: (testId: string) => MockTestAttempt[];
  getInterviewQuestionsByCategory: (category: string) => InterviewQuestion[];
  getUserSkillLevel: (skillName: string) => string | null;
  getRecommendedCourses: () => any[];
}

export const useCareerToolsStore = create<CareerToolsState & CareerToolsActions>((set, get) => ({
  // Initial State
  resumes: [],
  templates: [],
  currentResume: null,
  userSkills: [],
  skillAssessments: [],
  skillRecommendations: [],
  mockTests: [],
  testAttempts: [],
  interviewQuestions: [],
  interviewSessions: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,

  // Resume Builder Actions
  setResumes: (resumes) => set({ resumes }),
  
  addResume: (resume) => set((state) => ({
    resumes: [...state.resumes, resume]
  })),
  
  updateResume: (resumeId, updates) => set((state) => ({
    resumes: state.resumes.map(resume =>
      resume.id === resumeId ? { ...resume, ...updates, updatedAt: new Date().toISOString() } : resume
    ),
    currentResume: state.currentResume?.id === resumeId 
      ? { ...state.currentResume, ...updates, updatedAt: new Date().toISOString() }
      : state.currentResume
  })),
  
  deleteResume: (resumeId) => set((state) => ({
    resumes: state.resumes.filter(resume => resume.id !== resumeId),
    currentResume: state.currentResume?.id === resumeId ? null : state.currentResume
  })),
  
  setCurrentResume: (resume) => set({ currentResume: resume }),
  
  duplicateResume: (resumeId) => set((state) => {
    const originalResume = state.resumes.find(r => r.id === resumeId);
    if (!originalResume) return state;
    
    const duplicatedResume: ResumeData = {
      ...originalResume,
      id: `resume_${Date.now()}`,
      title: `${originalResume.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSyncedAt: undefined
    };
    
    return {
      resumes: [...state.resumes, duplicatedResume]
    };
  }),
  
  setTemplates: (templates) => set({ templates }),
  
  // Skills Actions
  setUserSkills: (skills) => set({ userSkills: skills }),
  
  addSkill: (skill) => set((state) => ({
    userSkills: [...state.userSkills, skill]
  })),
  
  updateSkill: (skillId, updates) => set((state) => ({
    userSkills: state.userSkills.map(skill =>
      skill.id === skillId ? { ...skill, ...updates, lastUpdated: new Date().toISOString() } : skill
    )
  })),
  
  removeSkill: (skillId) => set((state) => ({
    userSkills: state.userSkills.filter(skill => skill.id !== skillId)
  })),
  
  setSkillAssessments: (assessments) => set({ skillAssessments: assessments }),
  
  addSkillAssessment: (assessment) => set((state) => ({
    skillAssessments: [...state.skillAssessments, assessment]
  })),
  
  setSkillRecommendations: (recommendations) => set({ skillRecommendations: recommendations }),
  
  // Mock Tests Actions
  setMockTests: (tests) => set({ mockTests: tests }),
  
  addMockTest: (test) => set((state) => ({
    mockTests: [...state.mockTests, test]
  })),
  
  updateMockTest: (testId, updates) => set((state) => ({
    mockTests: state.mockTests.map(test =>
      test.id === testId ? { ...test, ...updates, updatedAt: new Date().toISOString() } : test
    )
  })),
  
  setTestAttempts: (attempts) => set({ testAttempts: attempts }),
  
  addTestAttempt: (attempt) => set((state) => ({
    testAttempts: [...state.testAttempts, attempt]
  })),
  
  updateTestAttempt: (attemptId, updates) => set((state) => ({
    testAttempts: state.testAttempts.map(attempt =>
      attempt.id === attemptId ? { ...attempt, ...updates } : attempt
    )
  })),
  
  // Interview Prep Actions
  setInterviewQuestions: (questions) => set({ interviewQuestions: questions }),
  
  addInterviewQuestion: (question) => set((state) => ({
    interviewQuestions: [...state.interviewQuestions, question]
  })),
  
  setInterviewSessions: (sessions) => set({ interviewSessions: sessions }),
  
  addInterviewSession: (session) => set((state) => ({
    interviewSessions: [...state.interviewSessions, session]
  })),
  
  updateInterviewSession: (sessionId, updates) => set((state) => ({
    interviewSessions: state.interviewSessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    )
  })),
  
  // UI State Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  clearError: () => set({ error: null }),
  
  // Computed Getters
  getResumeById: (resumeId) => {
    return get().resumes.find(resume => resume.id === resumeId);
  },
  
  getSkillsByCategory: (category) => {
    return get().userSkills.filter(skill => skill.category === category);
  },
  
  getTestsByCategory: (category) => {
    return get().mockTests.filter(test => test.category === category);
  },
  
  getTestAttemptsByTest: (testId) => {
    return get().testAttempts.filter(attempt => attempt.testId === testId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },
  
  getInterviewQuestionsByCategory: (category) => {
    return get().interviewQuestions.filter(question => question.category === category);
  },
  
  getUserSkillLevel: (skillName) => {
    const skill = get().userSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    return skill ? skill.level : null;
  },
  
  getRecommendedCourses: () => {
    const recommendations = get().skillRecommendations;
    const allCourses = recommendations.flatMap(rec => rec.recommendedCourses);
    
    // Remove duplicates and sort by relevance score
    const uniqueCourses = allCourses.filter((course, index, self) =>
      index === self.findIndex(c => c.courseId === course.courseId)
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return uniqueCourses.slice(0, 10); // Return top 10 recommendations
  }
}));

// Selector hooks for better performance
export const useResumes = () => useCareerToolsStore(state => state.resumes);
export const useCurrentResume = () => useCareerToolsStore(state => state.currentResume);
export const useUserSkills = () => useCareerToolsStore(state => state.userSkills);
export const useMockTests = () => useCareerToolsStore(state => state.mockTests);
export const useTestAttempts = () => useCareerToolsStore(state => state.testAttempts);
export const useInterviewQuestions = () => useCareerToolsStore(state => state.interviewQuestions);
export const useCareerToolsLoading = () => useCareerToolsStore(state => state.isLoading);
export const useCareerToolsError = () => useCareerToolsStore(state => state.error);
