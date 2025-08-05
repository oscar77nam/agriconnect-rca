import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../common/Header';

const ProfileScreen = ({ 
  user,
  onBack,
  onHome,
  screenHistory,
  currentScreen
}) => (
  <View style={styles.container}>
    <Header 
      title="👤 Mon Profil"
      onBack={onBack}
      onHome={onHome}
      screenHistory={screenHistory}
      currentScreen={currentScreen}
      user={user}
    />
    <View style={styles.header}>
      <Text style={styles.headerText}>Informations personnelles</Text>
    </View>
    
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>
              {user?.type === 'farmer' ? '👨‍🌾' : user?.type === 'admin' ? '👑' : '🛒'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userType}>
            {user?.type === 'farmer' ? 'Agriculteur' : 
             user?.type === 'admin' ? 'Administrateur' : 'Acheteur'}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="call" size={20} color="#9ca3af" />
            <Text style={styles.infoText}>{user?.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color="#9ca3af" />
            <Text style={styles.infoText}>{user?.location}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#7c3aed',
    padding: 24,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 30,
    color: 'white',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: '#6b7280',
  },
  userInfo: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
  },
});

export default ProfileScreen;