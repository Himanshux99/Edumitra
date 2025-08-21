import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

// Define role-based routes
const ROLE_ROUTES: Record<UserRole, string> = {
  student: '/(drawer)/',
  teacher: '/(drawer)/dashboard', // Teachers go to dashboard
  admin: '/(drawer)/dashboard',   // Admins go to dashboard
  parent: '/(drawer)/dashboard',  // Parents go to dashboard
  super_admin: '/(drawer)/dashboard', // Super admins go to dashboard
};

// Define role-based permissions for routes
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  student: [
    '/(drawer)/',
    '/(drawer)/lessons',
    '/(drawer)/quizzes',
    '/(drawer)/timetable',
    '/(drawer)/notifications',
    '/(drawer)/content',
  ],
  teacher: [
    '/(drawer)/',
    '/(drawer)/dashboard',
    '/(drawer)/lessons',
    '/(drawer)/quizzes',
    '/(drawer)/timetable',
    '/(drawer)/notifications',
    '/(drawer)/content',
  ],
  admin: [
    '/(drawer)/',
    '/(drawer)/dashboard',
    '/(drawer)/lessons',
    '/(drawer)/quizzes',
    '/(drawer)/timetable',
    '/(drawer)/notifications',
    '/(drawer)/content',
    '/(drawer)/explore',
  ],
  parent: [
    '/(drawer)/',
    '/(drawer)/dashboard',
    '/(drawer)/notifications',
    '/(drawer)/content',
  ],
  super_admin: ['*'], // Access to all routes
};

interface RoleBasedNavigationProps {
  children: React.ReactNode;
}

export default function RoleBasedNavigation({ children }: RoleBasedNavigationProps) {
  const { isAuthenticated, userProfile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to sign in if not authenticated
        router.replace('/auth/signin');
      } else if (userProfile) {
        // Navigate to role-based route
        const defaultRoute = ROLE_ROUTES[userProfile.role];
        if (defaultRoute) {
          router.replace(defaultRoute as any);
        }
      }
    }
  }, [isAuthenticated, userProfile, isLoading]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show children if authenticated
  if (isAuthenticated && userProfile) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

// Hook to check if user has access to a specific route
export function useRouteAccess() {
  const { userProfile } = useAuth();

  const hasAccess = (route: string): boolean => {
    if (!userProfile) return false;

    const permissions = ROLE_PERMISSIONS[userProfile.role];
    
    // Super admin has access to everything
    if (permissions.includes('*')) return true;
    
    // Check if route is in allowed permissions
    return permissions.includes(route);
  };

  const getDefaultRoute = (): string => {
    if (!userProfile) return '/auth/signin';
    return ROLE_ROUTES[userProfile.role];
  };

  const getAllowedRoutes = (): string[] => {
    if (!userProfile) return [];
    return ROLE_PERMISSIONS[userProfile.role];
  };

  return {
    hasAccess,
    getDefaultRoute,
    getAllowedRoutes,
    userRole: userProfile?.role || null,
  };
}

// Higher-order component for route protection
export function withRoleProtection<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles: UserRole[]
) {
  return function ProtectedComponent(props: T) {
    const { userProfile, isAuthenticated, isLoading } = useAuth();

    // Show loading while checking authentication
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace('/auth/signin');
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    // Check role access
    if (!userProfile || !allowedRoles.includes(userProfile.role)) {
      router.replace('/(drawer)/'); // Redirect to home
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    return <Component {...props} />;
  };
}

// Component for role-based content rendering
interface RoleBasedContentProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleBasedContent({ roles, children, fallback = null }: RoleBasedContentProps) {
  const { userProfile } = useAuth();

  if (!userProfile || !roles.includes(userProfile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for role-based features
export function useRoleFeatures() {
  const { userProfile } = useAuth();

  const canManageUsers = (): boolean => {
    if (!userProfile) return false;
    return ['admin', 'super_admin'].includes(userProfile.role);
  };

  const canManageCourses = (): boolean => {
    if (!userProfile) return false;
    return ['admin', 'teacher', 'super_admin'].includes(userProfile.role);
  };

  const canViewReports = (): boolean => {
    if (!userProfile) return false;
    return ['admin', 'teacher', 'super_admin'].includes(userProfile.role);
  };

  const canGradeAssignments = (): boolean => {
    if (!userProfile) return false;
    return ['teacher', 'admin', 'super_admin'].includes(userProfile.role);
  };

  const canViewStudentProgress = (): boolean => {
    if (!userProfile) return false;
    return ['teacher', 'admin', 'parent', 'super_admin'].includes(userProfile.role);
  };

  const canSubmitAssignments = (): boolean => {
    if (!userProfile) return false;
    return userProfile.role === 'student';
  };

  const canCommunicateWithTeachers = (): boolean => {
    if (!userProfile) return false;
    return ['student', 'parent'].includes(userProfile.role);
  };

  return {
    canManageUsers,
    canManageCourses,
    canViewReports,
    canGradeAssignments,
    canViewStudentProgress,
    canSubmitAssignments,
    canCommunicateWithTeachers,
    userRole: userProfile?.role || null,
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
