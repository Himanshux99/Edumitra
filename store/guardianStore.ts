import { create } from 'zustand';
import {
  GuardianProfile,
  GuardianStudentLink,
  StudentPerformanceSummary,
  ConsentRequest,
  GuardianNotification,
  GuardianNotificationSettings,
  GuardianState,
  ConsentStatus,
  AccessLevel,
  GuardianNotificationType,
  ConsentPermission
} from '../types/guardian';

interface GuardianActions {
  // Guardian Profile Actions
  setCurrentGuardian: (guardian: GuardianProfile | null) => void;
  updateGuardianProfile: (updates: Partial<GuardianProfile>) => void;
  
  // Student Link Management
  setLinkedStudents: (students: GuardianStudentLink[]) => void;
  addStudentLink: (link: GuardianStudentLink) => void;
  updateStudentLink: (linkId: string, updates: Partial<GuardianStudentLink>) => void;
  removeStudentLink: (linkId: string) => void;
  setSelectedStudent: (student: GuardianStudentLink | null) => void;
  
  // Student Performance Data
  setStudentPerformance: (studentId: string, performance: StudentPerformanceSummary) => void;
  updateStudentPerformance: (studentId: string, updates: Partial<StudentPerformanceSummary>) => void;
  
  // Consent Management
  setConsentRequests: (requests: ConsentRequest[]) => void;
  addConsentRequest: (request: ConsentRequest) => void;
  updateConsentRequest: (requestId: string, updates: Partial<ConsentRequest>) => void;
  approveConsent: (requestId: string, permissions: ConsentPermission[]) => void;
  denyConsent: (requestId: string, reason: string) => void;
  revokeConsent: (linkId: string) => void;
  
  // Notification Management
  setNotifications: (notifications: GuardianNotification[]) => void;
  addNotification: (notification: GuardianNotification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  archiveNotification: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  updateUnreadCount: () => void;
  
  // Notification Settings
  setNotificationSettings: (settings: GuardianNotificationSettings) => void;
  updateNotificationSettings: (updates: Partial<GuardianNotificationSettings>) => void;
  
  // UI State Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLastSyncTime: (time: string) => void;
  setSelectedTimeframe: (timeframe: 'week' | 'month' | 'semester' | 'year') => void;
  setDashboardLayout: (layout: 'compact' | 'detailed') => void;
  
  // Computed Getters
  getStudentById: (studentId: string) => GuardianStudentLink | undefined;
  getStudentPerformance: (studentId: string) => StudentPerformanceSummary | undefined;
  getActiveConsents: () => GuardianStudentLink[];
  getPendingConsentRequests: () => ConsentRequest[];
  getUnreadNotifications: () => GuardianNotification[];
  getNotificationsByType: (type: GuardianNotificationType) => GuardianNotification[];
  getNotificationsByStudent: (studentId: string) => GuardianNotification[];
  getCriticalAlerts: () => GuardianNotification[];
  getStudentsWithConcerns: () => GuardianStudentLink[];
  getOverallStudentSummary: () => {
    totalStudents: number;
    averageGPA: number;
    averageAttendance: number;
    totalConcerns: number;
    totalAchievements: number;
  };
}

export const useGuardianStore = create<GuardianState & GuardianActions>((set, get) => ({
  // Initial State
  currentGuardian: null,
  linkedStudents: [],
  selectedStudent: null,
  studentPerformance: {},
  consentRequests: [],
  activeConsents: [],
  notifications: [],
  unreadCount: 0,
  notificationSettings: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,
  selectedTimeframe: 'month',
  dashboardLayout: 'detailed',

  // Guardian Profile Actions
  setCurrentGuardian: (guardian) => set({ currentGuardian: guardian }),
  
  updateGuardianProfile: (updates) => set((state) => ({
    currentGuardian: state.currentGuardian 
      ? { ...state.currentGuardian, ...updates, updatedAt: new Date().toISOString() }
      : null
  })),

  // Student Link Management
  setLinkedStudents: (students) => set({ linkedStudents: students }),
  
  addStudentLink: (link) => set((state) => ({
    linkedStudents: [...state.linkedStudents, link]
  })),
  
  updateStudentLink: (linkId, updates) => set((state) => ({
    linkedStudents: state.linkedStudents.map(link =>
      link.id === linkId ? { ...link, ...updates } : link
    ),
    selectedStudent: state.selectedStudent?.id === linkId 
      ? { ...state.selectedStudent, ...updates }
      : state.selectedStudent
  })),
  
  removeStudentLink: (linkId) => set((state) => ({
    linkedStudents: state.linkedStudents.filter(link => link.id !== linkId),
    selectedStudent: state.selectedStudent?.id === linkId ? null : state.selectedStudent,
    // Clean up related data
    studentPerformance: Object.fromEntries(
      Object.entries(state.studentPerformance).filter(([studentId]) => {
        const link = state.linkedStudents.find(l => l.studentId === studentId);
        return link && link.id !== linkId;
      })
    ),
    notifications: state.notifications.filter(notification => {
      const link = state.linkedStudents.find(l => l.studentId === notification.studentId);
      return link && link.id !== linkId;
    })
  })),
  
  setSelectedStudent: (student) => set({ selectedStudent: student }),

  // Student Performance Data
  setStudentPerformance: (studentId, performance) => set((state) => ({
    studentPerformance: { ...state.studentPerformance, [studentId]: performance }
  })),
  
  updateStudentPerformance: (studentId, updates) => set((state) => ({
    studentPerformance: {
      ...state.studentPerformance,
      [studentId]: state.studentPerformance[studentId] 
        ? { ...state.studentPerformance[studentId], ...updates, lastUpdated: new Date().toISOString() }
        : undefined
    }
  })),

  // Consent Management
  setConsentRequests: (requests) => set({ consentRequests: requests }),
  
  addConsentRequest: (request) => set((state) => ({
    consentRequests: [request, ...state.consentRequests]
  })),
  
  updateConsentRequest: (requestId, updates) => set((state) => ({
    consentRequests: state.consentRequests.map(request =>
      request.id === requestId 
        ? { ...request, ...updates, respondedAt: new Date().toISOString() }
        : request
    )
  })),
  
  approveConsent: (requestId, permissions) => set((state) => {
    const request = state.consentRequests.find(r => r.id === requestId);
    if (!request) return state;

    const updatedRequests = state.consentRequests.map(r =>
      r.id === requestId 
        ? { 
            ...r, 
            status: 'granted' as ConsentStatus, 
            permissions,
            respondedAt: new Date().toISOString() 
          }
        : r
    );

    const updatedLinks = state.linkedStudents.map(link =>
      link.studentId === request.studentId && link.guardianId === request.guardianId
        ? { 
            ...link, 
            consentStatus: 'granted' as ConsentStatus,
            accessLevel: request.accessLevel,
            consentGivenAt: new Date().toISOString()
          }
        : link
    );

    return {
      consentRequests: updatedRequests,
      linkedStudents: updatedLinks,
      activeConsents: updatedLinks.filter(link => link.consentStatus === 'granted')
    };
  }),
  
  denyConsent: (requestId, reason) => set((state) => ({
    consentRequests: state.consentRequests.map(request =>
      request.id === requestId 
        ? { 
            ...request, 
            status: 'denied' as ConsentStatus, 
            message: reason,
            respondedAt: new Date().toISOString() 
          }
        : request
    )
  })),
  
  revokeConsent: (linkId) => set((state) => ({
    linkedStudents: state.linkedStudents.map(link =>
      link.id === linkId 
        ? { 
            ...link, 
            consentStatus: 'revoked' as ConsentStatus,
            accessLevel: 'emergency_only' as AccessLevel,
            isActive: false
          }
        : link
    ),
    activeConsents: state.activeConsents.filter(consent => consent.id !== linkId)
  })),

  // Notification Management
  setNotifications: (notifications) => {
    set({ notifications });
    get().updateUnreadCount();
  },
  
  addNotification: (notification) => set((state) => {
    const newNotifications = [notification, ...state.notifications];
    return { notifications: newNotifications };
  }),
  
  markNotificationAsRead: (notificationId) => set((state) => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: true, readAt: new Date().toISOString() }
        : notification
    );
    return { notifications: updatedNotifications };
  }),
  
  markAllNotificationsAsRead: () => set((state) => {
    const updatedNotifications = state.notifications.map(notification => ({
      ...notification,
      isRead: true,
      readAt: notification.readAt || new Date().toISOString()
    }));
    return { notifications: updatedNotifications, unreadCount: 0 };
  }),
  
  archiveNotification: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isArchived: true }
        : notification
    )
  })),
  
  deleteNotification: (notificationId) => set((state) => ({
    notifications: state.notifications.filter(notification => notification.id !== notificationId)
  })),
  
  updateUnreadCount: () => set((state) => ({
    unreadCount: state.notifications.filter(notification => !notification.isRead && !notification.isArchived).length
  })),

  // Notification Settings
  setNotificationSettings: (settings) => set({ notificationSettings: settings }),
  
  updateNotificationSettings: (updates) => set((state) => ({
    notificationSettings: state.notificationSettings 
      ? { ...state.notificationSettings, ...updates, updatedAt: new Date().toISOString() }
      : null
  })),

  // UI State Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setDashboardLayout: (layout) => set({ dashboardLayout: layout }),

  // Computed Getters
  getStudentById: (studentId) => {
    return get().linkedStudents.find(student => student.studentId === studentId);
  },
  
  getStudentPerformance: (studentId) => {
    return get().studentPerformance[studentId];
  },
  
  getActiveConsents: () => {
    return get().linkedStudents.filter(link => 
      link.consentStatus === 'granted' && link.isActive
    );
  },
  
  getPendingConsentRequests: () => {
    return get().consentRequests.filter(request => request.status === 'pending');
  },
  
  getUnreadNotifications: () => {
    return get().notifications.filter(notification => !notification.isRead && !notification.isArchived);
  },
  
  getNotificationsByType: (type) => {
    return get().notifications.filter(notification => notification.type === type);
  },
  
  getNotificationsByStudent: (studentId) => {
    return get().notifications.filter(notification => notification.studentId === studentId);
  },
  
  getCriticalAlerts: () => {
    return get().notifications.filter(notification => 
      notification.priority === 'critical' && !notification.isRead
    );
  },
  
  getStudentsWithConcerns: () => {
    const state = get();
    return state.linkedStudents.filter(student => {
      const performance = state.studentPerformance[student.studentId];
      return performance && performance.concerns.length > 0;
    });
  },
  
  getOverallStudentSummary: () => {
    const state = get();
    const activeStudents = state.getActiveConsents();
    
    if (activeStudents.length === 0) {
      return {
        totalStudents: 0,
        averageGPA: 0,
        averageAttendance: 0,
        totalConcerns: 0,
        totalAchievements: 0
      };
    }

    let totalGPA = 0;
    let totalAttendance = 0;
    let totalConcerns = 0;
    let totalAchievements = 0;
    let studentsWithData = 0;

    activeStudents.forEach(student => {
      const performance = state.studentPerformance[student.studentId];
      if (performance) {
        studentsWithData++;
        totalGPA += performance.gpa;
        totalAttendance += performance.attendanceSummary.overallPercentage;
        totalConcerns += performance.concerns.length;
        totalAchievements += performance.achievements.length;
      }
    });

    return {
      totalStudents: activeStudents.length,
      averageGPA: studentsWithData > 0 ? totalGPA / studentsWithData : 0,
      averageAttendance: studentsWithData > 0 ? totalAttendance / studentsWithData : 0,
      totalConcerns,
      totalAchievements
    };
  }
}));

// Selector hooks for better performance
export const useCurrentGuardian = () => useGuardianStore(state => state.currentGuardian);
export const useLinkedStudents = () => useGuardianStore(state => state.linkedStudents);
export const useSelectedStudent = () => useGuardianStore(state => state.selectedStudent);
export const useActiveConsents = () => useGuardianStore(state => state.getActiveConsents());
export const usePendingConsentRequests = () => useGuardianStore(state => state.getPendingConsentRequests());
export const useUnreadNotifications = () => useGuardianStore(state => state.getUnreadNotifications());
export const useUnreadCount = () => useGuardianStore(state => state.unreadCount);
export const useCriticalAlerts = () => useGuardianStore(state => state.getCriticalAlerts());
export const useStudentsWithConcerns = () => useGuardianStore(state => state.getStudentsWithConcerns());
export const useOverallStudentSummary = () => useGuardianStore(state => state.getOverallStudentSummary());
export const useGuardianLoading = () => useGuardianStore(state => state.isLoading);
export const useGuardianError = () => useGuardianStore(state => state.error);
export const useNotificationSettings = () => useGuardianStore(state => state.notificationSettings);
