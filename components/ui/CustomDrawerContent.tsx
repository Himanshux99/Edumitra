import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { IconSymbol } from './IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

interface DrawerItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

const drawerItems: DrawerItem[] = [
  { name: 'index', label: 'Home', icon: 'house.fill', route: '/(drawer)/' },
  { name: 'dashboard', label: 'Dashboard', icon: 'chart.bar', route: '/(drawer)/dashboard' },
  { name: 'academic-data', label: 'Academic Data', icon: 'doc.text.below.ecg', route: '/(drawer)/academic-data' },
  { name: 'content', label: 'Content Hub', icon: 'folder.fill', route: '/(drawer)/content' },
  { name: 'career-tools', label: 'Career Tools', icon: 'briefcase.fill', route: '/(drawer)/career-tools' },
  { name: 'community', label: 'Community', icon: 'people.fill', route: '/(drawer)/community' },
  { name: 'integrations', label: 'Integrations', icon: 'link', route: '/(drawer)/integrations' },
  { name: 'guardian', label: 'Guardian View', icon: 'family.restroom', route: '/(drawer)/guardian' },
  { name: 'notifications', label: 'Notifications', icon: 'bell.fill', route: '/(drawer)/notifications' },
  { name: 'lessons', label: 'Lessons', icon: 'book.fill', route: '/(drawer)/lessons' },
  { name: 'quizzes', label: 'Quizzes', icon: 'questionmark.circle.fill', route: '/(drawer)/quizzes' },
  { name: 'timetable', label: 'Timetable', icon: 'calendar', route: '/(drawer)/timetable' },
  { name: 'explore', label: 'Explore', icon: 'paperplane.fill', route: '/(drawer)/explore' },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut, userProfile } = useAuth();

  const { state, navigation } = props;
  const currentRoute = state.routes[state.index].name;

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Drawer - Starting logout process...');
              await signOut();
              console.log('Drawer - SignOut completed, AuthGuard should handle navigation');
              // Let AuthGuard handle the navigation automatically
            } catch (error) {
              console.error('Drawer - Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    header: {
      padding: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      backgroundColor: colors.tint,
      borderBottomWidth: 1,
      borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#ffffff',
      opacity: 0.8,
    },
    scrollContent: {
      flex: 1,
      paddingTop: 20,
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      marginHorizontal: 10,
      marginVertical: 2,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    activeDrawerItem: {
      backgroundColor: colors.tint + '15',
      borderLeftWidth: 4,
      borderLeftColor: colors.tint,
    },
    drawerItemIcon: {
      marginRight: 15,
      width: 24,
      alignItems: 'center',
    },
    drawerItemLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      flex: 1,
    },
    activeDrawerItemLabel: {
      color: colors.tint,
      fontWeight: '600',
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
    },
    footerText: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#888' : '#666',
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
      marginVertical: 10,
      marginHorizontal: 20,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      marginHorizontal: 10,
      marginVertical: 5,
      borderRadius: 12,
      backgroundColor: '#ff444415',
      borderWidth: 1,
      borderColor: '#ff4444',
    },
    logoutIcon: {
      marginRight: 15,
      width: 24,
      alignItems: 'center',
    },
    logoutLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: '#ff4444',
      flex: 1,
    },
    userInfo: {
      padding: 15,
      marginHorizontal: 10,
      marginBottom: 10,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
      borderRadius: 12,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 4,
    },
    userRole: {
      fontSize: 12,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      textTransform: 'capitalize',
    },
  });

  const handleItemPress = (route: string) => {
    router.push(route as any);
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EduMitra</Text>
        <Text style={styles.headerSubtitle}>Your Learning Companion</Text>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {drawerItems.map((item, index) => {
          const isActive = currentRoute === item.name;
          
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.drawerItem,
                isActive && styles.activeDrawerItem,
              ]}
              onPress={() => handleItemPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.drawerItemIcon}>
                <IconSymbol
                  size={24}
                  name={item.icon as any}
                  color={isActive ? colors.tint : (colorScheme === 'dark' ? '#ffffff' : '#666666')}
                />
              </View>
              <Text
                style={[
                  styles.drawerItemLabel,
                  isActive && styles.activeDrawerItemLabel,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Additional Options */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            // Handle settings navigation
            console.log('Settings pressed');
          }}
          activeOpacity={0.7}
        >
          <View style={styles.drawerItemIcon}>
            <IconSymbol
              size={24}
              name="gear"
              color={colorScheme === 'dark' ? '#ffffff' : '#666666'}
            />
          </View>
          <Text style={styles.drawerItemLabel}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            // Handle help navigation
            console.log('Help pressed');
          }}
          activeOpacity={0.7}
        >
          <View style={styles.drawerItemIcon}>
            <IconSymbol
              size={24}
              name="questionmark.circle"
              color={colorScheme === 'dark' ? '#ffffff' : '#666666'}
            />
          </View>
          <Text style={styles.drawerItemLabel}>Help & Support</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* User Info & Logout Section */}
      {userProfile && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {userProfile.displayName || userProfile.email}
          </Text>
          <Text style={styles.userRole}>
            {userProfile.role || 'Student'}
          </Text>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={styles.logoutIcon}>
          <IconSymbol
            size={24}
            name="rectangle.portrait.and.arrow.right"
            color="#ff4444"
          />
        </View>
        <Text style={styles.logoutLabel}>Sign Out</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          EduMitra v1.0.0{'\n'}
          © 2025 EduMitra. All rights reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
}
