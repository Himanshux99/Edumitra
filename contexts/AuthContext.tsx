import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { studentDataService } from '../services/studentDataService';
import {
  AuthState,
  AuthActions,
  UserProfile,
  SignUpFormData,
  SignInFormData
} from '../types/auth';

// Create the context
interface AuthContextType extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('Auth state changed - user:', user ? 'signed in' : 'signed out');
        if (user) {
          // User is signed in
          const profile = await authService.loadUserProfile(user.uid);

          // Initialize student data if user is a student and doesn't have data yet
          if (profile?.role === 'student') {
            try {
              const studentId = profile.studentData?.studentId || `STU${Date.now()}`;
              await studentDataService.initializeStudentData(user.uid, studentId);
              console.log('Student data initialized for user:', user.uid);
            } catch (error) {
              console.error('Error initializing student data:', error);
            }
          }

          setState({
            user,
            userProfile: profile,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
          console.log('Auth state updated - authenticated');
        } else {
          // User is signed out
          setState({
            user: null,
            userProfile: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
          console.log('Auth state updated - not authenticated');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        }));
      }
    });

    return unsubscribe;
  }, []);

  // Sign in function
  const signIn = async (data: SignInFormData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user, profile } = await authService.signIn(data);
      
      setState({
        user,
        userProfile: profile,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      throw error;
    }
  };

  // Sign up function
  const signUp = async (data: SignUpFormData): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user, profile } = await authService.signUp(data);
      
      setState({
        user,
        userProfile: profile,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }));
      throw error;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      console.log('AuthContext - Starting signOut process');
      console.log('AuthContext - Current auth state before signOut:', { isAuthenticated: state.isAuthenticated, user: !!state.user });

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await authService.signOut();
      console.log('AuthContext - authService.signOut completed');

      // Force state update immediately
      const newState = {
        user: null,
        userProfile: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      };

      setState(newState);
      console.log('AuthContext - State forcefully updated to signed out:', newState);

      // Also trigger a manual check after a short delay
      setTimeout(() => {
        console.log('AuthContext - Checking auth state after timeout...');
        setState(prev => {
          console.log('AuthContext - Current state in timeout:', prev);
          return prev;
        });
      }, 50);

    } catch (error) {
      console.error('AuthContext - SignOut error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await authService.resetPassword(email);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedProfile = await authService.updateUserProfile(data);
      
      setState(prev => ({
        ...prev,
        userProfile: updatedProfile,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      }));
      throw error;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async (): Promise<void> => {
    try {
      if (!state.user) return;
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const profile = await authService.loadUserProfile(state.user.uid);
      
      setState(prev => ({
        ...prev,
        userProfile: profile,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh profile',
      }));
    }
  };

  // Clear error function
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Context value
  const value: AuthContextType = {
    // State
    ...state,
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshUserProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Helper hooks for specific use cases
export function useAuthUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useUserProfile(): UserProfile | null {
  const { userProfile } = useAuth();
  return userProfile;
}

export function useUserRole(): string | null {
  const { userProfile } = useAuth();
  return userProfile?.role || null;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}
