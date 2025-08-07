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
}) => {
  const shouldShowBackButton = showBackButton && (
    screenHistory.length > 0 || 
    currentScreen === 'register' ||
    (user && currentScreen !== 'home') ||
    (!user && currentScreen !== 'welcome')
  );
    
  const shouldShowHomeButton = showHomeButton && (
    currentScreen === 'register' ||
    (user && currentScreen !== 'home') || 
    (!user && currentScreen !== 'welcome')
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {shouldShowBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title, shouldShowBackButton && styles.titleWithButton]}>
          {title}
        </Text>
      </View>
      
      <View style={styles.rightSection}>
        {shouldShowHomeButton && (
          <TouchableOpacity onPress={handleHome} style={styles.homeButton}>
            <Ionicons name="home" size={24} color="#16a34a" />
            <Text style={styles.homeButtonText}>Accueil</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 60,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  buttonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  homeButtonText: {
    fontSize: 14,
    color: '#16a34a',
    marginLeft: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  titleWithButton: {
    flex: 1,
  },
});

export default Header;