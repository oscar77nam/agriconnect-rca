import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import AgriConnectRCA from './src/AgriConnectRCA';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <AgriConnectRCA />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});