import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  AuthError,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import {
  UserProfile,
  SignUpFormData,
  SignInFormData,
  UserRole,
  AuthErrorCode,
  AuthEvent,
  AuthEventType
} from '../types/auth';

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }
    });
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current user profile
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Sign up new user
  async signUp(data: SignUpFormData): Promise<{ user: User; profile: UserProfile }> {
    try {
      // Validate role
      if (!this.isValidRole(data.role)) {
        throw new Error('Invalid user role');
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Add role-specific data
        ...(data.role === 'student' && { studentData: data.studentData }),
        ...(data.role === 'admin' && { adminData: data.adminData }),
        ...(data.role === 'teacher' && { teacherData: data.teacherData }),
        ...(data.role === 'parent' && { parentData: data.parentData }),
      };

      // Save profile to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Log authentication event
      await this.logAuthEvent('sign_up', user.uid, { role: data.role });

      this.userProfile = userProfile;
      return { user, profile: userProfile };
    } catch (error) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign in user
  async signIn(data: SignInFormData): Promise<{ user: User; profile: UserProfile }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      const profile = await this.loadUserProfile(user.uid);

      if (!profile) {
        throw new Error('User profile not found');
      }

      if (!profile.isActive) {
        throw new Error('Account is disabled');
      }

      // Update last login time
      await this.updateLastLogin(user.uid);

      // Log authentication event
      await this.logAuthEvent('sign_in', user.uid);

      return { user, profile };
    } catch (error) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      const userId = this.currentUser?.uid;
      await signOut(auth);
      
      if (userId) {
        await this.logAuthEvent('sign_out', userId);
      }
      
      this.userProfile = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Log password reset event
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await this.logAuthEvent('password_reset', userId);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user');
      }

      const userId = this.currentUser.uid;
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update in Firestore
      await updateDoc(doc(db, 'users', userId), updatedData);

      // Update local profile
      this.userProfile = { ...this.userProfile!, ...updatedData };

      // Log profile update event
      await this.logAuthEvent('profile_update', userId, { fields: Object.keys(updates) });

      return this.userProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  // Load user profile from Firestore
  async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        this.userProfile = profile;
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Load profile error:', error);
      return null;
    }
  }

  // Update last login time
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  // Log authentication events
  private async logAuthEvent(
    type: AuthEventType,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const event: AuthEvent = {
        type,
        userId,
        timestamp: new Date().toISOString(),
        metadata
      };

      await setDoc(doc(collection(db, 'auth_events')), event);
    } catch (error) {
      console.error('Log auth event error:', error);
    }
  }

  // Validate user role
  private isValidRole(role: string): role is UserRole {
    const validRoles: UserRole[] = ['student', 'admin', 'teacher', 'parent', 'super_admin'];
    return validRoles.includes(role as UserRole);
  }

  // Handle authentication errors
  private handleAuthError(error: AuthError | Error): Error {
    if ('code' in error) {
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/user-not-found':
          return new Error('No account found with this email address');
        case 'auth/wrong-password':
          return new Error('Incorrect password');
        case 'auth/email-already-in-use':
          return new Error('An account with this email already exists');
        case 'auth/weak-password':
          return new Error('Password should be at least 6 characters');
        case 'auth/invalid-email':
          return new Error('Invalid email address');
        case 'auth/user-disabled':
          return new Error('This account has been disabled');
        case 'auth/too-many-requests':
          return new Error('Too many failed attempts. Please try again later');
        case 'auth/network-request-failed':
          return new Error('Network error. Please check your connection');
        default:
          return new Error(authError.message || 'Authentication failed');
      }
    }
    
    return error;
  }

  // Check if user has specific role
  hasRole(role: UserRole): boolean {
    return this.userProfile?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: UserRole[]): boolean {
    return this.userProfile ? roles.includes(this.userProfile.role) : false;
  }

  // Get user's permissions based on role
  getUserPermissions(): string[] {
    if (!this.userProfile) return [];

    switch (this.userProfile.role) {
      case 'super_admin':
        return ['*']; // All permissions
      case 'admin':
        return this.userProfile.adminData?.permissions || [];
      case 'teacher':
        return ['view_students', 'manage_courses', 'grade_assignments'];
      case 'student':
        return ['view_courses', 'submit_assignments', 'view_grades'];
      case 'parent':
        return ['view_child_progress', 'communicate_teachers'];
      default:
        return [];
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
