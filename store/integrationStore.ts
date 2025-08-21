import { create } from 'zustand';
import {
  BaseIntegration,
  LMSCourse,
  LMSAssignment,
  LMSGrade,
  LMSAnnouncement,
  ERPStudentProfile,
  ERPAttendance,
  ERPGrade,
  ERPSchedule,
  ERPFeeRecord,
  CloudStorageFile,
  CloudStorageFolder,
  CloudStorageQuota,
  IntegrationState,
  SyncStatus,
  SyncError,
  IntegrationType,
  IntegrationStatus,
  SyncFrequency
} from '../types/integrations';

interface IntegrationActions {
  // Integration Management
  setIntegrations: (integrations: BaseIntegration[]) => void;
  addIntegration: (integration: BaseIntegration) => void;
  updateIntegration: (integrationId: string, updates: Partial<BaseIntegration>) => void;
  removeIntegration: (integrationId: string) => void;
  setSelectedIntegration: (integration: BaseIntegration | null) => void;
  
  // LMS Data Actions
  setLMSCourses: (courses: LMSCourse[]) => void;
  addLMSCourse: (course: LMSCourse) => void;
  updateLMSCourse: (courseId: string, updates: Partial<LMSCourse>) => void;
  
  setLMSAssignments: (assignments: LMSAssignment[]) => void;
  addLMSAssignment: (assignment: LMSAssignment) => void;
  updateLMSAssignment: (assignmentId: string, updates: Partial<LMSAssignment>) => void;
  
  setLMSGrades: (grades: LMSGrade[]) => void;
  addLMSGrade: (grade: LMSGrade) => void;
  
  setLMSAnnouncements: (announcements: LMSAnnouncement[]) => void;
  addLMSAnnouncement: (announcement: LMSAnnouncement) => void;
  markAnnouncementAsRead: (announcementId: string) => void;
  
  // ERP Data Actions
  setERPProfile: (profile: ERPStudentProfile | null) => void;
  updateERPProfile: (updates: Partial<ERPStudentProfile>) => void;
  
  setERPAttendance: (attendance: ERPAttendance[]) => void;
  addERPAttendance: (attendance: ERPAttendance) => void;
  
  setERPGrades: (grades: ERPGrade[]) => void;
  addERPGrade: (grade: ERPGrade) => void;
  
  setERPSchedule: (schedule: ERPSchedule[]) => void;
  updateERPSchedule: (schedule: ERPSchedule[]) => void;
  
  setERPFees: (fees: ERPFeeRecord[]) => void;
  updateERPFee: (feeId: string, updates: Partial<ERPFeeRecord>) => void;
  
  // Cloud Storage Actions
  setCloudFiles: (files: CloudStorageFile[]) => void;
  addCloudFile: (file: CloudStorageFile) => void;
  updateCloudFile: (fileId: string, updates: Partial<CloudStorageFile>) => void;
  removeCloudFile: (fileId: string) => void;
  
  setCloudFolders: (folders: CloudStorageFolder[]) => void;
  addCloudFolder: (folder: CloudStorageFolder) => void;
  updateCloudFolder: (folderId: string, updates: Partial<CloudStorageFolder>) => void;
  removeCloudFolder: (folderId: string) => void;
  
  setCloudQuota: (quota: CloudStorageQuota | null) => void;
  
  // Sync Management
  setSyncStatus: (integrationId: string, status: SyncStatus) => void;
  updateSyncProgress: (integrationId: string, progress: number, operation: string) => void;
  addSyncError: (integrationId: string, error: SyncError) => void;
  clearSyncErrors: (integrationId: string) => void;
  setLastSyncTime: (time: string) => void;
  
  // UI State Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed Getters
  getIntegrationById: (integrationId: string) => BaseIntegration | undefined;
  getIntegrationsByType: (type: IntegrationType) => BaseIntegration[];
  getActiveIntegrations: () => BaseIntegration[];
  getConnectedIntegrations: () => BaseIntegration[];
  getLMSCoursesByIntegration: (integrationId: string) => LMSCourse[];
  getERPAttendanceByDate: (date: string) => ERPAttendance[];
  getCloudFilesByFolder: (folderId: string | null) => CloudStorageFile[];
  getTotalCloudStorageUsed: () => number;
  getOverdueAssignments: () => LMSAssignment[];
  getUpcomingAssignments: (days: number) => LMSAssignment[];
  getUnreadAnnouncements: () => LMSAnnouncement[];
  getCurrentSemesterGrades: () => ERPGrade[];
  getAttendancePercentage: () => number;
  getPendingFees: () => ERPFeeRecord[];
}

export const useIntegrationStore = create<IntegrationState & IntegrationActions>((set, get) => ({
  // Initial State
  integrations: [],
  activeIntegrations: [],
  lmsCourses: [],
  lmsAssignments: [],
  lmsGrades: [],
  lmsAnnouncements: [],
  erpProfile: null,
  erpAttendance: [],
  erpGrades: [],
  erpSchedule: [],
  erpFees: [],
  cloudFiles: [],
  cloudFolders: [],
  cloudQuota: null,
  syncStatus: {},
  lastSyncTime: null,
  isLoading: false,
  error: null,
  selectedIntegration: null,

  // Integration Management
  setIntegrations: (integrations) => set({ integrations }),
  
  addIntegration: (integration) => set((state) => ({
    integrations: [...state.integrations, integration]
  })),
  
  updateIntegration: (integrationId, updates) => set((state) => ({
    integrations: state.integrations.map(integration =>
      integration.id === integrationId 
        ? { ...integration, ...updates, updatedAt: new Date().toISOString() }
        : integration
    ),
    selectedIntegration: state.selectedIntegration?.id === integrationId
      ? { ...state.selectedIntegration, ...updates, updatedAt: new Date().toISOString() }
      : state.selectedIntegration
  })),
  
  removeIntegration: (integrationId) => set((state) => ({
    integrations: state.integrations.filter(integration => integration.id !== integrationId),
    selectedIntegration: state.selectedIntegration?.id === integrationId ? null : state.selectedIntegration,
    // Clean up related data
    lmsCourses: state.lmsCourses.filter(course => course.integrationId !== integrationId),
    lmsAssignments: state.lmsAssignments.filter(assignment => assignment.integrationId !== integrationId),
    lmsGrades: state.lmsGrades.filter(grade => grade.integrationId !== integrationId),
    lmsAnnouncements: state.lmsAnnouncements.filter(announcement => announcement.integrationId !== integrationId),
    cloudFiles: state.cloudFiles.filter(file => file.integrationId !== integrationId),
    cloudFolders: state.cloudFolders.filter(folder => folder.integrationId !== integrationId)
  })),
  
  setSelectedIntegration: (integration) => set({ selectedIntegration: integration }),

  // LMS Data Actions
  setLMSCourses: (courses) => set({ lmsCourses: courses }),
  
  addLMSCourse: (course) => set((state) => ({
    lmsCourses: [...state.lmsCourses, course]
  })),
  
  updateLMSCourse: (courseId, updates) => set((state) => ({
    lmsCourses: state.lmsCourses.map(course =>
      course.id === courseId ? { ...course, ...updates, syncedAt: new Date().toISOString() } : course
    )
  })),
  
  setLMSAssignments: (assignments) => set({ lmsAssignments: assignments }),
  
  addLMSAssignment: (assignment) => set((state) => ({
    lmsAssignments: [...state.lmsAssignments, assignment]
  })),
  
  updateLMSAssignment: (assignmentId, updates) => set((state) => ({
    lmsAssignments: state.lmsAssignments.map(assignment =>
      assignment.id === assignmentId 
        ? { ...assignment, ...updates, syncedAt: new Date().toISOString() }
        : assignment
    )
  })),
  
  setLMSGrades: (grades) => set({ lmsGrades: grades }),
  
  addLMSGrade: (grade) => set((state) => ({
    lmsGrades: [...state.lmsGrades, grade]
  })),
  
  setLMSAnnouncements: (announcements) => set({ lmsAnnouncements: announcements }),
  
  addLMSAnnouncement: (announcement) => set((state) => ({
    lmsAnnouncements: [announcement, ...state.lmsAnnouncements]
  })),
  
  markAnnouncementAsRead: (announcementId) => set((state) => ({
    lmsAnnouncements: state.lmsAnnouncements.map(announcement =>
      announcement.id === announcementId ? { ...announcement, isRead: true } : announcement
    )
  })),

  // ERP Data Actions
  setERPProfile: (profile) => set({ erpProfile: profile }),
  
  updateERPProfile: (updates) => set((state) => ({
    erpProfile: state.erpProfile 
      ? { ...state.erpProfile, ...updates, syncedAt: new Date().toISOString() }
      : null
  })),
  
  setERPAttendance: (attendance) => set({ erpAttendance: attendance }),
  
  addERPAttendance: (attendance) => set((state) => ({
    erpAttendance: [...state.erpAttendance, attendance]
  })),
  
  setERPGrades: (grades) => set({ erpGrades: grades }),
  
  addERPGrade: (grade) => set((state) => ({
    erpGrades: [...state.erpGrades, grade]
  })),
  
  setERPSchedule: (schedule) => set({ erpSchedule: schedule }),
  
  updateERPSchedule: (schedule) => set({ erpSchedule: schedule }),
  
  setERPFees: (fees) => set({ erpFees: fees }),
  
  updateERPFee: (feeId, updates) => set((state) => ({
    erpFees: state.erpFees.map(fee =>
      fee.id === feeId ? { ...fee, ...updates, syncedAt: new Date().toISOString() } : fee
    )
  })),

  // Cloud Storage Actions
  setCloudFiles: (files) => set({ cloudFiles: files }),
  
  addCloudFile: (file) => set((state) => ({
    cloudFiles: [...state.cloudFiles, file]
  })),
  
  updateCloudFile: (fileId, updates) => set((state) => ({
    cloudFiles: state.cloudFiles.map(file =>
      file.id === fileId ? { ...file, ...updates, syncedAt: new Date().toISOString() } : file
    )
  })),
  
  removeCloudFile: (fileId) => set((state) => ({
    cloudFiles: state.cloudFiles.filter(file => file.id !== fileId)
  })),
  
  setCloudFolders: (folders) => set({ cloudFolders: folders }),
  
  addCloudFolder: (folder) => set((state) => ({
    cloudFolders: [...state.cloudFolders, folder]
  })),
  
  updateCloudFolder: (folderId, updates) => set((state) => ({
    cloudFolders: state.cloudFolders.map(folder =>
      folder.id === folderId ? { ...folder, ...updates, syncedAt: new Date().toISOString() } : folder
    )
  })),
  
  removeCloudFolder: (folderId) => set((state) => ({
    cloudFolders: state.cloudFolders.filter(folder => folder.id !== folderId)
  })),
  
  setCloudQuota: (quota) => set({ cloudQuota: quota }),

  // Sync Management
  setSyncStatus: (integrationId, status) => set((state) => ({
    syncStatus: { ...state.syncStatus, [integrationId]: status }
  })),
  
  updateSyncProgress: (integrationId, progress, operation) => set((state) => ({
    syncStatus: {
      ...state.syncStatus,
      [integrationId]: {
        ...state.syncStatus[integrationId],
        progress,
        currentOperation: operation
      }
    }
  })),
  
  addSyncError: (integrationId, error) => set((state) => {
    const currentStatus = state.syncStatus[integrationId];
    return {
      syncStatus: {
        ...state.syncStatus,
        [integrationId]: {
          ...currentStatus,
          errors: [...(currentStatus?.errors || []), error]
        }
      }
    };
  }),
  
  clearSyncErrors: (integrationId) => set((state) => ({
    syncStatus: {
      ...state.syncStatus,
      [integrationId]: {
        ...state.syncStatus[integrationId],
        errors: []
      }
    }
  })),
  
  setLastSyncTime: (time) => set({ lastSyncTime: time }),

  // UI State Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Computed Getters
  getIntegrationById: (integrationId) => {
    return get().integrations.find(integration => integration.id === integrationId);
  },
  
  getIntegrationsByType: (type) => {
    return get().integrations.filter(integration => integration.type === type);
  },
  
  getActiveIntegrations: () => {
    return get().integrations.filter(integration => integration.isEnabled);
  },
  
  getConnectedIntegrations: () => {
    return get().integrations.filter(integration => integration.status === 'connected');
  },
  
  getLMSCoursesByIntegration: (integrationId) => {
    return get().lmsCourses.filter(course => course.integrationId === integrationId);
  },
  
  getERPAttendanceByDate: (date) => {
    return get().erpAttendance.filter(attendance => attendance.date === date);
  },
  
  getCloudFilesByFolder: (folderId) => {
    return get().cloudFiles.filter(file => file.parentId === folderId);
  },
  
  getTotalCloudStorageUsed: () => {
    return get().cloudFiles.reduce((total, file) => total + file.size, 0);
  },
  
  getOverdueAssignments: () => {
    const now = new Date();
    return get().lmsAssignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate < now && assignment.status !== 'submitted' && assignment.status !== 'graded';
    });
  },
  
  getUpcomingAssignments: (days) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return get().lmsAssignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate >= now && dueDate <= futureDate && assignment.status !== 'submitted' && assignment.status !== 'graded';
    });
  },
  
  getUnreadAnnouncements: () => {
    return get().lmsAnnouncements.filter(announcement => !announcement.isRead);
  },
  
  getCurrentSemesterGrades: () => {
    const currentSemester = get().erpProfile?.semester || 1;
    return get().erpGrades.filter(grade => grade.semester === currentSemester);
  },
  
  getAttendancePercentage: () => {
    const attendance = get().erpAttendance;
    if (attendance.length === 0) return 0;
    
    const totalClasses = attendance.reduce((sum, record) => sum + record.totalClasses, 0);
    const attendedClasses = attendance.reduce((sum, record) => sum + record.attendedClasses, 0);
    
    return totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  },
  
  getPendingFees: () => {
    return get().erpFees.filter(fee => fee.status === 'pending' || fee.status === 'overdue');
  }
}));

// Selector hooks for better performance
export const useIntegrations = () => useIntegrationStore(state => state.integrations);
export const useActiveIntegrations = () => useIntegrationStore(state => state.getActiveIntegrations());
export const useLMSCourses = () => useIntegrationStore(state => state.lmsCourses);
export const useLMSAssignments = () => useIntegrationStore(state => state.lmsAssignments);
export const useERPProfile = () => useIntegrationStore(state => state.erpProfile);
export const useERPAttendance = () => useIntegrationStore(state => state.erpAttendance);
export const useCloudFiles = () => useIntegrationStore(state => state.cloudFiles);
export const useIntegrationLoading = () => useIntegrationStore(state => state.isLoading);
export const useIntegrationError = () => useIntegrationStore(state => state.error);
export const useOverdueAssignments = () => useIntegrationStore(state => state.getOverdueAssignments());
export const useUnreadAnnouncements = () => useIntegrationStore(state => state.getUnreadAnnouncements());
export const useAttendancePercentage = () => useIntegrationStore(state => state.getAttendancePercentage());
export const usePendingFees = () => useIntegrationStore(state => state.getPendingFees());
