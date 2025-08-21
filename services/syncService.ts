import NetInfo from '@react-native-community/netinfo';
import { databaseService } from './database';
import { learningService } from './learningService';
import { useLearningStore } from '../store/learningStore';
import { SyncStatus } from '../types/database';

class SyncService {
  private isOnline: boolean = false;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    // Monitor network connectivity
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      const store = useLearningStore.getState();
      store.setOfflineStatus(!this.isOnline);
      
      // If we just came online, trigger sync
      if (!wasOnline && this.isOnline) {
        this.syncPendingChanges();
      }
    });

    // Get initial network state
    const netInfo = await NetInfo.fetch();
    this.isOnline = netInfo.isConnected ?? false;
    
    const store = useLearningStore.getState();
    store.setOfflineStatus(!this.isOnline);

    // Set up periodic sync when online
    this.startPeriodicSync();
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges();
      }
    }, 5 * 60 * 1000);
  }

  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    const store = useLearningStore.getState();
    store.setSyncInProgress(true);

    try {
      // Get all pending sync items
      const pendingItems = await databaseService.findMany(
        'sync_status',
        'isSynced = ?',
        [0],
        'createdAt ASC'
      );

      console.log(`Syncing ${pendingItems.length} pending items`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          
          // Mark as synced
          await databaseService.update(
            'sync_status',
            { 
              isSynced: 1,
              lastSyncAttempt: new Date().toISOString()
            },
            'id = ?',
            [item.id]
          );
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment sync attempts
          await databaseService.update(
            'sync_status',
            { 
              syncAttempts: item.syncAttempts + 1,
              lastSyncAttempt: new Date().toISOString()
            },
            'id = ?',
            [item.id]
          );
        }
      }

      // Update last sync time
      store.setLastSyncTime(new Date().toISOString());
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
      store.setSyncInProgress(false);
    }
  }

  private async syncItem(item: SyncStatus): Promise<void> {
    const data = JSON.parse(item.data);
    
    // This is where you would make API calls to your backend
    // For now, we'll just simulate the sync
    console.log(`Syncing ${item.entityType} ${item.entityId} (${item.action})`);
    
    switch (item.entityType) {
      case 'lesson':
        await this.syncLesson(item.action, data);
        break;
      case 'quiz':
        await this.syncQuiz(item.action, data);
        break;
      case 'timetable':
        await this.syncTimetable(item.action, data);
        break;
      case 'progress':
        await this.syncProgress(item.action, data);
        break;
    }
  }

  private async syncLesson(action: string, data: any): Promise<void> {
    // Simulate API call
    await this.simulateApiCall();
    
    switch (action) {
      case 'create':
        console.log('Creating lesson on server:', data.title);
        break;
      case 'update':
        console.log('Updating lesson on server:', data.title);
        break;
      case 'delete':
        console.log('Deleting lesson on server:', data.id);
        break;
    }
  }

  private async syncQuiz(action: string, data: any): Promise<void> {
    // Simulate API call
    await this.simulateApiCall();
    
    switch (action) {
      case 'create':
        console.log('Creating quiz on server:', data.title);
        break;
      case 'update':
        console.log('Updating quiz on server:', data.title);
        break;
      case 'delete':
        console.log('Deleting quiz on server:', data.id);
        break;
    }
  }

  private async syncTimetable(action: string, data: any): Promise<void> {
    // Simulate API call
    await this.simulateApiCall();
    
    switch (action) {
      case 'create':
        console.log('Creating timetable entry on server:', data.title);
        break;
      case 'update':
        console.log('Updating timetable entry on server:', data.title);
        break;
      case 'delete':
        console.log('Deleting timetable entry on server:', data.id);
        break;
    }
  }

  private async syncProgress(action: string, data: any): Promise<void> {
    // Simulate API call
    await this.simulateApiCall();
    
    switch (action) {
      case 'create':
      case 'update':
        console.log('Syncing progress on server:', data.lessonId, data.progressPercentage);
        break;
    }
  }

  private async simulateApiCall(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }
  }

  async downloadFromServer(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot download content while offline');
    }

    const store = useLearningStore.getState();
    store.setLoading(true);

    try {
      // Simulate downloading courses from server
      const mockCourses = await this.getMockCourses();
      
      for (const course of mockCourses) {
        await learningService.saveCourse(course);
      }

      // Simulate downloading lessons
      const mockLessons = await this.getMockLessons();
      
      for (const lesson of mockLessons) {
        await learningService.saveLesson(lesson);
      }

      // Simulate downloading quizzes
      const mockQuizzes = await this.getMockQuizzes();
      
      for (const quiz of mockQuizzes) {
        await learningService.saveQuiz(quiz);
      }

      console.log('Downloaded content from server');
      
    } catch (error) {
      console.error('Failed to download from server:', error);
      throw error;
    } finally {
      store.setLoading(false);
    }
  }

  private async getMockCourses(): Promise<any[]> {
    await this.simulateApiCall();
    
    return [
      {
        id: 'course_1',
        title: 'Introduction to Mathematics',
        description: 'Basic mathematical concepts and operations',
        instructor: 'Dr. Smith',
        totalLessons: 10,
        estimatedDuration: 20,
        difficulty: 'beginner',
        tags: ['math', 'basics'],
        isDownloaded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'course_2',
        title: 'Physics Fundamentals',
        description: 'Introduction to physics principles',
        instructor: 'Prof. Johnson',
        totalLessons: 15,
        estimatedDuration: 30,
        difficulty: 'intermediate',
        tags: ['physics', 'science'],
        isDownloaded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async getMockLessons(): Promise<any[]> {
    await this.simulateApiCall();
    
    return [
      {
        id: 'lesson_1',
        title: 'Basic Arithmetic',
        description: 'Learn addition, subtraction, multiplication, and division',
        content: 'This lesson covers the fundamental arithmetic operations...',
        duration: 30,
        courseId: 'course_1',
        order: 1,
        isDownloaded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'lesson_2',
        title: 'Fractions and Decimals',
        description: 'Understanding fractions and decimal numbers',
        content: 'In this lesson, we will explore fractions and decimals...',
        duration: 45,
        courseId: 'course_1',
        order: 2,
        isDownloaded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async getMockQuizzes(): Promise<any[]> {
    await this.simulateApiCall();
    
    return [
      {
        id: 'quiz_1',
        title: 'Arithmetic Quiz',
        description: 'Test your arithmetic skills',
        courseId: 'course_1',
        lessonId: 'lesson_1',
        questions: [
          {
            id: 'q1',
            question: 'What is 2 + 2?',
            type: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: '2 + 2 equals 4',
            points: 1,
            order: 1
          },
          {
            id: 'q2',
            question: 'What is 10 - 3?',
            type: 'multiple-choice',
            options: ['6', '7', '8', '9'],
            correctAnswer: '7',
            explanation: '10 - 3 equals 7',
            points: 1,
            order: 2
          }
        ],
        timeLimit: 10,
        passingScore: 70,
        isDownloaded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();
