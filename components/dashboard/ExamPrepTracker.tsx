import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { ProgressChart, BarChart } from 'react-native-chart-kit';
import { useDashboardStore } from '../../store/dashboardStore';
import { Exam } from '../../types/dashboard';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

export default function ExamPrepTracker() {
  const {
    exams,
    addExam,
    updateExamPreparation,
    getUpcomingExams
  } = useDashboardStore();

  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [newExam, setNewExam] = useState({
    examName: '',
    courseName: '',
    examType: 'midterm' as Exam['examType'],
    date: '',
    duration: 120,
    syllabus: '',
    difficulty: 'medium' as Exam['difficulty']
  });

  const upcomingExams = getUpcomingExams(60); // Next 60 days

  const handleCreateExam = async () => {
    if (!newExam.examName || !newExam.courseName || !newExam.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const exam: Exam = {
      id: `exam_${Date.now()}`,
      userId: 'demo_user',
      courseId: 'course_1',
      courseName: newExam.courseName,
      examName: newExam.examName,
      examType: newExam.examType,
      date: newExam.date,
      duration: newExam.duration,
      syllabus: newExam.syllabus.split(',').map(s => s.trim()).filter(s => s),
      preparationStatus: 'not_started',
      preparationProgress: 0,
      studyHours: 0,
      difficulty: newExam.difficulty,
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addExam(exam);
    setShowExamModal(false);
    setNewExam({
      examName: '',
      courseName: '',
      examType: 'midterm',
      date: '',
      duration: 120,
      syllabus: '',
      difficulty: 'medium'
    });
  };

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'quiz': return '#4CAF50';
      case 'midterm': return '#FF9800';
      case 'final': return '#F44336';
      case 'practical': return '#9C27B0';
      case 'oral': return '#607D8B';
      default: return '#2196F3';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      case 'very_hard': return '#9C27B0';
      default: return '#666';
    }
  };

  const getPreparationData = () => {
    if (upcomingExams.length === 0) return null;

    const data = upcomingExams.slice(0, 5).map(exam => ({
      name: exam.examName.substring(0, 8),
      progress: exam.preparationProgress / 100,
      color: getExamTypeColor(exam.examType),
      legendFontColor: '#333',
      legendFontSize: 12
    }));

    return { data };
  };

  const getStudyHoursData = () => {
    if (upcomingExams.length === 0) return null;

    return {
      labels: upcomingExams.slice(0, 5).map(exam => exam.examName.substring(0, 8)),
      datasets: [{
        data: upcomingExams.slice(0, 5).map(exam => exam.studyHours)
      }]
    };
  };

  const preparationData = getPreparationData();
  const studyHoursData = getStudyHoursData();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📚 Exam Prep Tracker</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowExamModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Exam</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcomingExams.length}</Text>
            <Text style={styles.statLabel}>Upcoming Exams</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.round(upcomingExams.reduce((sum, exam) => sum + exam.preparationProgress, 0) / Math.max(upcomingExams.length, 1))}%
            </Text>
            <Text style={styles.statLabel}>Avg Preparation</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {upcomingExams.reduce((sum, exam) => sum + exam.studyHours, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Study Hours</Text>
          </View>
        </View>

        {/* Preparation Progress Chart */}
        {preparationData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>📊 Preparation Progress</Text>
            <ProgressChart
              data={preparationData}
              width={screenWidth - 40}
              height={220}
              strokeWidth={16}
              radius={32}
              chartConfig={chartConfig}
              hideLegend={false}
              style={styles.chart}
            />
          </View>
        )}

        {/* Study Hours Chart */}
        {studyHoursData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>⏰ Study Hours by Exam</Text>
            <BarChart
              data={studyHoursData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisSuffix="h"
              showValuesOnTopOfBars
            />
          </View>
        )}

        {/* Upcoming Exams List */}
        <View style={styles.examsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Exams</Text>
          
          {upcomingExams.map((exam) => {
            const daysUntil = getDaysUntilExam(exam.date);
            const isUrgent = daysUntil <= 7;
            
            return (
              <TouchableOpacity
                key={exam.id}
                style={[styles.examCard, isUrgent && styles.urgentExamCard]}
                onPress={() => setSelectedExam(exam)}
              >
                <View style={styles.examHeader}>
                  <View style={styles.examInfo}>
                    <Text style={styles.examName}>{exam.examName}</Text>
                    <Text style={styles.examCourse}>{exam.courseName}</Text>
                  </View>
                  <View style={styles.examBadges}>
                    <View style={[
                      styles.typeBadge,
                      { backgroundColor: getExamTypeColor(exam.examType) }
                    ]}>
                      <Text style={styles.badgeText}>{exam.examType.toUpperCase()}</Text>
                    </View>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(exam.difficulty) }
                    ]}>
                      <Text style={styles.badgeText}>{exam.difficulty.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.examDetails}>
                  <Text style={[
                    styles.examDate,
                    { color: isUrgent ? '#F44336' : '#666' }
                  ]}>
                    📅 {new Date(exam.date).toLocaleDateString()} 
                    {daysUntil > 0 ? ` (${daysUntil} days)` : ' (Today!)'}
                  </Text>
                  <Text style={styles.examDuration}>⏱️ {exam.duration} minutes</Text>
                </View>

                <View style={styles.preparationSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Preparation Progress</Text>
                    <Text style={styles.progressPercentage}>{exam.preparationProgress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${exam.preparationProgress}%`,
                          backgroundColor: exam.preparationProgress >= 80 ? '#4CAF50' : 
                                         exam.preparationProgress >= 50 ? '#FF9800' : '#F44336'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.studyHours}>📖 {exam.studyHours} hours studied</Text>
                </View>

                {exam.syllabus.length > 0 && (
                  <View style={styles.syllabusSection}>
                    <Text style={styles.syllabusTitle}>Syllabus:</Text>
                    <Text style={styles.syllabusText}>
                      {exam.syllabus.slice(0, 3).join(', ')}
                      {exam.syllabus.length > 3 && ` +${exam.syllabus.length - 3} more`}
                    </Text>
                  </View>
                )}

                <View style={styles.examActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      const newProgress = Math.min(exam.preparationProgress + 10, 100);
                      const newHours = exam.studyHours + 1;
                      updateExamPreparation(exam.id, newProgress, newHours);
                    }}
                  >
                    <Text style={styles.actionButtonText}>+1 Hour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.progressButton]}
                    onPress={() => {
                      const newProgress = Math.min(exam.preparationProgress + 25, 100);
                      updateExamPreparation(exam.id, newProgress, exam.studyHours);
                    }}
                  >
                    <Text style={styles.actionButtonText}>+25% Progress</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}

          {upcomingExams.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming exams</Text>
              <Text style={styles.emptyStateSubtext}>Add an exam to start tracking your preparation</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Exam Creation Modal */}
      <Modal
        visible={showExamModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExamModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exam</Text>
            <TouchableOpacity onPress={handleCreateExam}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Exam Name *"
              value={newExam.examName}
              onChangeText={(text) => setNewExam({ ...newExam, examName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Course Name *"
              value={newExam.courseName}
              onChangeText={(text) => setNewExam({ ...newExam, courseName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Exam Date (YYYY-MM-DD) *"
              value={newExam.date}
              onChangeText={(text) => setNewExam({ ...newExam, date: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Duration (minutes)"
              value={newExam.duration.toString()}
              onChangeText={(text) => setNewExam({ ...newExam, duration: parseInt(text) || 120 })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Syllabus Topics (comma separated)"
              value={newExam.syllabus}
              onChangeText={(text) => setNewExam({ ...newExam, syllabus: text })}
              multiline
            />

            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Exam Type:</Text>
              <View style={styles.pickerOptions}>
                {['quiz', 'midterm', 'final', 'practical', 'oral'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerOption,
                      newExam.examType === type && styles.selectedPickerOption
                    ]}
                    onPress={() => setNewExam({ ...newExam, examType: type as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      newExam.examType === type && styles.selectedPickerOptionText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Difficulty:</Text>
              <View style={styles.pickerOptions}>
                {['easy', 'medium', 'hard', 'very_hard'].map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.pickerOption,
                      newExam.difficulty === difficulty && styles.selectedPickerOption
                    ]}
                    onPress={() => setNewExam({ ...newExam, difficulty: difficulty as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      newExam.difficulty === difficulty && styles.selectedPickerOptionText
                    ]}>
                      {difficulty.replace('_', ' ').charAt(0).toUpperCase() + difficulty.replace('_', ' ').slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
  },
  examsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  examCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentExamCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  examInfo: {
    flex: 1,
    marginRight: 10,
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  examCourse: {
    fontSize: 14,
    color: '#666',
  },
  examBadges: {
    gap: 5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  examDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  examDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  examDuration: {
    fontSize: 14,
    color: '#666',
  },
  preparationSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#333',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  studyHours: {
    fontSize: 12,
    color: '#666',
  },
  syllabusSection: {
    marginBottom: 12,
  },
  syllabusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  syllabusText: {
    fontSize: 12,
    color: '#666',
  },
  examActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  progressButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalSaveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerSection: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedPickerOption: {
    backgroundColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPickerOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
