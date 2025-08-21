import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { studentDataService } from '../../services/studentDataService';
import {
  StudentDataUploadForm as FormData,
  SubjectFormData,
  CompletedCourseFormData,
  StudentDataValidationErrors,
  StudentAcademicData
} from '../../types/student';
import {
  validateStudentDataForm,
  hasValidationErrors,
  getFirstValidationError,
  gradeToPoints,
  calculateCGPA
} from '../../utils/studentDataValidation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface StudentDataUploadFormProps {
  onSuccess?: (data: StudentAcademicData) => void;
  onCancel?: () => void;
  initialData?: Partial<FormData>;
}

export default function StudentDataUploadForm({
  onSuccess,
  onCancel,
  initialData
}: StudentDataUploadFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useAuth();

  // Helper function to create empty subject
  function createEmptySubject(): SubjectFormData {
    return {
      subjectCode: '',
      subjectName: '',
      credits: '',
      grade: '',
      marks: '',
      maxMarks: '',
      semester: '',
      examType: 'final'
    };
  }

  // Helper function to create empty completed course
  function createEmptyCompletedCourse(): CompletedCourseFormData {
    return {
      courseCode: '',
      courseName: '',
      credits: '',
      grade: '',
      completionDate: '',
      semester: '',
      instructor: ''
    };
  }

  // Form state
  const [formData, setFormData] = useState<FormData>({
    cgpa: initialData?.cgpa || '',
    currentSemester: initialData?.currentSemester || '',
    academicYear: initialData?.academicYear || '2023-24',
    overallAttendance: initialData?.overallAttendance || '',
    totalClasses: initialData?.totalClasses || '',
    attendedClasses: initialData?.attendedClasses || '',
    subjects: initialData?.subjects || [createEmptySubject()],
    completedCourses: initialData?.completedCourses || [createEmptyCompletedCourse()]
  });

  const [errors, setErrors] = useState<StudentDataValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f5f5f5',
    },
    scrollContainer: {
      padding: 20,
    },
    section: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      ...(Platform.OS === 'web' ? {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitleText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    sectionIcon: {
      marginRight: 8,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e0e0e0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff',
    },
    inputError: {
      borderColor: '#ff4444',
    },
    errorText: {
      fontSize: 12,
      color: '#ff4444',
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    flex1: {
      flex: 1,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tint + '20',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    addButtonText: {
      color: colors.tint,
      fontWeight: '600',
      marginLeft: 8,
    },
    removeButton: {
      backgroundColor: '#ff444420',
      borderRadius: 6,
      padding: 8,
      alignSelf: 'flex-end',
      marginBottom: 8,
    },
    submitButton: {
      backgroundColor: colors.tint,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonDisabled: {
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#cccccc',
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    cancelButtonText: {
      color: colors.tint,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as keyof StudentDataValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle subject changes
  const handleSubjectChange = (index: number, field: keyof SubjectFormData, value: string) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    setFormData(prev => ({ ...prev, subjects: updatedSubjects }));
    
    // Clear subject error
    if (errors.subjects?.[index]?.[field]) {
      const updatedErrors = { ...errors };
      if (updatedErrors.subjects) {
        delete updatedErrors.subjects[index][field];
        if (Object.keys(updatedErrors.subjects[index]).length === 0) {
          delete updatedErrors.subjects[index];
        }
      }
      setErrors(updatedErrors);
    }
  };

  // Handle completed course changes
  const handleCompletedCourseChange = (index: number, field: keyof CompletedCourseFormData, value: string) => {
    const updatedCourses = [...formData.completedCourses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setFormData(prev => ({ ...prev, completedCourses: updatedCourses }));
    
    // Clear course error
    if (errors.completedCourses?.[index]?.[field]) {
      const updatedErrors = { ...errors };
      if (updatedErrors.completedCourses) {
        delete updatedErrors.completedCourses[index][field];
        if (Object.keys(updatedErrors.completedCourses[index]).length === 0) {
          delete updatedErrors.completedCourses[index];
        }
      }
      setErrors(updatedErrors);
    }
  };

  // Add new subject
  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, createEmptySubject()]
    }));
  };

  // Remove subject
  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, subjects: updatedSubjects }));
    }
  };

  // Add new completed course
  const addCompletedCourse = () => {
    setFormData(prev => ({
      ...prev,
      completedCourses: [...prev.completedCourses, createEmptyCompletedCourse()]
    }));
  };

  // Remove completed course
  const removeCompletedCourse = (index: number) => {
    if (formData.completedCourses.length > 1) {
      const updatedCourses = formData.completedCourses.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, completedCourses: updatedCourses }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validate form data
      const validationErrors = validateStudentDataForm(formData);
      
      if (hasValidationErrors(validationErrors)) {
        setErrors(validationErrors);
        const firstError = getFirstValidationError(validationErrors);
        if (firstError) {
          Alert.alert('Validation Error', firstError);
        }
        return;
      }

      if (!userProfile?.uid) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Convert form data to StudentAcademicData format
      const studentData = convertFormDataToStudentData(formData, userProfile.uid);
      
      // Upload data to Firebase
      const result = await studentDataService.uploadStudentData(userProfile.uid, studentData);
      
      if (result.success && result.data) {
        Alert.alert('Success', result.message || 'Student data uploaded successfully');
        onSuccess?.(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to upload student data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert form data to StudentAcademicData format
  const convertFormDataToStudentData = (formData: FormData, userId: string): Omit<StudentAcademicData, 'id' | 'createdAt' | 'lastUpdated'> => {
    return {
      userId,
      studentId: userProfile?.studentData?.studentId || 'STU001',
      cgpa: parseFloat(formData.cgpa),
      currentSemester: parseInt(formData.currentSemester),
      totalSemesters: 8, // Default value
      attendance: {
        overallPercentage: parseFloat(formData.overallAttendance),
        totalClasses: parseInt(formData.totalClasses),
        attendedClasses: parseInt(formData.attendedClasses),
        subjectWiseAttendance: [], // Can be calculated from subjects
        lastUpdated: new Date().toISOString()
      },
      subjects: formData.subjects.map(subject => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        credits: parseInt(subject.credits),
        grade: subject.grade,
        gradePoints: gradeToPoints(subject.grade),
        marks: parseFloat(subject.marks),
        maxMarks: parseFloat(subject.maxMarks),
        semester: parseInt(subject.semester),
        examType: subject.examType as any
      })),
      completedCourses: formData.completedCourses.map(course => ({
        courseId: course.courseCode,
        courseName: course.courseName,
        courseCode: course.courseCode,
        credits: parseInt(course.credits),
        grade: course.grade,
        gradePoints: gradeToPoints(course.grade),
        completionDate: course.completionDate,
        semester: parseInt(course.semester),
        instructor: course.instructor
      })),
      academicMetrics: {
        semesterGPAs: [],
        academicStanding: 'satisfactory',
        totalCreditsEarned: 0,
        totalCreditsRequired: 120,
        progressPercentage: 0,
        performanceTrend: 'stable',
        achievements: [],
        academicAlerts: []
      },
      academicYear: formData.academicYear
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Basic Academic Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="graduationcap.fill" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Academic Information</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>CGPA *</Text>
              <TextInput
                style={[styles.input, errors.cgpa && styles.inputError]}
                placeholder="e.g., 8.5"
                value={formData.cgpa}
                onChangeText={(value) => handleInputChange('cgpa', value)}
                keyboardType="decimal-pad"
                editable={!isLoading}
              />
              {errors.cgpa && <Text style={styles.errorText}>{errors.cgpa}</Text>}
            </View>
            
            <View style={styles.flex1}>
              <Text style={styles.label}>Current Semester *</Text>
              <TextInput
                style={[styles.input, errors.general && styles.inputError]}
                placeholder="e.g., 6"
                value={formData.currentSemester}
                onChangeText={(value) => handleInputChange('currentSemester', value)}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Academic Year *</Text>
            <TextInput
              style={[styles.input, errors.general && styles.inputError]}
              placeholder="e.g., 2023-24"
              value={formData.academicYear}
              onChangeText={(value) => handleInputChange('academicYear', value)}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Attendance Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="calendar.badge.checkmark" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Attendance Information</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Overall Attendance (%) *</Text>
            <TextInput
              style={[styles.input, errors.attendance && styles.inputError]}
              placeholder="e.g., 85.5"
              value={formData.overallAttendance}
              onChangeText={(value) => handleInputChange('overallAttendance', value)}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            {errors.attendance && <Text style={styles.errorText}>{errors.attendance}</Text>}
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Total Classes</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100"
                value={formData.totalClasses}
                onChangeText={(value) => handleInputChange('totalClasses', value)}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.flex1}>
              <Text style={styles.label}>Attended Classes</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 85"
                value={formData.attendedClasses}
                onChangeText={(value) => handleInputChange('attendedClasses', value)}
                keyboardType="number-pad"
                editable={!isLoading}
              />
            </View>
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <IconSymbol name="book.fill" size={20} color={colors.tint} style={styles.sectionIcon} />
            <Text style={styles.sectionTitleText}>Subject Performance</Text>
          </View>

          {formData.subjects.map((subject, index) => (
            <View key={index} style={{ marginBottom: 16 }}>
              {formData.subjects.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSubject(index)}
                >
                  <IconSymbol name="trash" size={16} color="#ff4444" />
                </TouchableOpacity>
              )}

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Subject Code *</Text>
                  <TextInput
                    style={[styles.input, errors.subjects?.[index]?.subjectCode && styles.inputError]}
                    placeholder="e.g., CS101"
                    value={subject.subjectCode}
                    onChangeText={(value) => handleSubjectChange(index, 'subjectCode', value)}
                    editable={!isLoading}
                  />
                  {errors.subjects?.[index]?.subjectCode && (
                    <Text style={styles.errorText}>{errors.subjects[index].subjectCode}</Text>
                  )}
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.label}>Credits *</Text>
                  <TextInput
                    style={[styles.input, errors.subjects?.[index]?.credits && styles.inputError]}
                    placeholder="e.g., 3"
                    value={subject.credits}
                    onChangeText={(value) => handleSubjectChange(index, 'credits', value)}
                    keyboardType="number-pad"
                    editable={!isLoading}
                  />
                  {errors.subjects?.[index]?.credits && (
                    <Text style={styles.errorText}>{errors.subjects[index].credits}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Subject Name *</Text>
                <TextInput
                  style={[styles.input, errors.subjects?.[index]?.subjectName && styles.inputError]}
                  placeholder="e.g., Introduction to Computer Science"
                  value={subject.subjectName}
                  onChangeText={(value) => handleSubjectChange(index, 'subjectName', value)}
                  editable={!isLoading}
                />
                {errors.subjects?.[index]?.subjectName && (
                  <Text style={styles.errorText}>{errors.subjects[index].subjectName}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={styles.flex1}>
                  <Text style={styles.label}>Grade *</Text>
                  <TextInput
                    style={[styles.input, errors.subjects?.[index]?.grade && styles.inputError]}
                    placeholder="e.g., A"
                    value={subject.grade}
                    onChangeText={(value) => handleSubjectChange(index, 'grade', value.toUpperCase())}
                    editable={!isLoading}
                  />
                  {errors.subjects?.[index]?.grade && (
                    <Text style={styles.errorText}>{errors.subjects[index].grade}</Text>
                  )}
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.label}>Marks *</Text>
                  <TextInput
                    style={[styles.input, errors.subjects?.[index]?.marks && styles.inputError]}
                    placeholder="e.g., 85"
                    value={subject.marks}
                    onChangeText={(value) => handleSubjectChange(index, 'marks', value)}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                  {errors.subjects?.[index]?.marks && (
                    <Text style={styles.errorText}>{errors.subjects[index].marks}</Text>
                  )}
                </View>

                <View style={styles.flex1}>
                  <Text style={styles.label}>Max Marks *</Text>
                  <TextInput
                    style={[styles.input, errors.subjects?.[index]?.maxMarks && styles.inputError]}
                    placeholder="e.g., 100"
                    value={subject.maxMarks}
                    onChangeText={(value) => handleSubjectChange(index, 'maxMarks', value)}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                  {errors.subjects?.[index]?.maxMarks && (
                    <Text style={styles.errorText}>{errors.subjects[index].maxMarks}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addSubject}>
            <IconSymbol name="plus" size={16} color={colors.tint} />
            <Text style={styles.addButtonText}>Add Subject</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Buttons */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Upload Student Data</Text>
          )}
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
