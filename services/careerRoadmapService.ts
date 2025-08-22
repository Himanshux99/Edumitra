/**
 * Career Roadmap Service
 * Handles personalized career recommendations, progress tracking, and gamification
 */

import { 
  CareerPath, 
  Skill, 
  UserRoadmapProgress, 
  PersonalizationData,
  SchedulePlan,
  VirtualTree,
  Achievement,
  CompletionCertificate,
  SalaryRange
} from '../types/careerRoadmap';
import { databaseService } from './database';

class CareerRoadmapService {
  private userId: string = 'default_user';

  /**
   * Get personalized career path recommendations based on user skills
   */
  async getPersonalizedRecommendations(userId: string): Promise<CareerPath[]> {
    try {
      const userSkills = await this.getUserSkills(userId);
      const allCareerPaths = await this.getAllCareerPaths();
      
      // Calculate match scores for each career path
      const recommendations = allCareerPaths.map(path => ({
        ...path,
        matchScore: this.calculateMatchScore(userSkills, path)
      }));

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return this.getMockCareerPaths();
    }
  }

  /**
   * Calculate how well user skills match a career path
   */
  private calculateMatchScore(userSkills: Skill[], careerPath: CareerPath): number {
    const requiredSkills = careerPath.requiredSkills;
    const optionalSkills = careerPath.optionalSkills;
    
    let score = 0;
    let maxScore = requiredSkills.length * 10 + optionalSkills.length * 5;

    // Check required skills
    requiredSkills.forEach(skillId => {
      const userSkill = userSkills.find(s => s.id === skillId);
      if (userSkill) {
        score += this.getSkillLevelScore(userSkill.level) * 2;
      }
    });

    // Check optional skills
    optionalSkills.forEach(skillId => {
      const userSkill = userSkills.find(s => s.id === skillId);
      if (userSkill) {
        score += this.getSkillLevelScore(userSkill.level);
      }
    });

    return Math.min(100, (score / maxScore) * 100);
  }

  private getSkillLevelScore(level: string): number {
    switch (level) {
      case 'beginner': return 2;
      case 'intermediate': return 5;
      case 'advanced': return 8;
      case 'expert': return 10;
      default: return 0;
    }
  }

  /**
   * Get all available career paths
   */
  async getAllCareerPaths(): Promise<CareerPath[]> {
    try {
      const paths = await databaseService.findMany('career_paths');
      return paths.map(this.mapCareerPathFromDb);
    } catch (error) {
      console.error('Error getting career paths:', error);
      return this.getMockCareerPaths();
    }
  }

  /**
   * Get user's current skills
   */
  async getUserSkills(userId: string): Promise<Skill[]> {
    try {
      const skills = await databaseService.findMany('user_skills', 'userId = ?', [userId]);
      return skills.map(this.mapSkillFromDb);
    } catch (error) {
      console.error('Error getting user skills:', error);
      return [];
    }
  }

  /**
   * Start a roadmap for user
   */
  async startRoadmap(userId: string, careerPathId: string): Promise<UserRoadmapProgress> {
    try {
      const careerPath = await this.getCareerPathById(careerPathId);
      if (!careerPath) {
        throw new Error('Career path not found');
      }

      const progress: UserRoadmapProgress = {
        id: `progress_${Date.now()}`,
        userId,
        careerPathId,
        startedAt: new Date().toISOString(),
        currentPhase: 0,
        overallProgress: 0,
        phaseProgress: careerPath.roadmap.map(phase => ({
          phaseId: phase.id,
          progress: 0,
          completedSkills: [],
          completedProjects: [],
          completedMilestones: []
        })),
        completedMilestones: [],
        earnedPoints: 0,
        estimatedCompletion: this.calculateEstimatedCompletion(careerPath),
        lastUpdated: new Date().toISOString()
      };

      await databaseService.insert('roadmap_progress', this.mapProgressToDb(progress));
      return progress;
    } catch (error) {
      console.error('Error starting roadmap:', error);
      throw error;
    }
  }

  /**
   * Update roadmap progress
   */
  async updateProgress(
    progressId: string, 
    phaseId: string, 
    completedItem: { type: 'skill' | 'project' | 'milestone', id: string }
  ): Promise<void> {
    try {
      const progress = await this.getRoadmapProgress(progressId);
      if (!progress) return;

      // Update phase progress
      const phaseIndex = progress.phaseProgress.findIndex(p => p.phaseId === phaseId);
      if (phaseIndex === -1) return;

      const phase = progress.phaseProgress[phaseIndex];
      
      switch (completedItem.type) {
        case 'skill':
          if (!phase.completedSkills.includes(completedItem.id)) {
            phase.completedSkills.push(completedItem.id);
          }
          break;
        case 'project':
          if (!phase.completedProjects.includes(completedItem.id)) {
            phase.completedProjects.push(completedItem.id);
          }
          break;
        case 'milestone':
          if (!phase.completedMilestones.includes(completedItem.id)) {
            phase.completedMilestones.push(completedItem.id);
            progress.completedMilestones.push(completedItem.id);
          }
          break;
      }

      // Recalculate progress
      progress.phaseProgress[phaseIndex] = this.calculatePhaseProgress(phase, phaseId);
      progress.overallProgress = this.calculateOverallProgress(progress.phaseProgress);
      progress.lastUpdated = new Date().toISOString();

      await databaseService.update('roadmap_progress', this.mapProgressToDb(progress), 'id = ?', [progressId]);

      // Award points and check for achievements
      await this.awardPoints(progress.userId, 10);
      await this.checkAchievements(progress.userId);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  /**
   * Create a custom schedule plan
   */
  async createSchedulePlan(userId: string, plan: Omit<SchedulePlan, 'id' | 'createdAt'>): Promise<SchedulePlan> {
    try {
      const schedulePlan: SchedulePlan = {
        ...plan,
        id: `schedule_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      await databaseService.insert('schedule_plans', this.mapScheduleToDb(schedulePlan));
      return schedulePlan;
    } catch (error) {
      console.error('Error creating schedule plan:', error);
      throw error;
    }
  }

  /**
   * Complete a scheduled task and award points
   */
  async completeTask(userId: string, taskId: string): Promise<void> {
    try {
      const task = await databaseService.findOne('schedule_tasks', 'id = ?', [taskId]);
      if (!task || task.isCompleted) return;

      // Mark task as completed
      await databaseService.update('schedule_tasks', {
        isCompleted: true,
        completedAt: new Date().toISOString()
      }, 'id = ?', [taskId]);

      // Award points
      await this.awardPoints(userId, task.points);

      // Update streak
      await this.updateStreak(userId);

      // Water the virtual tree
      await this.waterVirtualTree(userId, task.points);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  /**
   * Get or create virtual tree for user
   */
  async getVirtualTree(userId: string): Promise<VirtualTree> {
    try {
      const tree = await databaseService.findOne('virtual_trees', 'userId = ?', [userId]);
      if (tree) {
        return this.mapTreeFromDb(tree);
      }

      // Create new tree
      const newTree: VirtualTree = {
        id: `tree_${Date.now()}`,
        userId,
        level: 1,
        experience: 0,
        maxExperience: 100,
        treeType: 'oak',
        unlockedFeatures: [],
        achievements: [],
        lastWatered: new Date().toISOString(),
        health: 100,
        createdAt: new Date().toISOString()
      };

      await databaseService.insert('virtual_trees', this.mapTreeToDb(newTree));
      return newTree;
    } catch (error) {
      console.error('Error getting virtual tree:', error);
      throw error;
    }
  }

  /**
   * Water virtual tree (add experience)
   */
  async waterVirtualTree(userId: string, points: number): Promise<VirtualTree> {
    try {
      const tree = await this.getVirtualTree(userId);
      
      tree.experience += points;
      tree.lastWatered = new Date().toISOString();
      tree.health = Math.min(100, tree.health + 5);

      // Check for level up
      if (tree.experience >= tree.maxExperience) {
        tree.level += 1;
        tree.experience = tree.experience - tree.maxExperience;
        tree.maxExperience = Math.floor(tree.maxExperience * 1.5);
        
        // Unlock new features
        await this.unlockTreeFeatures(tree);
      }

      await databaseService.update('virtual_trees', this.mapTreeToDb(tree), 'id = ?', [tree.id]);
      return tree;
    } catch (error) {
      console.error('Error watering virtual tree:', error);
      throw error;
    }
  }

  /**
   * Generate completion certificate
   */
  async generateCertificate(userId: string, careerPathId: string): Promise<CompletionCertificate> {
    try {
      const progress = await this.getUserRoadmapProgress(userId, careerPathId);
      const careerPath = await this.getCareerPathById(careerPathId);
      
      if (!progress || !careerPath || progress.overallProgress < 100) {
        throw new Error('Roadmap not completed');
      }

      const certificate: CompletionCertificate = {
        id: `cert_${Date.now()}`,
        userId,
        careerPathId,
        careerPathTitle: careerPath.title,
        completedAt: new Date().toISOString(),
        totalDuration: this.calculateTotalDuration(progress),
        skillsLearned: this.getLearnedSkills(progress),
        projectsCompleted: this.getCompletedProjects(progress),
        finalScore: progress.overallProgress,
        shareableLink: `https://edumitra.com/certificates/${userId}/${careerPathId}`,
        certificateUrl: `https://edumitra.com/api/certificates/${userId}/${careerPathId}.pdf`
      };

      await databaseService.insert('certificates', this.mapCertificateToDb(certificate));
      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }

  // Helper methods and mock data
  private getMockCareerPaths(): CareerPath[] {
    return [
      {
        id: 'data_scientist',
        title: 'Data Scientist',
        description: 'Analyze complex data to help organizations make informed decisions',
        category: 'Data Science',
        averageSalary: { min: 80000, max: 150000, currency: 'USD', location: 'US', experience: '2-5 years' },
        growthRate: 22,
        demandLevel: 'very_high',
        requiredSkills: ['python', 'statistics', 'machine_learning', 'sql'],
        optionalSkills: ['r', 'tableau', 'spark', 'aws'],
        experienceLevel: 'mid',
        roadmap: [],
        matchScore: 0,
        icon: '📊',
        color: '#4CAF50'
      },
      {
        id: 'ai_engineer',
        title: 'AI Engineer',
        description: 'Design and implement artificial intelligence solutions',
        category: 'Artificial Intelligence',
        averageSalary: { min: 90000, max: 180000, currency: 'USD', location: 'US', experience: '2-5 years' },
        growthRate: 32,
        demandLevel: 'very_high',
        requiredSkills: ['python', 'machine_learning', 'deep_learning', 'tensorflow'],
        optionalSkills: ['pytorch', 'computer_vision', 'nlp', 'kubernetes'],
        experienceLevel: 'mid',
        roadmap: [],
        matchScore: 0,
        icon: '🤖',
        color: '#2196F3'
      }
    ];
  }

  // Database mapping methods
  private mapCareerPathFromDb(row: any): CareerPath {
    return {
      ...row,
      averageSalary: JSON.parse(row.averageSalary || '{}'),
      requiredSkills: JSON.parse(row.requiredSkills || '[]'),
      optionalSkills: JSON.parse(row.optionalSkills || '[]'),
      roadmap: JSON.parse(row.roadmap || '[]')
    };
  }

  private mapSkillFromDb(row: any): Skill {
    return {
      ...row,
      learningResources: JSON.parse(row.learningResources || '[]')
    };
  }

  private mapProgressToDb(progress: UserRoadmapProgress): any {
    return {
      ...progress,
      phaseProgress: JSON.stringify(progress.phaseProgress),
      completedMilestones: JSON.stringify(progress.completedMilestones)
    };
  }

  private mapScheduleToDb(schedule: SchedulePlan): any {
    return {
      ...schedule,
      tasks: JSON.stringify(schedule.tasks)
    };
  }

  private mapTreeToDb(tree: VirtualTree): any {
    return {
      ...tree,
      unlockedFeatures: JSON.stringify(tree.unlockedFeatures),
      achievements: JSON.stringify(tree.achievements)
    };
  }

  private mapTreeFromDb(row: any): VirtualTree {
    return {
      ...row,
      unlockedFeatures: JSON.parse(row.unlockedFeatures || '[]'),
      achievements: JSON.parse(row.achievements || '[]')
    };
  }

  private mapCertificateToDb(cert: CompletionCertificate): any {
    return {
      ...cert,
      skillsLearned: JSON.stringify(cert.skillsLearned),
      projectsCompleted: JSON.stringify(cert.projectsCompleted)
    };
  }

  // Placeholder methods (to be implemented)
  private async getCareerPathById(id: string): Promise<CareerPath | null> { return null; }
  private async getRoadmapProgress(id: string): Promise<UserRoadmapProgress | null> { return null; }
  private async getUserRoadmapProgress(userId: string, careerPathId: string): Promise<UserRoadmapProgress | null> { return null; }
  private calculateEstimatedCompletion(careerPath: CareerPath): string { return ''; }
  private calculatePhaseProgress(phase: any, phaseId: string): any { return phase; }
  private calculateOverallProgress(phases: any[]): number { return 0; }
  private async awardPoints(userId: string, points: number): Promise<void> { }
  private async checkAchievements(userId: string): Promise<void> { }
  private async updateStreak(userId: string): Promise<void> { }
  private async unlockTreeFeatures(tree: VirtualTree): Promise<void> { }
  private calculateTotalDuration(progress: UserRoadmapProgress): string { return ''; }
  private getLearnedSkills(progress: UserRoadmapProgress): string[] { return []; }
  private getCompletedProjects(progress: UserRoadmapProgress): string[] { return []; }
}

export const careerRoadmapService = new CareerRoadmapService();
export default careerRoadmapService;
