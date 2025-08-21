import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, userProfile, isLoading } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    console.log('AuthGuard useEffect triggered - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

    if (isLoading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === 'auth';

    console.log('AuthGuard - isAuthenticated:', isAuthenticated, 'segments:', segments, 'inAuthGroup:', inAuthGroup);

    if (!isAuthenticated) {
      // User is not authenticated
      if (!inAuthGroup) {
        // Redirect to sign in if not in auth group
        console.log('AuthGuard - Redirecting to sign-in');
        router.replace('/auth/signin');
      }
    } else {
      // User is authenticated
      if (inAuthGroup) {
        // Redirect to appropriate dashboard based on role
        if (userProfile) {
          switch (userProfile.role) {
            case 'student':
              router.replace('/(drawer)/');
              break;
            case 'teacher':
            case 'admin':
            case 'parent':
            case 'super_admin':
              router.replace('/(drawer)/dashboard');
              break;
            default:
              router.replace('/(drawer)/');
          }
        } else {
          router.replace('/(drawer)/');
        }
      }
    }
  }, [isAuthenticated, userProfile, isLoading, segments]);

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    logoText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>E</Text>
        </View>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={styles.loadingText}>Loading EduMitra...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

// Route protection hook
export function useRouteProtection() {
  const { isAuthenticated, userProfile } = useAuth();
  const segments = useSegments();

  const isProtectedRoute = (): boolean => {
    const protectedRoutes = ['(drawer)', 'profile', 'settings'];
    return protectedRoutes.some(route => segments.includes(route));
  };

  const requiresAuth = (): boolean => {
    return isProtectedRoute() && !isAuthenticated;
  };

  const hasRoleAccess = (requiredRoles: string[]): boolean => {
    if (!userProfile) return false;
    return requiredRoles.includes(userProfile.role);
  };

  return {
    isProtectedRoute,
    requiresAuth,
    hasRoleAccess,
    isAuthenticated,
    userRole: userProfile?.role || null,
  };
}
