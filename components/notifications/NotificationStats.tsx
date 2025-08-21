import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { NotificationStats as NotificationStatsType } from '../../types/notifications';

interface NotificationStatsProps {
  stats: NotificationStatsType;
}

export default function NotificationStats({ stats }: NotificationStatsProps) {
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Performance Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatPercentage(stats.deliveryRate)}</Text>
            <Text style={styles.metricLabel}>Delivery Rate</Text>
            <Text style={styles.metricDescription}>Successfully delivered</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatPercentage(stats.openRate)}</Text>
            <Text style={styles.metricLabel}>Open Rate</Text>
            <Text style={styles.metricDescription}>Notifications opened</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatPercentage(stats.clickRate)}</Text>
            <Text style={styles.metricLabel}>Click Rate</Text>
            <Text style={styles.metricDescription}>Actions taken</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatPercentage(stats.dismissRate)}</Text>
            <Text style={styles.metricLabel}>Dismiss Rate</Text>
            <Text style={styles.metricDescription}>Notifications dismissed</Text>
          </View>
        </View>
      </View>

      {/* Timing Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Timing Analysis</Text>
        
        <View style={styles.timingContainer}>
          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>Average Response Time</Text>
            <Text style={styles.timingValue}>{formatTime(stats.averageResponseTime)}</Text>
          </View>
          
          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>Best Performing Time</Text>
            <Text style={styles.timingValue}>{stats.bestPerformingTime}</Text>
          </View>
          
          <View style={styles.timingItem}>
            <Text style={styles.timingLabel}>Worst Performing Time</Text>
            <Text style={styles.timingValue}>{stats.worstPerformingTime}</Text>
          </View>
        </View>
      </View>

      {/* Top Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top Performing Categories</Text>
        
        <View style={styles.categoriesContainer}>
          {stats.topCategories.map((category, index) => (
            <View key={category.category} style={styles.categoryItem}>
              <View style={styles.categoryRank}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              
              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>
                  {category.category.replace('_', ' ').toUpperCase()}
                </Text>
                <View style={styles.engagementBar}>
                  <View 
                    style={[
                      styles.engagementFill,
                      { width: `${category.engagement * 100}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.engagementValue}>
                {formatPercentage(category.engagement)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Insights & Recommendations</Text>
        
        <View style={styles.insightsContainer}>
          {getInsights(stats).map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// Helper function to generate insights
const getInsights = (stats: NotificationStatsType) => {
  const insights = [];

  // Delivery rate insight
  if (stats.deliveryRate < 0.9) {
    insights.push({
      icon: '⚠️',
      title: 'Low Delivery Rate',
      description: 'Some notifications are not being delivered. Check notification permissions and settings.',
    });
  } else {
    insights.push({
      icon: '✅',
      title: 'Excellent Delivery Rate',
      description: 'Your notifications are being delivered successfully to most users.',
    });
  }

  // Open rate insight
  if (stats.openRate < 0.3) {
    insights.push({
      icon: '📱',
      title: 'Improve Notification Content',
      description: 'Consider making your notification titles more engaging to increase open rates.',
    });
  } else if (stats.openRate > 0.6) {
    insights.push({
      icon: '🎯',
      title: 'Great Engagement',
      description: 'Your notifications are highly engaging! Keep up the good work.',
    });
  }

  // Timing insight
  const bestHour = parseInt(stats.bestPerformingTime.split(':')[0]);
  if (bestHour >= 9 && bestHour <= 17) {
    insights.push({
      icon: '🕘',
      title: 'Optimal Timing',
      description: 'Your best performing time is during work hours. Consider scheduling more notifications then.',
    });
  } else if (bestHour >= 18 && bestHour <= 22) {
    insights.push({
      icon: '🌆',
      title: 'Evening Engagement',
      description: 'Users are most engaged in the evening. Schedule important notifications accordingly.',
    });
  }

  // Click rate insight
  if (stats.clickRate > 0.4) {
    insights.push({
      icon: '🚀',
      title: 'High Action Rate',
      description: 'Users frequently take action on your notifications. Your CTAs are effective!',
    });
  }

  return insights;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '47%',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  timingContainer: {
    gap: 15,
  },
  timingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timingLabel: {
    fontSize: 16,
    color: '#333',
  },
  timingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  engagementBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  engagementFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  engagementValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
    minWidth: 50,
    textAlign: 'right',
  },
  insightsContainer: {
    gap: 15,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
