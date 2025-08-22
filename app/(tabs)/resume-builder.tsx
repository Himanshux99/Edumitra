import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResumeBuilder from '../../components/resume/ResumeBuilder';

export default function ResumeBuilderScreen() {
  return (
    <View style={styles.container}>
      <ResumeBuilder />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
