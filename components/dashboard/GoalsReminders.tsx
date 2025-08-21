import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useDashboardStore } from '../../store/dashboardStore';
import { StudyGoal, Assignment, Reminder } from '../../types/dashboard';

export default function GoalsReminders() {
  const {
    studyGoals,
    assignments,
    reminders,
    addStudyGoal,
    updateGoalProgress,
    addAssignment,
    updateAssignmentProgress,
    addReminder,
    updateReminder,
    getActiveGoals,
    getPendingAssignments,
    getTodayReminders
  } = useDashboardStore();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'assignments' | 'reminders'>('goals');

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'daily' as StudyGoal['category'],
    targetValue: 0,
    unit: 'hours' as StudyGoal['unit'],
    priority: 'medium' as StudyGoal['priority'],
    endDate: ''
  });

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseName: '',
    type: 'homework' as Assignment['type'],
    priority: 'medium' as Assignment['priority'],
    dueDate: '',
    estimatedHours: 0
  });

  const activeGoals = getActiveGoals();
  const pendingAssignments = getPendingAssignments();
  const todayReminders = getTodayReminders();

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const goal: StudyGoal = {
      id: `goal_${Date.now()}`,
      userId: 'demo_user',
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      unit: newGoal.unit,
      priority: newGoal.priority,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: newGoal.endDate,
      reminderEnabled: true,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addStudyGoal(goal);
    setShowGoalModal(false);
    setNewGoal({
      title: '',
      description: '',
      category: 'daily',
      targetValue: 0,
      unit: 'hours',
      priority: 'medium',
      endDate: ''
    });
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.dueDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const assignment: Assignment = {
      id: `assignment_${Date.now()}`,
      userId: 'demo_user',
      courseId: 'course_1',
      courseName: newAssignment.courseName,
      title: newAssignment.title,
      description: newAssignment.description,
      type: newAssignment.type,
      priority: newAssignment.priority,
      status: 'not_started',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newAssignment.dueDate,
      estimatedHours: newAssignment.estimatedHours,
      progress: 0,
      attachments: [],
      reminderSet: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addAssignment(assignment);
    setShowAssignmentModal(false);
    setNewAssignment({
      title: '',
      description: '',
      courseName: '',
      type: 'homework',
      priority: 'medium',
      dueDate: '',
      estimatedHours: 0
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#F44336';
  };

  const renderGoals = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📎 Active Goals ({activeGoals.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowGoalModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {activeGoals.map((goal) => {
        const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
        return (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(goal.priority) }
              ]}>
                <Text style={styles.priorityText}>{goal.priority.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.goalDescription}>{goal.description}</Text>
            
            <View style={styles.goalProgress}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(progressPercentage)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(progressPercentage, 100)}%`,
                      backgroundColor: getProgressColor(progressPercentage)
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.goalFooter}>
              <Text style={styles.goalDeadline}>
                Due: {new Date(goal.endDate).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => {
                  const newValue = goal.currentValue + 0.5;
                  updateGoalProgress(goal.id, Math.min(newValue, goal.targetValue));
                }}
              >
                <Text style={styles.updateButtonText}>Update Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderAssignments = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📝 Pending Assignments ({pendingAssignments.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAssignmentModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Assignment</Text>
        </TouchableOpacity>
      </View>

      {pendingAssignments.map((assignment) => {
        const daysUntilDue = Math.ceil(
          (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return (
          <View key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <Text style={styles.assignmentCourse}>{assignment.courseName}</Text>
              </View>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(assignment.priority) }
              ]}>
                <Text style={styles.priorityText}>{assignment.priority.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.assignmentDescription}>{assignment.description}</Text>

            <View style={styles.assignmentProgress}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>Progress: {assignment.progress}%</Text>
                <Text style={[
                  styles.dueDate,
                  { color: daysUntilDue <= 3 ? '#F44336' : daysUntilDue <= 7 ? '#FF9800' : '#4CAF50' }
                ]}>
                  {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${assignment.progress}%`,
                      backgroundColor: getProgressColor(assignment.progress)
                    }
                  ]} 
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                const newProgress = Math.min(assignment.progress + 25, 100);
                updateAssignmentProgress(assignment.id, newProgress);
              }}
            >
              <Text style={styles.updateButtonText}>Update Progress</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  const renderReminders = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔔 Today's Reminders ({todayReminders.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowReminderModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>
      </View>

      {todayReminders.map((reminder) => (
        <View key={reminder.id} style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderTime}>
              {new Date(reminder.reminderTime).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
          <Text style={styles.reminderDescription}>{reminder.description}</Text>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => updateReminder(reminder.id, { status: 'completed' })}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      ))}

      {todayReminders.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No reminders for today</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'goals', label: 'Goals', icon: '🎯' },
          { key: 'assignments', label: 'Assignments', icon: '📝' },
          { key: 'reminders', label: 'Reminders', icon: '🔔' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'reminders' && renderReminders()}
      </ScrollView>

      {/* Goal Creation Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowGoalModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Study Goal</Text>
            <TouchableOpacity onPress={handleCreateGoal}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Goal Title *"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Target Value *"
              value={newGoal.targetValue.toString()}
              onChangeText={(text) => setNewGoal({ ...newGoal, targetValue: parseInt(text) || 0 })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD) *"
              value={newGoal.endDate}
              onChangeText={(text) => setNewGoal({ ...newGoal, endDate: text })}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Assignment Creation Modal */}
      <Modal
        visible={showAssignmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAssignmentModal(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Assignment</Text>
            <TouchableOpacity onPress={handleCreateAssignment}>
              <Text style={styles.modalSaveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Assignment Title *"
              value={newAssignment.title}
              onChangeText={(text) => setNewAssignment({ ...newAssignment, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Course Name *"
              value={newAssignment.courseName}
              onChangeText={(text) => setNewAssignment({ ...newAssignment, courseName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newAssignment.description}
              onChangeText={(text) => setNewAssignment({ ...newAssignment, description: text })}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Due Date (YYYY-MM-DD) *"
              value={newAssignment.dueDate}
              onChangeText={(text) => setNewAssignment({ ...newAssignment, dueDate: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Estimated Hours"
              value={newAssignment.estimatedHours.toString()}
              onChangeText={(text) => setNewAssignment({ ...newAssignment, estimatedHours: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
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
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 12,
    color: '#666',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  assignmentCard: {
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
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assignmentInfo: {
    flex: 1,
    marginRight: 10,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  assignmentCourse: {
    fontSize: 12,
    color: '#666',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  assignmentProgress: {
    marginBottom: 12,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reminderCard: {
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
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  reminderTime: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
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
});
