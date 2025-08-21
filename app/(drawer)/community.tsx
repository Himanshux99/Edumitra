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
import { useCommunityStore } from '../../store/communityStore';
import { communityService } from '../../services/communityService';
import { Colors } from '../../constants/Colors';
import { PeerGroup, Mentor, Question, GroupCategory } from '../../types/community';

const { width } = Dimensions.get('window');

interface CommunityCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
  color: string;
  stats?: string;
}

export default function CommunityScreen() {
  const {
    groups,
    mentors,
    questions,
    currentUser,
    isLoading,
    error,
    connectionStatus,
    getUserGroups,
    clearError
  } = useCommunityStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      await communityService.loadAllCommunityData();
    } catch (error) {
      console.error('Failed to load community data:', error);
      Alert.alert('Error', 'Failed to load community data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
  };

  const userGroups = currentUser ? getUserGroups(currentUser.id) : [];
  const userQuestions = currentUser ? questions.filter(q => q.askedBy === currentUser.id) : [];

  const communityCards: CommunityCard[] = [
    {
      id: 'peer-groups',
      title: 'Peer Groups',
      description: 'Join topic-wise discussion groups',
      icon: 'group',
      route: '/community/peer-groups',
      color: '#4CAF50',
      stats: `${userGroups.length} joined • ${groups.length} total`
    },
    {
      id: 'mentorship',
      title: 'Find Mentors',
      description: 'Connect with experienced mentors',
      icon: 'supervisor-account',
      route: '/community/mentors',
      color: '#2196F3',
      stats: `${mentors.length} mentor${mentors.length !== 1 ? 's' : ''} available`
    },
    {
      id: 'qa-forum',
      title: 'Q&A Forum',
      description: 'Ask questions and get answers',
      icon: 'live-help',
      route: '/community/qa',
      color: '#FF9800',
      stats: `${userQuestions.length} asked • ${questions.length} total`
    },
    {
      id: 'discussions',
      title: 'Discussions',
      description: 'Browse trending discussions',
      icon: 'chat',
      route: '/community/discussions',
      color: '#9C27B0',
      stats: 'Join the conversation'
    }
  ];

  const quickActions = [
    {
      id: 'create-group',
      title: 'Create Group',
      icon: 'add' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/community/groups/create')
    },
    {
      id: 'ask-question',
      title: 'Ask Question',
      icon: 'help-outline' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/community/qa/ask')
    },
    {
      id: 'find-mentor',
      title: 'Find Mentor',
      icon: 'search' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/community/mentors')
    },
    {
      id: 'browse-groups',
      title: 'Browse Groups',
      icon: 'explore' as keyof typeof MaterialIcons.glyphMap,
      onPress: () => router.push('/community/groups')
    }
  ];

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'disconnected': return '#f44336';
      default: return Colors.light.tabIconDefault;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Online';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Offline';
      default: return 'Unknown';
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            clearError();
            loadCommunityData();
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Community</Text>
              <Text style={styles.subtitle}>
                Connect, learn, and grow together
              </Text>
            </View>
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor() }]} />
              <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
                {getConnectionStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{groups.length}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mentors.length}</Text>
            <Text style={styles.statLabel}>Mentors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{questions.length}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userGroups.length}</Text>
            <Text style={styles.statLabel}>My Groups</Text>
          </View>
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

        {/* Community Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Features</Text>
          <View style={styles.featuresGrid}>
            {communityCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.featureCard, { borderLeftColor: card.color }]}
                onPress={() => router.push(card.route as any)}
              >
                <View style={styles.featureCardHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: card.color + '20' }]}>
                    <MaterialIcons name={card.icon} size={28} color={card.color} />
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={Colors.light.tabIconDefault} />
                </View>
                <Text style={styles.featureTitle}>{card.title}</Text>
                <Text style={styles.featureDescription}>{card.description}</Text>
                {card.stats && (
                  <Text style={styles.featureStats}>{card.stats}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Groups Preview */}
        {userGroups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Groups</Text>
              <TouchableOpacity onPress={() => router.push('/community/groups/my-groups')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.groupsPreview}>
                {userGroups.slice(0, 5).map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.groupPreviewCard}
                    onPress={() => router.push(`/community/groups/${group.id}`)}
                  >
                    <View style={styles.groupPreviewHeader}>
                      <Text style={styles.groupPreviewName} numberOfLines={1}>
                        {group.name}
                      </Text>
                      <Text style={styles.groupPreviewCategory}>{group.category}</Text>
                    </View>
                    <Text style={styles.groupPreviewStats}>
                      {group.stats.totalMembers} members
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Recent Questions Preview */}
        {questions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Questions</Text>
              <TouchableOpacity onPress={() => router.push('/community/qa')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.questionsPreview}>
              {questions.slice(0, 3).map((question) => (
                <TouchableOpacity
                  key={question.id}
                  style={styles.questionPreviewCard}
                  onPress={() => router.push(`/community/qa/${question.id}`)}
                >
                  <Text style={styles.questionTitle} numberOfLines={2}>
                    {question.title}
                  </Text>
                  <View style={styles.questionMeta}>
                    <Text style={styles.questionCategory}>{question.category}</Text>
                    <Text style={styles.questionStats}>
                      {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {groups.length === 0 && questions.length === 0 && mentors.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={64} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyStateText}>Welcome to Community!</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by joining groups, asking questions, or finding mentors
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => router.push('/community/groups')}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}

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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
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
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  featureCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 20,
    marginBottom: 8,
  },
  featureStats: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  groupsPreview: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  groupPreviewCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupPreviewHeader: {
    marginBottom: 8,
  },
  groupPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  groupPreviewCategory: {
    fontSize: 10,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  groupPreviewStats: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  questionsPreview: {
    gap: 12,
  },
  questionPreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCategory: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  questionStats: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
