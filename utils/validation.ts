import { SignUpFormData, SignInFormData, FormErrors } from '../types/auth';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Phone number validation regex (basic international format)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Name validation regex (letters, spaces, hyphens, apostrophes)
const NAME_REGEX = /^[a-zA-Z\s\-']+$/;

// Validate email format
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return 'Email is required';
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return undefined;
}

// Validate password strength
export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  
  return undefined;
}

// Validate password confirmation
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return undefined;
}

// Validate name fields
export function validateName(name: string, fieldName: string): string | undefined {
  if (!name) {
    return `${fieldName} is required`;
  }
  
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  
  if (!NAME_REGEX.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return undefined;
}

// Validate phone number
export function validatePhoneNumber(phone: string): string | undefined {
  if (!phone) {
    return undefined; // Phone is optional
  }
  
  if (!PHONE_REGEX.test(phone)) {
    return 'Please enter a valid phone number';
  }
  
  return undefined;
}

// Validate student ID
export function validateStudentId(studentId: string): string | undefined {
  if (!studentId) {
    return 'Student ID is required';
  }
  
  if (studentId.length < 3) {
    return 'Student ID must be at least 3 characters long';
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(studentId)) {
    return 'Student ID can only contain letters and numbers';
  }
  
  return undefined;
}

// Validate employee ID
export function validateEmployeeId(employeeId: string): string | undefined {
  if (!employeeId) {
    return 'Employee ID is required';
  }
  
  if (employeeId.length < 3) {
    return 'Employee ID must be at least 3 characters long';
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(employeeId)) {
    return 'Employee ID can only contain letters and numbers';
  }
  
  return undefined;
}

// Validate sign in form
export function validateSignInForm(data: SignInFormData): FormErrors {
  const errors: FormErrors = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
}

// Validate sign up form
export function validateSignUpForm(data: SignUpFormData): FormErrors {
  const errors: FormErrors = {};
  
  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Password validation
  const passwordError = validatePassword(data.password);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  // Confirm password validation
  const confirmPasswordError = validatePasswordConfirmation(
    data.password,
    data.confirmPassword
  );
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }
  
  // First name validation
  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) {
    errors.firstName = firstNameError;
  }
  
  // Last name validation
  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) {
    errors.lastName = lastNameError;
  }
  
  // Phone number validation
  const phoneError = validatePhoneNumber(data.phoneNumber || '');
  if (phoneError) {
    errors.phoneNumber = phoneError;
  }
  
  return errors;
}

// Check if form has any errors
export function hasFormErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Get first error message
export function getFirstError(errors: FormErrors): string | undefined {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    return errors[errorKeys[0] as keyof FormErrors];
  }
  return undefined;
}

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string;
  color: string;
} {
  if (!password) {
    return { score: 0, feedback: 'Enter a password', color: '#ccc' };
  }
  
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('at least 8 characters');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('an uppercase letter');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('a lowercase letter');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('a number');
  }
  
  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push('a special character');
  }
  
  // Return strength assessment
  if (score === 0) {
    return { score, feedback: 'Very weak', color: '#ff4444' };
  } else if (score <= 2) {
    return { score, feedback: `Weak - add ${feedback.join(', ')}`, color: '#ff8800' };
  } else if (score <= 3) {
    return { score, feedback: `Fair - add ${feedback.join(', ')}`, color: '#ffaa00' };
  } else if (score <= 4) {
    return { score, feedback: 'Good', color: '#88cc00' };
  } else {
    return { score, feedback: 'Strong', color: '#00cc44' };
  }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate and sanitize form data
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  });

  return sanitized;
}
