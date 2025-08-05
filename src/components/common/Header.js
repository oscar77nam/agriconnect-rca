import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ 
  title, 
  showBackButton = true, 
  showHomeButton = true,
  onBack,
  onHome,
  screenHistory,
  currentScreen,
  user 
}) => (
  <View style={styles.container}>
    <View style={styles.leftSection}>
      {showBackButton && screenHistory.length > 0 && (
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
    
    <View style={styles.rightSection}>
      {showHomeButton && (
        (user && currentScreen !== 'home') || (!user && currentScreen !== 'welcome') 
      ) && (
        <TouchableOpacity onPress={onHome} style={styles.iconButton}>
          <Ionicons name="home" size={20} color="#16a34a" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default Header;