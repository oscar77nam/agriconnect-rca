import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConnectionStatus = ({ isOnline, loading }) => {
  if (loading) return null;

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <Ionicons 
        name={isOnline ? 'cloud-done' : 'cloud-offline'} 
        size={16} 
        color="white" 
      />
      <Text style={styles.text}>
        {isOnline ? 'En ligne' : 'Hors ligne'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
    gap: 6,
  },
  online: {
    backgroundColor: '#16a34a',
  },
  offline: {
    backgroundColor: '#f59e0b',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConnectionStatus;