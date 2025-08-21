import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Lesson,
  LessonProgress,
  Quiz,
  QuizAttempt,
  TimetableEntry,
  Course,
  SyncStatus,
  OfflineContent
} from '../types/database';

class DatabaseService {
  private storage: Map<string, any[]> = new Map();

  async initialize(): Promise<void> {
    try {
      // Initialize AsyncStorage-based storage for all platforms
      await this.initializeStorage();
      console.log('Database storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async initializeStorage(): Promise<void> {
    // Initialize empty tables in memory
    const tables = [
      'courses', 'lessons', 'lesson_progress', 'quizzes',
      'quiz_attempts', 'timetable', 'sync_status', 'offline_content'
    ];

    for (const table of tables) {
      try {
        const stored = await AsyncStorage.getItem(`edumitra_${table}`);
        this.storage.set(table, stored ? JSON.parse(stored) : []);
      } catch (error) {
        console.warn(`Failed to load ${table} from storage:`, error);
        this.storage.set(table, []);
      }
    }
  }

  // No table creation needed for AsyncStorage implementation

  // Generic CRUD operations using AsyncStorage
  async insert(table: string, data: any): Promise<void> {
    const tableData = this.storage.get(table) || [];
    tableData.push(data);
    this.storage.set(table, tableData);
    await AsyncStorage.setItem(`edumitra_${table}`, JSON.stringify(tableData));
  }

  async update(table: string, data: any, whereClause: string, whereValues: any[]): Promise<void> {
    const tableData = this.storage.get(table) || [];
    const updatedData = tableData.map(row => {
      if (this.matchesWhereClause(row, whereClause, whereValues)) {
        return { ...row, ...data };
      }
      return row;
    });
    this.storage.set(table, updatedData);
    await AsyncStorage.setItem(`edumitra_${table}`, JSON.stringify(updatedData));
  }

  async delete(table: string, whereClause: string, whereValues: any[]): Promise<void> {
    const tableData = this.storage.get(table) || [];
    const filteredData = tableData.filter(row =>
      !this.matchesWhereClause(row, whereClause, whereValues)
    );
    this.storage.set(table, filteredData);
    await AsyncStorage.setItem(`edumitra_${table}`, JSON.stringify(filteredData));
  }

  async findOne(table: string, whereClause: string, whereValues: any[]): Promise<any> {
    const tableData = this.storage.get(table) || [];
    return tableData.find(row => this.matchesWhereClause(row, whereClause, whereValues)) || null;
  }

  async findMany(table: string, whereClause?: string, whereValues?: any[], orderBy?: string): Promise<any[]> {
    let tableData = this.storage.get(table) || [];

    if (whereClause && whereValues) {
      tableData = tableData.filter(row => this.matchesWhereClause(row, whereClause, whereValues));
    }

    if (orderBy) {
      // Simple ordering implementation
      const [column, direction] = orderBy.split(' ');
      tableData.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];
        if (direction?.toUpperCase() === 'DESC') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return tableData;
  }

  private matchesWhereClause(row: any, whereClause: string, whereValues: any[]): boolean {
    // Simple implementation for basic where clauses
    // This is a simplified version - in production you'd want a proper SQL parser
    if (whereClause.includes('=')) {
      const [column] = whereClause.split('=')[0].trim().split(' ');
      const value = whereValues[0];
      return row[column] === value;
    }

    if (whereClause.includes('AND')) {
      const conditions = whereClause.split('AND');
      let valueIndex = 0;
      return conditions.every(condition => {
        const [column] = condition.trim().split('=')[0].trim().split(' ');
        const value = whereValues[valueIndex++];
        return row[column] === value;
      });
    }

    return true;
  }

  async close(): Promise<void> {
    // Save all data to AsyncStorage before closing
    for (const [table, data] of this.storage.entries()) {
      await AsyncStorage.setItem(`edumitra_${table}`, JSON.stringify(data));
    }
    this.storage.clear();
  }
}

export const databaseService = new DatabaseService();
