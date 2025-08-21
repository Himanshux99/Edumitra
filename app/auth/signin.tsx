import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { SignInFormData, FormErrors } from '../../types/auth';
import { validateSignInForm, hasFormErrors } from '../../utils/validation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

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
    inputWrapperFocused: {
      borderColor: colors.tint,
      borderWidth: 2,
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
    passwordToggle: {
      paddingHorizontal: 12,
    },
    errorText: {
      fontSize: 14,
      color: '#ff4444',
      marginTop: 4,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 8,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: colors.tint,
      fontWeight: '600',
    },
    signInButton: {
      backgroundColor: colors.tint,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    signInButtonDisabled: {
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#cccccc',
    },
    signInButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
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
    signUpLink: {
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

  const handleInputChange = (field: keyof SignInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSignIn = async () => {
    try {
      // Validate form
      const validationErrors = validateSignInForm(formData);
      
      if (hasFormErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      // Clear errors
      setErrors({});
      clearError();

      // Attempt sign in
      await signIn(formData);

      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Sign in error:', error);
      // Error is handled by the auth context
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const isFormValid = formData.email && formData.password && !hasFormErrors(errors);

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
              <IconSymbol size={40} name="graduationcap.fill" color="#ffffff" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
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
                errors.email && styles.inputWrapperError
              ]}>
                <View style={styles.inputIcon}>
                  <IconSymbol size={20} name="envelope" color={colors.tint} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.inputWrapper,
                errors.password && styles.inputWrapperError
              ]}>
                <View style={styles.inputIcon}>
                  <IconSymbol size={20} name="lock" color={colors.tint} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <IconSymbol 
                    size={20} 
                    name={showPassword ? "eye.slash" : "eye"} 
                    color={colorScheme === 'dark' ? '#666666' : '#999999'} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.signInButton,
                (!isFormValid || isLoading) && styles.signInButtonDisabled
              ]}
              onPress={handleSignIn}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Dont have an account?</Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
