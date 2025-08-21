import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService } from './database';
import { useCareerToolsStore } from '../store/careerToolsStore';
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
  PersonalInfo,
  WorkExperience,
  Education,
  Project,
  Certification
} from '../types/career';

class CareerToolsService {
  private userId: string = 'default_user'; // This should come from auth service

  async initialize(): Promise<void> {
    await this.loadAllCareerData();
  }

  // Load all career data from local storage
  async loadAllCareerData(): Promise<void> {
    const store = useCareerToolsStore.getState();
    store.setLoading(true);

    try {
      // Load resumes
      const resumes = await this.getAllResumes();
      store.setResumes(resumes);

      // Load templates
      const templates = await this.getResumeTemplates();
      store.setTemplates(templates);

      // Load skills
      const skills = await this.getUserSkills();
      store.setUserSkills(skills);

      // Load skill assessments
      const assessments = await this.getSkillAssessments();
      store.setSkillAssessments(assessments);

      // Load mock tests
      const mockTests = await this.getMockTests();
      store.setMockTests(mockTests);

      // Load test attempts
      const testAttempts = await this.getTestAttempts();
      store.setTestAttempts(testAttempts);

      // Load interview questions
      const interviewQuestions = await this.getInterviewQuestions();
      store.setInterviewQuestions(interviewQuestions);

      // Load interview sessions
      const interviewSessions = await this.getInterviewSessions();
      store.setInterviewSessions(interviewSessions);

      store.setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load career data:', error);
      store.setError('Failed to load career data');
    } finally {
      store.setLoading(false);
    }
  }

  // Resume Builder Methods
  async getAllResumes(): Promise<ResumeData[]> {
    try {
      const rows = await databaseService.findMany('resumes', 'userId = ?', [this.userId], 'updatedAt DESC');
      return rows.map(this.mapResumeFromDb);
    } catch (error) {
      console.error('Error loading resumes:', error);
      return [];
    }
  }

  async saveResume(resume: ResumeData): Promise<void> {
    const dbResume = this.mapResumeToDb(resume);
    
    const existing = await databaseService.findOne('resumes', 'id = ?', [resume.id]);
    if (existing) {
      await databaseService.update('resumes', dbResume, 'id = ?', [resume.id]);
    } else {
      await databaseService.insert('resumes', dbResume);
    }

    // Update store
    const store = useCareerToolsStore.getState();
    if (existing) {
      store.updateResume(resume.id, resume);
    } else {
      store.addResume(resume);
    }
  }

  async deleteResume(resumeId: string): Promise<void> {
    await databaseService.delete('resumes', 'id = ?', [resumeId]);
    
    const store = useCareerToolsStore.getState();
    store.deleteResume(resumeId);
  }

  async getResumeTemplates(): Promise<ResumeTemplate[]> {
    // For now, return predefined templates
    // In production, these could be loaded from a server
    return this.getDefaultTemplates();
  }

  // Skills Methods
  async getUserSkills(): Promise<Skill[]> {
    try {
      const rows = await databaseService.findMany('user_skills', 'userId = ?', [this.userId], 'name ASC');
      return rows.map(this.mapSkillFromDb);
    } catch (error) {
      console.error('Error loading skills:', error);
      return [];
    }
  }

  async saveSkill(skill: Skill): Promise<void> {
    const dbSkill = this.mapSkillToDb(skill);
    
    const existing = await databaseService.findOne('user_skills', 'id = ?', [skill.id]);
    if (existing) {
      await databaseService.update('user_skills', dbSkill, 'id = ?', [skill.id]);
    } else {
      await databaseService.insert('user_skills', dbSkill);
    }

    // Update store
    const store = useCareerToolsStore.getState();
    if (existing) {
      store.updateSkill(skill.id, skill);
    } else {
      store.addSkill(skill);
    }
  }

  async deleteSkill(skillId: string): Promise<void> {
    await databaseService.delete('user_skills', 'id = ?', [skillId]);
    
    const store = useCareerToolsStore.getState();
    store.removeSkill(skillId);
  }

  async getSkillAssessments(): Promise<SkillAssessment[]> {
    try {
      const rows = await databaseService.findMany('skill_assessments', 'userId = ?', [this.userId], 'completedAt DESC');
      return rows.map(this.mapSkillAssessmentFromDb);
    } catch (error) {
      console.error('Error loading skill assessments:', error);
      return [];
    }
  }

  async saveSkillAssessment(assessment: SkillAssessment): Promise<void> {
    const dbAssessment = this.mapSkillAssessmentToDb(assessment);
    await databaseService.insert('skill_assessments', dbAssessment);

    const store = useCareerToolsStore.getState();
    store.addSkillAssessment(assessment);
  }

  // Mock Tests Methods
  async getMockTests(): Promise<MockTest[]> {
    try {
      const rows = await databaseService.findMany('mock_tests', undefined, undefined, 'title ASC');
      return rows.map(this.mapMockTestFromDb);
    } catch (error) {
      console.error('Error loading mock tests:', error);
      return [];
    }
  }

  async getTestAttempts(): Promise<MockTestAttempt[]> {
    try {
      const rows = await databaseService.findMany('test_attempts', 'userId = ?', [this.userId], 'startedAt DESC');
      return rows.map(this.mapTestAttemptFromDb);
    } catch (error) {
      console.error('Error loading test attempts:', error);
      return [];
    }
  }

  async saveTestAttempt(attempt: MockTestAttempt): Promise<void> {
    const dbAttempt = this.mapTestAttemptToDb(attempt);
    await databaseService.insert('test_attempts', dbAttempt);

    const store = useCareerToolsStore.getState();
    store.addTestAttempt(attempt);
  }

  // Interview Prep Methods
  async getInterviewQuestions(): Promise<InterviewQuestion[]> {
    try {
      const rows = await databaseService.findMany('interview_questions', undefined, undefined, 'category ASC');
      return rows.map(this.mapInterviewQuestionFromDb);
    } catch (error) {
      console.error('Error loading interview questions:', error);
      return [];
    }
  }

  async getInterviewSessions(): Promise<InterviewSession[]> {
    try {
      const rows = await databaseService.findMany('interview_sessions', 'userId = ?', [this.userId], 'createdAt DESC');
      return rows.map(this.mapInterviewSessionFromDb);
    } catch (error) {
      console.error('Error loading interview sessions:', error);
      return [];
    }
  }

  async saveInterviewSession(session: InterviewSession): Promise<void> {
    const dbSession = this.mapInterviewSessionToDb(session);
    
    const existing = await databaseService.findOne('interview_sessions', 'id = ?', [session.id]);
    if (existing) {
      await databaseService.update('interview_sessions', dbSession, 'id = ?', [session.id]);
    } else {
      await databaseService.insert('interview_sessions', dbSession);
    }

    const store = useCareerToolsStore.getState();
    if (existing) {
      store.updateInterviewSession(session.id, session);
    } else {
      store.addInterviewSession(session);
    }
  }

  // Utility Methods
  generateResumeId(): string {
    return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSkillId(): string {
    return `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTestAttemptId(): string {
    return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateInterviewSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Data mapping methods
  private mapResumeFromDb(row: any): ResumeData {
    return {
      ...row,
      personalInfo: JSON.parse(row.personalInfo),
      experience: JSON.parse(row.experience),
      education: JSON.parse(row.education),
      skills: JSON.parse(row.skills),
      projects: JSON.parse(row.projects),
      certifications: JSON.parse(row.certifications),
      languages: JSON.parse(row.languages),
      achievements: JSON.parse(row.achievements),
      references: JSON.parse(row.references),
      isPublic: Boolean(row.isPublic)
    };
  }

  private mapResumeToDb(resume: ResumeData): any {
    return {
      ...resume,
      personalInfo: JSON.stringify(resume.personalInfo),
      experience: JSON.stringify(resume.experience),
      education: JSON.stringify(resume.education),
      skills: JSON.stringify(resume.skills),
      projects: JSON.stringify(resume.projects),
      certifications: JSON.stringify(resume.certifications),
      languages: JSON.stringify(resume.languages),
      achievements: JSON.stringify(resume.achievements),
      references: JSON.stringify(resume.references),
      isPublic: resume.isPublic ? 1 : 0
    };
  }

  private mapSkillFromDb(row: any): Skill {
    return {
      ...row,
      isVerified: Boolean(row.isVerified),
      relatedCourses: JSON.parse(row.relatedCourses || '[]')
    };
  }

  private mapSkillToDb(skill: Skill): any {
    return {
      ...skill,
      isVerified: skill.isVerified ? 1 : 0,
      relatedCourses: JSON.stringify(skill.relatedCourses)
    };
  }

  private mapSkillAssessmentFromDb(row: any): SkillAssessment {
    return {
      ...row,
      questions: JSON.parse(row.questions)
    };
  }

  private mapSkillAssessmentToDb(assessment: SkillAssessment): any {
    return {
      ...assessment,
      questions: JSON.stringify(assessment.questions)
    };
  }

  private mapMockTestFromDb(row: any): MockTest {
    return {
      ...row,
      questions: JSON.parse(row.questions),
      isOfflineAvailable: Boolean(row.isOfflineAvailable),
      tags: JSON.parse(row.tags || '[]')
    };
  }

  private mapTestAttemptFromDb(row: any): MockTestAttempt {
    return {
      ...row,
      answers: JSON.parse(row.answers),
      isPassed: Boolean(row.isPassed),
      analysis: JSON.parse(row.analysis)
    };
  }

  private mapTestAttemptToDb(attempt: MockTestAttempt): any {
    return {
      ...attempt,
      answers: JSON.stringify(attempt.answers),
      isPassed: attempt.isPassed ? 1 : 0,
      analysis: JSON.stringify(attempt.analysis)
    };
  }

  private mapInterviewQuestionFromDb(row: any): InterviewQuestion {
    return {
      ...row,
      tips: JSON.parse(row.tips || '[]'),
      relatedSkills: JSON.parse(row.relatedSkills || '[]'),
      companyTypes: JSON.parse(row.companyTypes || '[]'),
      tags: JSON.parse(row.tags || '[]')
    };
  }

  private mapInterviewSessionFromDb(row: any): InterviewSession {
    return {
      ...row,
      questions: JSON.parse(row.questions),
      responses: JSON.parse(row.responses),
      feedback: JSON.parse(row.feedback)
    };
  }

  private mapInterviewSessionToDb(session: InterviewSession): any {
    return {
      ...session,
      questions: JSON.stringify(session.questions),
      responses: JSON.stringify(session.responses),
      feedback: JSON.stringify(session.feedback)
    };
  }

  // Default templates
  private getDefaultTemplates(): ResumeTemplate[] {
    return [
      {
        id: 'modern-1',
        name: 'Modern Professional',
        description: 'Clean and modern design perfect for tech professionals',
        category: 'Modern',
        previewImage: '/templates/modern-1.png',
        isPopular: true,
        isPremium: false,
        sections: [
          { id: 'personal', name: 'Personal Information', type: 'personal', isRequired: true, order: 1, styling: { fontSize: 16, fontWeight: 'bold', color: '#333', margin: 10, padding: 5 } },
          { id: 'summary', name: 'Professional Summary', type: 'summary', isRequired: true, order: 2, styling: { fontSize: 14, fontWeight: 'normal', color: '#666', margin: 10, padding: 5 } },
          { id: 'experience', name: 'Work Experience', type: 'experience', isRequired: true, order: 3, styling: { fontSize: 14, fontWeight: 'normal', color: '#333', margin: 10, padding: 5 } },
          { id: 'education', name: 'Education', type: 'education', isRequired: true, order: 4, styling: { fontSize: 14, fontWeight: 'normal', color: '#333', margin: 10, padding: 5 } },
          { id: 'skills', name: 'Skills', type: 'skills', isRequired: true, order: 5, styling: { fontSize: 14, fontWeight: 'normal', color: '#333', margin: 10, padding: 5 } }
        ]
      },
      {
        id: 'classic-1',
        name: 'Classic Professional',
        description: 'Traditional format suitable for corporate environments',
        category: 'Classic',
        previewImage: '/templates/classic-1.png',
        isPopular: false,
        isPremium: false,
        sections: [
          { id: 'personal', name: 'Personal Information', type: 'personal', isRequired: true, order: 1, styling: { fontSize: 16, fontWeight: 'bold', color: '#000', margin: 8, padding: 4 } },
          { id: 'summary', name: 'Objective', type: 'summary', isRequired: true, order: 2, styling: { fontSize: 12, fontWeight: 'normal', color: '#000', margin: 8, padding: 4 } },
          { id: 'experience', name: 'Professional Experience', type: 'experience', isRequired: true, order: 3, styling: { fontSize: 12, fontWeight: 'normal', color: '#000', margin: 8, padding: 4 } },
          { id: 'education', name: 'Education', type: 'education', isRequired: true, order: 4, styling: { fontSize: 12, fontWeight: 'normal', color: '#000', margin: 8, padding: 4 } },
          { id: 'skills', name: 'Technical Skills', type: 'skills', isRequired: true, order: 5, styling: { fontSize: 12, fontWeight: 'normal', color: '#000', margin: 8, padding: 4 } }
        ]
      }
    ];
  }
}

export const careerToolsService = new CareerToolsService();
