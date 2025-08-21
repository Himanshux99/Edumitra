import { create } from 'zustand';
import { 
  Lesson, 
  LessonProgress, 
  Quiz, 
  QuizAttempt, 
  TimetableEntry, 
  Course 
} from '../types/database';

interface LearningState {
  // Data
  courses: Course[];
  lessons: Lesson[];
  lessonProgress: LessonProgress[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  timetableEntries: TimetableEntry[];
  
  // UI State
  isLoading: boolean;
  isOffline: boolean;
  syncInProgress: boolean;
  lastSyncTime: string | null;
  
  // Current selections
  selectedCourse: Course | null;
  selectedLesson: Lesson | null;
  selectedQuiz: Quiz | null;
  
  // Actions
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  
  setLessons: (lessons: Lesson[]) => void;
  addLesson: (lesson: Lesson) => void;
  updateLesson: (lessonId: string, updates: Partial<Lesson>) => void;
  
  setLessonProgress: (progress: LessonProgress[]) => void;
  updateLessonProgress: (lessonId: string, userId: string, progress: Partial<LessonProgress>) => void;
  
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (quizId: string, updates: Partial<Quiz>) => void;
  
  setQuizAttempts: (attempts: QuizAttempt[]) => void;
  addQuizAttempt: (attempt: QuizAttempt) => void;
  updateQuizAttempt: (attemptId: string, updates: Partial<QuizAttempt>) => void;
  
  setTimetableEntries: (entries: TimetableEntry[]) => void;
  addTimetableEntry: (entry: TimetableEntry) => void;
  updateTimetableEntry: (entryId: string, updates: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (entryId: string) => void;
  
  // Selection actions
  selectCourse: (course: Course | null) => void;
  selectLesson: (lesson: Lesson | null) => void;
  selectQuiz: (quiz: Quiz | null) => void;
  
  // UI state actions
  setLoading: (loading: boolean) => void;
  setOfflineStatus: (offline: boolean) => void;
  setSyncInProgress: (syncing: boolean) => void;
  setLastSyncTime: (time: string) => void;
  
  // Computed getters
  getLessonsByCourse: (courseId: string) => Lesson[];
  getQuizzesByCourse: (courseId: string) => Quiz[];
  getLessonProgress: (lessonId: string, userId: string) => LessonProgress | undefined;
  getQuizAttempts: (quizId: string, userId: string) => QuizAttempt[];
  getTodaysTimetable: () => TimetableEntry[];
  getUpcomingTimetable: (days: number) => TimetableEntry[];
}

export const useLearningStore = create<LearningState>((set, get) => ({
  // Initial state
  courses: [],
  lessons: [],
  lessonProgress: [],
  quizzes: [],
  quizAttempts: [],
  timetableEntries: [],
  
  isLoading: false,
  isOffline: false,
  syncInProgress: false,
  lastSyncTime: null,
  
  selectedCourse: null,
  selectedLesson: null,
  selectedQuiz: null,
  
  // Course actions
  setCourses: (courses) => set({ courses }),
  addCourse: (course) => set((state) => ({ 
    courses: [...state.courses, course] 
  })),
  updateCourse: (courseId, updates) => set((state) => ({
    courses: state.courses.map(course => 
      course.id === courseId ? { ...course, ...updates } : course
    )
  })),
  
  // Lesson actions
  setLessons: (lessons) => set({ lessons }),
  addLesson: (lesson) => set((state) => ({ 
    lessons: [...state.lessons, lesson] 
  })),
  updateLesson: (lessonId, updates) => set((state) => ({
    lessons: state.lessons.map(lesson => 
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    )
  })),
  
  // Lesson progress actions
  setLessonProgress: (progress) => set({ lessonProgress: progress }),
  updateLessonProgress: (lessonId, userId, progress) => set((state) => {
    const existingIndex = state.lessonProgress.findIndex(
      p => p.lessonId === lessonId && p.userId === userId
    );
    
    if (existingIndex >= 0) {
      const updated = [...state.lessonProgress];
      updated[existingIndex] = { ...updated[existingIndex], ...progress };
      return { lessonProgress: updated };
    } else {
      const newProgress: LessonProgress = {
        id: `progress_${Date.now()}`,
        lessonId,
        userId,
        progressPercentage: 0,
        timeSpent: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...progress
      };
      return { lessonProgress: [...state.lessonProgress, newProgress] };
    }
  }),
  
  // Quiz actions
  setQuizzes: (quizzes) => set({ quizzes }),
  addQuiz: (quiz) => set((state) => ({ 
    quizzes: [...state.quizzes, quiz] 
  })),
  updateQuiz: (quizId, updates) => set((state) => ({
    quizzes: state.quizzes.map(quiz => 
      quiz.id === quizId ? { ...quiz, ...updates } : quiz
    )
  })),
  
  // Quiz attempt actions
  setQuizAttempts: (attempts) => set({ quizAttempts: attempts }),
  addQuizAttempt: (attempt) => set((state) => ({ 
    quizAttempts: [...state.quizAttempts, attempt] 
  })),
  updateQuizAttempt: (attemptId, updates) => set((state) => ({
    quizAttempts: state.quizAttempts.map(attempt => 
      attempt.id === attemptId ? { ...attempt, ...updates } : attempt
    )
  })),
  
  // Timetable actions
  setTimetableEntries: (entries) => set({ timetableEntries: entries }),
  addTimetableEntry: (entry) => set((state) => ({ 
    timetableEntries: [...state.timetableEntries, entry] 
  })),
  updateTimetableEntry: (entryId, updates) => set((state) => ({
    timetableEntries: state.timetableEntries.map(entry => 
      entry.id === entryId ? { ...entry, ...updates } : entry
    )
  })),
  deleteTimetableEntry: (entryId) => set((state) => ({
    timetableEntries: state.timetableEntries.filter(entry => entry.id !== entryId)
  })),
  
  // Selection actions
  selectCourse: (course) => set({ selectedCourse: course }),
  selectLesson: (lesson) => set({ selectedLesson: lesson }),
  selectQuiz: (quiz) => set({ selectedQuiz: quiz }),
  
  // UI state actions
  setLoading: (loading) => set({ isLoading: loading }),
  setOfflineStatus: (offline) => set({ isOffline: offline }),
  setSyncInProgress: (syncing) => set({ syncInProgress: syncing }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  
  // Computed getters
  getLessonsByCourse: (courseId) => {
    return get().lessons.filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },
  
  getQuizzesByCourse: (courseId) => {
    return get().quizzes.filter(quiz => quiz.courseId === courseId);
  },
  
  getLessonProgress: (lessonId, userId) => {
    return get().lessonProgress.find(
      p => p.lessonId === lessonId && p.userId === userId
    );
  },
  
  getQuizAttempts: (quizId, userId) => {
    return get().quizAttempts.filter(
      attempt => attempt.quizId === quizId && attempt.userId === userId
    ).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },
  
  getTodaysTimetable: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().timetableEntries.filter(entry => 
      entry.startTime.startsWith(today)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
  
  getUpcomingTimetable: (days) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return get().timetableEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= now && entryDate <= futureDate;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
}));
