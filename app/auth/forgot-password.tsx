import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.tint,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
      textAlign: 'center',
      lineHeight: 22,
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
      borderRadius: 12,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
    },
    inputWrapperError: {
      borderColor: '#ff4444',
    },
    input: {
      flex: 1,
      padding: 16,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    inputIcon: {
      paddingHorizontal: 12,
    },
    errorText: {
      fontSize: 14,
      color: '#ff4444',
      marginTop: 4,
    },
    resetButton: {
      backgroundColor: colors.tint,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    resetButtonDisabled: {
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#cccccc',
    },
    resetButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    successContainer: {
      backgroundColor: '#e6f7e6',
      borderColor: '#4CAF50',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    successIcon: {
      marginBottom: 12,
    },
    successTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2E7D32',
      marginBottom: 8,
    },
    successMessage: {
      fontSize: 14,
      color: '#388E3C',
      textAlign: 'center',
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
    backLink: {
      fontSize: 16,
      color: colors.tint,
      fontWeight: '600',
      marginLeft: 4,
    },
    errorContainer: {
      backgroundColor: '#ffe6e6',
      borderColor: '#ff4444',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorMessage: {
      color: '#cc0000',
      fontSize: 14,
      textAlign: 'center',
    },
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Clear email error when user starts typing
    if (emailError) {
      setEmailError(undefined);
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleResetPassword = async () => {
    try {
      // Validate email
      const emailValidationError = validateEmail(email);
      
      if (emailValidationError) {
        setEmailError(emailValidationError);
        return;
      }

      // Clear errors
      setEmailError(undefined);
      clearError();

      // Send reset email
      await resetPassword(email);
      
      // Show success state
      setIsEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      // Error is handled by the auth context
    }
  };

  const handleBackToSignIn = () => {
    router.push('/auth/signin');
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setEmail('');
  };

  const isFormValid = email && !emailError;

  if (isEmailSent) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* Success State */}
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <IconSymbol size={48} name="checkmark.circle.fill" color="#4CAF50" />
              </View>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent a password reset link to {email}. 
                Please check your email and follow the instructions to reset your password.
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.resetButton} onPress={handleBackToSignIn}>
              <Text style={styles.resetButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Didn't receive the email?</Text>
              <TouchableOpacity onPress={handleTryAgain}>
                <Text style={styles.backLink}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <IconSymbol size={40} name="key.fill" color="#ffffff" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[
                styles.inputWrapper,
                emailError && styles.inputWrapperError
              ]}>
                <View style={styles.inputIcon}>
                  <IconSymbol size={20} name="envelope" color={colors.tint} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                (!isFormValid || isLoading) && styles.resetButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity onPress={handleBackToSignIn}>
              <Text style={styles.backLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
