/**
 * Certificate View Component
 * Shows completion certificate with congratulations animation
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CompletionCertificate } from '@/types/careerRoadmap';

const { width, height } = Dimensions.get('window');

interface CertificateViewProps {
  certificate: CompletionCertificate;
  onClose: () => void;
}

export default function CertificateView({ certificate, onClose }: CertificateViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(confettiAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(confettiAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 I just completed the ${certificate.careerPathTitle} roadmap on EduMitra! Check out my certificate: ${certificate.shareableLink}`,
        url: certificate.shareableLink,
        title: 'My EduMitra Certificate',
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Error', 'Failed to share certificate');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const confettiTranslateY = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, height + 50],
  });

  const confettiOpacity = confettiAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Confetti Animation */}
      <Animated.View
        style={[
          styles.confetti,
          {
            opacity: confettiOpacity,
            transform: [{ translateY: confettiTranslateY }],
          },
        ]}
      >
        <Text style={styles.confettiEmoji}>🎉</Text>
        <Text style={styles.confettiEmoji}>🎊</Text>
        <Text style={styles.confettiEmoji}>✨</Text>
        <Text style={styles.confettiEmoji}>🌟</Text>
        <Text style={styles.confettiEmoji}>🎉</Text>
      </Animated.View>

      {/* Certificate */}
      <Animated.View
        style={[
          styles.certificateContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.certificateHeader}>
          <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
          <Text style={[styles.certificateTitle, { color: colors.text }]}>
            Certificate of Completion
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.certificateContent}>
          <Text style={[styles.presentedTo, { color: colors.text }]}>
            This certificate is presented to
          </Text>
          
          <View style={styles.nameContainer}>
            <Text style={[styles.recipientName, { color: '#667eea' }]}>
              You
            </Text>
            <View style={[styles.nameLine, { backgroundColor: colors.text }]} />
          </View>

          <Text style={[styles.completionText, { color: colors.text }]}>
            for successfully completing the
          </Text>

          <Text style={[styles.courseName, { color: '#667eea' }]}>
            {certificate.careerPathTitle}
          </Text>

          <Text style={[styles.roadmapText, { color: colors.text }]}>
            Career Roadmap
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={20} color="#FF9800" />
              <Text style={[styles.statLabel, { color: colors.text }]}>Duration</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {certificate.totalDuration}
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="school" size={20} color="#2196F3" />
              <Text style={[styles.statLabel, { color: colors.text }]}>Skills</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {certificate.skillsLearned.length}
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="assignment" size={20} color="#4CAF50" />
              <Text style={[styles.statLabel, { color: colors.text }]}>Projects</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {certificate.projectsCompleted.length}
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <Text style={[styles.statLabel, { color: colors.text }]}>Score</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {certificate.finalScore}%
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text style={[styles.completionDate, { color: colors.text }]}>
            Completed on {formatDate(certificate.completedAt)}
          </Text>

          {/* Signature */}
          <View style={styles.signatureContainer}>
            <View style={styles.signatureSection}>
              <View style={[styles.signatureLine, { backgroundColor: colors.text }]} />
              <Text style={[styles.signatureLabel, { color: colors.text }]}>
                EduMitra Team
              </Text>
            </View>
          </View>

          {/* Certificate ID */}
          <Text style={[styles.certificateId, { color: colors.text }]}>
            Certificate ID: {certificate.id}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={20} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={() => {
              // Handle download
              Alert.alert('Download', 'Certificate download feature coming soon!');
            }}
          >
            <MaterialIcons name="download" size={20} color="white" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={20} color="white" />
            <Text style={styles.actionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Decorative Elements */}
      <View style={styles.decorativeElements}>
        <Text style={[styles.decorativeEmoji, styles.topLeft]}>🌟</Text>
        <Text style={[styles.decorativeEmoji, styles.topRight]}>✨</Text>
        <Text style={[styles.decorativeEmoji, styles.bottomLeft]}>🎊</Text>
        <Text style={[styles.decorativeEmoji, styles.bottomRight]}>🎉</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1000,
  },
  confettiEmoji: {
    fontSize: 30,
  },
  certificateContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  certificateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  certificateContent: {
    alignItems: 'center',
  },
  presentedTo: {
    fontSize: 16,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recipientName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nameLine: {
    width: 200,
    height: 2,
  },
  completionText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  roadmapText: {
    fontSize: 16,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    margin: 8,
    minWidth: 60,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  completionDate: {
    fontSize: 14,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  signatureContainer: {
    width: '100%',
    marginBottom: 16,
  },
  signatureSection: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 150,
    height: 1,
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  certificateId: {
    fontSize: 10,
    opacity: 0.5,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  downloadButton: {
    backgroundColor: '#2196F3',
  },
  closeButton: {
    backgroundColor: '#FF5722',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  decorativeEmoji: {
    position: 'absolute',
    fontSize: 40,
    opacity: 0.3,
  },
  topLeft: {
    top: 100,
    left: 30,
  },
  topRight: {
    top: 120,
    right: 30,
  },
  bottomLeft: {
    bottom: 150,
    left: 40,
  },
  bottomRight: {
    bottom: 130,
    right: 40,
  },
});
