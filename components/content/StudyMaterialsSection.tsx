import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useContentStore } from '../../store/contentStore';

export default function StudyMaterialsSection() {
  const { studyMaterials, getDownloadedMaterials } = useContentStore();
  
  const downloadedMaterials = getDownloadedMaterials();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{studyMaterials.length}</Text>
            <Text style={styles.statLabel}>Total Materials</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{downloadedMaterials.length}</Text>
            <Text style={styles.statLabel}>Downloaded</Text>
          </View>
        </View>

        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>📄</Text>
          <Text style={styles.placeholderTitle}>Study Materials</Text>
          <Text style={styles.placeholderText}>
            Browse and download study materials including PDFs, videos, and interactive content.
          </Text>
          <TouchableOpacity style={styles.comingSoonButton}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  comingSoonButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  comingSoonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
