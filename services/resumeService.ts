import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ResumeData } from '../types/resume';

class ResumeService {
  private collectionName = 'resumes';

  // Create a new resume
  async createResume(resumeData: Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...resumeData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new Error('Failed to create resume');
    }
  }

  // Get a resume by ID
  async getResumeById(resumeId: string): Promise<ResumeData | null> {
    try {
      const docRef = doc(db, this.collectionName, resumeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ResumeData;
      }
      return null;
    } catch (error) {
      console.error('Error getting resume:', error);
      throw new Error('Failed to get resume');
    }
  }

  // Get all resumes for a user
  async getResumesByUserId(userId: string): Promise<ResumeData[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ResumeData[];
    } catch (error) {
      console.error('Error getting user resumes:', error);
      // Return empty array if there's an error (e.g., no resumes exist yet)
      return [];
    }
  }

  // Update a resume
  async updateResume(resumeId: string, updates: Partial<ResumeData>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, resumeId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('Failed to update resume');
    }
  }

  // Delete a resume
  async deleteResume(resumeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, resumeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('Failed to delete resume');
    }
  }

  // Duplicate a resume
  async duplicateResume(resumeId: string, newTitle?: string): Promise<string> {
    try {
      const originalResume = await this.getResumeById(resumeId);
      if (!originalResume) {
        throw new Error('Resume not found');
      }

      const duplicatedResume = {
        ...originalResume,
        title: newTitle || `${originalResume.title} (Copy)`,
      };

      // Remove the ID and timestamps to create a new document
      delete duplicatedResume.id;
      delete duplicatedResume.createdAt;
      delete duplicatedResume.updatedAt;

      return await this.createResume(duplicatedResume);
    } catch (error) {
      console.error('Error duplicating resume:', error);
      throw new Error('Failed to duplicate resume');
    }
  }

  // Get resume statistics
  async getResumeStats(resumeId: string): Promise<{
    experienceCount: number;
    educationCount: number;
    skillsCount: number;
    projectsCount: number;
  }> {
    try {
      const resume = await this.getResumeById(resumeId);
      if (!resume) {
        return { experienceCount: 0, educationCount: 0, skillsCount: 0, projectsCount: 0 };
      }

      return {
        experienceCount: resume.workExperience?.length || 0,
        educationCount: resume.education?.length || 0,
        skillsCount: resume.skills?.length || 0,
        projectsCount: resume.projects?.length || 0,
      };
    } catch (error) {
      console.error('Error getting resume stats:', error);
      return { experienceCount: 0, educationCount: 0, skillsCount: 0, projectsCount: 0 };
    }
  }

  // Subscribe to real-time updates for user's resumes
  subscribeToUserResumes(
    userId: string,
    callback: (resumes: ResumeData[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const resumes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ResumeData[];
        callback(resumes);
      });
    } catch (error) {
      console.error('Error subscribing to resumes:', error);
      // Return empty unsubscribe function
      return () => {};
    }
  }

  // Batch operations for bulk updates
  async batchUpdateResumes(updates: { id: string; data: Partial<ResumeData> }[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      updates.forEach(({ id, data }) => {
        const docRef = doc(db, this.collectionName, id);
        batch.update(docRef, {
          ...data,
          updatedAt: now,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error batch updating resumes:', error);
      throw new Error('Failed to batch update resumes');
    }
  }

  // Search resumes by title or content
  async searchResumes(userId: string, searchTerm: string): Promise<ResumeData[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that searches by title
      // For production, consider using Algolia or similar service
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const allResumes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ResumeData[];

      // Filter by search term (case-insensitive)
      return allResumes.filter(resume => 
        resume.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching resumes:', error);
      return [];
    }
  }

  // Generate a unique resume ID
  generateResumeId(): string {
    return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create a default empty resume structure
  createEmptyResume(userId: string, title: string = 'New Resume'): Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId,
      title,
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        website: '',
        github: '',
        portfolio: '',
      },
      education: [],
      skills: [],
      workExperience: [],
      projects: [],
      summary: '',
    };
  }
}

// Export a singleton instance
export const resumeService = new ResumeService();
export default resumeService;
