/**
 * Schedule Planner Component
 * Allows users to create and manage custom study schedules with gamification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { careerRoadmapService } from '@/services/careerRoadmapService';
import { SchedulePlan, ScheduleTask, VirtualTree } from '@/types/careerRoadmap';

const { width } = Dimensions.get('window');

interface SchedulePlannerProps {
  onBack: () => void;
}

export default function SchedulePlanner({ onBack }: SchedulePlannerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [schedules, setSchedules] = useState<SchedulePlan[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<SchedulePlan | null>(null);
  const [virtualTree, setVirtualTree] = useState<VirtualTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);

  // Task form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDuration, setTaskDuration] = useState('30');
  const [taskTime, setTaskTime] = useState('09:00');
  const [taskType, setTaskType] = useState<'study' | 'practice' | 'project' | 'review' | 'break'>('study');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      loadScheduleData();
    }
  }, [user]);

  const loadScheduleData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load user schedules
      // const userSchedules = await careerRoadmapService.getUserSchedules(user.uid);
      // setSchedules(userSchedules);

      // Load virtual tree
      const tree = await careerRoadmapService.getVirtualTree(user.uid);
      setVirtualTree(tree);

    } catch (error) {
      console.error('Error loading schedule data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!user || !scheduleTitle.trim()) {
      Alert.alert('Error', 'Please enter a schedule title');
      return;
    }

    try {
      const newSchedule: Omit<SchedulePlan, 'id' | 'createdAt'> = {
        userId: user.uid,
        title: scheduleTitle,
        description: scheduleDescription,
        type: scheduleType,
        tasks: tasks,
        startDate: new Date().toISOString(),
        isActive: true,
        totalPoints: tasks.reduce((sum, task) => sum + task.points, 0),
        earnedPoints: 0,
        streakCount: 0,
      };

      await careerRoadmapService.createSchedulePlan(user.uid, newSchedule);
      
      Alert.alert('Success', 'Schedule created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadScheduleData();
    } catch (error) {
      console.error('Error creating schedule:', error);
      Alert.alert('Error', 'Failed to create schedule');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      await careerRoadmapService.completeTask(user.uid, taskId);
      Alert.alert('Great!', 'Task completed! Your tree has grown! 🌱');
      loadScheduleData(); // Refresh data
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const addTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: ScheduleTask = {
      id: `task_${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      type: taskType,
      duration: parseInt(taskDuration),
      priority: taskPriority,
      points: calculateTaskPoints(taskType, taskPriority, parseInt(taskDuration)),
      isCompleted: false,
      scheduledTime: taskTime,
      reminderEnabled: reminderEnabled,
    };

    setTasks([...tasks, newTask]);
    setShowTaskModal(false);
    resetTaskForm();
  };

  const calculateTaskPoints = (
    type: string, 
    priority: string, 
    duration: number
  ): number => {
    let basePoints = Math.floor(duration / 15); // 1 point per 15 minutes
    
    // Type multiplier
    const typeMultiplier = {
      study: 1.5,
      practice: 1.3,
      project: 2.0,
      review: 1.0,
      break: 0.5,
    }[type] || 1.0;

    // Priority multiplier
    const priorityMultiplier = {
      low: 1.0,
      medium: 1.2,
      high: 1.5,
    }[priority] || 1.0;

    return Math.max(1, Math.floor(basePoints * typeMultiplier * priorityMultiplier));
  };

  const resetForm = () => {
    setScheduleTitle('');
    setScheduleDescription('');
    setScheduleType('daily');
    setTasks([]);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskDuration('30');
    setTaskTime('09:00');
    setTaskType('study');
    setTaskPriority('medium');
    setReminderEnabled(true);
  };

  const getTaskTypeIcon = (type: string) => {
    const icons = {
      study: 'school',
      practice: 'fitness-center',
      project: 'assignment',
      review: 'rate-review',
      break: 'coffee',
    };
    return icons[type as keyof typeof icons] || 'task';
  };

  const getTaskTypeColor = (type: string) => {
    const colors = {
      study: '#2196F3',
      practice: '#FF9800',
      project: '#4CAF50',
      review: '#9C27B0',
      break: '#795548',
    };
    return colors[type as keyof typeof colors] || '#666666';
  };

  const renderVirtualTreeStatus = () => {
    if (!virtualTree) return null;

    return (
      <View style={[styles.treeStatus, { backgroundColor: colors.background }]}>
        <Text style={styles.treeEmoji}>
          {virtualTree.level < 5 ? '🌱' : virtualTree.level < 10 ? '🌿' : '🌳'}
        </Text>
        <View style={styles.treeInfo}>
          <Text style={[styles.treeLevel, { color: colors.text }]}>
            Level {virtualTree.level}
          </Text>
          <Text style={[styles.treeHealth, { color: colors.text }]}>
            Health: {virtualTree.health}%
          </Text>
        </View>
        <View style={styles.streakInfo}>
          <MaterialIcons name="local-fire-department" size={20} color="#FF5722" />
          <Text style={[styles.streakText, { color: colors.text }]}>
            {/* {virtualTree.streakCount} day streak */}
            0 day streak
          </Text>
        </View>
      </View>
    );
  };

  const renderScheduleCard = (schedule: SchedulePlan) => (
    <TouchableOpacity
      key={schedule.id}
      style={[styles.scheduleCard, { backgroundColor: colors.background }]}
      onPress={() => setSelectedSchedule(schedule)}
    >
      <View style={styles.scheduleHeader}>
        <Text style={[styles.scheduleTitle, { color: colors.text }]}>
          {schedule.title}
        </Text>
        <View style={[
          styles.scheduleStatus,
          { backgroundColor: schedule.isActive ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.scheduleStatusText}>
            {schedule.isActive ? 'Active' : 'Paused'}
          </Text>
        </View>
      </View>

      <Text style={[styles.scheduleDescription, { color: colors.text }]}>
        {schedule.description}
      </Text>

      <View style={styles.scheduleStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="assignment" size={16} color="#2196F3" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {schedule.tasks.length} tasks
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={16} color="#FFD700" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {schedule.earnedPoints}/{schedule.totalPoints} points
          </Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="local-fire-department" size={16} color="#FF5722" />
          <Text style={[styles.statText, { color: colors.text }]}>
            {schedule.streakCount} streak
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTaskItem = (task: ScheduleTask) => (
    <View
      key={task.id}
      style={[
        styles.taskItem,
        { 
          backgroundColor: task.isCompleted ? '#E8F5E8' : colors.background,
          borderLeftColor: getTaskTypeColor(task.type),
        }
      ]}
    >
      <View style={styles.taskHeader}>
        <MaterialIcons 
          name={getTaskTypeIcon(task.type)} 
          size={20} 
          color={getTaskTypeColor(task.type)} 
        />
        <Text style={[styles.taskTitle, { color: colors.text }]}>
          {task.title}
        </Text>
        <TouchableOpacity
          onPress={() => !task.isCompleted && handleCompleteTask(task.id)}
          disabled={task.isCompleted}
        >
          <MaterialIcons 
            name={task.isCompleted ? "check-circle" : "radio-button-unchecked"} 
            size={24} 
            color={task.isCompleted ? "#4CAF50" : colors.text} 
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.taskDescription, { color: colors.text }]}>
        {task.description}
      </Text>

      <View style={styles.taskMeta}>
        <Text style={[styles.taskTime, { color: colors.text }]}>
          {task.scheduledTime} • {task.duration}min
        </Text>
        <Text style={[styles.taskPoints, { color: '#FFD700' }]}>
          {task.points} points
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#667eea' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Planner</Text>
        <TouchableOpacity 
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Virtual Tree Status */}
      {renderVirtualTreeStatus()}

      {/* Schedules List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Schedules
        </Text>

        {schedules.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="schedule" size={48} color={colors.text} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No schedules yet. Create your first study schedule!
            </Text>
            <TouchableOpacity
              style={[styles.createFirstButton, { backgroundColor: '#667eea' }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Schedule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          schedules.map(renderScheduleCard)
        )}
      </ScrollView>

      {/* Create Schedule Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Schedule
            </Text>
            <TouchableOpacity onPress={handleCreateSchedule}>
              <Text style={[styles.saveButton, { color: '#667eea' }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.text, color: colors.text }]}
              value={scheduleTitle}
              onChangeText={setScheduleTitle}
              placeholder="Enter schedule title"
              placeholderTextColor={colors.text + '60'}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput, { borderColor: colors.text, color: colors.text }]}
              value={scheduleDescription}
              onChangeText={setScheduleDescription}
              placeholder="Enter schedule description"
              placeholderTextColor={colors.text + '60'}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Type</Text>
            <View style={styles.typeSelector}>
              {(['daily', 'weekly', 'custom'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    { 
                      backgroundColor: scheduleType === type ? '#667eea' : 'transparent',
                      borderColor: '#667eea',
                    }
                  ]}
                  onPress={() => setScheduleType(type)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    { color: scheduleType === type ? 'white' : '#667eea' }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tasksSection}>
              <View style={styles.tasksSectionHeader}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Tasks</Text>
                <TouchableOpacity
                  onPress={() => setShowTaskModal(true)}
                  style={[styles.addTaskButton, { backgroundColor: '#667eea' }]}
                >
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text style={styles.addTaskButtonText}>Add Task</Text>
                </TouchableOpacity>
              </View>

              {tasks.map(renderTaskItem)}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Task
            </Text>
            <TouchableOpacity onPress={addTask}>
              <Text style={[styles.saveButton, { color: '#667eea' }]}>Add</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Task Title</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.text, color: colors.text }]}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.text + '60'}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.text, color: colors.text }]}
              value={taskDescription}
              onChangeText={setTaskDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.text + '60'}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (min)</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.text, color: colors.text }]}
                  value={taskDuration}
                  onChangeText={setTaskDuration}
                  placeholder="30"
                  placeholderTextColor={colors.text + '60'}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.text, color: colors.text }]}
                  value={taskTime}
                  onChangeText={setTaskTime}
                  placeholder="09:00"
                  placeholderTextColor={colors.text + '60'}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Type</Text>
            <View style={styles.typeSelector}>
              {(['study', 'practice', 'project', 'review', 'break'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    { 
                      backgroundColor: taskType === type ? getTaskTypeColor(type) : 'transparent',
                      borderColor: getTaskTypeColor(type),
                    }
                  ]}
                  onPress={() => setTaskType(type)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    { color: taskType === type ? 'white' : getTaskTypeColor(type) }
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Priority</Text>
            <View style={styles.typeSelector}>
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.typeOption,
                    { 
                      backgroundColor: taskPriority === priority ? '#667eea' : 'transparent',
                      borderColor: '#667eea',
                    }
                  ]}
                  onPress={() => setTaskPriority(priority)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    { color: taskPriority === priority ? 'white' : '#667eea' }
                  ]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Enable Reminder</Text>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: '#767577', true: '#667eea' }}
                thumbColor={reminderEnabled ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            <View style={styles.pointsPreview}>
              <Text style={[styles.pointsLabel, { color: colors.text }]}>
                Points for this task: 
              </Text>
              <Text style={[styles.pointsValue, { color: '#FFD700' }]}>
                {calculateTaskPoints(taskType, taskPriority, parseInt(taskDuration) || 0)}
              </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  addButton: {
    padding: 8,
  },
  treeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  treeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  treeInfo: {
    flex: 1,
  },
  treeLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  treeHealth: {
    fontSize: 14,
    opacity: 0.7,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
  },
  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  scheduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  scheduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  taskItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  taskPoints: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tasksSection: {
    marginTop: 16,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  pointsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
  },
  pointsLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
