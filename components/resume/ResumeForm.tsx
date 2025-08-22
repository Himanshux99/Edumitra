import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ResumeData, Education, WorkExperience, ResumeFormErrors } from '../../types/resume';

interface ResumeFormProps {
  onSubmit: (data: ResumeData) => void;
  initialData?: ResumeData;
  isLoading?: boolean;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, initialData, isLoading = false }) => {
  const [formData, setFormData] = useState<ResumeData>(
    initialData || {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        website: '',
      },
      education: [{ id: '1', degree: '', institution: '', year: '', gpa: '', description: '' }],
      skills: [],
      workExperience: [{ id: '1', company: '', role: '', duration: '', description: '', location: '' }],
      summary: '',
    }
  );

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<ResumeFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ResumeFormErrors = {};

    // Validate personal info
    if (!formData.personalInfo.fullName.trim()) {
      newErrors.personalInfo = { ...newErrors.personalInfo, fullName: 'Full name is required' };
    }
    if (!formData.personalInfo.email.trim()) {
      newErrors.personalInfo = { ...newErrors.personalInfo, email: 'Email is required' };
    } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
      newErrors.personalInfo = { ...newErrors.personalInfo, email: 'Invalid email format' };
    }
    if (!formData.personalInfo.phone.trim()) {
      newErrors.personalInfo = { ...newErrors.personalInfo, phone: 'Phone number is required' };
    }

    // Validate education
    formData.education.forEach((edu, index) => {
      if (!edu.degree.trim() || !edu.institution.trim() || !edu.year.trim()) {
        newErrors.education = {
          ...newErrors.education,
          [edu.id]: {
            degree: !edu.degree.trim() ? 'Degree is required' : undefined,
            institution: !edu.institution.trim() ? 'Institution is required' : undefined,
            year: !edu.year.trim() ? 'Year is required' : undefined,
          },
        };
      }
    });

    // Validate work experience
    formData.workExperience.forEach((exp, index) => {
      if (!exp.company.trim() || !exp.role.trim() || !exp.duration.trim() || !exp.description.trim()) {
        newErrors.workExperience = {
          ...newErrors.workExperience,
          [exp.id]: {
            company: !exp.company.trim() ? 'Company is required' : undefined,
            role: !exp.role.trim() ? 'Role is required' : undefined,
            duration: !exp.duration.trim() ? 'Duration is required' : undefined,
            description: !exp.description.trim() ? 'Description is required' : undefined,
          },
        };
      }
    });

    // Validate skills
    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
    }
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      year: '',
      gpa: '',
      description: '',
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  };

  const removeEducation = (id: string) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id),
      }));
    }
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: '',
      location: '',
    };
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExperience],
    }));
  };

  const removeWorkExperience = (id: string) => {
    if (formData.workExperience.length > 1) {
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter(exp => exp.id !== id),
      }));
    }
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.personalInfo?.fullName && styles.inputError]}
              value={formData.personalInfo.fullName}
              onChangeText={(text) =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, fullName: text },
                }))
              }
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
            {errors.personalInfo?.fullName && (
              <Text style={styles.errorText}>{errors.personalInfo.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.personalInfo?.email && styles.inputError]}
              value={formData.personalInfo.email}
              onChangeText={(text) =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, email: text },
                }))
              }
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.personalInfo?.email && (
              <Text style={styles.errorText}>{errors.personalInfo.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={[styles.input, errors.personalInfo?.phone && styles.inputError]}
              value={formData.personalInfo.phone}
              onChangeText={(text) =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, phone: text },
                }))
              }
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            {errors.personalInfo?.phone && (
              <Text style={styles.errorText}>{errors.personalInfo.phone}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.personalInfo.address}
              onChangeText={(text) =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, address: text },
                }))
              }
              placeholder="Enter your address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn</Text>
            <TextInput
              style={styles.input}
              value={formData.personalInfo.linkedIn}
              onChangeText={(text) =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, linkedIn: text },
                }))
              }
              placeholder="LinkedIn profile URL"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={formData.personalInfo.website}
              onChangeText={(text) =>
                setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, website: text },
                }))
              }
              placeholder="Personal website URL"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Professional Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.summary}
              onChangeText={(text) => setFormData(prev => ({ ...prev, summary: text }))}
              placeholder="Write a brief professional summary (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity onPress={addEducation} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {formData.education.map((edu, index) => (
            <View key={edu.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Education {index + 1}</Text>
                {formData.education.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEducation(edu.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Degree *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.education?.[edu.id]?.degree && styles.inputError,
                  ]}
                  value={edu.degree}
                  onChangeText={(text) => updateEducation(edu.id, 'degree', text)}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                  placeholderTextColor="#999"
                />
                {errors.education?.[edu.id]?.degree && (
                  <Text style={styles.errorText}>{errors.education[edu.id].degree}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Institution *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.education?.[edu.id]?.institution && styles.inputError,
                  ]}
                  value={edu.institution}
                  onChangeText={(text) => updateEducation(edu.id, 'institution', text)}
                  placeholder="e.g., University of California, Berkeley"
                  placeholderTextColor="#999"
                />
                {errors.education?.[edu.id]?.institution && (
                  <Text style={styles.errorText}>{errors.education[edu.id].institution}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Year *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.education?.[edu.id]?.year && styles.inputError,
                    ]}
                    value={edu.year}
                    onChangeText={(text) => updateEducation(edu.id, 'year', text)}
                    placeholder="e.g., 2020-2024"
                    placeholderTextColor="#999"
                  />
                  {errors.education?.[edu.id]?.year && (
                    <Text style={styles.errorText}>{errors.education[edu.id].year}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.label}>GPA</Text>
                  <TextInput
                    style={styles.input}
                    value={edu.gpa}
                    onChangeText={(text) => updateEducation(edu.id, 'gpa', text)}
                    placeholder="e.g., 3.8/4.0"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={edu.description}
                  onChangeText={(text) => updateEducation(edu.id, 'description', text)}
                  placeholder="Additional details about your education (optional)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          
          <View style={styles.skillInputContainer}>
            <TextInput
              style={[styles.input, styles.skillInput]}
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="Enter a skill and press Add"
              placeholderTextColor="#999"
              onSubmitEditing={addSkill}
            />
            <TouchableOpacity onPress={addSkill} style={styles.addSkillButton}>
              <Text style={styles.addSkillButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}

          <View style={styles.skillsContainer}>
            {formData.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <Ionicons name="close-circle" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Work Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            <TouchableOpacity onPress={addWorkExperience} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {formData.workExperience.map((exp, index) => (
            <View key={exp.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Experience {index + 1}</Text>
                {formData.workExperience.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeWorkExperience(exp.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Company *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.workExperience?.[exp.id]?.company && styles.inputError,
                  ]}
                  value={exp.company}
                  onChangeText={(text) => updateWorkExperience(exp.id, 'company', text)}
                  placeholder="e.g., Google Inc."
                  placeholderTextColor="#999"
                />
                {errors.workExperience?.[exp.id]?.company && (
                  <Text style={styles.errorText}>{errors.workExperience[exp.id].company}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.workExperience?.[exp.id]?.role && styles.inputError,
                  ]}
                  value={exp.role}
                  onChangeText={(text) => updateWorkExperience(exp.id, 'role', text)}
                  placeholder="e.g., Software Engineer"
                  placeholderTextColor="#999"
                />
                {errors.workExperience?.[exp.id]?.role && (
                  <Text style={styles.errorText}>{errors.workExperience[exp.id].role}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Duration *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.workExperience?.[exp.id]?.duration && styles.inputError,
                    ]}
                    value={exp.duration}
                    onChangeText={(text) => updateWorkExperience(exp.id, 'duration', text)}
                    placeholder="e.g., Jan 2022 - Present"
                    placeholderTextColor="#999"
                  />
                  {errors.workExperience?.[exp.id]?.duration && (
                    <Text style={styles.errorText}>{errors.workExperience[exp.id].duration}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.location}
                    onChangeText={(text) => updateWorkExperience(exp.id, 'location', text)}
                    placeholder="e.g., San Francisco, CA"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.workExperience?.[exp.id]?.description && styles.inputError,
                  ]}
                  value={exp.description}
                  onChangeText={(text) => updateWorkExperience(exp.id, 'description', text)}
                  placeholder="Describe your responsibilities and achievements"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.workExperience?.[exp.id]?.description && (
                  <Text style={styles.errorText}>{errors.workExperience[exp.id].description}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Generating Resume...' : 'Generate Resume'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  skillInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  skillInput: {
    flex: 1,
    marginRight: 8,
  },
  addSkillButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addSkillButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  skillText: {
    color: '#1976d2',
    marginRight: 6,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 50,
  },
});

export default ResumeForm;
