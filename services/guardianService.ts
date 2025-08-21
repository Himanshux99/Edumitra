import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService } from './database';
import { useGuardianStore } from '../store/guardianStore';
import {
  GuardianProfile,
  GuardianStudentLink,
  StudentPerformanceSummary,
  ConsentRequest,
  GuardianNotification,
  GuardianNotificationSettings,
  ConsentStatus,
  AccessLevel,
  ConsentPermission,
  GuardianRelationship
} from '../types/guardian';

class GuardianService {
  private guardianId: string = 'default_guardian'; // This should come from auth service

  async initialize(): Promise<void> {
    await this.loadAllGuardianData();
    await this.setupNotificationListeners();
  }

  // Load all guardian data from local storage
  async loadAllGuardianData(): Promise<void> {
    const store = useGuardianStore.getState();
    store.setLoading(true);

    try {
      // Load guardian profile
      const guardianProfile = await this.getLocalGuardianProfile();
      store.setCurrentGuardian(guardianProfile);

      // Load linked students
      const linkedStudents = await this.getLocalLinkedStudents();
      store.setLinkedStudents(linkedStudents);

      // Load student performance data
      for (const student of linkedStudents) {
        if (student.consentStatus === 'granted') {
          const performance = await this.getLocalStudentPerformance(student.studentId);
          if (performance) {
            store.setStudentPerformance(student.studentId, performance);
          }
        }
      }

      // Load consent requests
      const consentRequests = await this.getLocalConsentRequests();
      store.setConsentRequests(consentRequests);

      // Load notifications
      const notifications = await this.getLocalNotifications();
      store.setNotifications(notifications);

      // Load notification settings
      const notificationSettings = await this.getLocalNotificationSettings();
      store.setNotificationSettings(notificationSettings);

      store.setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load guardian data:', error);
      store.setError('Failed to load guardian data');
    } finally {
      store.setLoading(false);
    }
  }

  // Guardian Profile Management
  async createGuardianProfile(profileData: Partial<GuardianProfile>): Promise<GuardianProfile> {
    const profile: GuardianProfile = {
      id: this.generateId('guardian'),
      userId: this.guardianId,
      name: profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      relationship: profileData.relationship || 'guardian',
      isVerified: false,
      isActive: true,
      preferredLanguage: 'en',
      timezone: 'UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      students: [],
      notificationSettings: this.createDefaultNotificationSettings()
    };

    // Save locally
    await this.saveGuardianProfileLocally(profile);

    // Update store
    const store = useGuardianStore.getState();
    store.setCurrentGuardian(profile);

    return profile;
  }

  async updateGuardianProfile(updates: Partial<GuardianProfile>): Promise<void> {
    await this.updateGuardianProfileLocally(updates);
    
    const store = useGuardianStore.getState();
    store.updateGuardianProfile(updates);
  }

  // Student Link Management
  async requestStudentAccess(
    studentEmail: string, 
    relationship: GuardianRelationship,
    accessLevel: AccessLevel,
    permissions: ConsentPermission[]
  ): Promise<ConsentRequest> {
    const request: ConsentRequest = {
      id: this.generateId('consent_request'),
      studentId: 'student_' + studentEmail.split('@')[0], // Mock student ID
      guardianId: this.guardianId,
      requestedBy: 'guardian',
      accessLevel,
      permissions,
      message: `Request for ${accessLevel} access to monitor academic progress`,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      respondedAt: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      metadata: {
        ipAddress: '192.168.1.1',
        userAgent: 'Edumitra Mobile App',
        deviceInfo: {
          platform: 'mobile',
          version: '1.0.0',
          model: 'smartphone'
        }
      }
    };

    // Save locally
    await this.saveConsentRequestLocally(request);

    // Update store
    const store = useGuardianStore.getState();
    store.addConsentRequest(request);

    return request;
  }

  async approveConsentRequest(requestId: string, permissions: ConsentPermission[]): Promise<void> {
    const store = useGuardianStore.getState();
    const request = store.consentRequests.find(r => r.id === requestId);
    
    if (!request) {
      throw new Error('Consent request not found');
    }

    // Create student link
    const studentLink: GuardianStudentLink = {
      id: this.generateId('student_link'),
      guardianId: this.guardianId,
      studentId: request.studentId,
      studentName: 'Student Name', // This would come from student data
      studentEmail: 'student@example.com',
      relationship: 'guardian',
      consentStatus: 'granted',
      accessLevel: request.accessLevel,
      linkedAt: new Date().toISOString(),
      consentGivenAt: new Date().toISOString(),
      consentExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      isActive: true
    };

    // Save locally
    await this.saveStudentLinkLocally(studentLink);
    await this.updateConsentRequestLocally(requestId, { 
      status: 'granted', 
      permissions,
      respondedAt: new Date().toISOString() 
    });

    // Update store
    store.approveConsent(requestId, permissions);
    store.addStudentLink(studentLink);

    // Load student performance data
    await this.loadStudentPerformanceData(request.studentId);
  }

  async revokeStudentAccess(linkId: string): Promise<void> {
    await this.updateStudentLinkLocally(linkId, { 
      consentStatus: 'revoked',
      isActive: false 
    });

    const store = useGuardianStore.getState();
    store.revokeConsent(linkId);
  }

  // Student Performance Data
  async loadStudentPerformanceData(studentId: string): Promise<void> {
    try {
      const performance = await this.fetchStudentPerformance(studentId);
      await this.saveStudentPerformanceLocally(studentId, performance);

      const store = useGuardianStore.getState();
      store.setStudentPerformance(studentId, performance);
    } catch (error) {
      console.error('Failed to load student performance:', error);
    }
  }

  private async fetchStudentPerformance(studentId: string): Promise<StudentPerformanceSummary> {
    // Mock implementation - replace with actual API calls
    return {
      studentId,
      studentName: 'John Doe',
      academicYear: '2024-2025',
      semester: 'Fall 2024',
      lastUpdated: new Date().toISOString(),
      
      overallGrade: 'A-',
      gpa: 3.7,
      cgpa: 3.6,
      rank: 15,
      totalStudents: 120,
      
      subjects: [
        {
          subjectId: 'cs101',
          subjectName: 'Introduction to Computer Science',
          subjectCode: 'CS101',
          instructor: 'Dr. Smith',
          currentGrade: 'A',
          percentage: 88,
          credits: 3,
          recentTests: [
            {
              id: 'test1',
              name: 'Midterm Exam',
              type: 'midterm',
              score: 85,
              maxScore: 100,
              percentage: 85,
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              feedback: 'Good understanding of concepts'
            }
          ],
          assignments: [
            {
              id: 'assign1',
              title: 'Programming Assignment 1',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              submittedAt: null,
              status: 'submitted',
              score: 90,
              maxScore: 100,
              feedback: 'Excellent work'
            }
          ],
          trend: 'improving',
          trendPercentage: 5,
          attendancePercentage: 95,
          classesAttended: 19,
          totalClasses: 20
        }
      ],
      
      attendanceSummary: {
        overallPercentage: 92,
        totalDays: 50,
        presentDays: 46,
        absentDays: 4,
        lateDays: 2,
        excusedAbsences: 1,
        monthlyAttendance: [
          {
            month: 'September',
            year: 2024,
            percentage: 95,
            presentDays: 19,
            totalDays: 20
          },
          {
            month: 'October',
            year: 2024,
            percentage: 90,
            presentDays: 27,
            totalDays: 30
          }
        ],
        recentAttendance: [
          {
            date: new Date().toISOString().split('T')[0],
            status: 'present',
            periods: [
              {
                period: 1,
                subject: 'Computer Science',
                status: 'present',
                teacher: 'Dr. Smith'
              }
            ]
          }
        ],
        alerts: []
      },
      
      assignmentsSummary: {
        totalAssignments: 15,
        completedAssignments: 12,
        pendingAssignments: 2,
        overdueAssignments: 1,
        averageScore: 85,
        upcomingAssignments: [
          {
            id: 'upcoming1',
            title: 'Final Project',
            subject: 'Computer Science',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high',
            estimatedHours: 20,
            description: 'Comprehensive programming project'
          }
        ],
        recentSubmissions: []
      },
      
      behaviorSummary: {
        overallRating: 'excellent',
        punctuality: 5,
        participation: 4,
        cooperation: 5,
        responsibility: 4,
        incidents: [],
        recognitions: [
          {
            id: 'recognition1',
            type: 'academic',
            title: 'Outstanding Performance',
            description: 'Excellent work in Computer Science',
            date: new Date().toISOString(),
            awardedBy: 'Dr. Smith'
          }
        ],
        teacherComments: []
      },
      
      achievements: [
        {
          id: 'achievement1',
          title: 'Dean\'s List',
          description: 'Academic excellence in Fall 2024',
          category: 'academic',
          level: 'school',
          date: new Date().toISOString()
        }
      ],
      
      concerns: [],
      
      recommendations: [
        'Continue excellent work in Computer Science',
        'Consider participating in programming competitions'
      ]
    };
  }

  // Notification Management
  async sendNotification(
    studentId: string,
    type: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const notification: GuardianNotification = {
      id: this.generateId('notification'),
      guardianId: this.guardianId,
      studentId,
      type: type as any,
      priority,
      title,
      message,
      data: {},
      channels: ['inApp', 'push'],
      isRead: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      readAt: null,
      actionRequired: false
    };

    // Save locally
    await this.saveNotificationLocally(notification);

    // Update store
    const store = useGuardianStore.getState();
    store.addNotification(notification);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.updateNotificationLocally(notificationId, { 
      isRead: true, 
      readAt: new Date().toISOString() 
    });

    const store = useGuardianStore.getState();
    store.markNotificationAsRead(notificationId);
  }

  // Notification Settings
  private createDefaultNotificationSettings(): GuardianNotificationSettings {
    return {
      id: this.generateId('notification_settings'),
      guardianId: this.guardianId,
      email: true,
      sms: false,
      push: true,
      inApp: true,
      academicAlerts: {
        enabled: true,
        channels: ['email', 'push', 'inApp'],
        threshold: 'important',
        customRules: []
      },
      attendanceAlerts: {
        enabled: true,
        channels: ['email', 'push', 'inApp'],
        threshold: 'all',
        customRules: []
      },
      behaviorAlerts: {
        enabled: true,
        channels: ['email', 'push', 'inApp'],
        threshold: 'all',
        customRules: []
      },
      assignmentReminders: {
        enabled: true,
        channels: ['push', 'inApp'],
        threshold: 'important',
        customRules: []
      },
      gradeUpdates: {
        enabled: true,
        channels: ['email', 'inApp'],
        threshold: 'all',
        customRules: []
      },
      schoolAnnouncements: {
        enabled: true,
        channels: ['inApp'],
        threshold: 'important',
        customRules: []
      },
      emergencyAlerts: {
        enabled: true,
        channels: ['email', 'sms', 'push', 'inApp'],
        threshold: 'all',
        customRules: []
      },
      feeReminders: {
        enabled: true,
        channels: ['email', 'inApp'],
        threshold: 'all',
        customRules: []
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '07:00',
        timezone: 'UTC',
        exceptions: ['emergency', 'critical']
      },
      frequency: 'immediate',
      language: 'en',
      timezone: 'UTC',
      digestFormat: 'daily',
      updatedAt: new Date().toISOString()
    };
  }

  async updateNotificationSettings(updates: Partial<GuardianNotificationSettings>): Promise<void> {
    await this.updateNotificationSettingsLocally(updates);

    const store = useGuardianStore.getState();
    store.updateNotificationSettings(updates);
  }

  // Setup notification listeners
  private async setupNotificationListeners(): Promise<void> {
    // This would set up real-time notification listeners
    // For now, we'll simulate periodic checks
    setInterval(() => {
      this.checkForNewNotifications();
    }, 30000); // Check every 30 seconds
  }

  private async checkForNewNotifications(): Promise<void> {
    // Mock implementation - would check server for new notifications
    // For demo purposes, we'll occasionally add a sample notification
    if (Math.random() < 0.1) { // 10% chance every 30 seconds
      const store = useGuardianStore.getState();
      const activeStudents = store.getActiveConsents();
      
      if (activeStudents.length > 0) {
        const randomStudent = activeStudents[Math.floor(Math.random() * activeStudents.length)];
        await this.sendNotification(
          randomStudent.studentId,
          'grade_update',
          'New Grade Posted',
          `A new grade has been posted for ${randomStudent.studentName} in Computer Science.`,
          'medium'
        );
      }
    }
  }

  // Utility Methods
  generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Local Storage Methods
  private async getLocalGuardianProfile(): Promise<GuardianProfile | null> {
    try {
      const profile = await AsyncStorage.getItem(`guardian_profile_${this.guardianId}`);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error loading guardian profile:', error);
      return null;
    }
  }

  private async saveGuardianProfileLocally(profile: GuardianProfile): Promise<void> {
    await AsyncStorage.setItem(`guardian_profile_${this.guardianId}`, JSON.stringify(profile));
  }

  private async updateGuardianProfileLocally(updates: Partial<GuardianProfile>): Promise<void> {
    const profile = await this.getLocalGuardianProfile();
    if (profile) {
      const updatedProfile = { ...profile, ...updates, updatedAt: new Date().toISOString() };
      await this.saveGuardianProfileLocally(updatedProfile);
    }
  }

  private async getLocalLinkedStudents(): Promise<GuardianStudentLink[]> {
    try {
      const rows = await databaseService.findMany('guardian_student_links', 'guardianId = ?', [this.guardianId]);
      return rows.map(this.mapStudentLinkFromDb);
    } catch (error) {
      console.error('Error loading linked students:', error);
      return [];
    }
  }

  private async saveStudentLinkLocally(link: GuardianStudentLink): Promise<void> {
    const dbLink = this.mapStudentLinkToDb(link);
    await databaseService.insert('guardian_student_links', dbLink);
  }

  private async updateStudentLinkLocally(linkId: string, updates: Partial<GuardianStudentLink>): Promise<void> {
    await databaseService.update('guardian_student_links', updates, 'id = ?', [linkId]);
  }

  private async getLocalConsentRequests(): Promise<ConsentRequest[]> {
    try {
      const rows = await databaseService.findMany('consent_requests', 'guardianId = ?', [this.guardianId]);
      return rows.map(this.mapConsentRequestFromDb);
    } catch (error) {
      console.error('Error loading consent requests:', error);
      return [];
    }
  }

  private async saveConsentRequestLocally(request: ConsentRequest): Promise<void> {
    const dbRequest = this.mapConsentRequestToDb(request);
    await databaseService.insert('consent_requests', dbRequest);
  }

  private async updateConsentRequestLocally(requestId: string, updates: Partial<ConsentRequest>): Promise<void> {
    await databaseService.update('consent_requests', updates, 'id = ?', [requestId]);
  }

  private async getLocalStudentPerformance(studentId: string): Promise<StudentPerformanceSummary | null> {
    try {
      const performance = await AsyncStorage.getItem(`student_performance_${studentId}`);
      return performance ? JSON.parse(performance) : null;
    } catch (error) {
      console.error('Error loading student performance:', error);
      return null;
    }
  }

  private async saveStudentPerformanceLocally(studentId: string, performance: StudentPerformanceSummary): Promise<void> {
    await AsyncStorage.setItem(`student_performance_${studentId}`, JSON.stringify(performance));
  }

  private async getLocalNotifications(): Promise<GuardianNotification[]> {
    try {
      const rows = await databaseService.findMany('guardian_notifications', 'guardianId = ?', [this.guardianId], 'createdAt DESC');
      return rows.map(this.mapNotificationFromDb);
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  private async saveNotificationLocally(notification: GuardianNotification): Promise<void> {
    const dbNotification = this.mapNotificationToDb(notification);
    await databaseService.insert('guardian_notifications', dbNotification);
  }

  private async updateNotificationLocally(notificationId: string, updates: Partial<GuardianNotification>): Promise<void> {
    await databaseService.update('guardian_notifications', updates, 'id = ?', [notificationId]);
  }

  private async getLocalNotificationSettings(): Promise<GuardianNotificationSettings | null> {
    try {
      const settings = await AsyncStorage.getItem(`notification_settings_${this.guardianId}`);
      return settings ? JSON.parse(settings) : this.createDefaultNotificationSettings();
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.createDefaultNotificationSettings();
    }
  }

  private async updateNotificationSettingsLocally(updates: Partial<GuardianNotificationSettings>): Promise<void> {
    const settings = await this.getLocalNotificationSettings();
    if (settings) {
      const updatedSettings = { ...settings, ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(`notification_settings_${this.guardianId}`, JSON.stringify(updatedSettings));
    }
  }

  // Data mapping methods
  private mapStudentLinkFromDb(row: any): GuardianStudentLink {
    return {
      ...row,
      isActive: Boolean(row.isActive)
    };
  }

  private mapStudentLinkToDb(link: GuardianStudentLink): any {
    return {
      ...link,
      isActive: link.isActive ? 1 : 0
    };
  }

  private mapConsentRequestFromDb(row: any): ConsentRequest {
    return {
      ...row,
      permissions: JSON.parse(row.permissions || '[]'),
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  private mapConsentRequestToDb(request: ConsentRequest): any {
    return {
      ...request,
      permissions: JSON.stringify(request.permissions),
      metadata: JSON.stringify(request.metadata)
    };
  }

  private mapNotificationFromDb(row: any): GuardianNotification {
    return {
      ...row,
      data: JSON.parse(row.data || '{}'),
      channels: JSON.parse(row.channels || '[]'),
      isRead: Boolean(row.isRead),
      isArchived: Boolean(row.isArchived),
      actionRequired: Boolean(row.actionRequired)
    };
  }

  private mapNotificationToDb(notification: GuardianNotification): any {
    return {
      ...notification,
      data: JSON.stringify(notification.data),
      channels: JSON.stringify(notification.channels),
      isRead: notification.isRead ? 1 : 0,
      isArchived: notification.isArchived ? 1 : 0,
      actionRequired: notification.actionRequired ? 1 : 0
    };
  }
}

export const guardianService = new GuardianService();
