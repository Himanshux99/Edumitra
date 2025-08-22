import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { ResumeData } from '../../types/resume';
import { generateResumePDF, saveResumeToDevice } from '../../utils/generateResume';

interface ResumePreviewProps {
  resumeData: ResumeData;
  onBack: () => void;
  onEdit: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, onBack, onEdit }) => {
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePDF();
  }, [resumeData]);

  const generatePDF = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const uri = await generateResumePDF(resumeData, {
        format: 'A4',
        orientation: 'portrait',
        margins: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        },
      });
      setPdfUri(uri);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!pdfUri) {
      Alert.alert('Error', 'No PDF available to share');
      return;
    }

    setIsSharing(true);
    
    try {
      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      const savedUri = await saveResumeToDevice(pdfUri, fileName);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(savedUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Resume',
        UTI: 'com.adobe.pdf',
      });
    } catch (err) {
      console.error('Error sharing PDF:', err);
      Alert.alert('Error', 'Failed to share PDF. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUri) {
      Alert.alert('Error', 'No PDF available to download');
      return;
    }

    setIsSaving(true);
    
    try {
      const fileName = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      const savedUri = await saveResumeToDevice(pdfUri, fileName);
      
      Alert.alert(
        'Success',
        `Resume saved successfully!\n\nLocation: ${savedUri}`,
        [
          {
            text: 'OK',
            style: 'default',
          },
          {
            text: 'Share',
            onPress: handleShare,
            style: 'default',
          },
        ]
      );
    } catch (err) {
      console.error('Error saving PDF:', err);
      Alert.alert('Error', 'Failed to save PDF. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegeneratePDF = () => {
    Alert.alert(
      'Regenerate PDF',
      'Are you sure you want to regenerate the PDF?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Regenerate',
          onPress: generatePDF,
          style: 'default',
        },
      ]
    );
  };

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating your resume...</Text>
        <Text style={styles.loadingSubtext}>This may take a few moments</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorTitle}>Generation Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorActions}>
          <TouchableOpacity style={styles.retryButton} onPress={generatePDF}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Resume Preview</Text>
        
        <TouchableOpacity onPress={onEdit} style={styles.headerButton}>
          <Ionicons name="create" size={24} color="#007AFF" />
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Preview */}
      <View style={styles.previewContainer}>
        {pdfUri ? (
          <WebView
            source={{ uri: pdfUri }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading preview...</Text>
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error: ', nativeEvent);
              setError('Failed to load PDF preview');
            }}
            scalesPageToFit={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.noPreviewContainer}>
            <Ionicons name="document-text" size={64} color="#bdc3c7" />
            <Text style={styles.noPreviewText}>No preview available</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownload}
          disabled={isSaving || !pdfUri}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="download" size={20} color="white" />
          )}
          <Text style={styles.actionButtonText}>
            {isSaving ? 'Saving...' : 'Download'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={isSharing || !pdfUri}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="share" size={20} color="white" />
          )}
          <Text style={styles.actionButtonText}>
            {isSharing ? 'Sharing...' : 'Share'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.regenerateButton]}
          onPress={handleRegeneratePDF}
          disabled={isGenerating || !pdfUri}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.actionButtonText}>Regenerate</Text>
        </TouchableOpacity>
      </View>

      {/* Resume Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>{resumeData.personalInfo.fullName}</Text>
        <Text style={styles.infoSubtitle}>{resumeData.personalInfo.email}</Text>
        <Text style={styles.infoDetails}>
          {resumeData.education.length} Education • {resumeData.workExperience.length} Experience • {resumeData.skills.length} Skills
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    ...Platform.select({
      ios: {
        paddingTop: 44,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  previewContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  noPreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPreviewText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: '#27ae60',
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  regenerateButton: {
    backgroundColor: '#f39c12',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  infoDetails: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
});

export default ResumePreview;
