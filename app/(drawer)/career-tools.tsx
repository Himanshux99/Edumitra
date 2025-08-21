import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCareerToolsStore } from '../../store/careerToolsStore';
import { careerToolsService } from '../../services/careerToolsService';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  color: string;
  stats?: string;
}

export default function CareerToolsScreen() {
  const {
    resumes,
    userSkills,
    mockTests,
    testAttempts,
    interviewSessions,
    isLoading,
    error,
    setLoading,
    clearError
  } = useCareerToolsStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCareerData();
  }, []);

  const loadCareerData = async () => {
    try {
      setLoading(true);
      await careerToolsService.loadAllCareerData();
    } catch (error) {
      console.error('Failed to load career data:', error);
      Alert.alert('Error', 'Failed to load career tools data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCareerData();
    setRefreshing(false);
  };

  const toolCards: ToolCard[] = [
    {
      id: 'resume-builder',
      title: 'Resume Builder',
      description: 'Create professional resumes with templates',
      icon: 'description',
      route: '/career-tools/resume-builder',
      color: '#4CAF50',
      stats: `${resumes.length} resume${resumes.length !== 1 ? 's' : ''}`
    },
    {
      id: 'skill-mapping',
      title: 'Skill Mapping',
      description: 'Track and develop your skills',
      icon: 'trending-up',
      route: '/career-tools/skill-mapping',
      color: '#2196F3',
      stats: `${userSkills.length} skill${userSkills.length !== 1 ? 's' : ''} tracked`
    },
    {
      id: 'mock-tests',
      title: 'Mock Tests',
      description: 'Practice with aptitude and technical tests',
      icon: 'quiz',
      route: '/career-tools/mock-tests',
      color: '#FF9800',
      stats: `${testAttempts.length} test${testAttempts.length !== 1 ? 's' : ''} taken`
    },
    {
      id: 'interview-prep',
      title: 'Interview Prep',
      description: 'Prepare for interviews with practice questions',
      icon: 'record-voice-over',
      route: '/career-tools/interview-prep',
      color: '#9C27B0',
      stats: `${interviewSessions.length} session${interviewSessions.length !== 1 ? 's' : ''}`
    }
  ];

  const quickActions = [
    {
      id: 'create-resume',
      title: 'Create Resume',
      icon: 'add' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/career-tools/resume-builder/create')
    },
    {
      id: 'take-test',
      title: 'Take Test',
      icon: 'play-arrow' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/career-tools/mock-tests')
    },
    {
      id: 'practice-interview',
      title: 'Practice Interview',
      icon: 'mic' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/career-tools/interview-prep')
    },
    {
      id: 'assess-skills',
      title: 'Assess Skills',
      icon: 'assessment' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/career-tools/skill-mapping/assessment')
    }
  ];

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            loadCareerData();
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Career Tools</Text>
          <Text style={styles.subtitle}>
            Build your career with professional tools and resources
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <MaterialIcons name={action.icon} size={24} color={Colors.light.tint} />
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tool Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Tools</Text>
          <View style={styles.toolsGrid}>
            {toolCards.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { borderLeftColor: tool.color }]}
                onPress={() => router.push(tool.route as any)}
              >
                <View style={styles.toolCardHeader}>
                  <View style={[styles.toolIcon, { backgroundColor: tool.color + '20' }]}>
                    <MaterialIcons name={tool.icon} size={28} color={tool.color} />
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={Colors.light.tabIconDefault} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
                {tool.stats && (
                  <Text style={styles.toolStats}>{tool.stats}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {testAttempts.length === 0 && resumes.length === 0 && interviewSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="work-outline" size={48} color={Colors.light.tabIconDefault} />
                <Text style={styles.emptyStateText}>No recent activity</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start using career tools to see your activity here
                </Text>
              </View>
            ) : (
              <View style={styles.activityList}>
                {resumes.slice(0, 3).map((resume) => (
                  <View key={resume.id} style={styles.activityItem}>
                    <MaterialIcons name="description" size={20} color="#4CAF50" />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>Resume: {resume.title}</Text>
                      <Text style={styles.activityTime}>
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
                {testAttempts.slice(0, 2).map((attempt) => (
                  <View key={attempt.id} style={styles.activityItem}>
                    <MaterialIcons name="quiz" size={20} color="#FF9800" />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        Mock Test - Score: {attempt.percentage.toFixed(0)}%
                      </Text>
                      <Text style={styles.activityTime}>
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '20',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 8,
    textAlign: 'center',
  },
  toolsGrid: {
    gap: 16,
  },
  toolCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  toolCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  toolDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
    marginBottom: 8,
  },
  toolStats: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  activityContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '20',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: 4,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
