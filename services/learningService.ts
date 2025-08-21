import { databaseService } from './database';
import { useLearningStore } from '../store/learningStore';
import { 
  Lesson, 
  LessonProgress, 
  Quiz, 
  QuizAttempt, 
  TimetableEntry, 
  Course,
  SyncStatus 
} from '../types/database';

class LearningService {
  private userId: string = 'default_user'; // This should come from auth service

  async initialize(): Promise<void> {
    await databaseService.initialize();
    await this.loadAllData();
  }

  // Load all data from database to store
  async loadAllData(): Promise<void> {
    const store = useLearningStore.getState();
    store.setLoading(true);

    try {
      // Load courses
      const courses = await this.getAllCourses();
      store.setCourses(courses);

      // Load lessons
      const lessons = await this.getAllLessons();
      store.setLessons(lessons);

      // Load lesson progress
      const progress = await this.getAllLessonProgress();
      store.setLessonProgress(progress);

      // Load quizzes
      const quizzes = await this.getAllQuizzes();
      store.setQuizzes(quizzes);

      // Load quiz attempts
      const attempts = await this.getAllQuizAttempts();
      store.setQuizAttempts(attempts);

      // Load timetable
      const timetable = await this.getAllTimetableEntries();
      store.setTimetableEntries(timetable);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      store.setLoading(false);
    }
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    const rows = await databaseService.findMany('courses', undefined, undefined, 'title ASC');
    return rows.map(this.mapCourseFromDb);
  }

  async getCourseById(id: string): Promise<Course | null> {
    const row = await databaseService.findOne('courses', 'id = ?', [id]);
    return row ? this.mapCourseFromDb(row) : null;
  }

  async saveCourse(course: Course): Promise<void> {
    const dbCourse = this.mapCourseToDb(course);
    
    const existing = await databaseService.findOne('courses', 'id = ?', [course.id]);
    if (existing) {
      await databaseService.update('courses', dbCourse, 'id = ?', [course.id]);
    } else {
      await databaseService.insert('courses', dbCourse);
    }

    // Add to sync queue
    await this.addToSyncQueue('course', course.id, 'create', course);
    
    // Update store
    const store = useLearningStore.getState();
    if (existing) {
      store.updateCourse(course.id, course);
    } else {
      store.addCourse(course);
    }
  }

  // Lesson operations
  async getAllLessons(): Promise<Lesson[]> {
    const rows = await databaseService.findMany('lessons', undefined, undefined, 'courseId, order ASC');
    return rows.map(this.mapLessonFromDb);
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const rows = await databaseService.findMany('lessons', 'courseId = ?', [courseId], 'order ASC');
    return rows.map(this.mapLessonFromDb);
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const row = await databaseService.findOne('lessons', 'id = ?', [id]);
    return row ? this.mapLessonFromDb(row) : null;
  }

  async saveLesson(lesson: Lesson): Promise<void> {
    const dbLesson = this.mapLessonToDb(lesson);
    
    const existing = await databaseService.findOne('lessons', 'id = ?', [lesson.id]);
    if (existing) {
      await databaseService.update('lessons', dbLesson, 'id = ?', [lesson.id]);
    } else {
      await databaseService.insert('lessons', dbLesson);
    }

    // Add to sync queue
    await this.addToSyncQueue('lesson', lesson.id, existing ? 'update' : 'create', lesson);
    
    // Update store
    const store = useLearningStore.getState();
    if (existing) {
      store.updateLesson(lesson.id, lesson);
    } else {
      store.addLesson(lesson);
    }
  }

  // Lesson Progress operations
  async getAllLessonProgress(): Promise<LessonProgress[]> {
    const rows = await databaseService.findMany('lesson_progress', 'userId = ?', [this.userId]);
    return rows.map(this.mapLessonProgressFromDb);
  }

  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    const row = await databaseService.findOne('lesson_progress', 'lessonId = ? AND userId = ?', [lessonId, this.userId]);
    return row ? this.mapLessonProgressFromDb(row) : null;
  }

  async saveLessonProgress(progress: LessonProgress): Promise<void> {
    const dbProgress = this.mapLessonProgressToDb(progress);
    
    const existing = await databaseService.findOne('lesson_progress', 'lessonId = ? AND userId = ?', [progress.lessonId, progress.userId]);
    if (existing) {
      await databaseService.update('lesson_progress', dbProgress, 'lessonId = ? AND userId = ?', [progress.lessonId, progress.userId]);
    } else {
      await databaseService.insert('lesson_progress', dbProgress);
    }

    // Add to sync queue
    await this.addToSyncQueue('progress', progress.id, existing ? 'update' : 'create', progress);
    
    // Update store
    const store = useLearningStore.getState();
    store.updateLessonProgress(progress.lessonId, progress.userId, progress);
  }

  // Quiz operations
  async getAllQuizzes(): Promise<Quiz[]> {
    const rows = await databaseService.findMany('quizzes', undefined, undefined, 'courseId, title ASC');
    return rows.map(this.mapQuizFromDb);
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    const rows = await databaseService.findMany('quizzes', 'courseId = ?', [courseId]);
    return rows.map(this.mapQuizFromDb);
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const row = await databaseService.findOne('quizzes', 'id = ?', [id]);
    return row ? this.mapQuizFromDb(row) : null;
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    const dbQuiz = this.mapQuizToDb(quiz);
    
    const existing = await databaseService.findOne('quizzes', 'id = ?', [quiz.id]);
    if (existing) {
      await databaseService.update('quizzes', dbQuiz, 'id = ?', [quiz.id]);
    } else {
      await databaseService.insert('quizzes', dbQuiz);
    }

    // Add to sync queue
    await this.addToSyncQueue('quiz', quiz.id, existing ? 'update' : 'create', quiz);
    
    // Update store
    const store = useLearningStore.getState();
    if (existing) {
      store.updateQuiz(quiz.id, quiz);
    } else {
      store.addQuiz(quiz);
    }
  }

  // Quiz Attempt operations
  async getAllQuizAttempts(): Promise<QuizAttempt[]> {
    const rows = await databaseService.findMany('quiz_attempts', 'userId = ?', [this.userId], 'startedAt DESC');
    return rows.map(this.mapQuizAttemptFromDb);
  }

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    const rows = await databaseService.findMany('quiz_attempts', 'quizId = ? AND userId = ?', [quizId, this.userId], 'startedAt DESC');
    return rows.map(this.mapQuizAttemptFromDb);
  }

  async saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
    const dbAttempt = this.mapQuizAttemptToDb(attempt);
    
    const existing = await databaseService.findOne('quiz_attempts', 'id = ?', [attempt.id]);
    if (existing) {
      await databaseService.update('quiz_attempts', dbAttempt, 'id = ?', [attempt.id]);
    } else {
      await databaseService.insert('quiz_attempts', dbAttempt);
    }

    // Add to sync queue
    await this.addToSyncQueue('quiz', attempt.id, existing ? 'update' : 'create', attempt);
    
    // Update store
    const store = useLearningStore.getState();
    if (existing) {
      store.updateQuizAttempt(attempt.id, attempt);
    } else {
      store.addQuizAttempt(attempt);
    }
  }

  // Timetable operations
  async getAllTimetableEntries(): Promise<TimetableEntry[]> {
    const rows = await databaseService.findMany('timetable', undefined, undefined, 'startTime ASC');
    return rows.map(this.mapTimetableFromDb);
  }

  async getTimetableEntry(id: string): Promise<TimetableEntry | null> {
    const row = await databaseService.findOne('timetable', 'id = ?', [id]);
    return row ? this.mapTimetableFromDb(row) : null;
  }

  async saveTimetableEntry(entry: TimetableEntry): Promise<void> {
    const dbEntry = this.mapTimetableToDb(entry);
    
    const existing = await databaseService.findOne('timetable', 'id = ?', [entry.id]);
    if (existing) {
      await databaseService.update('timetable', dbEntry, 'id = ?', [entry.id]);
    } else {
      await databaseService.insert('timetable', dbEntry);
    }

    // Add to sync queue
    await this.addToSyncQueue('timetable', entry.id, existing ? 'update' : 'create', entry);
    
    // Update store
    const store = useLearningStore.getState();
    if (existing) {
      store.updateTimetableEntry(entry.id, entry);
    } else {
      store.addTimetableEntry(entry);
    }
  }

  async deleteTimetableEntry(id: string): Promise<void> {
    await databaseService.delete('timetable', 'id = ?', [id]);
    
    // Add to sync queue
    await this.addToSyncQueue('timetable', id, 'delete', { id });
    
    // Update store
    const store = useLearningStore.getState();
    store.deleteTimetableEntry(id);
  }

  // Sync operations
  private async addToSyncQueue(entityType: string, entityId: string, action: string, data: any): Promise<void> {
    const syncItem: SyncStatus = {
      id: `sync_${Date.now()}_${Math.random()}`,
      entityType: entityType as any,
      entityId,
      action: action as any,
      data: JSON.stringify(data),
      isSynced: false,
      syncAttempts: 0,
      createdAt: new Date().toISOString()
    };

    await databaseService.insert('sync_status', {
      ...syncItem,
      data: syncItem.data
    });
  }

  // Database mapping functions
  private mapCourseFromDb(row: any): Course {
    return {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      isDownloaded: Boolean(row.isDownloaded)
    };
  }

  private mapCourseToDb(course: Course): any {
    return {
      ...course,
      tags: JSON.stringify(course.tags),
      isDownloaded: course.isDownloaded ? 1 : 0
    };
  }

  private mapLessonFromDb(row: any): Lesson {
    return {
      ...row,
      order: row.orderIndex,
      isDownloaded: Boolean(row.isDownloaded)
    };
  }

  private mapLessonToDb(lesson: Lesson): any {
    return {
      ...lesson,
      orderIndex: lesson.order,
      isDownloaded: lesson.isDownloaded ? 1 : 0
    };
  }

  private mapLessonProgressFromDb(row: any): LessonProgress {
    return {
      ...row,
      isCompleted: Boolean(row.isCompleted)
    };
  }

  private mapLessonProgressToDb(progress: LessonProgress): any {
    return {
      ...progress,
      isCompleted: progress.isCompleted ? 1 : 0
    };
  }

  private mapQuizFromDb(row: any): Quiz {
    return {
      ...row,
      questions: JSON.parse(row.questions),
      isDownloaded: Boolean(row.isDownloaded)
    };
  }

  private mapQuizToDb(quiz: Quiz): any {
    return {
      ...quiz,
      questions: JSON.stringify(quiz.questions),
      isDownloaded: quiz.isDownloaded ? 1 : 0
    };
  }

  private mapQuizAttemptFromDb(row: any): QuizAttempt {
    return {
      ...row,
      answers: JSON.parse(row.answers),
      isCompleted: Boolean(row.isCompleted),
      isPassed: Boolean(row.isPassed)
    };
  }

  private mapQuizAttemptToDb(attempt: QuizAttempt): any {
    return {
      ...attempt,
      answers: JSON.stringify(attempt.answers),
      isCompleted: attempt.isCompleted ? 1 : 0,
      isPassed: attempt.isPassed ? 1 : 0
    };
  }

  private mapTimetableFromDb(row: any): TimetableEntry {
    return {
      ...row,
      isRecurring: Boolean(row.isRecurring)
    };
  }

  private mapTimetableToDb(entry: TimetableEntry): any {
    return {
      ...entry,
      isRecurring: entry.isRecurring ? 1 : 0
    };
  }
}

export const learningService = new LearningService();
