import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import CustomDrawerContent from '@/components/ui/CustomDrawerContent';

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
          width: 280,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        sceneContainerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
        },
        headerStyle: {
          backgroundColor: colors.tint,
          elevation: 4,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        gestureEnabled: true,
        swipeEnabled: true,
        swipeEdgeWidth: 50,
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
