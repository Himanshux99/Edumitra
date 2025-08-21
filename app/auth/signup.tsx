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
import { SignUpFormData, FormErrors, UserRole } from '../../types/auth';
import { validateSignUpForm, hasFormErrors, getPasswordStrength } from '../../utils/validation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userRoles: { label: string; value: UserRole }[] = [
    { label: 'Student', value: 'student' },
    { label: 'Teacher', value: 'teacher' },
    { label: 'Parent', value: 'parent' },
    { label: 'Admin', value: 'admin' },
  ];

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
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    inputContainer: {
      flex: 1,
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
    roleSelector: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      padding: 8,
    },
    roleOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
    },
    roleOptionSelected: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    roleOptionText: {
      fontSize: 14,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    roleOptionTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    errorText: {
      fontSize: 14,
      color: '#ff4444',
      marginTop: 4,
    },
    passwordStrength: {
      marginTop: 8,
    },
    strengthBar: {
      height: 4,
      borderRadius: 2,
      marginBottom: 4,
    },
    strengthText: {
      fontSize: 12,
    },
    signUpButton: {
      backgroundColor: colors.tint,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    signUpButtonDisabled: {
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#cccccc',
    },
    signUpButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
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
    signInLink: {
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

  const handleInputChange = (field: keyof SignUpFormData, value: string | UserRole) => {
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

  const handleSignUp = async () => {
    try {
      // Validate form
      const validationErrors = validateSignUpForm(formData);
      
      if (hasFormErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      // Clear errors
      setErrors({});
      clearError();

      // Attempt sign up
      await signUp(formData);

      // Navigation will be handled by the auth state change
    } catch (error) {
      console.error('Sign up error:', error);
      // Error is handled by the auth context
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const isFormValid = 
    formData.email && 
    formData.password && 
    formData.confirmPassword &&
    formData.firstName &&
    formData.lastName &&
    !hasFormErrors(errors);

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
              <IconSymbol size={40} name="person.badge.plus" color="#ffffff" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join EduMitra and start your learning journey</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Name Row */}
            <View style={styles.row}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <View style={[
                  styles.inputWrapper,
                  errors.firstName && styles.inputWrapperError
                ]}>
                  <View style={styles.inputIcon}>
                    <IconSymbol size={20} name="person" color={colors.tint} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <View style={[
                  styles.inputWrapper,
                  errors.lastName && styles.inputWrapperError
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
            </View>

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

            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <IconSymbol size={20} name="person.3" color={colors.tint} />
                </View>
                <View style={styles.roleSelector}>
                  {userRoles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleOption,
                        formData.role === role.value && styles.roleOptionSelected
                      ]}
                      onPress={() => handleInputChange('role', role.value)}
                      disabled={isLoading}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        formData.role === role.value && styles.roleOptionTextSelected
                      ]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <View style={[
                styles.inputWrapper,
                errors.phoneNumber && styles.inputWrapperError
              ]}>
                <View style={styles.inputIcon}>
                  <IconSymbol size={20} name="phone" color={colors.tint} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
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
                  placeholder="Create a password"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <View style={styles.passwordStrength}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor: passwordStrength.color,
                        width: `${(passwordStrength.score / 5) * 100}%`
                      }
                    ]}
                  />
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.feedback}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                errors.confirmPassword && styles.inputWrapperError
              ]}>
                <View style={styles.inputIcon}>
                  <IconSymbol size={20} name="lock" color={colors.tint} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#666666' : '#999999'}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <IconSymbol
                    size={20}
                    name={showConfirmPassword ? "eye.slash" : "eye"}
                    color={colorScheme === 'dark' ? '#666666' : '#999999'}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                (!isFormValid || isLoading) && styles.signUpButtonDisabled
              ]}
              onPress={handleSignUp}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
