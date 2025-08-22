import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { resumeService } from '../../../services/resumeService';
import { Education, Project, ResumeData, WorkExperience } from '../../../types/resume';
import { generateResumePDF } from '../../../utils/generateResume';

// Skills Input Component
interface SkillsInputProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

const SkillsInput: React.FC<SkillsInputProps> = ({ skills, onAddSkill, onRemoveSkill }) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      onAddSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  return (
    <View>
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.input, styles.skillInput]}
          value={skillInput}
          onChangeText={setSkillInput}
          placeholder="Enter a skill and press Add"
          placeholderTextColor="#999"
          onSubmitEditing={handleAddSkill}
        />
        <TouchableOpacity onPress={handleAddSkill} style={styles.addSkillButton}>
          <Text style={styles.addSkillButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.skillsContainer}>
        {skills.map((skill, index) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
            <TouchableOpacity onPress={() => onRemoveSkill(skill)}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const ResumeEditor: React.FC = () => {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    if (id) {
      loadResume();
    }
  }, [id]);

  const loadResume = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const resume = await resumeService.getResumeById(id);
      if (resume) {
        setResumeData(resume);
      } else {
        Alert.alert('Error', 'Resume not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      Alert.alert('Error', 'Failed to load resume');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!resumeData || !id) return;

    try {
      setSaving(true);
      await resumeService.updateResume(id, resumeData);
      Alert.alert('Success', 'Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      Alert.alert('Error', 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!resumeData) return;

    try {
      setGeneratingPDF(true);
      const pdfUri = await generateResumePDF(resumeData);
      
      // Share the PDF
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Resume PDF',
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const addEducation = () => {
    if (!resumeData) return;
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      year: '',
      gpa: '',
      description: '',
      location: '',
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEducation],
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id),
    });
  };

  const addWorkExperience = () => {
    if (!resumeData) return;
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      role: '',
      duration: '',
      description: '',
      location: '',
      achievements: [],
    };
    setResumeData({
      ...resumeData,
      workExperience: [...resumeData.workExperience, newExperience],
    });
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | string[]) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeWorkExperience = (id: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.filter(exp => exp.id !== id),
    });
  };

  const addProject = () => {
    if (!resumeData) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      techStack: [],
      duration: '',
      url: '',
      github: '',
      highlights: [],
    };
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, newProject],
    });
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    });
  };

  const removeProject = (id: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(project => project.id !== id),
    });
  };

  const addSkill = (skill: string) => {
    if (!resumeData || !skill.trim()) return;
    if (!resumeData.skills.includes(skill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skill.trim()],
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!resumeData) return;
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading resume...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!resumeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Resume not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{resumeData.title || 'Edit Resume'}</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, saving && styles.disabledButton]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="save" size={24} color="#007AFF" />
            )}
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.fullName}
                onChangeText={(text) => updatePersonalInfo('fullName', text)}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.email}
                onChangeText={(text) => updatePersonalInfo('email', text)}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.phone}
                onChangeText={(text) => updatePersonalInfo('phone', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={resumeData.personalInfo.address}
                onChangeText={(text) => updatePersonalInfo('address', text)}
                placeholder="Enter your address"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>LinkedIn</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.personalInfo.linkedIn}
                  onChangeText={(text) => updatePersonalInfo('linkedIn', text)}
                  placeholder="LinkedIn URL"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.personalInfo.website}
                  onChangeText={(text) => updatePersonalInfo('website', text)}
                  placeholder="Website URL"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>GitHub</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.personalInfo.github}
                  onChangeText={(text) => updatePersonalInfo('github', text)}
                  placeholder="GitHub URL"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Portfolio</Text>
                <TextInput
                  style={styles.input}
                  value={resumeData.personalInfo.portfolio}
                  onChangeText={(text) => updatePersonalInfo('portfolio', text)}
                  placeholder="Portfolio URL"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Professional Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={resumeData.summary}
                onChangeText={(text) => setResumeData({ ...resumeData, summary: text })}
                placeholder="Write a brief professional summary"
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

            {resumeData.education.map((edu, index) => (
              <View key={edu.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Education {index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeEducation(edu.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Degree *</Text>
                  <TextInput
                    style={styles.input}
                    value={edu.degree}
                    onChangeText={(text) => updateEducation(edu.id, 'degree', text)}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Institution *</Text>
                  <TextInput
                    style={styles.input}
                    value={edu.institution}
                    onChangeText={(text) => updateEducation(edu.id, 'institution', text)}
                    placeholder="e.g., University of California, Berkeley"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.label}>Year *</Text>
                    <TextInput
                      style={styles.input}
                      value={edu.year}
                      onChangeText={(text) => updateEducation(edu.id, 'year', text)}
                      placeholder="e.g., 2020-2024"
                      placeholderTextColor="#999"
                    />
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
                  <Text style={styles.label}>Location</Text>
                  <TextInput
                    style={styles.input}
                    value={edu.location}
                    onChangeText={(text) => updateEducation(edu.id, 'location', text)}
                    placeholder="e.g., Berkeley, CA"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={edu.description}
                    onChangeText={(text) => updateEducation(edu.id, 'description', text)}
                    placeholder="Additional details about your education"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Work Experience Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              <TouchableOpacity onPress={addWorkExperience} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {resumeData.workExperience.map((exp, index) => (
              <View key={exp.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Experience {index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeWorkExperience(exp.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company *</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.company}
                    onChangeText={(text) => updateWorkExperience(exp.id, 'company', text)}
                    placeholder="e.g., Google Inc."
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role *</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.role}
                    onChangeText={(text) => updateWorkExperience(exp.id, 'role', text)}
                    placeholder="e.g., Software Engineer"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.label}>Duration *</Text>
                    <TextInput
                      style={styles.input}
                      value={exp.duration}
                      onChangeText={(text) => updateWorkExperience(exp.id, 'duration', text)}
                      placeholder="e.g., Jan 2022 - Present"
                      placeholderTextColor="#999"
                    />
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
                    style={[styles.input, styles.textArea]}
                    value={exp.description}
                    onChangeText={(text) => updateWorkExperience(exp.id, 'description', text)}
                    placeholder="Describe your responsibilities and achievements"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Projects Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projects</Text>
              <TouchableOpacity onPress={addProject} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {resumeData.projects.map((project, index) => (
              <View key={project.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>Project {index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeProject(project.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Project Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={project.name}
                    onChangeText={(text) => updateProject(project.id, 'name', text)}
                    placeholder="e.g., E-commerce Mobile App"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={project.description}
                    onChangeText={(text) => updateProject(project.id, 'description', text)}
                    placeholder="Describe what the project does and your role"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tech Stack</Text>
                  <TextInput
                    style={styles.input}
                    value={project.techStack.join(', ')}
                    onChangeText={(text) => updateProject(project.id, 'techStack', text.split(', ').filter(t => t.trim()))}
                    placeholder="e.g., React Native, Node.js, MongoDB"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      style={styles.input}
                      value={project.duration}
                      onChangeText={(text) => updateProject(project.id, 'duration', text)}
                      placeholder="e.g., 3 months"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                    <Text style={styles.label}>Project URL</Text>
                    <TextInput
                      style={styles.input}
                      value={project.url}
                      onChangeText={(text) => updateProject(project.id, 'url', text)}
                      placeholder="Live demo URL"
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GitHub URL</Text>
                  <TextInput
                    style={styles.input}
                    value={project.github}
                    onChangeText={(text) => updateProject(project.id, 'github', text)}
                    placeholder="GitHub repository URL"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Skills Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>

            <SkillsInput
              skills={resumeData.skills}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
            />
          </View>

          {/* Generate PDF Button */}
          <TouchableOpacity
            style={[styles.pdfButton, generatingPDF && styles.disabledButton]}
            onPress={handleGeneratePDF}
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="document-text" size={20} color="white" />
            )}
            <Text style={styles.pdfButtonText}>
              {generatingPDF ? 'Generating PDF...' : 'Generate PDF'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
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
    shadowOffset: { width: 0, height: 2 },
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 50,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 4,
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
});

export default ResumeEditor;
