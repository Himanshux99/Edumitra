import CustomDrawerContent from '@/components/ui/CustomDrawerContent';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: 'slide',
        drawerPosition: 'left',
        drawerStyle: {
          width: 320,
          backgroundColor: colorScheme === 'dark' ? '#0f0f0f' : '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 16,
        },
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        sceneContainerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#f8f9fa',
        },
        headerStyle: {
          backgroundColor: '#667eea',
          elevation: 8,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          borderBottomWidth: 0,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 19,
          letterSpacing: 0.5,
        },
        headerTitleAlign: 'center',
        gestureEnabled: true,
        swipeEnabled: true,
        swipeEdgeWidth: 80,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'EduMitra Home',
        }}
      />
      <Drawer.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'Personal Dashboard',
        }}
      />
      <Drawer.Screen
        name="career-hub"
        options={{
          title: 'Career Hub',
          headerTitle: 'Personalized Career Roadmaps',
        }}
      />
      <Drawer.Screen
        name="academic-data"
        options={{
          title: 'Academic Data',
          headerTitle: 'Academic Performance',
        }}
      />
      <Drawer.Screen
        name="content"
        options={{
          title: 'Content Hub',
          headerTitle: 'Content Hub',
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerTitle: 'Notifications',
        }}
      />
      <Drawer.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          headerTitle: 'Learning Modules',
        }}
      />
      <Drawer.Screen
        name="quizzes"
        options={{
          title: 'Quizzes',
          headerTitle: 'Quizzes & Assessments',
        }}
      />
      <Drawer.Screen
        name="timetable"
        options={{
          title: 'Timetable',
          headerTitle: 'Study Timetable',
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerTitle: 'Explore',
        }}
      />
    </Drawer>
  );
}
