import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { IconSymbol } from './IconSymbol';

interface DrawerItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

const drawerItems: DrawerItem[] = [
  { name: 'index', label: 'Home', icon: 'house.fill', route: '/(drawer)/' },
  { name: 'dashboard', label: 'Dashboard', icon: 'chart.bar', route: '/(drawer)/dashboard' },
  { name: 'career-hub', label: 'Career Hub', icon: 'briefcase.fill', route: '/(drawer)/career-hub' },
  { name: 'academic-data', label: 'Academic Data', icon: 'doc.text.below.ecg', route: '/(drawer)/academic-data' },
  { name: 'content', label: 'Content Hub', icon: 'folder.fill', route: '/(drawer)/content' },
  { name: 'career-tools', label: 'Career Tools', icon: 'briefcase', route: '/(drawer)/career-tools' },
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
      backgroundColor: colorScheme === 'dark' ? '#0f0f0f' : '#ffffff',
    },
    header: {
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 70 : 50,
      backgroundColor: '#667eea',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      position: 'relative',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: 6,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    headerSubtitle: {
      fontSize: 15,
      color: '#ffffff',
      opacity: 0.9,
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    scrollContent: {
      flex: 1,
      paddingTop: 24,
      paddingBottom: 16,
    },
    drawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 12,
      marginVertical: 4,
      borderRadius: 16,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'transparent',
      shadowColor: colorScheme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    activeDrawerItem: {
      backgroundColor: colorScheme === 'dark' ? '#667eea20' : '#667eea15',
      borderLeftWidth: 5,
      borderLeftColor: '#667eea',
      borderColor: '#667eea30',
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      transform: [{ scale: 1.02 }],
    },
    drawerItemIcon: {
      marginRight: 16,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colorScheme === 'dark' ? '#ffffff10' : '#f8f9fa',
    },
    drawerItemLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#2c3e50',
      flex: 1,
      letterSpacing: 0.2,
    },
    activeDrawerItemLabel: {
      color: '#667eea',
      fontWeight: '700',
    },
    activeDrawerItemIcon: {
      backgroundColor: '#667eea',
      shadowColor: '#667eea',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    activeIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#667eea',
      marginLeft: 8,
    },
    footer: {
      padding: 20,
      paddingBottom: 30,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#333333' : '#e8ecf0',
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
    },
    footerText: {
      fontSize: 11,
      color: colorScheme === 'dark' ? '#999999' : '#6c757d',
      textAlign: 'center',
      lineHeight: 16,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#e8ecf0',
      marginVertical: 16,
      marginHorizontal: 20,
      opacity: 0.6,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 16,
      backgroundColor: '#ff444418',
      borderWidth: 1.5,
      borderColor: '#ff4444',
      shadowColor: '#ff4444',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    logoutIcon: {
      marginRight: 16,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#ff444420',
    },
    logoutLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: '#ff4444',
      flex: 1,
      letterSpacing: 0.2,
    },
    userInfo: {
      padding: 18,
      marginHorizontal: 12,
      marginBottom: 12,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e8ecf0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    userName: {
      fontSize: 17,
      fontWeight: '700',
      color: colorScheme === 'dark' ? '#ffffff' : '#2c3e50',
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    userRole: {
      fontSize: 13,
      color: colorScheme === 'dark' ? '#cccccc' : '#6c757d',
      textTransform: 'capitalize',
      fontWeight: '600',
      backgroundColor: colorScheme === 'dark' ? '#667eea20' : '#667eea15',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
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
              activeOpacity={0.8}
            >
              <View style={[
                styles.drawerItemIcon,
                isActive && styles.activeDrawerItemIcon
              ]}>
                <IconSymbol
                  size={22}
                  name={item.icon as any}
                  color={isActive ? '#ffffff' : (colorScheme === 'dark' ? '#cccccc' : '#667eea')}
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
              {isActive && <View style={styles.activeIndicator} />}
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
