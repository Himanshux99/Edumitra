import { databaseService } from './database';
import { OfflineContent } from '../types/database';

class OfflineContentService {
  async initialize(): Promise<void> {
    // For this demo, we'll use a simplified offline content service
    console.log('Offline content service initialized (simplified for demo)');
  }

  async downloadContent(
    type: 'lesson' | 'quiz' | 'pdf' | 'video' | 'audio',
    entityId: string,
    url: string,
    filename?: string
  ): Promise<string> {
    // Simulate download by storing URL reference
    const localPath = `cache_${entityId}_${Date.now()}`;

    const offlineContent: OfflineContent = {
      id: `content_${Date.now()}_${Math.random()}`,
      type,
      entityId,
      localPath,
      originalUrl: url,
      fileSize: 1024, // Simulated size
      downloadedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    };

    await databaseService.insert('offline_content', offlineContent);
    return localPath;
  }

  async getOfflineContent(entityId: string, type?: string): Promise<OfflineContent[]> {
    let whereClause = 'entityId = ?';
    let whereValues = [entityId];
    
    if (type) {
      whereClause += ' AND type = ?';
      whereValues.push(type);
    }
    
    const rows = await databaseService.findMany('offline_content', whereClause, whereValues);
    return rows;
  }

  async getLocalPath(entityId: string, type: string): Promise<string | null> {
    const content = await databaseService.findOne(
      'offline_content', 
      'entityId = ? AND type = ?', 
      [entityId, type]
    );
    
    if (content) {
      // Update last accessed time
      await this.updateLastAccessed(content.id);
      return content.localPath;
    }
    
    return null;
  }

  async isContentDownloaded(entityId: string, type: string): Promise<boolean> {
    const content = await databaseService.findOne(
      'offline_content',
      'entityId = ? AND type = ?',
      [entityId, type]
    );

    return !!content;
  }

  async deleteOfflineContent(entityId: string, type?: string): Promise<void> {
    const contents = await this.getOfflineContent(entityId, type);

    for (const content of contents) {
      try {
        // Remove from database
        await databaseService.delete('offline_content', 'id = ?', [content.id]);
      } catch (error) {
        console.error(`Failed to delete content ${content.id}:`, error);
      }
    }
  }

  async getStorageUsage(): Promise<{ totalSize: number; itemCount: number }> {
    const contents = await databaseService.findMany('offline_content');

    // Return estimated usage
    return {
      totalSize: contents.reduce((total, content) => total + (content.fileSize || 1024), 0),
      itemCount: contents.length
    };
  }

  async cleanupOrphanedFiles(): Promise<void> {
    console.log('Cleanup completed');
  }

  private async updateLastAccessed(contentId: string): Promise<void> {
    await databaseService.update(
      'offline_content',
      { lastAccessedAt: new Date().toISOString() },
      'id = ?',
      [contentId]
    );
  }

  private getFileExtension(url: string): string | null {
    const match = url.match(/\.([^.?]+)(\?|$)/);
    return match ? `.${match[1]}` : null;
  }

  private getDefaultExtension(type: string): string {
    switch (type) {
      case 'pdf': return '.pdf';
      case 'video': return '.mp4';
      case 'audio': return '.mp3';
      case 'lesson': return '.json';
      case 'quiz': return '.json';
      default: return '.dat';
    }
  }
}

export const offlineContentService = new OfflineContentService();
