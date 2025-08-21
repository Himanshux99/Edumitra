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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Course,
  StudyMaterial,
  MockTest,
  Scholarship,
  Internship,
  ContentCategory,
  UserBookmark,
  UserProgress,
  ContentReview,
  SearchFilters,
  ContentHubSummary
} from '../types/content';

class ContentService {
  private userId: string = 'demo_user'; // In production, get from auth

  // Course operations
  async getCourses(filters?: SearchFilters): Promise<Course[]> {
    try {
      let q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      
      if (filters?.category?.length) {
        q = query(q, where('category', 'in', filters.category));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting courses:', error);
      return this.getMockCourses();
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const docRef = doc(db, 'courses', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Course;
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      return this.getMockCourses().find(c => c.id === id) || null;
    }
  }

  async getEnrolledCourses(): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('isEnrolled', '==', true),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting enrolled courses:', error);
      return this.getMockCourses().filter(c => c.isEnrolled);
    }
  }

  async enrollInCourse(courseId: string): Promise<void> {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        isEnrolled: true,
        enrollmentCount: increment(1),
        updatedAt: Timestamp.now().toDate().toISOString()
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  }

  // Study Materials operations
  async getStudyMaterials(courseId?: string, filters?: SearchFilters): Promise<StudyMaterial[]> {
    try {
      let q = query(collection(db, 'study_materials'), orderBy('createdAt', 'desc'));
      
      if (courseId) {
        q = query(q, where('courseId', '==', courseId));
      }
      
      if (filters?.type?.length) {
        q = query(q, where('type', 'in', filters.type));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyMaterial[];
    } catch (error) {
      console.error('Error getting study materials:', error);
      return this.getMockStudyMaterials();
    }
  }

  async downloadMaterial(materialId: string): Promise<string> {
    try {
      // Simulate download process
      const material = await this.getStudyMaterialById(materialId);
      if (!material) throw new Error('Material not found');
      
      // Update download status
      const materialRef = doc(db, 'study_materials', materialId);
      await updateDoc(materialRef, {
        isDownloaded: true,
        downloadedAt: Timestamp.now().toDate().toISOString(),
        accessCount: increment(1)
      });
      
      return `local_path_${materialId}`;
    } catch (error) {
      console.error('Error downloading material:', error);
      throw error;
    }
  }

  async getStudyMaterialById(id: string): Promise<StudyMaterial | null> {
    try {
      const docRef = doc(db, 'study_materials', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StudyMaterial;
      }
      return null;
    } catch (error) {
      console.error('Error getting study material:', error);
      return this.getMockStudyMaterials().find(m => m.id === id) || null;
    }
  }

  // Mock Tests operations
  async getMockTests(filters?: SearchFilters): Promise<MockTest[]> {
    try {
      let q = query(collection(db, 'mock_tests'), orderBy('createdAt', 'desc'));
      
      if (filters?.category?.length) {
        q = query(q, where('category', 'in', filters.category));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MockTest[];
    } catch (error) {
      console.error('Error getting mock tests:', error);
      return this.getMockTests();
    }
  }

  async getMockTestById(id: string): Promise<MockTest | null> {
    try {
      const docRef = doc(db, 'mock_tests', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MockTest;
      }
      return null;
    } catch (error) {
      console.error('Error getting mock test:', error);
      return this.getMockMockTests().find(t => t.id === id) || null;
    }
  }

  // Scholarships operations
  async getScholarships(filters?: SearchFilters): Promise<Scholarship[]> {
    try {
      let q = query(
        collection(db, 'scholarships'),
        where('isActive', '==', true),
        orderBy('applicationDeadline', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Scholarship[];
    } catch (error) {
      console.error('Error getting scholarships:', error);
      return this.getMockScholarships();
    }
  }

  async getScholarshipById(id: string): Promise<Scholarship | null> {
    try {
      const docRef = doc(db, 'scholarships', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Scholarship;
      }
      return null;
    } catch (error) {
      console.error('Error getting scholarship:', error);
      return this.getMockScholarships().find(s => s.id === id) || null;
    }
  }

  // Internships operations
  async getInternships(filters?: SearchFilters): Promise<Internship[]> {
    try {
      let q = query(
        collection(db, 'internships'),
        where('isActive', '==', true),
        orderBy('applicationDeadline', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Internship[];
    } catch (error) {
      console.error('Error getting internships:', error);
      return this.getMockInternships();
    }
  }

  async getInternshipById(id: string): Promise<Internship | null> {
    try {
      const docRef = doc(db, 'internships', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Internship;
      }
      return null;
    } catch (error) {
      console.error('Error getting internship:', error);
      return this.getMockInternships().find(i => i.id === id) || null;
    }
  }

  // Bookmark operations
  async toggleBookmark(contentType: string, contentId: string): Promise<boolean> {
    try {
      const bookmarkQuery = query(
        collection(db, 'user_bookmarks'),
        where('userId', '==', this.userId),
        where('contentType', '==', contentType),
        where('contentId', '==', contentId)
      );
      
      const querySnapshot = await getDocs(bookmarkQuery);
      
      if (querySnapshot.empty) {
        // Add bookmark
        await addDoc(collection(db, 'user_bookmarks'), {
          userId: this.userId,
          contentType,
          contentId,
          createdAt: Timestamp.now().toDate().toISOString()
        });
        return true;
      } else {
        // Remove bookmark
        const bookmarkDoc = querySnapshot.docs[0];
        await deleteDoc(doc(db, 'user_bookmarks', bookmarkDoc.id));
        return false;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  }

  async getUserBookmarks(): Promise<UserBookmark[]> {
    try {
      const q = query(
        collection(db, 'user_bookmarks'),
        where('userId', '==', this.userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserBookmark[];
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      return [];
    }
  }

  // Search operations
  async searchContent(query: string, filters?: SearchFilters): Promise<{
    courses: Course[];
    materials: StudyMaterial[];
    tests: MockTest[];
    scholarships: Scholarship[];
    internships: Internship[];
  }> {
    try {
      // In a real implementation, this would use full-text search
      // For demo, we'll filter by title containing the query
      const [courses, materials, tests, scholarships, internships] = await Promise.all([
        this.getCourses(filters),
        this.getStudyMaterials(undefined, filters),
        this.getMockTests(filters),
        this.getScholarships(filters),
        this.getInternships(filters)
      ]);

      const searchTerm = query.toLowerCase();
      
      return {
        courses: courses.filter(c => c.title.toLowerCase().includes(searchTerm)),
        materials: materials.filter(m => m.title.toLowerCase().includes(searchTerm)),
        tests: tests.filter(t => t.title.toLowerCase().includes(searchTerm)),
        scholarships: scholarships.filter(s => s.title.toLowerCase().includes(searchTerm)),
        internships: internships.filter(i => i.title.toLowerCase().includes(searchTerm))
      };
    } catch (error) {
      console.error('Error searching content:', error);
      return {
        courses: [],
        materials: [],
        tests: [],
        scholarships: [],
        internships: []
      };
    }
  }

  // Content Hub Summary
  async getContentHubSummary(): Promise<ContentHubSummary> {
    try {
      const [courses, materials, tests, scholarships, internships, bookmarks] = await Promise.all([
        this.getCourses(),
        this.getStudyMaterials(),
        this.getMockTests(),
        this.getScholarships(),
        this.getInternships(),
        this.getUserBookmarks()
      ]);

      return {
        totalCourses: courses.length,
        enrolledCourses: courses.filter(c => c.isEnrolled).length,
        totalMaterials: materials.length,
        downloadedMaterials: materials.filter(m => m.isDownloaded).length,
        totalTests: tests.length,
        attemptedTests: tests.filter(t => t.attemptCount > 0).length,
        totalScholarships: scholarships.length,
        bookmarkedScholarships: bookmarks.filter(b => b.contentType === 'scholarship').length,
        totalInternships: internships.length,
        bookmarkedInternships: bookmarks.filter(b => b.contentType === 'internship').length,
        recentlyViewed: [],
        recommendations: [],
        trendingContent: []
      };
    } catch (error) {
      console.error('Error getting content hub summary:', error);
      return this.getMockContentHubSummary();
    }
  }

  // Mock data methods
  private getMockCourses(): Course[] {
    return [
      {
        id: 'course_1',
        title: 'Complete JEE Mathematics',
        description: 'Comprehensive mathematics course for JEE Main and Advanced preparation',
        instructor: 'Dr. Rajesh Kumar',
        instructorAvatar: 'https://example.com/avatar1.jpg',
        thumbnailUrl: 'https://example.com/course1.jpg',
        category: 'competitive_exams',
        subcategory: 'JEE',
        level: 'intermediate',
        duration: 120,
        totalLessons: 45,
        totalQuizzes: 15,
        rating: 4.8,
        reviewCount: 1250,
        price: 2999,
        currency: 'INR',
        isPremium: true,
        isEnrolled: true,
        enrollmentCount: 15000,
        tags: ['mathematics', 'jee', 'calculus', 'algebra'],
        prerequisites: ['Class 12 Mathematics'],
        learningOutcomes: ['Master calculus concepts', 'Solve complex algebra problems'],
        syllabus: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T00:00:00Z',
        publishedAt: '2024-01-01T00:00:00Z',
        isOfflineAvailable: true,
        downloadSize: 2500
      },
      {
        id: 'course_2',
        title: 'NEET Biology Masterclass',
        description: 'Complete biology preparation for NEET with detailed explanations',
        instructor: 'Dr. Priya Sharma',
        instructorAvatar: 'https://example.com/avatar2.jpg',
        thumbnailUrl: 'https://example.com/course2.jpg',
        category: 'competitive_exams',
        subcategory: 'NEET',
        level: 'advanced',
        duration: 150,
        totalLessons: 60,
        totalQuizzes: 20,
        rating: 4.9,
        reviewCount: 2100,
        price: 3499,
        currency: 'INR',
        isPremium: true,
        isEnrolled: false,
        enrollmentCount: 22000,
        tags: ['biology', 'neet', 'botany', 'zoology'],
        prerequisites: ['Class 12 Biology'],
        learningOutcomes: ['Master NEET biology syllabus', 'Solve previous year questions'],
        syllabus: [],
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-21T00:00:00Z',
        publishedAt: '2024-01-05T00:00:00Z',
        isOfflineAvailable: true,
        downloadSize: 3200
      }
    ];
  }

  private getMockStudyMaterials(): StudyMaterial[] {
    return [
      {
        id: 'material_1',
        title: 'Calculus Formula Sheet',
        description: 'Complete formula sheet for differential and integral calculus',
        type: 'pdf',
        url: 'https://example.com/calculus-formulas.pdf',
        fileSize: 2048000,
        pageCount: 15,
        thumbnailUrl: 'https://example.com/pdf-thumb1.jpg',
        courseId: 'course_1',
        category: 'mathematics',
        tags: ['calculus', 'formulas', 'reference'],
        difficulty: 'medium',
        isDownloaded: true,
        downloadedAt: '2024-01-15T00:00:00Z',
        lastAccessedAt: '2024-01-21T00:00:00Z',
        accessCount: 25,
        rating: 4.7,
        reviewCount: 150,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T00:00:00Z'
      }
    ];
  }

  private getMockMockTests(): MockTest[] {
    return [
      {
        id: 'test_1',
        title: 'JEE Main Mathematics Mock Test 1',
        description: 'Full-length mock test for JEE Main mathematics section',
        category: 'jee',
        subcategory: 'JEE Main',
        examType: 'mock',
        difficulty: 'medium',
        duration: 180,
        totalQuestions: 30,
        totalMarks: 120,
        passingMarks: 72,
        negativeMarking: true,
        negativeMarkingRatio: 0.25,
        instructions: ['Read all questions carefully', 'Manage your time effectively'],
        sections: [],
        isPremium: false,
        price: 0,
        currency: 'INR',
        attemptCount: 5,
        averageScore: 85,
        tags: ['jee', 'mathematics', 'mock test'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T00:00:00Z',
        isOfflineAvailable: true
      }
    ];
  }

  private getMockScholarships(): Scholarship[] {
    return [
      {
        id: 'scholarship_1',
        title: 'Merit Scholarship for Engineering Students',
        description: 'Scholarship for meritorious students pursuing engineering',
        provider: 'Tech Foundation',
        amount: 50000,
        currency: 'INR',
        type: 'merit_based',
        category: ['engineering'],
        eligibility: {
          education: ['B.Tech', 'B.E.'],
          cgpaMin: 8.0,
          yearOfStudy: ['2nd year', '3rd year'],
          nationality: ['Indian']
        },
        applicationDeadline: '2024-03-31',
        applicationUrl: 'https://example.com/apply',
        documentsRequired: ['Academic transcripts', 'Income certificate'],
        selectionProcess: ['Application review', 'Interview'],
        benefits: ['Tuition fee coverage', 'Monthly stipend'],
        contactInfo: {
          email: 'scholarships@techfoundation.org',
          website: 'https://techfoundation.org'
        },
        tags: ['engineering', 'merit', 'students'],
        location: 'India',
        isActive: true,
        applicationCount: 1500,
        successRate: 15,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T00:00:00Z',
        isBookmarked: false
      }
    ];
  }

  private getMockInternships(): Internship[] {
    return [
      {
        id: 'internship_1',
        title: 'Software Development Intern',
        description: 'Summer internship program for computer science students',
        company: 'TechCorp',
        location: 'Bangalore',
        locationType: 'onsite',
        duration: '3 months',
        stipend: 25000,
        currency: 'INR',
        type: 'summer',
        category: ['technology', 'software'],
        skills: ['JavaScript', 'React', 'Node.js'],
        eligibility: {
          education: ['B.Tech CSE', 'B.Sc CS'],
          yearOfStudy: ['3rd year', '4th year'],
          nationality: ['Indian']
        },
        applicationDeadline: '2024-04-15',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        applicationUrl: 'https://techcorp.com/internships',
        requirements: ['Strong programming skills', 'Good communication'],
        responsibilities: ['Develop web applications', 'Participate in code reviews'],
        benefits: ['Mentorship', 'Certificate', 'Pre-placement offer'],
        contactInfo: {
          email: 'internships@techcorp.com',
          website: 'https://techcorp.com'
        },
        tags: ['software', 'internship', 'technology'],
        isActive: true,
        applicationCount: 2500,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-21T00:00:00Z',
        isBookmarked: true
      }
    ];
  }

  private getMockContentHubSummary(): ContentHubSummary {
    return {
      totalCourses: 150,
      enrolledCourses: 5,
      totalMaterials: 500,
      downloadedMaterials: 25,
      totalTests: 200,
      attemptedTests: 15,
      totalScholarships: 75,
      bookmarkedScholarships: 8,
      totalInternships: 120,
      bookmarkedInternships: 12,
      recentlyViewed: [],
      recommendations: [],
      trendingContent: []
    };
  }
}

// Helper function for Firestore increment
function increment(value: number) {
  return value; // In real Firebase, use FieldValue.increment(value)
}

export const contentService = new ContentService();
