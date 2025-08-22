import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResumeData } from '../../types/resume';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';

type ResumeBuilderStep = 'form' | 'preview';

interface ResumeBuilderProps {
  onClose?: () => void;
}

const STORAGE_KEY = '@resume_builder_data';

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState<ResumeBuilderStep>('form');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on component mount
  React.useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Validate the data structure before using it
        if (parsedData && parsedData.personalInfo && parsedData.education && parsedData.skills && parsedData.workExperience) {
          setResumeData(parsedData);
        }
      }
    } catch (error) {
      console.error('Error loading saved resume data:', error);
    }
  };

  const saveData = async (data: ResumeData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving resume data:', error);
    }
  };

  const handleFormSubmit = useCallback(async (data: ResumeData) => {
    setIsLoading(true);
    
    try {
      // Save the data
      await saveData(data);
      setResumeData(data);
      
      // Navigate to preview
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error processing form submission:', error);
      Alert.alert(
        'Error',
        'Failed to process your resume data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackToForm = useCallback(() => {
    setCurrentStep('form');
  }, []);

  const handleEditResume = useCallback(() => {
    setCurrentStep('form');
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all resume data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setResumeData(null);
              setCurrentStep('form');
            } catch (error) {
              console.error('Error clearing data:', error);
            }
          },
        },
      ]
    );
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'form':
        return (
          <ResumeForm
            onSubmit={handleFormSubmit}
            initialData={resumeData || undefined}
            isLoading={isLoading}
          />
        );
      case 'preview':
        if (!resumeData) {
          // This shouldn't happen, but handle it gracefully
          setCurrentStep('form');
          return null;
        }
        return (
          <ResumePreview
            resumeData={resumeData}
            onBack={handleBackToForm}
            onEdit={handleEditResume}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#f8f9fa' : undefined}
      />
      
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      {/* Development/Debug Actions - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          {/* Add debug buttons here if needed during development */}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
});

export default ResumeBuilder;
