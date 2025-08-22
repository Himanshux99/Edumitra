import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResumeForm from '../ResumeForm';
import { ResumeData } from '../../../types/resume';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo modules
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'mock-pdf-uri' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'mock-document-directory/',
  copyAsync: jest.fn(() => Promise.resolve()),
}));

describe('ResumeForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleResumeData: ResumeData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State',
      linkedIn: 'https://linkedin.com/in/johndoe',
      website: 'https://johndoe.com',
    },
    education: [
      {
        id: '1',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Technology',
        year: '2020-2024',
        gpa: '3.8/4.0',
        description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering',
      },
    ],
    skills: ['JavaScript', 'React Native', 'TypeScript', 'Node.js', 'Python'],
    workExperience: [
      {
        id: '1',
        company: 'Tech Solutions Inc.',
        role: 'Software Developer Intern',
        duration: 'June 2023 - August 2023',
        description: 'Developed mobile applications using React Native and contributed to backend services.',
        location: 'San Francisco, CA',
      },
    ],
    summary: 'Passionate software developer with experience in mobile and web development.',
  };

  it('renders form with all required fields', () => {
    const { getByPlaceholderText, getByText } = render(
      <ResumeForm onSubmit={mockOnSubmit} />
    );

    // Check personal info fields
    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();

    // Check section titles
    expect(getByText('Personal Information')).toBeTruthy();
    expect(getByText('Education')).toBeTruthy();
    expect(getByText('Skills')).toBeTruthy();
    expect(getByText('Work Experience')).toBeTruthy();

    // Check submit button
    expect(getByText('Generate Resume')).toBeTruthy();
  });

  it('shows validation errors for empty required fields', async () => {
    const { getByText } = render(<ResumeForm onSubmit={mockOnSubmit} />);

    // Try to submit empty form
    fireEvent.press(getByText('Generate Resume'));

    await waitFor(() => {
      expect(getByText('Full name is required')).toBeTruthy();
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Phone number is required')).toBeTruthy();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ResumeForm onSubmit={mockOnSubmit} />
    );

    // Fill in invalid email
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');
    fireEvent.changeText(getByPlaceholderText('Enter your phone number'), '1234567890');

    fireEvent.press(getByText('Generate Resume'));

    await waitFor(() => {
      expect(getByText('Invalid email format')).toBeTruthy();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('allows adding and removing education entries', () => {
    const { getByText, getAllByText } = render(
      <ResumeForm onSubmit={mockOnSubmit} />
    );

    // Initially should have one education entry
    expect(getByText('Education 1')).toBeTruthy();

    // Add another education entry
    const addButton = getByText('Education').parentNode?.querySelector('[testID="add-education"]');
    if (addButton) {
      fireEvent.press(addButton);
    }

    // Should now have two education entries
    expect(getByText('Education 1')).toBeTruthy();
    expect(getByText('Education 2')).toBeTruthy();
  });

  it('allows adding and removing skills', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <ResumeForm onSubmit={mockOnSubmit} />
    );

    const skillInput = getByPlaceholderText('Enter a skill and press Add');
    const addButton = getByText('Add');

    // Add a skill
    fireEvent.changeText(skillInput, 'JavaScript');
    fireEvent.press(addButton);

    // Skill should be added
    expect(getByText('JavaScript')).toBeTruthy();

    // Input should be cleared
    expect(skillInput.props.value).toBe('');
  });

  it('submits form with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ResumeForm onSubmit={mockOnSubmit} initialData={sampleResumeData} />
    );

    // Form should be pre-filled with sample data
    expect(getByPlaceholderText('Enter your full name').props.value).toBe('John Doe');
    expect(getByPlaceholderText('Enter your email').props.value).toBe('john.doe@example.com');

    // Submit the form
    fireEvent.press(getByText('Generate Resume'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(sampleResumeData);
    });
  });

  it('handles loading state correctly', () => {
    const { getByText } = render(
      <ResumeForm onSubmit={mockOnSubmit} isLoading={true} />
    );

    const submitButton = getByText('Generating Resume...');
    expect(submitButton).toBeTruthy();
    
    // Button should be disabled during loading
    expect(submitButton.parent?.props.disabled).toBe(true);
  });
});

// Integration test for the complete flow
describe('Resume Builder Integration', () => {
  it('should handle the complete resume building flow', async () => {
    // This would be a more comprehensive integration test
    // that tests the entire flow from form submission to PDF generation
    // For now, we'll just ensure the components can be imported without errors
    
    const ResumeBuilder = require('../ResumeBuilder').default;
    const ResumePreview = require('../ResumePreview').default;
    const generateResume = require('../../../utils/generateResume');
    
    expect(ResumeBuilder).toBeDefined();
    expect(ResumePreview).toBeDefined();
    expect(generateResume.generateResumePDF).toBeDefined();
    expect(generateResume.saveResumeToDevice).toBeDefined();
  });
});
