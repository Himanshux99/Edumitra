import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = screenWidth >= 768;
const isSmallScreen = screenWidth < 375;

// Color palette
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  
  // Grays
  dark: '#2c3e50',
  medium: '#34495e',
  light: '#7f8c8d',
  lighter: '#95a5a6',
  lightest: '#bdc3c7',
  
  // Backgrounds
  background: '#f8f9fa',
  surface: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Borders
  border: '#e1e8ed',
  borderLight: '#ecf0f1',
  
  // Text
  textPrimary: '#2c3e50',
  textSecondary: '#7f8c8d',
  textLight: '#95a5a6',
  textPlaceholder: '#999999',
};

// Typography
export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  
  // Font weights
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  
  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  
  // Typography
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  
  subtitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  body: {
    fontSize: typography.base,
    color: colors.textPrimary,
    lineHeight: typography.base * typography.normal,
  },
  
  caption: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  
  // Buttons
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.sm,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  
  buttonWarning: {
    backgroundColor: colors.warning,
  },
  
  buttonDanger: {
    backgroundColor: colors.danger,
  },
  
  buttonText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.surface,
  },
  
  buttonDisabled: {
    backgroundColor: colors.lighter,
  },
  
  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.base,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    minHeight: 48,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  inputError: {
    borderColor: colors.danger,
  },
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Labels and errors
  label: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  errorText: {
    fontSize: typography.sm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  
  // Layout helpers
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  flex1: {
    flex: 1,
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  // Margins and padding
  mt: {
    marginTop: spacing.md,
  },
  
  mb: {
    marginBottom: spacing.md,
  },
  
  ml: {
    marginLeft: spacing.md,
  },
  
  mr: {
    marginRight: spacing.md,
  },
  
  mx: {
    marginHorizontal: spacing.md,
  },
  
  my: {
    marginVertical: spacing.md,
  },
  
  pt: {
    paddingTop: spacing.md,
  },
  
  pb: {
    paddingBottom: spacing.md,
  },
  
  pl: {
    paddingLeft: spacing.md,
  },
  
  pr: {
    paddingRight: spacing.md,
  },
  
  px: {
    paddingHorizontal: spacing.md,
  },
  
  py: {
    paddingVertical: spacing.md,
  },
});

// Responsive styles
export const responsiveStyles = StyleSheet.create({
  // Responsive containers
  containerTablet: {
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
  },
  
  // Responsive text
  titleResponsive: {
    fontSize: isTablet ? typography['3xl'] : typography['2xl'],
  },
  
  // Responsive spacing
  sectionResponsive: {
    padding: isTablet ? spacing['2xl'] : spacing.lg,
    marginHorizontal: isTablet ? spacing.xl : 0,
  },
  
  // Responsive buttons
  buttonResponsive: {
    paddingVertical: isTablet ? spacing.lg : spacing.md,
    paddingHorizontal: isTablet ? spacing['2xl'] : spacing.xl,
  },
});

// Platform-specific styles
export const platformStyles = StyleSheet.create({
  // iOS specific
  iosShadow: Platform.select({
    ios: shadows.md,
    android: {},
  }),
  
  // Android specific
  androidElevation: Platform.select({
    ios: {},
    android: {
      elevation: 5,
    },
  }),
  
  // Safe area handling
  safeAreaTop: {
    paddingTop: Platform.select({
      ios: 44,
      android: 24,
    }),
  },
});

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
  responsiveStyles,
  platformStyles,
};
