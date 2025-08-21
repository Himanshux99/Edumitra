import { databaseService } from './database';
import { learningService } from './learningService';
import { offlineContentService } from './offlineContentService';
import { syncService } from './syncService';
import { notificationService, smartNudgeEngine } from './notificationService';

class AppInitializer {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing EduMitra app...');

      // Initialize database
      console.log('Initializing database...');
      await databaseService.initialize();

      // Initialize offline content service
      console.log('Initializing offline content service...');
      await offlineContentService.initialize();

      // Initialize learning service (loads data from DB to store)
      console.log('Initializing learning service...');
      await learningService.initialize();

      // Initialize sync service (sets up network monitoring)
      console.log('Initializing sync service...');
      await syncService.initialize();

      // Initialize notification service
      console.log('Initializing notification service...');
      await notificationService.initialize();

      // Initialize smart nudge engine
      console.log('Initializing smart nudge engine...');
      await smartNudgeEngine.initialize();

      // Check if this is first run and download initial content
      await this.handleFirstRun();

      this.isInitialized = true;
      console.log('EduMitra app initialized successfully');

    } catch (error) {
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  private async handleFirstRun(): Promise<void> {
    try {
      // Check if we have any courses in the database
      const courses = await databaseService.findMany('courses');
      
      if (courses.length === 0) {
        console.log('First run detected, downloading initial content...');
        
        // Only download if we're online
        if (syncService.getConnectionStatus()) {
          await syncService.downloadFromServer();
        } else {
          console.log('Offline - will download content when connection is available');
        }
      }
    } catch (error) {
      console.error('Failed to handle first run:', error);
      // Don't throw here - app should still work even if initial download fails
    }
  }

  async cleanup(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('Cleaning up app services...');

      // Cleanup sync service
      syncService.destroy();

      // Close database connection
      await databaseService.close();

      // Cleanup orphaned files
      await offlineContentService.cleanupOrphanedFiles();

      this.isInitialized = false;
      console.log('App cleanup completed');

    } catch (error) {
      console.error('Failed to cleanup app:', error);
    }
  }

  isAppInitialized(): boolean {
    return this.isInitialized;
  }
}

export const appInitializer = new AppInitializer();
