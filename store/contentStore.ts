import { create } from 'zustand';
import {
  Course,
  StudyMaterial,
  MockTest,
  Scholarship,
  Internship,
  ContentCategory,
  UserBookmark,
  SearchFilters,
  ContentHubSummary
} from '../types/content';

interface ContentState {
  // Data
  courses: Course[];
  studyMaterials: StudyMaterial[];
  mockTests: MockTest[];
  scholarships: Scholarship[];
  internships: Internship[];
  categories: ContentCategory[];
  bookmarks: UserBookmark[];
  contentHubSummary: ContentHubSummary | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchFilters: SearchFilters;
  selectedCategory: string | null;
  
  // Current selections
  selectedCourse: Course | null;
  selectedMaterial: StudyMaterial | null;
  selectedTest: MockTest | null;
  selectedScholarship: Scholarship | null;
  selectedInternship: Internship | null;
  
  // Actions - Data Management
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  
  setStudyMaterials: (materials: StudyMaterial[]) => void;
  addStudyMaterial: (material: StudyMaterial) => void;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => void;
  
  setMockTests: (tests: MockTest[]) => void;
  addMockTest: (test: MockTest) => void;
  updateMockTest: (id: string, updates: Partial<MockTest>) => void;
  
  setScholarships: (scholarships: Scholarship[]) => void;
  addScholarship: (scholarship: Scholarship) => void;
  updateScholarship: (id: string, updates: Partial<Scholarship>) => void;
  
  setInternships: (internships: Internship[]) => void;
  addInternship: (internship: Internship) => void;
  updateInternship: (id: string, updates: Partial<Internship>) => void;
  
  setCategories: (categories: ContentCategory[]) => void;
  setBookmarks: (bookmarks: UserBookmark[]) => void;
  toggleBookmark: (contentType: string, contentId: string) => void;
  setContentHubSummary: (summary: ContentHubSummary) => void;
  
  // Actions - UI State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setSelectedCategory: (category: string | null) => void;
  
  // Actions - Selections
  setSelectedCourse: (course: Course | null) => void;
  setSelectedMaterial: (material: StudyMaterial | null) => void;
  setSelectedTest: (test: MockTest | null) => void;
  setSelectedScholarship: (scholarship: Scholarship | null) => void;
  setSelectedInternship: (internship: Internship | null) => void;
  
  // Computed getters
  getEnrolledCourses: () => Course[];
  getDownloadedMaterials: () => StudyMaterial[];
  getBookmarkedContent: (contentType?: string) => UserBookmark[];
  getFilteredCourses: () => Course[];
  getFilteredMaterials: () => StudyMaterial[];
  getFilteredTests: () => MockTest[];
  getFilteredScholarships: () => Scholarship[];
  getFilteredInternships: () => Internship[];
  getTrendingCourses: () => Course[];
  getRecommendedContent: () => (Course | StudyMaterial | MockTest)[];
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  courses: [],
  studyMaterials: [],
  mockTests: [],
  scholarships: [],
  internships: [],
  categories: [],
  bookmarks: [],
  contentHubSummary: null,
  
  isLoading: false,
  error: null,
  searchQuery: '',
  searchFilters: {},
  selectedCategory: null,
  
  selectedCourse: null,
  selectedMaterial: null,
  selectedTest: null,
  selectedScholarship: null,
  selectedInternship: null,
  
  // Data management actions
  setCourses: (courses) => set({ courses }),
  addCourse: (course) => set((state) => ({
    courses: [course, ...state.courses]
  })),
  updateCourse: (id, updates) => set((state) => ({
    courses: state.courses.map(course =>
      course.id === id ? { ...course, ...updates } : course
    )
  })),
  
  setStudyMaterials: (materials) => set({ studyMaterials: materials }),
  addStudyMaterial: (material) => set((state) => ({
    studyMaterials: [material, ...state.studyMaterials]
  })),
  updateStudyMaterial: (id, updates) => set((state) => ({
    studyMaterials: state.studyMaterials.map(material =>
      material.id === id ? { ...material, ...updates } : material
    )
  })),
  
  setMockTests: (tests) => set({ mockTests: tests }),
  addMockTest: (test) => set((state) => ({
    mockTests: [test, ...state.mockTests]
  })),
  updateMockTest: (id, updates) => set((state) => ({
    mockTests: state.mockTests.map(test =>
      test.id === id ? { ...test, ...updates } : test
    )
  })),
  
  setScholarships: (scholarships) => set({ scholarships }),
  addScholarship: (scholarship) => set((state) => ({
    scholarships: [scholarship, ...state.scholarships]
  })),
  updateScholarship: (id, updates) => set((state) => ({
    scholarships: state.scholarships.map(scholarship =>
      scholarship.id === id ? { ...scholarship, ...updates } : scholarship
    )
  })),
  
  setInternships: (internships) => set({ internships }),
  addInternship: (internship) => set((state) => ({
    internships: [internship, ...state.internships]
  })),
  updateInternship: (id, updates) => set((state) => ({
    internships: state.internships.map(internship =>
      internship.id === id ? { ...internship, ...updates } : internship
    )
  })),
  
  setCategories: (categories) => set({ categories }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  toggleBookmark: (contentType, contentId) => set((state) => {
    const existingBookmark = state.bookmarks.find(
      b => b.contentType === contentType && b.contentId === contentId
    );
    
    if (existingBookmark) {
      // Remove bookmark
      return {
        bookmarks: state.bookmarks.filter(b => b.id !== existingBookmark.id)
      };
    } else {
      // Add bookmark
      const newBookmark = {
        id: `bookmark_${Date.now()}`,
        userId: 'demo_user',
        contentType,
        contentId,
        createdAt: new Date().toISOString()
      };
      return {
        bookmarks: [newBookmark, ...state.bookmarks]
      };
    }
  }),
  setContentHubSummary: (summary) => set({ contentHubSummary: summary }),
  
  // UI state actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchFilters: (filters) => set({ searchFilters: filters }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  // Selection actions
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSelectedMaterial: (material) => set({ selectedMaterial: material }),
  setSelectedTest: (test) => set({ selectedTest: test }),
  setSelectedScholarship: (scholarship) => set({ selectedScholarship: scholarship }),
  setSelectedInternship: (internship) => set({ selectedInternship: internship }),
  
  // Computed getters
  getEnrolledCourses: () => {
    const { courses } = get();
    return courses.filter(course => course.isEnrolled);
  },
  
  getDownloadedMaterials: () => {
    const { studyMaterials } = get();
    return studyMaterials.filter(material => material.isDownloaded);
  },
  
  getBookmarkedContent: (contentType) => {
    const { bookmarks } = get();
    if (contentType) {
      return bookmarks.filter(bookmark => bookmark.contentType === contentType);
    }
    return bookmarks;
  },
  
  getFilteredCourses: () => {
    const { courses, searchQuery, searchFilters, selectedCategory } = get();
    let filtered = courses;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    // Filter by level
    if (searchFilters.level?.length) {
      filtered = filtered.filter(course => searchFilters.level!.includes(course.level));
    }
    
    // Filter by price range
    if (searchFilters.priceRange) {
      filtered = filtered.filter(course =>
        course.price >= searchFilters.priceRange!.min &&
        course.price <= searchFilters.priceRange!.max
      );
    }
    
    // Filter by rating
    if (searchFilters.rating) {
      filtered = filtered.filter(course => course.rating >= searchFilters.rating!);
    }
    
    // Filter by premium status
    if (searchFilters.isPremium !== undefined) {
      filtered = filtered.filter(course => course.isPremium === searchFilters.isPremium);
    }
    
    // Filter by offline availability
    if (searchFilters.isOfflineAvailable !== undefined) {
      filtered = filtered.filter(course => course.isOfflineAvailable === searchFilters.isOfflineAvailable);
    }
    
    // Sort results
    if (searchFilters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (searchFilters.sortBy) {
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'duration':
            aValue = a.duration;
            bValue = b.duration;
            break;
          case 'popularity':
            aValue = a.enrollmentCount;
            bValue = b.enrollmentCount;
            break;
          case 'newest':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }
        
        if (searchFilters.sortOrder === 'desc') {
          return bValue - aValue;
        }
        return aValue - bValue;
      });
    }
    
    return filtered;
  },
  
  getFilteredMaterials: () => {
    const { studyMaterials, searchQuery, searchFilters } = get();
    let filtered = studyMaterials;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query) ||
        material.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by type
    if (searchFilters.type?.length) {
      filtered = filtered.filter(material => searchFilters.type!.includes(material.type));
    }
    
    return filtered;
  },
  
  getFilteredTests: () => {
    const { mockTests, searchQuery, searchFilters } = get();
    let filtered = mockTests;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(query) ||
        test.description.toLowerCase().includes(query) ||
        test.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (searchFilters.category?.length) {
      filtered = filtered.filter(test => searchFilters.category!.includes(test.category));
    }
    
    return filtered;
  },
  
  getFilteredScholarships: () => {
    const { scholarships, searchQuery } = get();
    let filtered = scholarships;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(scholarship =>
        scholarship.title.toLowerCase().includes(query) ||
        scholarship.description.toLowerCase().includes(query) ||
        scholarship.provider.toLowerCase().includes(query) ||
        scholarship.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  },
  
  getFilteredInternships: () => {
    const { internships, searchQuery } = get();
    let filtered = internships;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(query) ||
        internship.description.toLowerCase().includes(query) ||
        internship.company.toLowerCase().includes(query) ||
        internship.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  },
  
  getTrendingCourses: () => {
    const { courses } = get();
    return courses
      .filter(course => course.enrollmentCount > 1000)
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10);
  },
  
  getRecommendedContent: () => {
    const { courses, studyMaterials, mockTests } = get();
    
    // Simple recommendation based on rating and popularity
    const recommendedCourses = courses
      .filter(course => course.rating >= 4.5)
      .slice(0, 3);
    
    const recommendedMaterials = studyMaterials
      .filter(material => material.rating >= 4.0)
      .slice(0, 2);
    
    const recommendedTests = mockTests
      .filter(test => test.averageScore >= 70)
      .slice(0, 2);
    
    return [...recommendedCourses, ...recommendedMaterials, ...recommendedTests];
  }
}));
