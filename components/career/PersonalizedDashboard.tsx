/**
 * Personalized Career Dashboard
 * Shows personalized career recommendations, progress tracking, and virtual tree
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { careerRoadmapService } from '@/services/careerRoadmapService';
import { CareerPath, VirtualTree, UserRoadmapProgress } from '@/types/careerRoadmap';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface PersonalizedDashboardProps {
  onNavigateToRoadmap?: (careerPath: CareerPath) => void;
  onNavigateToSchedule?: () => void;
}

export default function PersonalizedDashboard({ 
  onNavigateToRoadmap, 
  onNavigateToSchedule 
}: PersonalizedDashboardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [recommendations, setRecommendations] = useState<CareerPath[]>([]);
  const [virtualTree, setVirtualTree] = useState<VirtualTree | null>(null);
  const [userProgress, setUserProgress] = useState<UserRoadmapProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [completedRoadmap, setCompletedRoadmap] = useState<CareerPath | null>(null);

  const treeAnimation = new Animated.Value(0);

  useEffect(() => {
    if (user) {
      loadPersonalizedData();
    }
  }, [user]);

  useEffect(() => {
    // Animate tree growth
    Animated.loop(
      Animated.sequence([
        Animated.timing(treeAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(treeAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadPersonalizedData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load personalized recommendations
      const recs = await careerRoadmapService.getPersonalizedRecommendations(user.uid);
      setRecommendations(recs);

      // Load virtual tree
      const tree = await careerRoadmapService.getVirtualTree(user.uid);
      setVirtualTree(tree);

      // Load user progress
      // const progress = await careerRoadmapService.getUserProgress(user.uid);
      // setUserProgress(progress);

    } catch (error) {
      console.error('Error loading personalized data:', error);
      Alert.alert('Error', 'Failed to load personalized recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRoadmap = async (careerPath: CareerPath) => {
    if (!user) return;

    try {
      await careerRoadmapService.startRoadmap(user.uid, careerPath.id);
      Alert.alert(
        'Roadmap Started!',
        `You've started the ${careerPath.title} roadmap. Good luck on your journey!`,
        [
          {
            text: 'View Roadmap',
            onPress: () => onNavigateToRoadmap?.(careerPath)
          },
          { text: 'OK' }
        ]
      );
      loadPersonalizedData(); // Refresh data
    } catch (error) {
      console.error('Error starting roadmap:', error);
      Alert.alert('Error', 'Failed to start roadmap');
    }
  };

  const formatSalary = (salary: any) => {
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
  };

  const getTreeEmoji = (level: number) => {
    if (level < 5) return '🌱';
    if (level < 10) return '🌿';
    if (level < 20) return '🌳';
    if (level < 50) return '🌲';
    return '🌴';
  };

  const renderVirtualTree = () => {
    if (!virtualTree) return null;

    const treeScale = treeAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });

    return (
      <View style={[styles.treeContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Learning Tree 🌳
        </Text>
        
        <View style={styles.treeDisplay}>
          <Animated.Text 
            style={[
              styles.treeEmoji, 
              { transform: [{ scale: treeScale }] }
            ]}
          >
            {getTreeEmoji(virtualTree.level)}
          </Animated.Text>
          
          <View style={styles.treeStats}>
            <Text style={[styles.treeLevel, { color: colors.text }]}>
              Level {virtualTree.level}
            </Text>
            <View style={styles.experienceBar}>
              <View 
                style={[
                  styles.experienceProgress, 
                  { 
                    width: `${(virtualTree.experience / virtualTree.maxExperience) * 100}%`,
                    backgroundColor: '#4CAF50'
                  }
                ]} 
              />
            </View>
            <Text style={[styles.experienceText, { color: colors.text }]}>
              {virtualTree.experience} / {virtualTree.maxExperience} XP
            </Text>
            <Text style={[styles.healthText, { color: colors.text }]}>
              Health: {virtualTree.health}% 💚
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.scheduleButton, { backgroundColor: '#667eea' }]}
          onPress={onNavigateToSchedule}
        >
          <MaterialIcons name="schedule" size={20} color="white" />
          <Text style={styles.scheduleButtonText}>Create Study Schedule</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCareerRecommendation = (careerPath: CareerPath, index: number) => (
    <TouchableOpacity
      key={careerPath.id}
      style={[
        styles.careerCard,
        { 
          backgroundColor: colors.background,
          borderColor: careerPath.color || '#667eea',
          borderLeftWidth: 4,
        }
      ]}
      onPress={() => handleStartRoadmap(careerPath)}
    >
      <View style={styles.careerHeader}>
        <Text style={styles.careerEmoji}>{careerPath.icon}</Text>
        <View style={styles.careerInfo}>
          <Text style={[styles.careerTitle, { color: colors.text }]}>
            {careerPath.title}
          </Text>
          <Text style={[styles.careerCategory, { color: colors.text }]}>
            {careerPath.category}
          </Text>
        </View>
        <View style={styles.matchScore}>
          <Text style={[styles.matchText, { color: careerPath.color }]}>
            {Math.round(careerPath.matchScore)}% match
          </Text>
        </View>
      </View>

      <Text style={[styles.careerDescription, { color: colors.text }]}>
        {careerPath.description}
      </Text>

      <View style={styles.careerStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {formatSalary(careerPath.averageSalary)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialIcons name="trending-up" size={16} color="#FF9800" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {careerPath.growthRate}% growth
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialIcons name="work" size={16} color="#2196F3" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {careerPath.demandLevel} demand
          </Text>
        </View>
      </View>

      <View style={styles.skillsPreview}>
        <Text style={[styles.skillsTitle, { color: colors.text }]}>
          Key Skills:
        </Text>
        <Text style={[styles.skillsList, { color: colors.text }]}>
          {careerPath.requiredSkills.slice(0, 3).join(', ')}
          {careerPath.requiredSkills.length > 3 && '...'}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.startButton, { backgroundColor: careerPath.color || '#667eea' }]}
        onPress={() => handleStartRoadmap(careerPath)}
      >
        <Text style={styles.startButtonText}>Start Roadmap</Text>
        <MaterialIcons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <MaterialIcons name="hourglass-empty" size={48} color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Personalizing your recommendations...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Virtual Tree Section */}
      {renderVirtualTree()}

      {/* Career Recommendations */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Personalized Career Paths 🚀
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
          Based on your skills and interests
        </Text>

        {recommendations.map((careerPath, index) => 
          renderCareerRecommendation(careerPath, index)
        )}

        {recommendations.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="explore" size={48} color={colors.text} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Complete your skill assessment to get personalized recommendations
            </Text>
            <TouchableOpacity 
              style={[styles.assessmentButton, { backgroundColor: '#667eea' }]}
              onPress={() => router.push('/career-tools/skill-mapping')}
            >
              <Text style={styles.assessmentButtonText}>Take Skill Assessment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Congratulations Modal */}
      <Modal
        visible={showCongratulations}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCongratulations(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.congratsModal, { backgroundColor: colors.background }]}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <Text style={[styles.congratsTitle, { color: colors.text }]}>
              Congratulations!
            </Text>
            <Text style={[styles.congratsText, { color: colors.text }]}>
              You've completed the {completedRoadmap?.title} roadmap!
            </Text>
            <TouchableOpacity
              style={[styles.certificateButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => {
                setShowCongratulations(false);
                // Navigate to certificate view
              }}
            >
              <Text style={styles.certificateButtonText}>View Certificate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  treeContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  treeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  treeEmoji: {
    fontSize: 60,
    marginRight: 16,
  },
  treeStats: {
    flex: 1,
  },
  treeLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  experienceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 4,
  },
  experienceProgress: {
    height: '100%',
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    marginBottom: 4,
  },
  healthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  careerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  careerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  careerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  careerInfo: {
    flex: 1,
  },
  careerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  careerCategory: {
    fontSize: 14,
    opacity: 0.7,
  },
  matchScore: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  careerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  careerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  skillsPreview: {
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  skillsList: {
    fontSize: 12,
    opacity: 0.7,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
  },
  assessmentButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  assessmentButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsModal: {
    width: width * 0.8,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  congratsEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  certificateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  certificateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
