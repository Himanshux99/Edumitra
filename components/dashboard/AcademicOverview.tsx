import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart
} from 'react-native-chart-kit';
import { useDashboardStore } from '../../store/dashboardStore';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
};

export default function AcademicOverview() {
  const {
    attendanceRecords,
    grades,
    selectedPeriod,
    setSelectedPeriod,
    getAttendanceRate,
    getCurrentGPA,
    getCoursePerformance
  } = useDashboardStore();

  const attendanceRate = getAttendanceRate(selectedPeriod === 'week' ? 'week' : 'month');
  const currentGPA = getCurrentGPA();
  const coursePerformance = getCoursePerformance();

  // Prepare attendance trend data
  const getAttendanceTrendData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = attendanceRecords.filter(record => record.date === dateStr);
      const presentCount = dayRecords.filter(record => 
        record.status === 'present' || record.status === 'late'
      ).length;
      const totalCount = dayRecords.length;
      
      last7Days.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        rate: totalCount > 0 ? (presentCount / totalCount) * 100 : 0
      });
    }
    
    return {
      labels: last7Days.map(d => d.day),
      datasets: [{
        data: last7Days.map(d => d.rate),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  // Prepare grades distribution data
  const getGradesDistributionData = () => {
    const gradeRanges = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    grades.forEach(grade => {
      if (grade.percentage >= 90) gradeRanges['A (90-100)']++;
      else if (grade.percentage >= 80) gradeRanges['B (80-89)']++;
      else if (grade.percentage >= 70) gradeRanges['C (70-79)']++;
      else if (grade.percentage >= 60) gradeRanges['D (60-69)']++;
      else gradeRanges['F (0-59)']++;
    });

    return Object.entries(gradeRanges).map(([range, count], index) => ({
      name: range,
      population: count,
      color: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'][index],
      legendFontColor: '#333',
      legendFontSize: 12
    }));
  };

  // Prepare course performance data
  const getCoursePerformanceData = () => {
    const courses = Object.keys(coursePerformance);
    if (courses.length === 0) return null;

    return {
      labels: courses.map(courseId => {
        const grade = grades.find(g => g.courseId === courseId);
        return grade ? grade.courseName.substring(0, 8) : courseId;
      }),
      datasets: [{
        data: courses.map(courseId => coursePerformance[courseId] || 0)
      }]
    };
  };

  const attendanceTrendData = getAttendanceTrendData();
  const gradesDistributionData = getGradesDistributionData();
  const coursePerformanceData = getCoursePerformanceData();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Academic Overview</Text>
        <View style={styles.periodSelector}>
          {['week', 'month', 'semester'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{attendanceRate}%</Text>
          <Text style={styles.metricLabel}>Attendance Rate</Text>
          <View style={[
            styles.metricIndicator,
            { backgroundColor: attendanceRate >= 80 ? '#4CAF50' : attendanceRate >= 60 ? '#FF9800' : '#F44336' }
          ]} />
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{currentGPA.toFixed(2)}</Text>
          <Text style={styles.metricLabel}>Current GPA</Text>
          <View style={[
            styles.metricIndicator,
            { backgroundColor: currentGPA >= 3.5 ? '#4CAF50' : currentGPA >= 3.0 ? '#FF9800' : '#F44336' }
          ]} />
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{grades.length}</Text>
          <Text style={styles.metricLabel}>Total Grades</Text>
          <View style={[styles.metricIndicator, { backgroundColor: '#2196F3' }]} />
        </View>
      </View>

      {/* Attendance Trend Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📈 Attendance Trend (Last 7 Days)</Text>
        <LineChart
          data={attendanceTrendData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Grades Distribution */}
      {gradesDistributionData.some(item => item.population > 0) && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📊 Grades Distribution</Text>
          <PieChart
            data={gradesDistributionData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      {/* Course Performance */}
      {coursePerformanceData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📚 Course Performance</Text>
          <BarChart
            data={coursePerformanceData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisSuffix="%"
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* Recent Grades */}
      <View style={styles.recentGradesContainer}>
        <Text style={styles.sectionTitle}>Recent Grades</Text>
        {grades.slice(0, 5).map((grade) => (
          <View key={grade.id} style={styles.gradeItem}>
            <View style={styles.gradeInfo}>
              <Text style={styles.gradeCourse}>{grade.courseName}</Text>
              <Text style={styles.gradeAssessment}>{grade.assessmentName}</Text>
            </View>
            <View style={styles.gradeScore}>
              <Text style={[
                styles.gradePercentage,
                { color: grade.percentage >= 80 ? '#4CAF50' : grade.percentage >= 60 ? '#FF9800' : '#F44336' }
              ]}>
                {grade.percentage}%
              </Text>
              <Text style={styles.gradeGrade}>{grade.grade}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activePeriodButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricIndicator: {
    width: 30,
    height: 4,
    borderRadius: 2,
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
  recentGradesContainer: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gradeInfo: {
    flex: 1,
  },
  gradeCourse: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  gradeAssessment: {
    fontSize: 12,
    color: '#666',
  },
  gradeScore: {
    alignItems: 'flex-end',
  },
  gradePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gradeGrade: {
    fontSize: 12,
    color: '#666',
  },
});
