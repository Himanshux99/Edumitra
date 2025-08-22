/**
 * Career Hub Screen
 * Main screen for personalized career roadmaps and schedule planning
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import PersonalizedDashboard from '@/components/career/PersonalizedDashboard';
import RoadmapDetailView from '@/components/career/RoadmapDetailView';
import SchedulePlanner from '@/components/career/SchedulePlanner';
import CertificateView from '@/components/career/CertificateView';
import { CareerPath, CompletionCertificate } from '@/types/careerRoadmap';

type ViewMode = 'dashboard' | 'roadmap' | 'schedule' | 'certificate';

export default function CareerHubScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedCareerPath, setSelectedCareerPath] = useState<CareerPath | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CompletionCertificate | null>(null);

  const handleNavigateToRoadmap = (careerPath: CareerPath) => {
    setSelectedCareerPath(careerPath);
    setCurrentView('roadmap');
  };

  const handleNavigateToSchedule = () => {
    setCurrentView('schedule');
  };

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCareerPath(null);
  };

  const handleShowCertificate = (certificate: CompletionCertificate) => {
    setSelectedCertificate(certificate);
    setCurrentView('certificate');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <PersonalizedDashboard
            onNavigateToRoadmap={handleNavigateToRoadmap}
            onNavigateToSchedule={handleNavigateToSchedule}
          />
        );

      case 'roadmap':
        if (!selectedCareerPath) {
          return (
            <PersonalizedDashboard
              onNavigateToRoadmap={handleNavigateToRoadmap}
              onNavigateToSchedule={handleNavigateToSchedule}
            />
          );
        }
        return (
          <RoadmapDetailView
            careerPath={selectedCareerPath}
            onBack={handleNavigateToDashboard}
          />
        );

      case 'schedule':
        return (
          <SchedulePlanner
            onBack={handleNavigateToDashboard}
          />
        );

      case 'certificate':
        if (!selectedCertificate) {
          return (
            <PersonalizedDashboard
              onNavigateToRoadmap={handleNavigateToRoadmap}
              onNavigateToSchedule={handleNavigateToSchedule}
            />
          );
        }
        return (
          <CertificateView
            certificate={selectedCertificate}
            onClose={handleNavigateToDashboard}
          />
        );

      default:
        return (
          <PersonalizedDashboard
            onNavigateToRoadmap={handleNavigateToRoadmap}
            onNavigateToSchedule={handleNavigateToSchedule}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderCurrentView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
