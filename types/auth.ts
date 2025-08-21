import { User } from 'firebase/auth';

// User roles in the system
export type UserRole = 'student' | 'admin' | 'teacher' | 'parent' | 'super_admin';

// User profile data stored in Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  
  // Role-specific data
  studentData?: StudentData;
  adminData?: AdminData;
  teacherData?: TeacherData;
  parentData?: ParentData;
}

// Student-specific data
export interface StudentData {
  studentId: string;
  grade: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  parentEmail?: string;
  enrollmentDate: string;
  subjects: string[];
  academicYear: string;
}

// Admin/Teacher-specific data
export interface AdminData {
  employeeId: string;
  department: string;
  position: string;
  permissions: string[];
  canManageUsers: boolean;
  canManageCourses: boolean;
  canViewReports: boolean;
}

// Teacher-specific data
export interface TeacherData {
  employeeId: string;
  department: string;
  subjects: string[];
  classes: string[];
  qualifications: string[];
  experience: number; // years
}

// Parent-specific data
export interface ParentData {
  children: string[]; // Array of student UIDs
  relationship: 'father' | 'mother' | 'guardian';
  occupation?: string;
  emergencyContact: string;
}

// Authentication context state
export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Sign up form data
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  
  // Role-specific fields
  studentData?: Partial<StudentData>;
  adminData?: Partial<AdminData>;
  teacherData?: Partial<TeacherData>;
  parentData?: Partial<ParentData>;
}

// Sign in form data
export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password reset form data
export interface PasswordResetFormData {
  email: string;
}

// Form validation errors
export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  general?: string;
}

// Authentication actions
export interface AuthActions {
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}

// Navigation routes based on user role
export interface RoleBasedRoutes {
  student: string;
  admin: string;
  teacher: string;
  parent: string;
  super_admin: string;
}

// Permission system
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Authentication error types
export type AuthErrorCode = 
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/requires-recent-login'
  | 'custom/role-not-authorized'
  | 'custom/profile-creation-failed'
  | 'custom/invalid-role';

// Authentication event types
export type AuthEventType = 
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'password_reset'
  | 'profile_update'
  | 'role_change'
  | 'account_disabled'
  | 'account_enabled';

export interface AuthEvent {
  type: AuthEventType;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
